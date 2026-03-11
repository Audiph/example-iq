import { ServiceType, LocationType, PhoneStatus } from "@/lib/enums";
import type { LocationState, StopState } from "@/lib/schemas";

export const EMPTY_LOCATION: LocationState = {
  locationType: LocationType.Location,
  address: "",
  placeId: "",
};

export const EMPTY_STOP: StopState = {
  address: "",
  placeId: "",
};

export interface FormState {
  readonly serviceType: ServiceType;
  readonly pickupDate: string;
  readonly pickupTime: string;
  readonly pickup: LocationState;
  readonly dropoff: LocationState;
  readonly stops: ReadonlyArray<StopState>;
  readonly phone: string | undefined;
  readonly phoneStatus: PhoneStatus;
  readonly customerName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly passengers: string;
  readonly travelInfo: {
    readonly distance: string;
    readonly duration: string;
  } | null;
  readonly errors: Record<string, string>;
  readonly isSubmitting: boolean;
}

export const INITIAL_STATE: FormState = {
  serviceType: ServiceType.OneWay,
  pickupDate: "",
  pickupTime: "",
  pickup: EMPTY_LOCATION,
  dropoff: EMPTY_LOCATION,
  stops: [],
  phone: "",
  phoneStatus: PhoneStatus.Idle,
  customerName: "",
  firstName: "",
  lastName: "",
  email: "",
  passengers: "",
  travelInfo: null,
  errors: {},
  isSubmitting: false,
};

export enum ActionType {
  SetServiceType = "SET_SERVICE_TYPE",
  SetPickupDate = "SET_PICKUP_DATE",
  SetPickupTime = "SET_PICKUP_TIME",
  SetPickup = "SET_PICKUP",
  SetDropoff = "SET_DROPOFF",
  SetStops = "SET_STOPS",
  AddStop = "ADD_STOP",
  RemoveStop = "REMOVE_STOP",
  UpdateStop = "UPDATE_STOP",
  SetPhone = "SET_PHONE",
  SetPhoneStatus = "SET_PHONE_STATUS",
  PhoneLookupResult = "PHONE_LOOKUP_RESULT",
  SetFirstName = "SET_FIRST_NAME",
  SetLastName = "SET_LAST_NAME",
  SetEmail = "SET_EMAIL",
  SetPassengers = "SET_PASSENGERS",
  SetTravelInfo = "SET_TRAVEL_INFO",
  SetErrors = "SET_ERRORS",
  SetIsSubmitting = "SET_IS_SUBMITTING",
  ClearError = "CLEAR_ERROR",
  ResetForm = "RESET_FORM",
}

export type FormAction =
  | { readonly type: ActionType.SetServiceType; readonly payload: ServiceType }
  | { readonly type: ActionType.SetPickupDate; readonly payload: string }
  | { readonly type: ActionType.SetPickupTime; readonly payload: string }
  | { readonly type: ActionType.SetPickup; readonly payload: LocationState }
  | { readonly type: ActionType.SetDropoff; readonly payload: LocationState }
  | {
      readonly type: ActionType.SetStops;
      readonly payload: ReadonlyArray<StopState>;
    }
  | { readonly type: ActionType.AddStop }
  | { readonly type: ActionType.RemoveStop; readonly payload: number }
  | {
      readonly type: ActionType.UpdateStop;
      readonly payload: { readonly index: number; readonly stop: StopState };
    }
  | { readonly type: ActionType.SetPhone; readonly payload: string | undefined }
  | { readonly type: ActionType.SetPhoneStatus; readonly payload: PhoneStatus }
  | {
      readonly type: ActionType.PhoneLookupResult;
      readonly payload: {
        readonly phoneStatus: PhoneStatus;
        readonly customerName: string;
      };
    }
  | { readonly type: ActionType.SetFirstName; readonly payload: string }
  | { readonly type: ActionType.SetLastName; readonly payload: string }
  | { readonly type: ActionType.SetEmail; readonly payload: string }
  | { readonly type: ActionType.SetPassengers; readonly payload: string }
  | {
      readonly type: ActionType.SetTravelInfo;
      readonly payload: {
        readonly distance: string;
        readonly duration: string;
      } | null;
    }
  | {
      readonly type: ActionType.SetErrors;
      readonly payload: Record<string, string>;
    }
  | { readonly type: ActionType.SetIsSubmitting; readonly payload: boolean }
  | { readonly type: ActionType.ClearError; readonly payload: string }
  | { readonly type: ActionType.ResetForm };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case ActionType.SetServiceType:
      return { ...state, serviceType: action.payload };
    case ActionType.SetPickupDate:
      return { ...state, pickupDate: action.payload };
    case ActionType.SetPickupTime:
      return { ...state, pickupTime: action.payload };
    case ActionType.SetPickup:
      return { ...state, pickup: action.payload };
    case ActionType.SetDropoff:
      return { ...state, dropoff: action.payload };
    case ActionType.SetStops:
      return { ...state, stops: action.payload };
    case ActionType.AddStop:
      return { ...state, stops: [...state.stops, { ...EMPTY_STOP }] };
    case ActionType.RemoveStop:
      return {
        ...state,
        stops: state.stops.filter((_, i) => i !== action.payload),
      };
    case ActionType.UpdateStop:
      return {
        ...state,
        stops: state.stops.map((stop, i) =>
          i === action.payload.index ? action.payload.stop : stop,
        ),
      };
    case ActionType.SetPhone:
      return { ...state, phone: action.payload, phoneStatus: PhoneStatus.Idle };
    case ActionType.SetPhoneStatus:
      return { ...state, phoneStatus: action.payload };
    case ActionType.PhoneLookupResult:
      return {
        ...state,
        phoneStatus: action.payload.phoneStatus,
        customerName: action.payload.customerName,
      };
    case ActionType.SetFirstName:
      return { ...state, firstName: action.payload };
    case ActionType.SetLastName:
      return { ...state, lastName: action.payload };
    case ActionType.SetEmail:
      return { ...state, email: action.payload };
    case ActionType.SetPassengers:
      return { ...state, passengers: action.payload };
    case ActionType.SetTravelInfo:
      return { ...state, travelInfo: action.payload };
    case ActionType.SetErrors:
      return { ...state, errors: action.payload };
    case ActionType.SetIsSubmitting:
      return { ...state, isSubmitting: action.payload };
    case ActionType.ClearError:
      return {
        ...state,
        errors: Object.fromEntries(
          Object.entries(state.errors).filter(
            ([key]) => key !== action.payload,
          ),
        ),
      };
    case ActionType.ResetForm:
      return INITIAL_STATE;
  }
}
