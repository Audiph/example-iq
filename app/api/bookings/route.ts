import { lookupPhone, saveContact } from "@/lib/mock-db";
import { bookingPayloadSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = bookingPayloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid booking payload", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const body = parsed.data;

  const existing = lookupPhone(body.contact.phone);
  if (!existing && body.contact.firstName) {
    saveContact({
      phone: body.contact.phone,
      firstName: body.contact.firstName,
      lastName: body.contact.lastName,
      email: body.contact.email,
    });
  }

  const bookingId = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return Response.json({
    success: true,
    bookingId,
    message: "Booking submitted successfully",
    summary: {
      id: bookingId,
      serviceType: body.serviceType,
      pickup: body.pickup.address,
      dropoff: body.dropoff.address,
      passengers: body.passengers,
      travelInfo: body.travelInfo,
    },
  });
}
