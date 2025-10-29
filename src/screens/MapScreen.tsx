import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import MapSearchBar, { MapSearchBarHandle } from "../components/MapSearchBar";
import FloatingActionButton from "../components/FloatingActionButton";
import FilterBottomSheet, {
  FilterState,
} from "../components/FilterBottomSheet";
import RoutePlannerModal from "../components/RoutePlannerModal";
import QRScannerModal from "../components/QRScannerModal";
import BackToMapButton from "../components/BackToMapButton";
import useUserLocation from "../hooks/useUserLocation";
import {
  fetchRoute,
  parseGeoUri,
  RouteResult,
  SearchResult,
} from "../services/MapService";
import { useFavorites } from "../context/FavoritesContext";
import { useChatConversations } from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { LatLng } from "../types/coordinates";
import { Colors, Palette } from "../../constants/theme";
import { DEFAULT_COORDINATES } from "../../constants/map";
import CreateConversationModal from "../components/CreateConversationModal";
import LeafletMapView, {
  LeafletLayerConfig,
  LeafletMapHandle,
} from "../components/LeafletMapView";
import type {
  RootTabParamList,
  SearchStackParamList,
} from "../navigation/AppNavigator";
import useVoiceSearch from "../hooks/useVoiceSearch";
import usePlaceSearch from "../hooks/usePlaceSearch";
import SelectedPlaceCard from "../components/map/SelectedPlaceCard";
import RouteSummaryCard from "../components/map/RouteSummaryCard";
import LocationErrorBanner from "../components/map/LocationErrorBanner";
import LayerBadge from "../components/map/LayerBadge";
import MapOverlayCard from "../components/map/MapOverlayCard";

export type MapScreenParams = {
  trigger?: {
    type: "focusSearch" | "openRoute";
    timestamp: number;
  };
};

type MapScreenRoute = RouteProp<SearchStackParamList, "Map">;
type MapScreenNavigation = NativeStackNavigationProp<
  SearchStackParamList,
  "Map"
>;

type MapLayer = LeafletLayerConfig & {
  id: "standard" | "satellite" | "terrain" | "dark";
  label: string;
};

