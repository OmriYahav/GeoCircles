import dayjs from "dayjs";

import { Business } from "../context/BusinessContext";

type FirestoreTimestamp = { toDate: () => Date };

type RawBusiness = Record<string, unknown> & {
  latitude?: number;
  longitude?: number;
  radius?: number;
};

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
}

function normalizeExpiryDate(value: unknown): string | number | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  const timestamp = value as FirestoreTimestamp;
  if (typeof timestamp?.toDate === "function") {
    try {
      return timestamp.toDate().toISOString();
    } catch (error) {
      console.warn("Failed to normalise expiry date", error);
    }
  }
  return null;
}

export function parseBusinessDocument(
  id: string,
  data: RawBusiness | undefined
): Business | null {
  if (!data) {
    return null;
  }

  const latitude = normalizeNumber(data.latitude);
  const longitude = normalizeNumber(data.longitude);
  const radius = normalizeNumber(data.radius);

  if (
    typeof data.name !== "string" ||
    typeof data.offerText !== "string" ||
    latitude === null ||
    longitude === null ||
    radius === null
  ) {
    return null;
  }

  const business: Business = {
    id,
    name: data.name,
    latitude,
    longitude,
    radius,
    offerText: data.offerText,
    logoUrl:
      typeof data.logoUrl === "string" && data.logoUrl.length > 0
        ? data.logoUrl
        : null,
    expiryDate: normalizeExpiryDate(data.expiryDate ?? null),
  };

  return business;
}

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatExpiryDate(
  expiryDate: Business["expiryDate"]
): string | null {
  if (!expiryDate) {
    return null;
  }
  if (typeof expiryDate === "number") {
    return dayjs(expiryDate).format("MMMM D, YYYY");
  }
  if (typeof expiryDate === "string") {
    const parsed = dayjs(expiryDate);
    if (parsed.isValid()) {
      return parsed.format("MMMM D, YYYY");
    }
    return expiryDate;
  }
  return null;
}

