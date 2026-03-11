import { z } from "zod";
import { ServiceType, LocationType, enumValues } from "@/lib/enums";

export const locationStateSchema = z.object({
  locationType: z.enum(enumValues(LocationType)),
  address: z.string(),
  placeId: z.string(),
});

export type LocationState = z.infer<typeof locationStateSchema>;

export const stopStateSchema = z.object({
  address: z.string(),
  placeId: z.string(),
});

export type StopState = z.infer<typeof stopStateSchema>;

export const autocompleteRequestSchema = z.object({
  input: z.string().min(1),
  type: z.enum(enumValues(LocationType)),
});

export const directionsRequestSchema = z.object({
  originPlaceId: z.string().min(1),
  destinationPlaceId: z.string().min(1),
  waypointPlaceIds: z.array(z.string()),
});

export const bookingPayloadSchema = z.object({
  serviceType: z.enum(enumValues(ServiceType)),
  pickup: z.object({
    date: z.string().min(1),
    time: z.string().min(1),
    locationType: z.enum(enumValues(LocationType)),
    address: z.string().min(1),
    placeId: z.string().min(1),
  }),
  stops: z.array(
    z.object({
      address: z.string(),
      placeId: z.string(),
    }),
  ),
  dropoff: z.object({
    locationType: z.enum(enumValues(LocationType)),
    address: z.string(),
    placeId: z.string(),
  }),
  contact: z.object({
    phone: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
  passengers: z.number().int().min(1),
  travelInfo: z
    .object({ distance: z.string(), duration: z.string() })
    .nullable(),
});

export const phoneLookupRequestSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
});

export function flattenFormErrors(error: z.ZodError): Record<string, string> {
  const keyed = error.issues.map(
    (issue) => [issue.path.map(String).join("."), issue.message] as const,
  );
  return Object.fromEntries(
    keyed.filter(([key], i) => keyed.findIndex(([k]) => k === key) === i),
  );
}
