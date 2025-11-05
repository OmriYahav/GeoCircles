import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { User } from "firebase/auth";

import { ensureUser, observeAuthState } from "../services/auth";
import {
  CreateSpotInput,
  SpotRecord,
  SpotsSubscription,
  createSpot,
  subscribeToSpots,
} from "../services/spots";

export type UseSpotsResult = {
  currentUser: User | null;
  spots: SpotRecord[];
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  createSpot: (input: Omit<CreateSpotInput, "userId">) => Promise<SpotRecord | null>;
};

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while loading spots.";
}

export default function useSpots(): UseSpotsResult {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [spots, setSpots] = useState<SpotRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const subscriptionRef = useRef<SpotsSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Keep the hook in sync with Firebase auth changes so the caller always
    // knows which user owns the current spot list.
    const unsubscribe = observeAuthState((user) => {
      if (!isMounted) {
        return;
      }
      setCurrentUser(user);
    });

    (async () => {
      try {
        const user = await ensureUser();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (authError) {
        if (isMounted) {
          setError(formatError(authError));
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    subscriptionRef.current?.unsubscribe();

    // Listen to Firestore updates when the user is available to surface
    // community spots in real time on the map.
    const subscription = subscribeToSpots(
      (nextSpots) => {
        setSpots(nextSpots);
        setIsLoading(false);
      },
      (subscriptionError) => {
        setError(formatError(subscriptionError));
        setIsLoading(false);
      }
    );

    subscriptionRef.current = subscription;

    if (!subscription) {
      setIsLoading(false);
      return undefined;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const handleCreateSpot = useCallback<UseSpotsResult["createSpot"]>(
    async (input) => {
      if (!currentUser) {
        setError("Please sign in to create a spot.");
        return null;
      }
      setIsSaving(true);
      try {
        const record = await createSpot({ ...input, userId: currentUser.uid });
        return record;
      } catch (creationError) {
        const message = formatError(creationError);
        setError(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [currentUser]
  );

  const sortedSpots = useMemo(() => {
    return [...spots].sort((a, b) => b.createdAt - a.createdAt);
  }, [spots]);

  return {
    currentUser,
    spots: sortedSpots,
    isLoading,
    error,
    isSaving,
    createSpot: handleCreateSpot,
  };
}
