import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import SearchBar, { SearchBarHandle } from "../components/SearchBar";
import FloatingActionButton from "../components/FloatingActionButton";
import FilterBottomSheet, {
  FilterState,
} from "../components/FilterBottomSheet";
import useUserLocation from "../hooks/useUserLocation";
import { SearchResult } from "../services/MapService";
import { useFavorites } from "../context/FavoritesContext";
import { useChatConversations } from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { LatLng } from "../types/coordinates";
import { colors, spacing, typography } from "../theme";
import { DEFAULT_COORDINATES } from "../../constants/map";
import CreateConversationModal from "../components/CreateConversationModal";
import LeafletMapView, { LeafletMapHandle } from "../components/LeafletMapView";
import useVoiceSearch from "../hooks/useVoiceSearch";
import usePlaceSearch from "../hooks/usePlaceSearch";
import SelectedPlaceCard from "../components/map/SelectedPlaceCard";
import LocationErrorBanner from "../components/map/LocationErrorBanner";
import MapOverlayCard from "../components/map/MapOverlayCard";
import ScreenScaffold from "../components/layout/ScreenScaffold";
import { TAB_BAR_HEIGHT } from "../../constants/layout";

export type MapScreenParams = {
  triggerType?: string | string[];
  triggerTimestamp?: string | string[];
};

const INITIAL_VIEW = {
  latitude: DEFAULT_COORDINATES.latitude,
  longitude: DEFAULT_COORDINATES.longitude,
  zoom: DEFAULT_COORDINATES.zoomLevel ?? 11,
};

const TRAFFIC_SEGMENTS: LatLng[][] = [
  [
    { latitude: 40.7158, longitude: -74.0111 },
    { latitude: 40.7222, longitude: -74.0023 },
  ],
  [
    { latitude: 40.7056, longitude: -74.0092 },
    { latitude: 40.7122, longitude: -73.995 },
  ],
];

const HIKING_TRAILS: LatLng[][] = [
  [
    { latitude: 40.6994, longitude: -74.017 },
    { latitude: 40.7036, longitude: -74.013 },
    { latitude: 40.7068, longitude: -74.01 },
  ],
];

const TRANSPORT_POINTS = [
  {
    id: "transport-1",
    coordinate: { latitude: 40.7114, longitude: -74.0091 },
    label: "Fulton St Station",
  },
  {
    id: "transport-2",
    coordinate: { latitude: 40.7301, longitude: -73.9918 },
    label: "Astor Place",
  },
];

