import {
  Timestamp,
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { getFirestoreClient } from "./firebaseApp";

export type SpotRecord = {
  id: string;
  userId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: number;
};

export type CreateSpotInput = {
  userId: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
};

function resolveFirestore() {
  const firestore = getFirestoreClient();
  if (!firestore) {
    throw new Error(
      "Firestore is not configured. Provide firebase credentials under expoConfig.extra.firebase."
    );
  }
  return firestore;
}

function toSpotRecord(id: string, data: Record<string, unknown>): SpotRecord | null {
  const {
    userId,
    title,
    description,
    latitude,
    longitude,
    createdAt,
  } = data as {
    userId?: unknown;
    title?: unknown;
    description?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    createdAt?: unknown;
  };

  if (
    typeof userId !== "string" ||
    typeof title !== "string" ||
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return null;
  }

  const normalizedDescription = typeof description === "string" ? description : "";
  let createdAtMs: number;
  if (typeof createdAt === "number") {
    createdAtMs = createdAt;
  } else if (createdAt instanceof Timestamp) {
    createdAtMs = createdAt.toMillis();
  } else {
    createdAtMs = Date.now();
  }

  return {
    id,
    userId,
    title,
    description: normalizedDescription,
    latitude,
    longitude,
    createdAt: createdAtMs,
  };
}

export type SpotsSubscription = {
  unsubscribe: () => void;
};

// Subscribes to real-time spot updates ordered by creation time. Returns null
// when Firestore is not configured so callers can handle the missing backend
// gracefully.
export function subscribeToSpots(
  onChange: (spots: SpotRecord[]) => void,
  onError?: (error: Error) => void
): SpotsSubscription | null {
  let firestore;
  try {
    firestore = resolveFirestore();
  } catch (error) {
    if (error instanceof Error) {
      onError?.(error);
    }
    onChange([]);
    return null;
  }

  const spotsCollection = collection(firestore, "spots");
  const spotsQuery = query(spotsCollection, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    spotsQuery,
    (snapshot) => {
      const nextSpots: SpotRecord[] = [];
      snapshot.forEach((doc) => {
        const record = toSpotRecord(doc.id, doc.data());
        if (record) {
          nextSpots.push(record);
        }
      });
      onChange(nextSpots);
    },
    (error) => {
      console.warn("Failed to load spots", error);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    }
  );

  return { unsubscribe };
}

// Persists a spot in Firestore and returns the normalized record for local use.
export async function createSpot(input: CreateSpotInput): Promise<SpotRecord> {
  const { userId, title, description, latitude, longitude } = input;
  const createdAt = Date.now();
  const normalizedDescription = description ?? "";

  const firestore = getFirestoreClient();
  if (!firestore) {
    console.warn(
      "Firestore is not configured. Returning an unsynced spot so the UI can continue working."
    );

    return {
      id: `local-${createdAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      title,
      description: normalizedDescription,
      latitude,
      longitude,
      createdAt,
    };
  }

  const spotsCollection = collection(firestore, "spots");

  const docRef = await addDoc(spotsCollection, {
    userId,
    title,
    description: normalizedDescription,
    latitude,
    longitude,
    createdAt,
    createdAtTimestamp: serverTimestamp(),
  });

  return {
    id: docRef.id,
    userId,
    title,
    description: normalizedDescription,
    latitude,
    longitude,
    createdAt,
  };
}
