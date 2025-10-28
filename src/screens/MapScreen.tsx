import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type MapViewType from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import Constants from "expo-constants";
import type VoiceModuleType from "@react-native-voice/voice";
import type { SpeechErrorEvent, SpeechResultsEvent } from "@react-native-voice/voice";
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
import useUserLocation from "../hooks/useUserLocation";
import {
  fetchRoute,
  parseGeoUri,
  searchPlaces,
  RouteResult,
  SearchResult,
} from "../services/MapService";
import { useFavorites } from "../context/FavoritesContext";
import { useChatConversations } from "../context/ChatConversationsContext";
import { useUserProfile } from "../context/UserProfileContext";
import { reactNativeMapsModule, reactNativeMapsUnavailableReason } from "../utils/reactNativeMaps";
import { LatLng, MapPressEvent } from "../types/coordinates";
import { Colors } from "../../constants/theme";
import { DEFAULT_COORDINATES } from "../../constants/map";
import CreateConversationModal from "../components/CreateConversationModal";
import type {
  RootTabParamList,
  SearchStackParamList,
} from "../navigation/AppNavigator";

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

type MapLayer = {
  id: "standard" | "satellite" | "terrain" | "dark";
  label: string;
  urlTemplate: string;
  maximumZ?: number;
};

const MAP_LAYERS: MapLayer[] = [
  {
    id: "standard",
    label: "Standard",
    urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maximumZ: 19,
  },
  {
    id: "satellite",
    label: "Satellite",
    urlTemplate:
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maximumZ: 18,
  },
  {
    id: "terrain",
    label: "Terrain",
    urlTemplate: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    maximumZ: 17,
  },
  {
    id: "dark",
    label: "Dark",
    urlTemplate:
      "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
    maximumZ: 19,
  },
];

