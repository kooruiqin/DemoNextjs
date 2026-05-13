import { z } from "zod";

export const coordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type Coords = z.infer<typeof coordsSchema>;

export type NearbyPlace = {
  id: string;
  name: string;
  rating: number | null;
  userRatingCount: number | null;
  formattedAddress: string | null;
  priceLevel: string | null;
  primaryType: string | null;
  openNow: boolean | null;
  distanceMeters: number;
  location: { lat: number; lng: number };
  mapsUrl: string;
};
