import { lookupPhone } from "@/lib/mock-db";
import { phoneLookupRequestSchema } from "@/lib/schemas";
import type { PhoneLookupResponse } from "@/types";

export async function POST(request: Request) {
  const parsed = phoneLookupRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Phone number is required" },
      { status: 400 },
    );
  }

  const contact = lookupPhone(parsed.data.phone);

  if (contact) {
    return Response.json({
      found: true,
      firstName: contact.firstName,
    } satisfies PhoneLookupResponse);
  }

  return Response.json({ found: false } satisfies PhoneLookupResponse);
}