const INITIAL_REGION = {
  latitude: DEFAULT_COORDINATES.latitude,
  longitude: DEFAULT_COORDINATES.longitude,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
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
  const mapRef = useRef<MapViewType | null>(null);
  const searchBarRef = useRef<MapSearchBarHandle>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceModule, setVoiceModule] = useState<VoiceModuleType | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    if (Constants.appOwnership === "expo") {
      console.warn(
        "Voice search is unavailable in Expo Go. Create a development build to enable this feature."
      );
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const module = (await import("@react-native-voice/voice")).default as VoiceModuleType;
        if (isMounted) {
          setVoiceModule(module);
        }
      } catch (error) {
        console.warn(
          "Voice search is unavailable because the native voice module could not be loaded.",
          error
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const { addFavorite } = useFavorites();
  const { conversations, createConversation } = useChatConversations();
  const { profile } = useUserProfile();
  const [pendingCoordinate, setPendingCoordinate] = useState<LatLng | null>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const {
    location: userLocation,
    refresh: refreshLocation,
    error: locationError,
  } = useUserLocation();

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
        searchBarRef.current?.focus();
      });
    }

    if (trigger.type === "openRoute") {
      setRouteModalVisible(true);
    }

    navigation.setParams({ trigger: undefined });
  }, [navigation, route.params?.trigger]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);
      searchPlaces(searchQuery)
        .then((results) => {
          setSearchResults(results);
        })
        .catch((error) => {
          console.warn("Failed to search places", error);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, DEBOUNCE_DELAY);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!voiceModule) {
      return;
    }

    const handleSpeechResults = (event: SpeechResultsEvent) => {
      const [transcript] = event.value ?? [];
      if (transcript) {
        setSearchQuery(transcript);
      }
      setIsVoiceListening(false);
    };

    const handleSpeechError = (event: SpeechErrorEvent) => {
      setIsVoiceListening(false);
      if (event.error) {
        Alert.alert("Voice search", event.error.message ?? "We couldn't understand that.");
      }
    };

    voiceModule.onSpeechResults = handleSpeechResults;
    voiceModule.onSpeechError = handleSpeechError;
    voiceModule.onSpeechEnd = () => setIsVoiceListening(false);

    return () => {
      voiceModule.destroy().finally(() => voiceModule.removeAllListeners());
    };
  }, [voiceModule]);

  const focusCamera = useCallback(
    (coords: LatLng, zoom = 14) => {
      mapRef.current?.animateCamera(
        {
          center: coords,
          zoom,
        },
        { duration: 650 }
      );
    },
    []
  );

  const handleSelectSearchResult = useCallback(
    (result: SearchResult) => {
      setSelectedPlace(result);
      setSearchQuery(result.displayName);
      setSearchResults([]);
      focusCamera({ latitude: result.latitude, longitude: result.longitude }, 15);
    },
    [focusCamera]
  );

  const handleSubmitSearch = useCallback(() => {
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
    }
  }, [handleSelectSearchResult, searchResults]);

  useEffect(() => {
    if (routeResult?.coordinates?.length) {
      mapRef.current?.fitToCoordinates(routeResult.coordinates, {
        edgePadding: mapPadding,
        animated: true,
      });
    }
  }, [mapPadding, routeResult]);

  useEffect(() => {
    const coords = userLocation.coords;
    if (!coords) {
      return;
    }
    focusCamera({ latitude: coords.latitude, longitude: coords.longitude }, 14);
  }, [focusCamera, userLocation.coords]);

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

  const handleToggleFilters = useCallback(() => {
    setFilterSheetVisible(true);
  }, []);

  const handleBackToMap = useCallback(() => {
    Keyboard.dismiss();
    searchBarRef.current?.blur();
    setSearchQuery("");
    setSearchResults([]);
    setFilterSheetVisible(false);
    setRouteModalVisible(false);
    setQrScannerVisible(false);
  }, []);

  const shouldShowBackButton = useMemo(
    () =>
      searchResults.length > 0 ||
      isFilterSheetVisible ||
      isRouteModalVisible ||
      isQrScannerVisible ||
      searchQuery.trim().length > 0,
    [
      isFilterSheetVisible,
      isQrScannerVisible,
      isRouteModalVisible,
      searchQuery,
      searchResults.length,
    ]
  );

  const stopVoiceSearch = useCallback(async () => {
    if (!voiceModule) {
      setIsVoiceListening(false);
      return;
    }

    try {
      await voiceModule.stop();
    } catch (error) {
      console.warn("Failed to stop voice search", error);
    } finally {
      setIsVoiceListening(false);
    }
  }, [voiceModule]);

  const handleVoiceSearch = useCallback(async () => {
    if (!voiceModule) {
      const message =
        Platform.OS === "web"
          ? "Voice input is not supported on the web yet."
          : "Voice input requires a development build of the app.";

      Alert.alert("Voice search", message);
      return;
    }

    try {
      setIsVoiceListening(true);
      await voiceModule.start("en-US");
    } catch (error) {
      console.warn("Failed to start voice search", error);
      setIsVoiceListening(false);
      Alert.alert(
        "Voice search",
        "We couldn't access the microphone. Check your permissions and try again."
      );
    }
  }, [voiceModule]);

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

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      const action = (event.nativeEvent as unknown as { action?: string }).action;
      if (action === "marker-press" || action === "callout-press") {
        return;
      }

      const { coordinate } = event.nativeEvent;
      setPendingCoordinate(coordinate);
      setCreateModalVisible(true);
    },
    []
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

  const nightOverlayStyle = useMemo(
    () => [
      styles.nightOverlay,
      { opacity: filters.night ? 0.35 : 0 },
    ],
    [filters.night]
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

  if (!reactNativeMapsModule) {
    return (
      <View style={styles.mapUnavailableContainer}>
        <Text style={styles.mapUnavailableTitle}>Map unavailable</Text>
        <Text style={styles.mapUnavailableMessage}>
          {reactNativeMapsUnavailableReason === "expo-go"
            ? "Maps require a development build because Expo Go doesn't include the native react-native-maps module. Run `expo run:android` or `expo run:ios` to continue."
            : "The native react-native-maps module could not be loaded. Double-check your native build configuration and rebuild the app."}
        </Text>
      </View>
    );
  }

  const { default: MapView, Callout, Circle, Marker, Polyline, UrlTile, PROVIDER_DEFAULT } =
    reactNativeMapsModule;

  const mapHeight = Dimensions.get("window").height;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={[styles.map, { height: mapHeight }]}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        onPress={handleMapPress}
        showsCompass
        showsPointsOfInterest={false}
      >
        <UrlTile
          key={activeLayer.id}
          urlTemplate={activeLayer.urlTemplate}
          zIndex={0}
          maximumZ={activeLayer.maximumZ}
        />
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            }}
            title={selectedPlace.displayName}
          />
        )}
        {conversations.map((conversation) => (
          <Marker
            key={conversation.id}
            coordinate={conversation.coordinate}
            title={conversation.title}
            pinColor={
              conversation.hostId === profile.id ? "#1d4ed8" : "#9333ea"
            }
          >
            <Callout onPress={() => openConversation(conversation.id)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{conversation.title}</Text>
                <Text style={styles.calloutSubtitle}>
                  Host: {conversation.hostName}
                </Text>
                <Text style={styles.calloutLink}>Open chat ↗</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        {filters.traffic &&
          TRAFFIC_SEGMENTS.map((segment, index) => (
            <Polyline
              key={`traffic-${index}`}
              coordinates={segment}
              strokeColor="rgba(239, 68, 68, 0.85)"
              strokeWidth={4}
              zIndex={2}
            />
          ))}
        {filters.hiking &&
          HIKING_TRAILS.map((segment, index) => (
            <Polyline
              key={`trail-${index}`}
              coordinates={segment}
              strokeColor="rgba(34,197,94,0.85)"
              strokeWidth={4}
              lineDashPattern={[6, 6]}
              zIndex={2}
            />
          ))}
        {filters.transport &&
          TRANSPORT_POINTS.map((point) => (
            <Marker
              key={point.id}
              coordinate={point.coordinate}
              title={point.label}
              pinColor="#6366f1"
            />
          ))}
        {userLocation.coords && (
          <>
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Your location"
              pinColor="#1d4ed8"
            />
            <Circle
              center={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              radius={120}
              strokeColor="rgba(37,99,235,0.35)"
              fillColor="rgba(59,130,246,0.15)"
              zIndex={1}
            />
          </>
        )}
        {routeResult?.coordinates && (
          <Polyline
            coordinates={routeResult.coordinates}
            strokeColor="#2563eb"
            strokeWidth={5}
            zIndex={3}
          />
        )}
      </MapView>

      <View style={[styles.searchContainer, { paddingTop: insets.top + 12 }]}>
        <MapSearchBar
          ref={searchBarRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSubmitSearch}
          onMicPress={isVoiceListening ? stopVoiceSearch : handleVoiceSearch}
          onQrPress={() => setQrScannerVisible(true)}
          isLoading={isSearching || isVoiceListening}
        />
        {shouldShowBackButton && (
          <Button
            mode="contained-tonal"
            icon="map"
            onPress={handleBackToMap}
            style={styles.backToMapButton}
          >
            Back to map
          </Button>
        )}
        {searchResults.length > 0 && (
          <View style={styles.resultsList}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <View style={[styles.fabColumn, { top: insets.top + 100 }]}>
        <FloatingActionButton
          icon="options-outline"
          accessibilityLabel="Open filters"
          onPress={handleToggleFilters}
        />
        <FloatingActionButton
          icon="layers-outline"
          accessibilityLabel="Change map layer"
          onPress={handleCycleLayer}
          style={styles.fabSpacing}
        />
        <FloatingActionButton
          icon="locate-outline"
          accessibilityLabel="Center on my location"
          onPress={handleLocateMe}
        />
      </View>

      <View style={[styles.layerBadge, { top: insets.top + 16 }]}>
        <Text style={styles.layerBadgeText}>{activeLayer.label}</Text>
      </View>

      {selectedPlace && (
        <View style={[styles.selectedPlaceCard, { bottom: insets.bottom + 140 }]}>
          <Text numberOfLines={2} style={styles.selectedPlaceTitle}>
            {selectedPlace.displayName}
          </Text>
          <Text style={styles.selectedPlaceCoords}>
            {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}
          </Text>
          <Button
            mode="contained"
            onPress={handleSaveFavorite}
            style={styles.favoriteButton}
          >
            Save to favorites
          </Button>
        </View>
      )}

      {routeResult && routeEndpoints && (
        <View style={[styles.routeSummary, { bottom: insets.bottom + 100 }]}>
          <Text style={styles.routeSummaryTitle}>Route overview</Text>
          <Text style={styles.routeSummarySubtitle}>
            {routeEndpoints.start.displayName.split(",")[0]} →
            {" "}
            {routeEndpoints.destination.displayName.split(",")[0]}
          </Text>
          <View style={styles.routeSummaryRow}>
            <Text style={styles.routeStatLabel}>
              {(routeResult.distanceInMeters / 1000).toFixed(1)} km
            </Text>
            <Text style={styles.routeStatLabel}>
              {Math.round(routeResult.durationInSeconds / 60)} min
            </Text>
          </View>
        </View>
      )}

      {locationError && (
        <View style={[styles.locationError, { bottom: insets.bottom + 140 }]}>
          <Text style={styles.locationErrorTitle}>Location unavailable</Text>
          <Text style={styles.locationErrorMessage}>{locationError}</Text>
          <Button mode="contained-tonal" onPress={refreshLocation}>
            Try again
          </Button>
        </View>
      )}

      <View pointerEvents="none" style={nightOverlayStyle} />

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
  mapUnavailableContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: Colors.light.background,
  },
  mapUnavailableTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center",
  },
  mapUnavailableMessage: {
    textAlign: "center",
    color: Colors.light.icon,
    fontSize: 16,
    lineHeight: 22,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  backToMapButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    borderRadius: 14,
  },
  calloutContainer: {
    width: 200,
    paddingVertical: 8,
  },
  calloutTitle: {
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: Colors.light.icon,
    marginBottom: 6,
  },
  calloutLink: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  resultsList: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    maxHeight: 240,
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  resultItemPressed: {
    backgroundColor: "rgba(0,0,0,0.05)",
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
  fabColumn: {
    position: "absolute",
    right: 16,
    alignItems: "center",
    gap: 16,
  },
  fabSpacing: {
    marginVertical: 16,
  },
  layerBadge: {
    position: "absolute",
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
  },
  layerBadgeText: {
    color: "#fff",
    fontWeight: "600",
  },
  selectedPlaceCard: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  selectedPlaceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
  },
  selectedPlaceCoords: {
    marginTop: 6,
    color: Colors.light.icon,
  },
  favoriteButton: {
    marginTop: 14,
    borderRadius: 12,
  },
  routeSummary: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(24, 24, 27, 0.92)",
    borderRadius: 18,
    padding: 18,
  },
  routeSummaryTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  routeSummarySubtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
  },
  routeSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  routeStatLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  locationError: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  locationErrorTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: Colors.light.text,
  },
  locationErrorMessage: {
    marginTop: 6,
    color: Colors.light.icon,
  },
  nightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0b1120",
  },
});
