import type { LatLng } from "../types/coordinates";

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

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT = "OpenSpot/1.0 (https://example.com/contact)";

const OSRM_ROUTE_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
};

type OsrmRoute = {
  distance?: number;
  duration?: number;
  geometry?: { coordinates?: [number, number][] };
};

type OsrmResponse = {
  code?: string;
  message?: string;
  routes?: OsrmRoute[];
};

function toBoundingBox(
  bbox: [string, string, string, string] | undefined
): [number, number, number, number] | undefined {
  if (!bbox) {
    return undefined;
  }
  const [south, north, west, east] = bbox.map((value) => Number(value));
  if ([south, north, west, east].some((value) => Number.isNaN(value))) {
    return undefined;
  }
  return [south, north, west, east];
}

function toLatLngCollection(coordinates: [number, number][] | undefined): LatLng[] {
  if (!coordinates || coordinates.length === 0) {
    return [];
  }
  return coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    q: trimmed,
    limit: "8",
    addressdetails: "0",
  });

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": NOMINATIM_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed (${response.status})`);
  }

  const results = (await response.json()) as NominatimPlace[];

  return results
    .map((place) => {
      const latitude = Number(place.lat);
      const longitude = Number(place.lon);

      const result: SearchResult = {
        id: String(place.place_id),
        displayName: place.display_name,
        latitude,
        longitude,
        boundingBox: toBoundingBox(place.boundingbox),
      };

      return result;
    })
    .filter(
      (result) =>
        Number.isFinite(result.latitude) && Number.isFinite(result.longitude)
    );
}

export async function fetchRoute(
  start: LatLng,
  destination: LatLng
): Promise<RouteResult | null> {
  const waypointParam = `${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}`;
  const params = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
    alternatives: "false",
  });

  const response = await fetch(
    `${OSRM_ROUTE_ENDPOINT}/${waypointParam}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`OSRM request failed (${response.status})`);
  }

  const data = (await response.json()) as OsrmResponse;

  if (data.code === "NoRoute") {
    return null;
  }

  if (data.code && data.code !== "Ok") {
    const details = data.message ? `: ${data.message}` : "";
    throw new Error(`OSRM request failed (${data.code})${details}`);
  }

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
