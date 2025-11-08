import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  avatarUrl: string | null;
};

type UserProfileContextValue = {
  profile: UserProfile;
  isLoading: boolean;
  updateProfile: (updates: Partial<Omit<UserProfile, "id">>) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const STORAGE_KEY = "@sweetbalance:user-profile";

const DEFAULT_PROFILE: UserProfile = {
  id: "current-user",
  firstName: "Explorer",
  lastName: "",
  nickname: "Trailblazer",
  avatarUrl: null,
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isMounted) {
            setProfile((current) => ({ ...current, ...parsed }));
          }
        }
      } catch (error) {
        console.warn("Failed to load stored profile", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistProfile = useCallback(async (next: UserProfile) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          firstName: next.firstName,
          lastName: next.lastName,
          nickname: next.nickname,
          avatarUrl: next.avatarUrl,
        })
      );
    } catch (error) {
      console.warn("Failed to persist profile", error);
    }
  }, []);

  const updateProfile = useCallback<
    UserProfileContextValue["updateProfile"]
  >(
    async (updates) => {
      let nextState: UserProfile | null = null;

      setProfile((current) => {
        nextState = { ...current, ...updates };
        return nextState;
      });

      if (nextState) {
        await persistProfile(nextState);
      }
    },
    [persistProfile]
  );

  const resetProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to reset profile", error);
    }
  }, []);

  const value = useMemo(
    () => ({ profile, isLoading, updateProfile, resetProfile }),
    [isLoading, profile, resetProfile, updateProfile]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
