import type { LatLng } from "../types/coordinates";
import { requireMapboxAccessToken } from "../utils/mapbox";

export type SearchResult = {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
  boundingBox?: [number, number, number, number];
};

export type RouteResult = {
  coordinates: LatLng[];
  distanceInMeters: number;
  durationInSeconds: number;
};

const MAPBOX_GEOCODING_ENDPOINT = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MAPBOX_DIRECTIONS_ENDPOINT = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic";

type MapboxGeocodingFeature = {
  id: string;
  place_name?: string;
  text?: string;
  center?: [number, number];
  bbox?: [number, number, number, number];
};

type MapboxGeocodingResponse = {
  features?: MapboxGeocodingFeature[];
  message?: string;
};

type MapboxDirectionsRoute = {
  distance?: number;
  duration?: number;
  geometry?: {
    coordinates?: [number, number][];
  };
};

type MapboxDirectionsResponse = {
  routes?: MapboxDirectionsRoute[];
  code?: string;
  message?: string;
};

function toBoundingBox(
  bbox: [number, number, number, number] | undefined
): [number, number, number, number] | undefined {
  if (!bbox) {
    return undefined;
  }
  const [west, south, east, north] = bbox;
  return [south, north, west, east];
}

function toLatLngCollection(
  coordinates: [number, number][] | undefined
): LatLng[] {
  if (!coordinates || coordinates.length === 0) {
    return [];
  }
  return coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
}

function assertMapboxResponse(
  response: Response,
  body: { message?: string }
) {
  if (response.ok) {
    return;
  }
  const details = body.message ? `: ${body.message}` : "";
  throw new Error(`Mapbox request failed (${response.status})${details}`);
}

function assertMapboxCode(code: string | undefined, message?: string) {
  if (code === "Ok" || code === "NoRoute" || code === undefined) {
    return;
  }
  const details = message ? `: ${message}` : "";
  throw new Error(`Mapbox request failed (${code})${details}`);
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const token = requireMapboxAccessToken();
  const params = new URLSearchParams({
    access_token: token,
    limit: "8",
    language: "en",
  });

  const encodedQuery = encodeURIComponent(trimmed);
  const response = await fetch(
    `${MAPBOX_GEOCODING_ENDPOINT}/${encodedQuery}.json?${params.toString()}`
  );
  const data = (await response.json()) as MapboxGeocodingResponse;
  assertMapboxResponse(response, data);

  const features = data.features ?? [];
  return features.map((feature) => {
    const center = feature.center ?? [0, 0];
    const displayName = feature.place_name ?? feature.text ?? trimmed;

    return {
      id: feature.id,
      displayName,
      latitude: center[1],
      longitude: center[0],
      boundingBox: toBoundingBox(feature.bbox),
    };
  });
}

export async function fetchRoute(
  start: LatLng,
  destination: LatLng
): Promise<RouteResult | null> {
  const token = requireMapboxAccessToken();
  const params = new URLSearchParams({
    access_token: token,
    geometries: "geojson",
    overview: "full",
    steps: "false",
  });

  const waypointParam = `${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}`;
  const response = await fetch(
    `${MAPBOX_DIRECTIONS_ENDPOINT}/${waypointParam}?${params.toString()}`
  );
  const data = (await response.json()) as MapboxDirectionsResponse;
  assertMapboxResponse(response, data);
  assertMapboxCode(data.code, data.message);

  const [route] = data.routes ?? [];
  if (!route?.geometry?.coordinates || route.geometry.coordinates.length === 0) {
    return null;
  }

  const coordinates = toLatLngCollection(route.geometry.coordinates);
  const distanceInMeters = route.distance ?? 0;
  const durationInSeconds = route.duration ?? 0;

  return {
    coordinates,
    distanceInMeters,
    durationInSeconds,
  };
}

export function parseGeoUri(uri: string): LatLng | null {
  const trimmed = uri.trim();
  if (!trimmed.toLowerCase().startsWith("geo:")) {
    return null;
  }

  const [, coords] = trimmed.split(":");
  const [lat, lon] = coords.split(",");
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }

  return null;
}
