import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { ServiceType, PhoneStatus, enumValues } from "@/lib/enums";
import { locationStateSchema, stopStateSchema } from "@/lib/schemas";

export const bookingFormSchema = z
  .object({
    serviceType: z.enum(enumValues(ServiceType)),
    pickupDate: z.string().min(1, "Required"),
    pickupTime: z.string().min(1, "Required"),
    pickup: locationStateSchema.refine((loc) => loc.placeId.length > 0, {
      message: "Select a pickup location",
    }),
    dropoff: locationStateSchema,
    stops: z.array(stopStateSchema),
    phone: z.string().refine((val) => !!val && isValidPhoneNumber(val), {
      message: "Valid phone number required",
    }),
    phoneStatus: z.enum(enumValues(PhoneStatus)),
    customerName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    passengers: z.string().refine((val) => !!val && parseInt(val) >= 1, {
      message: "At least 1 passenger",
    }),
    travelInfo: z
      .object({ distance: z.string(), duration: z.string() })
      .nullable(),
    isSubmitting: z.boolean(),
    errors: z.record(z.string(), z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.serviceType === ServiceType.OneWay && !data.dropoff.placeId) {
      ctx.addIssue({
        code: "custom",
        path: ["dropoff"],
        message: "Select a drop off location",
      });
    }
    if (data.phoneStatus === PhoneStatus.NotFound) {
      if (!data.firstName.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["firstName"],
          message: "Required",
        });
      }
      if (!data.lastName.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["lastName"],
          message: "Required",
        });
      }
      if (
        !data.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Valid email required",
        });
      }
    }
  });
