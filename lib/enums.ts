export function enumValues<T extends Record<string, string>>(
  obj: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]];
}

export const ServiceType = {
  OneWay: "one-way",
  Hourly: "hourly",
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const LocationType = {
  Location: "location",
  Airport: "airport",
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const PhoneStatus = {
  Idle: "idle",
  Checking: "checking",
  Found: "found",
  NotFound: "not-found",
} as const;

export type PhoneStatus = (typeof PhoneStatus)[keyof typeof PhoneStatus];

export const SERVICE_TYPE_CONFIG = {
  [ServiceType.OneWay]: { label: "One-way", icon: "➤" },
  [ServiceType.Hourly]: { label: "Hourly", icon: "⏱" },
} as const;

export const LOCATION_TYPE_CONFIG = {
  [LocationType.Location]: { label: "Location" },
  [LocationType.Airport]: { label: "Airport" },
} as const;
