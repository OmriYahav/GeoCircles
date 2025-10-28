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
const OSRM_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} ${text}`);
  }
  return response.json();
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: "jsonv2",
    addressdetails: "1",
    limit: "6",
  });

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: {
      "User-Agent": "GeoCircles/1.0 (https://example.com)",
      Accept: "application/json",
    },
  });

  const data = (await handleResponse(response)) as {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  }[];

  return data.map((item) => ({
    id: item.place_id,
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    boundingBox: item.boundingbox
      ? [
          Number(item.boundingbox[0]),
          Number(item.boundingbox[1]),
          Number(item.boundingbox[2]),
          Number(item.boundingbox[3]),
        ]
      : undefined,
  }));
}

export async function fetchRoute(
  start: LatLng,
  destination: LatLng
): Promise<RouteResult | null> {
  const startPoint = `${start.longitude},${start.latitude}`;
  const endPoint = `${destination.longitude},${destination.latitude}`;
  const url = `${OSRM_ENDPOINT}/${startPoint};${endPoint}?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "GeoCircles/1.0 (https://example.com)",
      Accept: "application/json",
    },
  });

  const data = (await handleResponse(response)) as {
    routes: {
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
    }[];
  };

  const [route] = data.routes ?? [];
  if (!route) {
    return null;
  }

  return {
    coordinates: route.geometry.coordinates.map(([lon, lat]) => ({
      latitude: lat,
      longitude: lon,
    })),
    distanceInMeters: route.distance,
    durationInSeconds: route.duration,
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
