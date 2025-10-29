import { useEffect, useMemo, useRef, useState } from "react";

import { SearchResult, searchPlaces } from "../services/MapService";

type UsePlaceSearchOptions = {
  debounceMs?: number;
  limit?: number;
};

type UsePlaceSearchState = {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
};

const DEFAULT_STATE: UsePlaceSearchState = {
  results: [],
  isSearching: false,
  error: null,
};

export default function usePlaceSearch(
  query: string,
  { debounceMs = 380, limit = 8 }: UsePlaceSearchOptions = {}
): UsePlaceSearchState {
  const [state, setState] = useState<UsePlaceSearchState>(DEFAULT_STATE);
  const cacheRef = useRef<Map<string, SearchResult[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmedQuery) {
      setState({ results: [], isSearching: false, error: null });
      return () => undefined;
    }

    const cachedResults = cacheRef.current.get(trimmedQuery);
    if (cachedResults) {
      setState({ results: cachedResults, isSearching: false, error: null });
    } else {
      setState((prev) => ({ ...prev, isSearching: true, error: null }));
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timeout = setTimeout(() => {
      searchPlaces(trimmedQuery, { signal: controller.signal, limit })
        .then((results) => {
          cacheRef.current.set(trimmedQuery, results);
          setState({ results, isSearching: false, error: null });
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
          console.warn("Failed to search places", error);
          setState((prev) => ({
            ...prev,
            isSearching: false,
            error: "We couldn't fetch places. Check your connection and try again.",
          }));
        });
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [debounceMs, limit, trimmedQuery]);

  return state;
}
