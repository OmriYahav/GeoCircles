import Constants from "expo-constants";

const PLACEHOLDER_TOKENS = new Set([
  "YOUR_MAPBOX_ACCESS_TOKEN",
  "pk.your-mapbox-token",
]);

type MapboxAccessToken = string | undefined;

function normalizeToken(token: MapboxAccessToken): string | null {
  if (!token) {
    return null;
  }
  const trimmed = token.trim();
  if (!trimmed || PLACEHOLDER_TOKENS.has(trimmed)) {
    return null;
  }
  return trimmed;
}

export function getMapboxAccessToken(): string | null {
  const expoConfig = Constants.expoConfig ?? null;
  const extraToken = normalizeToken(
    typeof expoConfig?.extra?.mapboxAccessToken === "string"
      ? expoConfig.extra.mapboxAccessToken
      : undefined
  );

  const envToken =
    normalizeToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN) ??
    normalizeToken(process.env.MAPBOX_ACCESS_TOKEN);

  return extraToken ?? envToken ?? null;
}

export function requireMapboxAccessToken(): string {
  const token = getMapboxAccessToken();
  if (!token) {
    throw new Error(
      "Mapbox access token is missing. Provide expo.extra.mapboxAccessToken or set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN."
    );
  }
  return token;
}

const appOwnership = Constants.appOwnership ?? "standalone";
const isExpoGo = appOwnership === "expo";

let mapbox: typeof import("@rnmapbox/maps") | null = null;
let unavailableReason: "expo-go" | "not-installed" | "missing-token" | null = null;

if (isExpoGo) {
  unavailableReason = "expo-go";
} else {
  const token = getMapboxAccessToken();
  if (!token) {
    unavailableReason = "missing-token";
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const requiredMapbox = require("@rnmapbox/maps") as typeof import("@rnmapbox/maps");
      requiredMapbox.setAccessToken(token);
      if (typeof requiredMapbox.setTelemetryEnabled === "function") {
        requiredMapbox.setTelemetryEnabled(false);
      }
      mapbox = requiredMapbox;
    } catch (error) {
      if (__DEV__) {
        console.warn("@rnmapbox/maps could not be loaded", error);
      }
      unavailableReason = "not-installed";
      mapbox = null;
    }
  }
}

export const mapboxModule = mapbox;
export const isMapboxAvailable = mapboxModule != null;
export const mapboxUnavailableReason = unavailableReason;
