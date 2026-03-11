import type {
  AutocompleteResponse,
  BookingPayload,
  BookingResponse,
  DirectionsResponse,
  PhoneLookupResponse,
} from "@/types";
import type { LocationType } from "@/lib/enums";

enum ApiEndpoint {
  PhoneLookup = "/api/phone-lookup",
  Bookings = "/api/bookings",
  PlacesAutocomplete = "/api/places-autocomplete",
  Directions = "/api/directions",
}

async function postJson<T>(endpoint: ApiEndpoint, body: unknown): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function phoneLookup(phone: string): Promise<PhoneLookupResponse> {
  return postJson<PhoneLookupResponse>(ApiEndpoint.PhoneLookup, { phone });
}

export async function submitBooking(
  payload: BookingPayload,
): Promise<BookingResponse> {
  return postJson<BookingResponse>(ApiEndpoint.Bookings, payload);
}

export async function fetchPlacePredictions(
  input: string,
  type: LocationType,
): Promise<AutocompleteResponse> {
  return postJson<AutocompleteResponse>(ApiEndpoint.PlacesAutocomplete, {
    input,
    type,
  });
}

export async function fetchDirections(
  originPlaceId: string,
  destinationPlaceId: string,
  waypointPlaceIds: ReadonlyArray<string>,
): Promise<DirectionsResponse> {
  return postJson<DirectionsResponse>(ApiEndpoint.Directions, {
    originPlaceId,
    destinationPlaceId,
    waypointPlaceIds,
  });
}
