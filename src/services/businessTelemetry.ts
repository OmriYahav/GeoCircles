import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import CryptoJS from "crypto-js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { getFirestoreClient } from "./firebaseApp";

const RECENT_OFFERS_KEY = "@openspot:recent-offers";
const VISIT_LOG_KEY = "@openspot:recent-visits";

const OFFER_SUPPRESSION_MS = 30 * 60 * 1000; // 30 minutes
const VISIT_SUPPRESSION_MS = 5 * 60 * 1000; // 5 minutes

export type VisitLogPayload = {
  businessId: string;
  userId: string;
  distance: number;
  location?: { latitude: number; longitude: number } | null;
};

type TimestampDictionary = Record<string, number>;

let offerCache: TimestampDictionary | null = null;
let visitCache: TimestampDictionary | null = null;

function getEncryptionKey(): string | null {
  const expoConfig = Constants.expoConfig ?? (Constants.manifest as any);
  if (!expoConfig?.extra) {
    return null;
  }
  const extra = expoConfig.extra as Record<string, unknown>;
  const key = extra.locationEncryptionKey;
  return typeof key === "string" && key.length > 0 ? key : null;
}

async function readDictionary(key: string): Promise<TimestampDictionary> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as TimestampDictionary;
    }
  } catch (error) {
    console.warn(`Failed to read storage key ${key}`, error);
  }
  return {};
}

async function persistDictionary(key: string, value: TimestampDictionary) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to persist storage key ${key}`, error);
  }
}

async function ensureOfferCache(): Promise<TimestampDictionary> {
  if (!offerCache) {
    offerCache = await readDictionary(RECENT_OFFERS_KEY);
  }
  return offerCache;
}

async function ensureVisitCache(): Promise<TimestampDictionary> {
  if (!visitCache) {
    visitCache = await readDictionary(VISIT_LOG_KEY);
  }
  return visitCache;
}

export async function shouldDisplayBusinessOffer(
  businessId: string,
  now = Date.now()
): Promise<boolean> {
  const cache = await ensureOfferCache();
  const lastShown = cache[businessId];
  if (!lastShown) {
    return true;
  }
  return now - lastShown > OFFER_SUPPRESSION_MS;
}

export async function markBusinessOfferDisplayed(
  businessId: string,
  now = Date.now()
) {
  const cache = await ensureOfferCache();
  cache[businessId] = now;
  offerCache = { ...cache };
  await persistDictionary(RECENT_OFFERS_KEY, offerCache);
}

export async function shouldLogBusinessVisit(
  businessId: string,
  now = Date.now()
): Promise<boolean> {
  const cache = await ensureVisitCache();
  const lastVisit = cache[businessId];
  if (!lastVisit) {
    return true;
  }
  return now - lastVisit > VISIT_SUPPRESSION_MS;
}

export async function markBusinessVisitLogged(
  businessId: string,
  now = Date.now()
) {
  const cache = await ensureVisitCache();
  cache[businessId] = now;
  visitCache = { ...cache };
  await persistDictionary(VISIT_LOG_KEY, visitCache);
}

function encryptLocationPayload(
  location: VisitLogPayload["location"]
): string | null {
  if (!location) {
    return null;
  }
  const key = getEncryptionKey();
  if (!key) {
    return null;
  }
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(location), key).toString();
  } catch (error) {
    console.warn("Failed to encrypt location payload", error);
    return null;
  }
}

export async function recordBusinessVisit({
  businessId,
  userId,
  distance,
  location,
}: VisitLogPayload) {
  const firestore = getFirestoreClient();
  if (!firestore) {
    return;
  }

  try {
    const payload: Record<string, unknown> = {
      userId,
      businessId,
      distance,
      timestamp: serverTimestamp(),
    };

    const encrypted = encryptLocationPayload(location ?? null);
    if (encrypted) {
      payload.encryptedLocation = encrypted;
    } else if (location) {
      payload.location = location;
    }

    await addDoc(collection(firestore, "visits"), payload);
  } catch (error) {
    console.warn("Failed to record business visit", error);
  }
}

