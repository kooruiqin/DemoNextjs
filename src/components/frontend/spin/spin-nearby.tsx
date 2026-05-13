"use client";

import * as React from "react";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Star,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type MealType } from "@/lib/mock/daily";
import { findNearbyRestaurants } from "@/server/actions/nearby-places";
import { type NearbyPlace } from "@/lib/schemas/nearby";
import { SlotRoller } from "./slot-roller";
import { type WheelOption } from "./wheel-types";

type Props = {
  onResult: (entry: { mealType: MealType; optionName: string }) => void;
};

type State =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "fetching"; coords: { lat: number; lng: number } }
  | {
      kind: "ready";
      coords: { lat: number; lng: number };
      places: NearbyPlace[];
      radiusMeters: number;
    }
  | { kind: "error"; message: string };

type Category = "restaurant" | "cafe" | "bar" | "takeaway" | "other";

const CATEGORIES: Array<{ id: Category; label: string }> = [
  { id: "restaurant", label: "Restaurants" },
  { id: "cafe", label: "Cafes" },
  { id: "bar", label: "Bars" },
  { id: "takeaway", label: "Takeaway" },
];

const PRICE_LEVELS = [
  { id: "PRICE_LEVEL_INEXPENSIVE", label: "$" },
  { id: "PRICE_LEVEL_MODERATE", label: "$$" },
  { id: "PRICE_LEVEL_EXPENSIVE", label: "$$$" },
  { id: "PRICE_LEVEL_VERY_EXPENSIVE", label: "$$$$" },
] as const;
type PriceLevel = (typeof PRICE_LEVELS)[number]["id"];

const RATING_THRESHOLDS = [
  { id: 0, label: "Any" },
  { id: 3.5, label: "3.5+" },
  { id: 4.0, label: "4.0+" },
  { id: 4.5, label: "4.5+" },
] as const;
type RatingThreshold = (typeof RATING_THRESHOLDS)[number]["id"];

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};

function inferMealFromTime(): MealType {
  return new Date().getHours() < 17 ? "lunch" : "dinner";
}