const DEBOUNCE_DELAY = 380;
export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<MapScreenParams>();
  const insets = useSafeAreaInsets();
  const triggerHandledRef = useRef<string | null>(null);
  const mapRef = useRef<LeafletMapHandle | null>(null);
  const searchBarRef = useRef<SearchBarHandle>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [shouldShowResults, setShouldShowResults] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    traffic: true,
    hiking: false,
    transport: false,
    night: false,
  });
  const [isFilterSheetVisible, setFilterSheetVisible] = useState(false);
  const [pendingCoordinate, setPendingCoordinate] = useState<LatLng | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [pendingSubmitQuery, setPendingSubmitQuery] = useState<string | null>(null);

  const { addFavorite } = useFavorites();
  const { conversations, createConversation } = useChatConversations();
  const { profile } = useUserProfile();

  const {
    location: userLocation,
    refresh: refreshLocation,
    error: locationError,
  } = useUserLocation();

  const { results: searchResults, isSearching, error: searchError } = usePlaceSearch(
    searchQuery,
    { debounceMs: DEBOUNCE_DELAY }
  );

  const handleVoiceTranscript = useCallback((transcript: string) => {
    const trimmed = transcript.trim();
    setSearchQuery(transcript);
    setShouldShowResults(trimmed.length > 0);
    setPendingSubmitQuery(trimmed.length > 0 ? trimmed : null);
  }, []);

  const handleVoiceError = useCallback((message: string) => {
    Alert.alert("Voice search", message);
  }, []);

  const {
    isSupported: isVoiceSupported,
    isListening: isVoiceListening,
    start: startVoiceSearch,
    stop: stopVoiceSearch,
    error: voiceError,
  } = useVoiceSearch({
    onResult: handleVoiceTranscript,
    onError: handleVoiceError,
  });

  useEffect(() => {
    if (params?.triggerType !== "focusSearch") {
      return;
    }

    const rawTimestamp = params.triggerTimestamp;
    const timestamp = Array.isArray(rawTimestamp)
      ? rawTimestamp[0]
      : rawTimestamp ?? null;

    if (timestamp && triggerHandledRef.current === timestamp) {
      return;
    }

    if (timestamp) {
      triggerHandledRef.current = timestamp;
    }

    requestAnimationFrame(() => {
      setShouldShowResults(true);
      searchBarRef.current?.focus();
    });
  }, [params?.triggerType, params?.triggerTimestamp]);

  useEffect(() => {
    const coords = userLocation.coords;
    if (!coords) {
      return;
    }
    mapRef.current?.animateCamera(
      {
        center: { latitude: coords.latitude, longitude: coords.longitude },
        zoom: 14,
      },
      { duration: 650 }
    );
  }, [userLocation.coords]);

  const focusCamera = useCallback((coords: LatLng, zoom = 14) => {
    mapRef.current?.animateCamera(
      {
        center: coords,
        zoom,
      },
      { duration: 650 }
    );
  }, []);

  const handleSelectSearchResult = useCallback(
    (result: SearchResult) => {
      setSelectedPlace(result);
      setSearchQuery(result.displayName);
      setShouldShowResults(false);
      setPendingSubmitQuery(null);
      focusCamera({ latitude: result.latitude, longitude: result.longitude }, 15);
    },
    [focusCamera]
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        setShouldShowResults(false);
        setSelectedPlace(null);
        setPendingSubmitQuery(null);
        return;
      }

      setSearchQuery((current) => (current === query ? current : query));
      setShouldShowResults(true);
      setPendingSubmitQuery(trimmed);
    },
    []
  );

  useEffect(() => {
    if (!pendingSubmitQuery) {
      return;
    }

    if (isSearching) {
      return;
    }

    const normalizedQuery = searchQuery.trim();
    if (normalizedQuery !== pendingSubmitQuery) {
      return;
    }

    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
      setPendingSubmitQuery(null);
      return;
    }

    if (searchError) {
      setPendingSubmitQuery(null);
      return;
    }

    setPendingSubmitQuery(null);
  }, [
    handleSelectSearchResult,
    isSearching,
    pendingSubmitQuery,
    searchError,
    searchQuery,
    searchResults,
  ]);

  const conversationMarkers = useMemo(
    () =>
      conversations.map((conversation) => ({
        id: conversation.id,
        latitude: conversation.coordinate.latitude,
        longitude: conversation.coordinate.longitude,
        title: conversation.title,
        hostName: conversation.hostName,
        isSelf: conversation.hostId === profile.id,
      })),
    [conversations, profile.id]
  );

  const transportMarkers = useMemo(
    () =>
      TRANSPORT_POINTS.map((point) => ({
        id: point.id,
        latitude: point.coordinate.latitude,
        longitude: point.coordinate.longitude,
        label: point.label,
      })),
    []
  );

  const mapUserLocation = useMemo(
    () =>
      userLocation.coords
        ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            radius: 120,
          }
        : null,
    [userLocation.coords]
  );

  const mapFilters = useMemo(
    () => ({
      traffic: filters.traffic,
      hiking: filters.hiking,
      transport: filters.transport,
      night: filters.night,
    }),
    [filters.hiking, filters.night, filters.traffic, filters.transport]
  );

  const trafficSegments = useMemo(() => TRAFFIC_SEGMENTS, []);
  const hikingTrails = useMemo(() => HIKING_TRAILS, []);

  const handleVoiceSearch = useCallback(async () => {
    const started = await startVoiceSearch();
    if (!started && voiceError && !isVoiceSupported) {
      Alert.alert("Voice search", voiceError);
    }
  }, [isVoiceSupported, startVoiceSearch, voiceError]);

  const mapBottomInset = useMemo(
    () => insets.bottom + TAB_BAR_HEIGHT + 16,
    [insets.bottom]
  );

  const overlayBottomOffset = useMemo(
    () => insets.bottom + TAB_BAR_HEIGHT + 48,
    [insets.bottom]
  );

  const handleSaveFavorite = useCallback(() => {
    if (!selectedPlace) {
      return;
    }
    addFavorite({
      id: selectedPlace.id,
      title: selectedPlace.displayName,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      addedAt: Date.now(),
    });
    Alert.alert("Saved", "Added to your favorites.");
  }, [addFavorite, selectedPlace]);

  const openConversation = useCallback(
    (conversationId: string) => {
      router.navigate({
        pathname: "/conversation/[conversationId]",
        params: { conversationId },
      });
    },
    [router]
  );

  const handleCoordinatePress = useCallback((coordinate: LatLng) => {
    setPendingCoordinate(coordinate);
    setCreateModalVisible(true);
  }, []);

  const handleMapPress = useCallback(
    (coordinate: LatLng) => {
      handleCoordinatePress(coordinate);
    },
    [handleCoordinatePress]
  );

  const handleDismissCreateConversation = useCallback(() => {
    setCreateModalVisible(false);
    setPendingCoordinate(null);
  }, []);

  const handleConfirmCreateConversation = useCallback(
    (title: string) => {
      if (!pendingCoordinate) {
        return;
      }
      const conversationId = createConversation({
        title,
        coordinate: pendingCoordinate,
        host: profile,
      });
      setCreateModalVisible(false);
      setPendingCoordinate(null);
      openConversation(conversationId);
    },
    [createConversation, openConversation, pendingCoordinate, profile]
  );

  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <Pressable
        onPress={() => handleSelectSearchResult(item)}
        style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
      >
        <Text style={styles.resultTitle}>{item.displayName}</Text>
        <Text style={styles.resultSubtitle}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      </Pressable>
    ),
    [handleSelectSearchResult]
  );

  const handleLocateMe = useCallback(() => {
    const coords = userLocation.coords;
    if (coords) {
      focusCamera({ latitude: coords.latitude, longitude: coords.longitude }, 15);
      return;
    }
    refreshLocation();
  }, [focusCamera, refreshLocation, userLocation.coords]);

  const handleOpenFilters = useCallback(() => {
    setFilterSheetVisible(true);
  }, []);

  return (
    <ScreenScaffold contentStyle={styles.screenContent}>
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              ref={searchBarRef}
              value={searchQuery}
              onChangeText={(value) => {
                setSearchQuery(value);
                setShouldShowResults(true);
              }}
              onSubmit={handleSearchSubmit}
              onFocus={() => setShouldShowResults(true)}
              onBlur={() => {
                if (searchQuery.trim().length === 0 && !isFilterSheetVisible) {
                  setShouldShowResults(false);
                }
              }}
              onMicPress={isVoiceListening ? stopVoiceSearch : handleVoiceSearch}
              isLoading={isSearching || isVoiceListening}
            />
          </View>

          {shouldShowResults && searchResults.length > 0 && (
            <MapOverlayCard style={styles.resultsCard}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderSearchResult}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => (
                  <View style={styles.resultSeparator} />
                )}
              />
            </MapOverlayCard>
          )}

          {shouldShowResults &&
            !isSearching &&
            !searchError &&
            searchQuery.trim().length > 0 &&
            searchResults.length === 0 && (
              <MapOverlayCard style={styles.resultsCard}>
                <Text style={styles.resultsErrorTitle}>No places found</Text>
                <Text style={styles.resultsErrorMessage}>
                  Try a different address or landmark.
                </Text>
              </MapOverlayCard>
            )}

          {searchError && (
            <MapOverlayCard style={styles.resultsCard}>
              <Text style={styles.resultsErrorTitle}>Search unavailable</Text>
              <Text style={styles.resultsErrorMessage}>{searchError}</Text>
            </MapOverlayCard>
          )}
        </View>

        <View style={styles.mapContainer}>
          <LeafletMapView
            ref={(instance) => {
              mapRef.current = instance;
            }}
            style={[styles.map, { bottom: mapBottomInset }]}
            initialCenter={INITIAL_VIEW}
            selectedPlace={
              selectedPlace
                ? {
                    latitude: selectedPlace.latitude,
                    longitude: selectedPlace.longitude,
                    displayName: selectedPlace.displayName,
                  }
                : null
            }
            conversations={conversationMarkers}
            transportPoints={filters.transport ? transportMarkers : []}
            trafficSegments={trafficSegments}
            hikingTrails={hikingTrails}
            routeCoordinates={null}
            userLocation={mapUserLocation}
            filters={mapFilters}
            onMapPress={handleMapPress}
            onConversationPress={openConversation}
          />

          <View style={[styles.fabColumn, { top: 16 }]}>
            <FloatingActionButton
              icon="options-outline"
              accessibilityLabel="Open filters"
              onPress={handleOpenFilters}
            />
            <FloatingActionButton
              icon="locate-outline"
              accessibilityLabel="Center on my location"
              onPress={handleLocateMe}
            />
          </View>

          {selectedPlace && (
            <View style={[styles.overlayPosition, { bottom: overlayBottomOffset }]}>
              <SelectedPlaceCard place={selectedPlace} onSave={handleSaveFavorite} />
            </View>
          )}

          {locationError && (
            <View
              style={[
                styles.overlayPosition,
                { bottom: overlayBottomOffset + 120 },
              ]}
            >
              <LocationErrorBanner
                message={locationError}
                onRetry={refreshLocation}
              />
            </View>
          )}
        </View>
      </View>

      <CreateConversationModal
        visible={isCreateModalVisible}
        coordinate={pendingCoordinate}
        onDismiss={handleDismissCreateConversation}
        onCreate={handleConfirmCreateConversation}
      />

      <FilterBottomSheet
        visible={isFilterSheetVisible}
        onDismiss={() => setFilterSheetVisible(false)}
        filters={filters}
        onChange={setFilters}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    zIndex: 2,
  },
  searchBarWrapper: {
    width: "100%",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  resultsCard: {
    gap: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
    maxHeight: 260,
    width: "100%",
    alignSelf: "center",
  },
  resultItem: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  resultItemPressed: {
    backgroundColor: colors.primaryTint,
  },
  resultTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.medium,
    color: colors.text.primary,
  },
  resultSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontSize: typography.size.xs,
  },
  resultSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  resultsErrorTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
  resultsErrorMessage: {
    color: colors.text.secondary,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    fontFamily: typography.family.regular,
  },
  fabColumn: {
    position: "absolute",
    right: spacing.xxl,
    alignItems: "center",
    gap: spacing.lg,
  },
  overlayPosition: {
    position: "absolute",
    alignSelf: "center",
    width: "92%",
    maxWidth: 420,
  },
});
