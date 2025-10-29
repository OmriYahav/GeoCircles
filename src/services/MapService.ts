import type { LatLng } from "../types/coordinates";
import { requireGoogleMapsApiKey } from "../utils/googleMaps";

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

const GOOGLE_PLACES_ENDPOINT = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const GOOGLE_DIRECTIONS_ENDPOINT = "https://maps.googleapis.com/maps/api/directions/json";

type GoogleLatLng = { lat: number; lng: number };

type GoogleDirectionsLeg = {
  distance?: { value: number };
  duration?: { value: number };
};

type GoogleDirectionsRoute = {
  legs?: GoogleDirectionsLeg[];
  overview_polyline?: { points?: string };
};

type GoogleDirectionsResponse = {
  status: string;
  routes?: GoogleDirectionsRoute[];
  error_message?: string;
};

type GooglePlaceResult = {
  place_id: string;
  formatted_address?: string;
  name?: string;
  geometry?: {
    location: GoogleLatLng;
    viewport?: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
  };
};

type GooglePlaceResponse = {
  status: string;
  results?: GooglePlaceResult[];
  error_message?: string;
};

function decodePolyline(polyline: string): LatLng[] {
  let index = 0;
  const points: LatLng[] = [];
  const length = polyline.length;
  let lat = 0;
  let lng = 0;

  while (index < length) {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

function assertGoogleStatus(status: string, errorMessage?: string) {
  if (status === "OK" || status === "ZERO_RESULTS") {
    return;
  }

  const message = errorMessage ? `${status}: ${errorMessage}` : status;
  throw new Error(`Google Maps request failed: ${message}`);
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const key = requireGoogleMapsApiKey();
  const params = new URLSearchParams({ query: trimmed, key });

  const response = await fetch(`${GOOGLE_PLACES_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${text}`);
  }
  const data = (await response.json()) as GooglePlaceResponse;
  assertGoogleStatus(data.status, data.error_message);

  const results = data.results ?? [];
  return results.map((item) => {
    const name = item.name ?? "";
    const address = item.formatted_address ?? "";
    const displayName = name && address ? `${name}, ${address}` : name || address || trimmed;
    const location = item.geometry?.location ?? { lat: 0, lng: 0 };
    const viewport = item.geometry?.viewport;

    return {
      id: item.place_id,
      displayName,
      latitude: location.lat,
      longitude: location.lng,
      boundingBox: viewport
        ? [viewport.south, viewport.north, viewport.west, viewport.east]
        : undefined,
    };
  });
}

export async function fetchRoute(
  start: LatLng,
  destination: LatLng
): Promise<RouteResult | null> {
  const key = requireGoogleMapsApiKey();
  const params = new URLSearchParams({
    origin: `${start.latitude},${start.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    key,
  });

  const response = await fetch(`${GOOGLE_DIRECTIONS_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as GoogleDirectionsResponse;
  assertGoogleStatus(data.status, data.error_message);

  const [route] = data.routes ?? [];
  if (!route?.overview_polyline?.points) {
    return null;
  }

  const coordinates = decodePolyline(route.overview_polyline.points);
  const legs = route.legs ?? [];
  const distanceInMeters = legs.reduce(
    (total, leg) => total + (leg.distance?.value ?? 0),
    0
  );
  const durationInSeconds = legs.reduce(
    (total, leg) => total + (leg.duration?.value ?? 0),
    0
  );

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
