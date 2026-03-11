import { directionsRequestSchema } from "@/lib/schemas";
import type { DirectionsResponse } from "@/types";

interface SegmentResult {
  readonly meters: number;
  readonly seconds: number;
}

async function fetchSegment(
  origin: string,
  destination: string,
  apiKey: string,
): Promise<SegmentResult> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json",
  );
  url.searchParams.set("origins", `place_id:${origin}`);
  url.searchParams.set("destinations", `place_id:${destination}`);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(data.error_message ?? "Distance Matrix API error");
  }

  const element = data.rows?.[0]?.elements?.[0];

  if (!element || element.status !== "OK") {
    const status = element?.status ?? "UNKNOWN";
    throw new Error(
      `Could not calculate distance for route segment: ${status}`,
    );
  }

  return { meters: element.distance.value, seconds: element.duration.value };
}

export async function POST(request: Request) {
  const parsed = directionsRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { originPlaceId, destinationPlaceId, waypointPlaceIds } = parsed.data;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Google Maps API key not configured" },
      { status: 500 },
    );
  }

  const allPlaceIds = [originPlaceId, ...waypointPlaceIds, destinationPlaceId];
  const pairs = allPlaceIds
    .slice(0, -1)
    .map((_, i) => [allPlaceIds[i], allPlaceIds[i + 1]] as const);

  try {
    const segments = await Promise.all(
      pairs.map(([origin, dest]) => fetchSegment(origin, dest, apiKey)),
    );

    const totalMeters = segments.reduce((sum, s) => sum + s.meters, 0);
    const totalSeconds = segments.reduce((sum, s) => sum + s.seconds, 0);

    const miles = totalMeters / 1609.344;
    const distance = `${miles.toFixed(1)} mi`;

    const totalMinutes = Math.round(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration =
      hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

    return Response.json({ distance, duration } satisfies DirectionsResponse);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 },
    );
  }
}
