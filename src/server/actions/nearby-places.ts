"use server";

import { env } from "@/lib/env";
import { requireSession } from "@/lib/session";
import { coordsSchema, type NearbyPlace } from "@/lib/schemas/nearby";

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

const SEARCH_RADIUS_METERS = 3000;
const MAX_RESULTS = 20;
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.location",
  "places.priceLevel",
  "places.primaryType",
  "places.regularOpeningHours.openNow",
].join(",");

type PlacesApiResponse = {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    location?: { latitude: number; longitude: number };
    priceLevel?: string;
    primaryType?: string;
    regularOpeningHours?: { openNow?: boolean };
  }>;
  error?: { message?: string };
};

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export async function findNearbyRestaurants(
  input: unknown,
): Promise<ActionResult<{ places: NearbyPlace[]; center: { lat: number; lng: number }; radiusMeters: number }>> {
  await requireSession();

  const parsed = coordsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid coordinates" };
  }
  const { lat, lng } = parsed.data;

  if (!env.GOOGLE_MAPS_API_KEY) {
    return {
      error:
        "Google Maps API is not configured. Add GOOGLE_MAPS_API_KEY to .env.local and restart the server.",
    };
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        // Broader food + drink coverage. Filtering is done client-side so a single
        // fetch covers all category/price selections.
        includedTypes: [
          "restaurant",
          "cafe",
          "coffee_shop",
          "bakery",
          "bar",
          "meal_takeaway",
        ],
        maxResultCount: MAX_RESULTS,
        rankPreference: "POPULARITY",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: SEARCH_RADIUS_METERS,
          },
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as PlacesApiResponse | null;
      const msg = body?.error?.message ?? `Places API responded ${res.status}`;
      console.error("findNearbyRestaurants: Places API error:", msg);
      return { error: msg };
    }

    const body = (await res.json()) as PlacesApiResponse;
    const places: NearbyPlace[] = (body.places ?? []).flatMap((p) => {
      const loc = p.location
        ? { lat: p.location.latitude, lng: p.location.longitude }
        : null;
      const name = p.displayName?.text;
      if (!loc || !name) return [];
      return [
        {
          id: p.id,
          name,
          rating: p.rating ?? null,
          userRatingCount: p.userRatingCount ?? null,
          formattedAddress: p.formattedAddress ?? null,
          priceLevel: p.priceLevel ?? null,
          primaryType: p.primaryType ?? null,
          openNow: p.regularOpeningHours?.openNow ?? null,
          distanceMeters: Math.round(haversineMeters({ lat, lng }, loc)),
          location: loc,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${p.id}`,
        },
      ];
    });

    places.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return {
      data: {
        places,
        center: { lat, lng },
        radiusMeters: SEARCH_RADIUS_METERS,
      },
    };
  } catch (e) {
    console.error("findNearbyRestaurants failed:", e);
    return { error: "Failed to reach Google Places API" };
  }
}
