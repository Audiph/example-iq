"use client";

import {
  useEffect,
  useCallback,
  useRef,
  useReducer,
  type SubmitEvent,
} from "react";
import { toast } from "sonner";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  ServiceType,
  LocationType,
  PhoneStatus,
  SERVICE_TYPE_CONFIG,
  LOCATION_TYPE_CONFIG,
} from "@/lib/enums";
import type { BookingPayload, PlaceResult } from "@/types";
import {
  phoneLookup,
  submitBooking,
  fetchDirections,
} from "@/services/api-handler";
import { flattenFormErrors } from "@/lib/schemas";
import { bookingFormSchema } from "@/lib/form-schema";
import PlacesAutocomplete from "@/components/ui/PlacesAutocomplete";
import {
  formReducer,
  INITIAL_STATE,
  ActionType,
  EMPTY_STOP,
} from "@/store/booking-form";

export default function BookingForm() {
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE);
  const {
    serviceType,
    pickupDate,
    pickupTime,
    pickup,
    dropoff,
    stops,
    phone,
    phoneStatus,
    customerName,
    firstName,
    lastName,
    email,
    passengers,
    travelInfo,
    errors,
    isSubmitting,
  } = state;

  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!pickup.placeId || !dropoff.placeId) {
      dispatch({ type: ActionType.SetTravelInfo, payload: null });
      return;
    }

    const waypointPlaceIds = stops
      .filter((s) => s.placeId.length > 0)
      .map((s) => s.placeId);

    let cancelled = false;

    fetchDirections(pickup.placeId, dropoff.placeId, waypointPlaceIds)
      .then((result) => {
        if (!cancelled) {
          dispatch({ type: ActionType.SetTravelInfo, payload: result });
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Unable to calculate distance for this route");
          dispatch({ type: ActionType.SetTravelInfo, payload: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pickup.placeId, dropoff.placeId, stops]);

  const lookupPhoneNumber = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      dispatch({
        type: ActionType.PhoneLookupResult,
        payload: { phoneStatus: PhoneStatus.Idle, customerName: "" },
      });
      return;
    }
    dispatch({
      type: ActionType.SetPhoneStatus,
      payload: PhoneStatus.Checking,
    });
    try {
      const data = await phoneLookup(phoneNumber);
      if (data.found) {
        dispatch({
          type: ActionType.PhoneLookupResult,
          payload: {
            phoneStatus: PhoneStatus.Found,
            customerName: data.firstName ?? "",
          },
        });
      } else {
        dispatch({
          type: ActionType.PhoneLookupResult,
          payload: { phoneStatus: PhoneStatus.NotFound, customerName: "" },
        });
      }
    } catch {
      dispatch({ type: ActionType.SetPhoneStatus, payload: PhoneStatus.Idle });
    }
  }, []);

  const handlePhoneChange = (value: string | undefined) => {
    dispatch({ type: ActionType.SetPhone, payload: value });
    dispatch({ type: ActionType.ClearError, payload: "phone" });
    if (phoneDebounceRef.current) {
      clearTimeout(phoneDebounceRef.current);
    }
    if (value) {
      phoneDebounceRef.current = setTimeout(() => {
        lookupPhoneNumber(value);
      }, 800);
    }
  };

  const handlePickupPlaceSelect = useCallback(
    (place: PlaceResult) => {
      dispatch({
        type: ActionType.SetPickup,
        payload: {
          ...pickup,
          address: place.address,
          placeId: place.placeId,
        },
      });
      dispatch({ type: ActionType.ClearError, payload: "pickup" });
    },
    [pickup],
  );

  const handleDropoffPlaceSelect = useCallback(
    (place: PlaceResult) => {
      dispatch({
        type: ActionType.SetDropoff,
        payload: {
          ...dropoff,
          address: place.address,
          placeId: place.placeId,
        },
      });
      dispatch({ type: ActionType.ClearError, payload: "dropoff" });
    },
    [dropoff],
  );

  const handleStopPlaceSelect = useCallback(
    (index: number, place: PlaceResult) => {
      dispatch({
        type: ActionType.UpdateStop,
        payload: {
          index,
          stop: {
            address: place.address,
            placeId: place.placeId,
          },
        },
      });
    },
    [],
  );

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = bookingFormSchema.safeParse(state);
    if (!result.success) {
      dispatch({
        type: ActionType.SetErrors,
        payload: flattenFormErrors(result.error),
      });
      return;
    }

    dispatch({ type: ActionType.SetErrors, payload: {} });
    dispatch({ type: ActionType.SetIsSubmitting, payload: true });

    try {
      const payload: BookingPayload = {
        serviceType,
        pickup: {
          date: pickupDate,
          time: pickupTime,
          locationType: pickup.locationType,
          address: pickup.address,
          placeId: pickup.placeId,
        },
        stops: stops.map((s) => ({ address: s.address, placeId: s.placeId })),
        dropoff: {
          locationType: dropoff.locationType,
          address: dropoff.address,
          placeId: dropoff.placeId,
        },
        contact: {
          phone: phone ?? "",
          firstName:
            phoneStatus === PhoneStatus.Found ? customerName : firstName,
          lastName,
          email,
        },
        passengers: parseInt(passengers),
        travelInfo,
      };

      const data = await submitBooking(payload);

      if (data.success) {
        toast.success("Booking submitted! We'll confirm shortly.");
        dispatch({ type: ActionType.ResetForm });
      }
    } catch {
      dispatch({
        type: ActionType.SetErrors,
        payload: { ...errors, phone: "Submission failed. Please try again." },
      });
    } finally {
      dispatch({ type: ActionType.SetIsSubmitting, payload: false });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
      <div className="flex overflow-hidden rounded-xl border border-zinc-300">
        {Object.values(ServiceType).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              dispatch({ type: ActionType.SetServiceType, payload: type })
            }
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-250 ease-out ${
              serviceType === type
                ? "bg-gold text-white"
                : "bg-white text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            <span>{SERVICE_TYPE_CONFIG[type].icon}</span>
            {SERVICE_TYPE_CONFIG[type].label}
          </button>
        ))}
      </div>
      <section
        className="animate-fade-in-up space-y-2"
        style={{ animationDelay: "50ms" }}
      >
        <h3 className="text-navy text-base font-bold">Pickup</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <fieldset
              className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${
                errors.pickupDate
                  ? "border-red-400"
                  : "focus-within:border-gold border-zinc-300"
              }`}
            >
              <legend className="px-1 text-xs text-zinc-400">Date</legend>
              <div className="flex items-center gap-2">
                <svg
                  className="text-gold h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => {
                    dispatch({
                      type: ActionType.SetPickupDate,
                      payload: e.target.value,
                    });
                    dispatch({
                      type: ActionType.ClearError,
                      payload: "pickupDate",
                    });
                  }}
                  className="text-navy w-full bg-transparent text-sm outline-none"
                />
              </div>
            </fieldset>
            {errors.pickupDate && (
              <p className="mt-1 text-xs text-red-500">{errors.pickupDate}</p>
            )}
          </div>
          <div className="flex-1">
            <fieldset
              className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${
                errors.pickupTime
                  ? "border-red-400"
                  : "focus-within:border-gold border-zinc-300"
              }`}
            >
              <legend className="px-1 text-xs text-zinc-400">Time</legend>
              <div className="flex items-center gap-2">
                <svg
                  className="text-gold h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => {
                    dispatch({
                      type: ActionType.SetPickupTime,
                      payload: e.target.value,
                    });
                    dispatch({
                      type: ActionType.ClearError,
                      payload: "pickupTime",
                    });
                  }}
                  className="text-navy w-full bg-transparent text-sm outline-none"
                />
              </div>
            </fieldset>
            {errors.pickupTime && (
              <p className="mt-1 text-xs text-red-500">{errors.pickupTime}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {Object.values(LocationType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                dispatch({
                  type: ActionType.SetPickup,
                  payload: {
                    ...pickup,
                    locationType: type,
                    address: "",
                    placeId: "",
                  },
                })
              }
              className={`cursor-pointer rounded border px-3 py-1 text-xs font-medium transition-all duration-200 ease-out ${
                pickup.locationType === type
                  ? "border-gold text-gold bg-gold/5"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-400"
              }`}
            >
              {LOCATION_TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>
        <PlacesAutocomplete
          label="Location"
          value={pickup.address}
          locationType={pickup.locationType}
          onPlaceSelect={handlePickupPlaceSelect}
          onClear={() => {
            dispatch({
              type: ActionType.SetPickup,
              payload: { ...pickup, address: "", placeId: "" },
            });
            dispatch({ type: ActionType.ClearError, payload: "pickup" });
          }}
          error={errors.pickup}
        />
        {errors.pickup && (
          <p className="-mt-1 text-xs text-red-500">{errors.pickup}</p>
        )}
        {stops.map((stop, index) => (
          <div
            key={index}
            className="animate-fade-in-up flex items-start gap-2"
          >
            <div className="flex-1">
              <PlacesAutocomplete
                label={`Stop ${index + 1}`}
                value={stop.address}
                locationType={LocationType.Location}
                onPlaceSelect={(place) => handleStopPlaceSelect(index, place)}
                onClear={() =>
                  dispatch({
                    type: ActionType.UpdateStop,
                    payload: { index, stop: { ...EMPTY_STOP } },
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: ActionType.RemoveStop, payload: index })
              }
              className="mt-3 cursor-pointer text-zinc-400 transition-colors duration-200 hover:text-red-500"
              aria-label="Remove stop"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: ActionType.AddStop })}
          className="text-gold hover:text-gold-dark cursor-pointer text-sm transition-colors duration-200"
        >
          + Add a stop
        </button>
      </section>
      {serviceType === ServiceType.OneWay && (
        <section className="animate-fade-in-up space-y-2">
          <h3 className="text-navy text-base font-bold">Drop off</h3>
          <div className="flex gap-2">
            {Object.values(LocationType).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  dispatch({
                    type: ActionType.SetDropoff,
                    payload: {
                      ...dropoff,
                      locationType: type,
                      address: "",
                      placeId: "",
                    },
                  })
                }
                className={`cursor-pointer rounded border px-3 py-1 text-xs font-medium transition-all duration-200 ease-out ${
                  dropoff.locationType === type
                    ? "border-gold text-gold bg-gold/5"
                    : "border-zinc-300 text-zinc-500 hover:border-zinc-400"
                }`}
              >
                {LOCATION_TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
          <PlacesAutocomplete
            label="Location"
            value={dropoff.address}
            locationType={dropoff.locationType}
            onPlaceSelect={handleDropoffPlaceSelect}
            onClear={() => {
              dispatch({
                type: ActionType.SetDropoff,
                payload: {
                  ...dropoff,
                  address: "",
                  placeId: "",
                },
              });
              dispatch({ type: ActionType.ClearError, payload: "dropoff" });
            }}
            error={errors.dropoff}
          />
          {errors.dropoff && (
            <p className="-mt-1 text-xs text-red-500">{errors.dropoff}</p>
          )}
          {travelInfo && (
            <div className="text-blue-gray bg-gold/5 animate-fade-in flex gap-4 rounded-lg px-4 py-3 text-sm">
              <span>📍 {travelInfo.distance}</span>
              <span>⏱ {travelInfo.duration}</span>
            </div>
          )}
        </section>
      )}
      <section
        className="animate-fade-in-up space-y-2"
        style={{ animationDelay: "100ms" }}
      >
        <h3 className="text-navy text-base font-bold">Contact Information</h3>
        <div>
          <div
            className={`rounded-lg border px-3 py-2.5 transition-colors duration-200 ${
              errors.phone
                ? "border-red-400"
                : "focus-within:border-gold border-zinc-300"
            }`}
          >
            <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={handlePhoneChange}
              className="phone-input-custom"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>
        {phoneStatus === PhoneStatus.Checking && (
          <p className="text-blue-gray animate-fade-in text-sm">
            Checking phone number...
          </p>
        )}
        {phoneStatus === PhoneStatus.Found && (
          <p className="animate-fade-in text-sm text-green-600">
            Welcome back, {customerName}!
          </p>
        )}
        {phoneStatus === PhoneStatus.NotFound && (
          <div className="animate-fade-in-up space-y-2">
            <p className="text-blue-gray text-sm">
              We don&apos;t have that phone number on file. Please provide
              additional contact information.
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <fieldset
                  className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${
                    errors.firstName
                      ? "border-red-400"
                      : "focus-within:border-gold border-zinc-300"
                  }`}
                >
                  <legend className="px-1 text-xs text-zinc-400">
                    First name
                  </legend>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        dispatch({
                          type: ActionType.SetFirstName,
                          payload: e.target.value,
                        });
                        dispatch({
                          type: ActionType.ClearError,
                          payload: "firstName",
                        });
                      }}
                      placeholder="First name"
                      className="text-navy w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    />
                  </div>
                </fieldset>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <fieldset
                  className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${
                    errors.lastName
                      ? "border-red-400"
                      : "focus-within:border-gold border-zinc-300"
                  }`}
                >
                  <legend className="px-1 text-xs text-zinc-400">
                    Last name
                  </legend>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        dispatch({
                          type: ActionType.SetLastName,
                          payload: e.target.value,
                        });
                        dispatch({
                          type: ActionType.ClearError,
                          payload: "lastName",
                        });
                      }}
                      placeholder="Last name"
                      className="text-navy w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    />
                  </div>
                </fieldset>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <fieldset
                className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${
                  errors.email
                    ? "border-red-400"
                    : "focus-within:border-gold border-zinc-300"
                }`}
              >
                <legend className="px-1 text-xs text-zinc-400">Email</legend>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm text-zinc-400">@</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      dispatch({
                        type: ActionType.SetEmail,
                        payload: e.target.value,
                      });
                      dispatch({
                        type: ActionType.ClearError,
                        payload: "email",
                      });
                    }}
                    placeholder="name@example.com"
                    className="text-navy w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                  />
                </div>
              </fieldset>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        )}
      </section>
      <section
        className="animate-fade-in-up space-y-2"
        style={{ animationDelay: "150ms" }}
      >
        <p className="text-navy text-sm font-medium">
          How many passengers are expected for the trip?
        </p>
        <div className="w-32">
          <fieldset
            className={`relative rounded-lg border px-3 pt-1 pb-3 transition-colors duration-200 ${
              errors.passengers
                ? "border-red-400"
                : "focus-within:border-gold border-zinc-300"
            }`}
          >
            <legend className="px-1 text-xs text-zinc-400"># Passengers</legend>
            <div className="flex items-center gap-2">
              <span className="text-gold shrink-0 text-sm font-medium">#</span>
              <input
                type="number"
                min="1"
                max="99"
                value={passengers}
                onChange={(e) => {
                  dispatch({
                    type: ActionType.SetPassengers,
                    payload: e.target.value,
                  });
                  dispatch({
                    type: ActionType.ClearError,
                    payload: "passengers",
                  });
                }}
                placeholder="1"
                className="text-navy w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
          </fieldset>
          {errors.passengers && (
            <p className="mt-1 text-xs text-red-500">{errors.passengers}</p>
          )}
        </div>
      </section>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-gold hover:bg-gold-dark w-full cursor-pointer rounded-lg py-3.5 font-semibold text-white transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </button>
    </form>
  );
}
