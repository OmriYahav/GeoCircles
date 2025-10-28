import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FavoriteLocation = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  addedAt: number;
};

export type FavoritesContextValue = {
  favorites: FavoriteLocation[];
  addFavorite: (favorite: FavoriteLocation) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  isReady: boolean;
};

const STORAGE_KEY = "geocircles:favorites";

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) {
          return;
        }
        const parsed = JSON.parse(stored) as FavoriteLocation[];
        setFavorites(parsed);
      })
      .catch((error) => {
        console.warn("Failed to read favorites", error);
      })
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback(async (next: FavoriteLocation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to persist favorites", error);
    }
  }, []);

  const addFavorite = useCallback(
    async (favorite: FavoriteLocation) => {
      setFavorites((current) => {
        const filtered = current.filter((item) => item.id !== favorite.id);
        const next = [favorite, ...filtered];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      setFavorites((current) => {
        const next = current.filter((item) => item.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearFavorites = useCallback(async () => {
    setFavorites([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear favorites", error);
    }
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, addFavorite, removeFavorite, clearFavorites, isReady }),
    [addFavorite, clearFavorites, favorites, isReady, removeFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