function formatDistance(m: number) {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function priceSymbols(level: string | null): string {
  switch (level) {
    case "PRICE_LEVEL_FREE":
      return "Free";
    case "PRICE_LEVEL_INEXPENSIVE":
      return "$";
    case "PRICE_LEVEL_MODERATE":
      return "$$";
    case "PRICE_LEVEL_EXPENSIVE":
      return "$$$";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "$$$$";
    default:
      return "";
  }
}

function categoryOf(primaryType: string | null): Category {
  if (!primaryType) return "other";
  const t = primaryType.toLowerCase();
  if (t.includes("bar") || t.includes("night_club") || t.includes("pub")) return "bar";
  if (
    t.includes("cafe") ||
    t.includes("coffee") ||
    t.includes("bakery") ||
    t.includes("tea_house") ||
    t.includes("dessert")
  ) {
    return "cafe";
  }
  if (t.includes("takeaway") || t.includes("delivery")) return "takeaway";
  if (t.includes("restaurant") || t.includes("food")) return "restaurant";
  return "other";
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function SpinNearby({ onResult }: Props) {
  const [state, setState] = React.useState<State>({ kind: "idle" });
  const [categoryFilter, setCategoryFilter] = React.useState<Set<Category>>(new Set());
  const [priceFilter, setPriceFilter] = React.useState<Set<PriceLevel>>(new Set());
  const [ratingFilter, setRatingFilter] = React.useState<RatingThreshold>(0);
  const [openNowOnly, setOpenNowOnly] = React.useState(false);

  function resetFilters() {
    setCategoryFilter(new Set());
    setPriceFilter(new Set());
    setRatingFilter(0);
    setOpenNowOnly(false);
  }

  // Reset filters whenever a new set of places loads.
  const placesKey =
    state.kind === "ready"
      ? `${state.coords.lat},${state.coords.lng},${state.places.length}`
      : "";
  React.useEffect(() => {
    if (placesKey) resetFilters();
  }, [placesKey]);

  async function fetchPlaces(coords: { lat: number; lng: number }) {
    setState({ kind: "fetching", coords });
    const res = await findNearbyRestaurants(coords);
    if (!res.data) {
      setState({ kind: "error", message: res.error ?? "Unknown error" });
      return;
    }
    const { places, center, radiusMeters } = res.data;
    if (places.length === 0) {
      setState({
        kind: "error",
        message: "No places found within 3 km. Try a different location.",
      });
      return;
    }
    setState({ kind: "ready", coords: center, places, radiusMeters });
  }

  function requestLocation() {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ kind: "error", message: "Geolocation isn't available in this browser." });
      return;
    }
    setState({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fetchPlaces({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow access in your browser settings, then try again."
            : err.code === err.POSITION_UNAVAILABLE
              ? "Couldn't determine your location."
              : err.code === err.TIMEOUT
                ? "Location request timed out. Try again."
                : "Failed to get your location.";
        setState({ kind: "error", message });
      },
      GEOLOCATION_OPTIONS,
    );
  }

  if (state.kind === "idle") {
    return <IdleCard onStart={requestLocation} />;
  }

  if (state.kind === "locating") {
    return (
      <StatusCard icon={<Navigation className="size-5 animate-pulse" />} title="Getting your location…" />
    );
  }

  if (state.kind === "fetching") {
    return (
      <StatusCard icon={<Loader2 className="size-5 animate-spin" />} title="Finding places within 3 km…" />
    );
  }

  if (state.kind === "error") {
    return (
      <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="size-5" />
          </div>
          <div className="max-w-md space-y-1">
            <p className="text-sm font-medium">Couldn&apos;t load nearby places</p>
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
          <Button size="sm" variant="outline" onClick={requestLocation} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { places, coords, radiusMeters } = state;

  // Per-category counts on the unfiltered set, used to dim empty chips and show counts.
  const categoryCounts = places.reduce<Record<Category, number>>(
    (acc, p) => {
      const c = categoryOf(p.primaryType);
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    },
    { restaurant: 0, cafe: 0, bar: 0, takeaway: 0, other: 0 },
  );

  const filteredPlaces = places.filter((p) => {
    if (categoryFilter.size > 0 && !categoryFilter.has(categoryOf(p.primaryType))) return false;
    if (priceFilter.size > 0) {
      if (!p.priceLevel || !priceFilter.has(p.priceLevel as PriceLevel)) return false;
    }
    if (ratingFilter > 0 && (p.rating == null || p.rating < ratingFilter)) return false;
    if (openNowOnly && p.openNow !== true) return false;
    return true;
  });

  const filtersActive =
    categoryFilter.size > 0 ||
    priceFilter.size > 0 ||
    ratingFilter > 0 ||
    openNowOnly;
  const rollerOptions: WheelOption[] = filteredPlaces.map((p) => ({ id: p.id, label: p.name }));
  const placeById = new Map(places.map((p) => [p.id, p]));
  const meal = inferMealFromTime();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span>
            {filtersActive ? (
              <>
                <span className="font-medium text-foreground">{filteredPlaces.length}</span> of{" "}
                {places.length} places
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{places.length}</span> places
              </>
            )}{" "}
            within {(radiusMeters / 1000).toFixed(0)} km
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => fetchPlaces(coords)}>
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={requestLocation}>
            <Navigation className="size-3.5" />
            Re-locate
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <FilterRow label="Category">
            {CATEGORIES.map((c) => {
              const count = categoryCounts[c.id];
              const active = categoryFilter.has(c.id);
              const empty = count === 0;
              return (
                <FilterChip
                  key={c.id}
                  active={active}
                  disabled={empty}
                  onClick={() => setCategoryFilter((s) => toggleInSet(s, c.id))}
                >
                  {c.label}
                  <span
                    className={cn(
                      "ml-1 text-[10px] tabular-nums",
                      active ? "text-background/70" : "text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </FilterChip>
              );
            })}
          </FilterRow>

          <FilterRow label="Price">
            {PRICE_LEVELS.map((p) => {
              const active = priceFilter.has(p.id);
              return (
                <FilterChip
                  key={p.id}
                  active={active}
                  onClick={() => setPriceFilter((s) => toggleInSet(s, p.id))}
                >
                  <span className="font-semibold tracking-tight">{p.label}</span>
                </FilterChip>
              );
            })}
          </FilterRow>

          <FilterRow label="Rating">
            {RATING_THRESHOLDS.map((r) => {
              const active = ratingFilter === r.id;
              return (
                <FilterChip
                  key={r.id}
                  active={active}
                  onClick={() => setRatingFilter(r.id)}
                >
                  {r.id > 0 ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Star
                        className={cn(
                          "size-3",
                          active ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400",
                        )}
                      />
                      {r.label}
                    </span>
                  ) : (
                    r.label
                  )}
                </FilterChip>
              );
            })}
          </FilterRow>

          <FilterRow label="Open">
            <FilterChip active={openNowOnly} onClick={() => setOpenNowOnly((v) => !v)}>
              Open now only
            </FilterChip>
            {(priceFilter.size > 0 || ratingFilter > 0 || openNowOnly) && (
              <span className="text-xs text-muted-foreground">
                Places missing this data are hidden.
              </span>
            )}
          </FilterRow>

          {filtersActive && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs"
                onClick={resetFilters}
              >
                <X className="size-3" />
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SlotRoller
        options={rollerOptions}
        resetKey={`${placesKey}|${[...categoryFilter].sort().join(",")}|${[...priceFilter].sort().join(",")}|${ratingFilter}|${openNowOnly ? 1 : 0}`}
        onResult={(r) => onResult({ mealType: meal, optionName: r.label })}
        emptyState={
          <div className="space-y-2">
            <p>No places match these filters.</p>
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        }
        caption={
          rollerOptions.length > 0
            ? `Spin to pick from ${rollerOptions.length} ${rollerOptions.length === 1 ? "place" : "places"}.`
            : undefined
        }
        renderRow={(r) => {
          const p = placeById.get(r.id);
          if (!p) return <span className="truncate font-medium">{r.label}</span>;
          return (
            <div className="flex w-full items-center gap-3">
              <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
              <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground">
                {p.rating != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {p.rating.toFixed(1)}
                  </span>
                )}
                <span>{formatDistance(p.distanceMeters)}</span>
              </span>
            </div>
          );
        }}
        renderResult={(r) => {
          const p = placeById.get(r.id);
          if (!p) return <p className="text-2xl font-semibold tracking-tight">{r.label}</p>;
          return <PlaceResult place={p} />;
        }}
      />
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors",
        disabled
          ? "cursor-not-allowed border-dashed text-muted-foreground/50"
          : active
            ? "border-transparent bg-foreground text-background shadow-sm"
            : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function IdleCard({ onStart }: { onStart: () => void }) {
  return (
    <Card className="relative overflow-hidden border-orange-200/50 bg-gradient-to-br from-orange-50 to-rose-50/60 dark:border-orange-900/30 dark:from-orange-950/40 dark:to-rose-950/30">
      <CardContent className="relative flex flex-col items-center gap-5 py-14 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-orange-500/30">
          <MapPin className="size-6" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">Pick from places near you</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ll pull restaurants, cafes, bars and takeaway spots within 3&nbsp;km of where
            you are, then let the reel choose. Your location stays on this device — only the
            coordinates are sent to find places.
          </p>
        </div>
        <Button size="lg" onClick={onStart} className="h-12 gap-2 rounded-full px-7">
          <Navigation className="size-4" />
          Find places near me
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-muted">{icon}</div>
        <p className="text-sm font-medium">{title}</p>
      </CardContent>
    </Card>
  );
}

function PlaceResult({ place }: { place: NearbyPlace }) {
  const price = priceSymbols(place.priceLevel);
  return (
    <div className="flex flex-col items-center gap-3">
      <Badge className="gap-1 bg-foreground px-3 py-1 text-sm">
        <MapPin className="size-3" />
        {formatDistance(place.distanceMeters)} away
      </Badge>
      <p className="max-w-md text-2xl font-semibold tracking-tight">{place.name}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {place.rating != null && (
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {place.rating.toFixed(1)}
            {place.userRatingCount ? (
              <span className="text-muted-foreground/70">({place.userRatingCount})</span>
            ) : null}
          </span>
        )}
        {price && <span>{price}</span>}
        {place.primaryType && (
          <span className="capitalize">{place.primaryType.replaceAll("_", " ")}</span>
        )}
        {place.openNow != null && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              place.openNow
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-rose-700 dark:text-rose-400",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                place.openNow ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            {place.openNow ? "Open now" : "Closed"}
          </span>
        )}
      </div>
      {place.formattedAddress && (
        <p className="max-w-md text-xs text-muted-foreground">{place.formattedAddress}</p>
      )}
      <Button asChild size="sm" variant="outline" className="mt-1 gap-1.5">
        <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer">
          Open in Google Maps
          <ExternalLink className="size-3.5" />
        </a>
      </Button>
    </div>
  );
}
