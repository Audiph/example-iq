import { autocompleteRequestSchema } from "@/lib/schemas";
import { LocationType } from "@/lib/enums";
import type { AutocompleteResponse } from "@/types";

export async function POST(request: Request) {
  const parsed = autocompleteRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { input, type } = parsed.data;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    );
  }

  const types =
    type === LocationType.Airport ? "airport" : "establishment|geocode";

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", input);
  url.searchParams.set("types", types);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return Response.json(
      { error: data.error_message ?? "Places API error" },
      { status: 502 },
    );
  }

  const predictions = (data.predictions ?? []).map(
    (p: { place_id: string; description: string }) => ({
      placeId: p.place_id,
      description: p.description,
    }),
  );

  return Response.json({ predictions } satisfies AutocompleteResponse);
}