const MAP_LAYERS: MapLayer[] = [
  {
    id: "standard",
    label: "Standard",
    tileUrlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  {
    id: "satellite",
    label: "Satellite",
    tileUrlTemplate:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
  {
    id: "terrain",
    label: "Terrain",
    tileUrlTemplate: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
    maxZoom: 17,
    subdomains: ["a", "b", "c"],
  },
  {
    id: "dark",
    label: "Night",
    tileUrlTemplate:
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      "&copy; OpenStreetMap contributors &copy; CARTO",
    maxZoom: 19,
    subdomains: ["a", "b", "c", "d"],
  },
];

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
  const navigation = useNavigation<MapScreenNavigation>();
  const route = useRoute<MapScreenRoute>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<LeafletMapHandle | null>(null);
  const searchBarRef = useRef<MapSearchBarHandle>(null);

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
  const [mapLayerIndex, setMapLayerIndex] = useState(0);
  const [isRouteModalVisible, setRouteModalVisible] = useState(false);
  const [isQrScannerVisible, setQrScannerVisible] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeEndpoints, setRouteEndpoints] = useState<{
    start: SearchResult;
    destination: SearchResult;
  } | null>(null);
  const [pendingCoordinate, setPendingCoordinate] = useState<LatLng | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

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
    setSearchQuery(transcript);
    setShouldShowResults(true);
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

  const activeLayer = MAP_LAYERS[mapLayerIndex];

  const mapPadding = useMemo(
    () => ({ top: insets.top + 120, bottom: insets.bottom + 140, left: 60, right: 60 }),
    [insets.bottom, insets.top]
  );

  useEffect(() => {
    const trigger = route.params?.trigger;
    if (!trigger) {
      return;
    }

    if (trigger.type === "focusSearch") {
      requestAnimationFrame(() => {
        setShouldShowResults(true);
        searchBarRef.current?.focus();
      });
    }

    if (trigger.type === "openRoute") {
      setRouteModalVisible(true);
    }

    navigation.setParams({ trigger: undefined });
  }, [navigation, route.params?.trigger]);

  useEffect(() => {
    if (!routeResult?.coordinates?.length) {
      return;
    }

    mapRef.current?.fitToCoordinates(routeResult.coordinates, {
      edgePadding: mapPadding,
      animated: true,
    });
  }, [mapPadding, routeResult]);

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
      focusCamera({ latitude: result.latitude, longitude: result.longitude }, 15);
    },
    [focusCamera]
  );

  const handleSubmitSearch = useCallback(() => {
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
    }
  }, [handleSelectSearchResult, searchResults]);

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

  const routeCoordinates = useMemo(
    () => (routeResult?.coordinates?.length ? routeResult.coordinates : null),
    [routeResult]
  );

  const trafficSegments = useMemo(() => TRAFFIC_SEGMENTS, []);
  const hikingTrails = useMemo(() => HIKING_TRAILS, []);

  const handleVoiceSearch = useCallback(async () => {
    const started = await startVoiceSearch();
    if (!started && voiceError && !isVoiceSupported) {
      Alert.alert("Voice search", voiceError);
    }
  }, [isVoiceSupported, startVoiceSearch, voiceError]);

  const handleBackToMap = useCallback(() => {
    Keyboard.dismiss();
    searchBarRef.current?.blur();
    setSearchQuery("");
    setShouldShowResults(false);
    setSelectedPlace(null);
    setFilterSheetVisible(false);
    setRouteModalVisible(false);
    setQrScannerVisible(false);
  }, []);

  const shouldShowBackButton = useMemo(
    () =>
      shouldShowResults ||
      isFilterSheetVisible ||
      isRouteModalVisible ||
      isQrScannerVisible ||
      searchQuery.trim().length > 0,
    [
      isFilterSheetVisible,
      isQrScannerVisible,
      isRouteModalVisible,
      searchQuery,
      shouldShowResults,
    ]
  );

  const handleQrScanned = useCallback(
    (data: string) => {
      setQrScannerVisible(false);
      const coords = parseGeoUri(data);
      if (coords) {
        focusCamera(coords, 15);
        setSelectedPlace({
          id: data,
          displayName: `Pinned location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        return;
      }
      setSearchQuery(data);
      setShouldShowResults(true);
      Alert.alert("QR content", data);
    },
    [focusCamera]
  );

  const handlePlanRoute = useCallback(
    async ({ start, destination }: { start: SearchResult; destination: SearchResult }) => {
      setRouteModalVisible(false);
      try {
        const routeResponse = await fetchRoute(
          { latitude: start.latitude, longitude: start.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        );
        if (!routeResponse) {
          Alert.alert("Route planner", "No route was returned for those points.");
          return;
        }
        setRouteEndpoints({ start, destination });
        setRouteResult(routeResponse);
      } catch (error) {
        console.error("Failed to fetch route", error);
        Alert.alert(
          "Route planner",
          "We couldn't calculate a route right now. Please try again shortly."
        );
      }
    },
    []
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
      const parentNavigation =
        navigation.getParent<NavigationProp<RootTabParamList>>();
      parentNavigation?.navigate("Messages", {
        screen: "Conversation",
        params: { conversationId },
      });
    },
    [navigation]
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

  const handleCycleLayer = useCallback(() => {
    setMapLayerIndex((current) => (current + 1) % MAP_LAYERS.length);
  }, []);

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

  const handleOpenRoutePlanner = useCallback(() => {
    setRouteModalVisible(true);
  }, []);

  const handleOpenQrScanner = useCallback(() => {
    setQrScannerVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <LeafletMapView
          ref={(instance) => {
            mapRef.current = instance;
          }}
          style={styles.map}
          initialCenter={INITIAL_VIEW}
          activeLayer={activeLayer}
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
          routeCoordinates={routeCoordinates}
          userLocation={mapUserLocation}
          filters={mapFilters}
          onMapPress={handleMapPress}
          onConversationPress={openConversation}
        />
      </View>

      <View style={[styles.searchContainer, { paddingTop: insets.top + 12 }]}>
        <MapSearchBar
          ref={searchBarRef}
          value={searchQuery}
          onChangeText={(value) => {
            setSearchQuery(value);
            setShouldShowResults(true);
          }}
          onSubmitEditing={handleSubmitSearch}
          onFocus={() => setShouldShowResults(true)}
          onMicPress={isVoiceListening ? stopVoiceSearch : handleVoiceSearch}
          isLoading={isSearching || isVoiceListening}
        />
        <View style={styles.searchActionsRow}>
          {shouldShowBackButton ? (
            <BackToMapButton
              mode="contained-tonal"
              onPress={handleBackToMap}
              style={styles.backToMapButton}
            />
          ) : null}
          <Button
            mode="contained-tonal"
            compact
            icon="navigate-outline"
            onPress={handleOpenRoutePlanner}
            style={styles.searchActionButton}
          >
            Plan route
          </Button>
          <Button
            mode="contained-tonal"
            compact
            icon="qr-code-outline"
            onPress={handleOpenQrScanner}
            style={styles.searchActionButton}
          >
            Scan code
          </Button>
        </View>

        {shouldShowResults && searchResults.length > 0 && (
          <MapOverlayCard style={styles.resultsCard}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.resultSeparator} />}
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

      <View style={[styles.fabColumn, { top: insets.top + 100 }]}>
        <FloatingActionButton
          icon="options-outline"
          accessibilityLabel="Open filters"
          onPress={handleOpenFilters}
        />
        <FloatingActionButton
          icon="layers-outline"
          accessibilityLabel="Change map layer"
          onPress={handleCycleLayer}
        />
        <FloatingActionButton
          icon="compass-outline"
          accessibilityLabel="Open route planner"
          onPress={handleOpenRoutePlanner}
        />
        <FloatingActionButton
          icon="locate-outline"
          accessibilityLabel="Center on my location"
          onPress={handleLocateMe}
        />
      </View>

      <LayerBadge style={[styles.layerBadge, { top: insets.top + 16 }]} label={activeLayer.label} />

      {selectedPlace && (
        <View style={[styles.overlayPosition, { bottom: insets.bottom + 140 }]}>
          <SelectedPlaceCard place={selectedPlace} onSave={handleSaveFavorite} />
        </View>
      )}

      {routeResult && routeEndpoints && (
        <View style={[styles.overlayPosition, { bottom: insets.bottom + 220 }]}>
          <RouteSummaryCard
            title="Route overview"
            subtitle={`${routeEndpoints.start.displayName.split(",")[0]} → ${routeEndpoints.destination.displayName.split(",")[0]}`}
            distanceKilometers={routeResult.distanceInMeters / 1000}
            durationMinutes={routeResult.durationInSeconds / 60}
          />
        </View>
      )}

      {locationError && (
        <View style={[styles.overlayPosition, { bottom: insets.bottom + 260 }]}>
          <LocationErrorBanner message={locationError} onRetry={refreshLocation} />
        </View>
      )}

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

      <RoutePlannerModal
        visible={isRouteModalVisible}
        onDismiss={() => setRouteModalVisible(false)}
        onPlan={handlePlanRoute}
      />

      <QRScannerModal
        visible={isQrScannerVisible}
        onDismiss={() => setQrScannerVisible(false)}
        onScanned={handleQrScanned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
    gap: 12,
  },
  searchActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  backToMapButton: {
    borderRadius: 14,
  },
  searchActionButton: {
    borderRadius: 14,
  },
  resultsCard: {
    gap: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
    maxHeight: 260,
  },
  resultItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  resultItemPressed: {
    backgroundColor: Palette.primaryTint,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.text,
  },
  resultSubtitle: {
    marginTop: 4,
    color: Colors.light.icon,
    fontSize: 12,
  },
  resultSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.border,
  },
  resultsErrorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  resultsErrorMessage: {
    color: Palette.textSecondary,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  fabColumn: {
    position: "absolute",
    right: 16,
    alignItems: "center",
    gap: 16,
  },
  layerBadge: {
    position: "absolute",
    right: 16,
  },
  overlayPosition: {
    position: "absolute",
    left: 16,
    right: 16,
  },
});
