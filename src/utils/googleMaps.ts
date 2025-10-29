import Constants from "expo-constants";

let cachedApiKey: string | null | undefined;

function normalizeKey(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getGoogleMapsApiKey(): string | null {
  if (cachedApiKey !== undefined) {
    return cachedApiKey;
  }

  const envKey =
    normalizeKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) ??
    normalizeKey(process.env.GOOGLE_MAPS_API_KEY);
  if (envKey) {
    cachedApiKey = envKey;
    return cachedApiKey;
  }

  const expoConfig = Constants.expoConfig ?? (Constants.manifest as any);
  const extra = expoConfig?.extra as Record<string, unknown> | undefined;
  const keyFromExtra =
    normalizeKey(extra?.googleMapsApiKey) ??
    normalizeKey((extra?.googleMaps as { apiKey?: string } | undefined)?.apiKey);

  if (keyFromExtra) {
    cachedApiKey = keyFromExtra;
    return cachedApiKey;
  }

  cachedApiKey = null;
  if (__DEV__) {
    console.warn(
      "Google Maps API key is missing. Provide expo.extra.googleMapsApiKey or set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY."
    );
  }
  return cachedApiKey;
}

export function requireGoogleMapsApiKey(): string {
  const key = getGoogleMapsApiKey();
  if (!key) {
    throw new Error(
      "Google Maps API key is required. Define expo.extra.googleMapsApiKey or set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY."
    );
  }
  return key;
}
