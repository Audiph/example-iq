import type { ServiceType, LocationType } from "@/lib/enums";

export interface PlaceResult {
  readonly address: string;
  readonly placeId: string;
}

export interface PlacePrediction {
  readonly placeId: string;
  readonly description: string;
}

export interface AutocompleteResponse {
  readonly predictions: ReadonlyArray<PlacePrediction>;
}

export interface DirectionsResponse {
  readonly distance: string;
  readonly duration: string;
}

export interface BookingPickup {
  readonly date: string;
  readonly time: string;
  readonly locationType: LocationType;
  readonly address: string;
  readonly placeId: string;
}

export interface BookingStop {
  readonly address: string;
  readonly placeId: string;
}

export interface BookingDropoff {
  readonly locationType: LocationType;
  readonly address: string;
  readonly placeId: string;
}

export interface BookingContact {
  readonly phone: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export interface TravelInfo {
  readonly distance: string;
  readonly duration: string;
}

export interface BookingPayload {
  readonly serviceType: ServiceType;
  readonly pickup: BookingPickup;
  readonly stops: ReadonlyArray<BookingStop>;
  readonly dropoff: BookingDropoff;
  readonly contact: BookingContact;
  readonly passengers: number;
  readonly travelInfo: TravelInfo | null;
}

export interface PhoneLookupResponse {
  readonly found: boolean;
  readonly firstName?: string;
  readonly error?: string;
}

export interface Summary {
  readonly id: string;
  readonly serviceType: ServiceType;
  readonly pickup: string;
  readonly dropoff: string;
  readonly passengers: number;
  readonly travelInfo: TravelInfo | null;
}

export interface BookingResponse {
  readonly success: boolean;
  readonly bookingId: string;
  readonly message: string;
  readonly summary: Summary;
}
