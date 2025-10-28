import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  DEFAULT_COORDINATES,
  OSM_MAX_ZOOM_LEVEL,
  OSM_TILE_URL,
  STATIC_MAP_BASE_URL,
} from "../../constants/map";
import { Colors, Fonts } from "../../constants/theme";
import InteractiveMap, {
  InteractiveMapHandle,
} from "../../components/InteractiveMap";

const isMobilePlatform = Platform.OS === "ios" || Platform.OS === "android";

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type NearbyUser = {
  id: string;
  name: string;
  distanceInMeters: number;
  sharedInterest: string;
  lastActiveMinutes: number;
};

type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: string;
};

type BottomTabId =
  | "search"
  | "route"
  | "hub"
  | "favorites"
  | "messages";

type BottomTabItem = {
  id: BottomTabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type TopToolbarActionId = "filters" | "layers" | "locate";

type TopToolbarAction = {
  id: TopToolbarActionId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const BOTTOM_TABS: BottomTabItem[] = [
  { id: "search", label: "Search", icon: "search-outline" },
  { id: "route", label: "Route", icon: "navigate-outline" },
  { id: "hub", label: "Hub", icon: "people-outline" },
  { id: "favorites", label: "Favorites", icon: "heart-outline" },
  { id: "messages", label: "Messages", icon: "chatbubbles-outline" },
];

const TOP_TOOLBAR_ACTIONS: TopToolbarAction[] = [
  { id: "filters", label: "Filters", icon: "options-outline" },
  { id: "layers", label: "Layers", icon: "layers-outline" },
  { id: "locate", label: "My location", icon: "locate-outline" },
];

const DEFAULT_REGION: MapRegion = {
  latitude: DEFAULT_COORDINATES.latitude,
  longitude: DEFAULT_COORDINATES.longitude,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const MIN_STATIC_MAP_ZOOM_LEVEL = 3;

function createRegionFromCoords(coords: Location.LocationObjectCoords): MapRegion {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
}

export default function MapScreen() {
  const [isOverlayDismissed, setOverlayDismissed] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [canAskLocationAgain, setCanAskLocationAgain] = useState(true);
  const [isChatVisible, setChatVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabId>("search");
  const mapRef = useRef<InteractiveMapHandle | null>(null);
  const isMountedRef = useRef(true);
  const isFetchingLocationRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isInteractiveMapSupported = isMobilePlatform;
  const shouldUseInteractiveMap = isInteractiveMapSupported && !hasMapError;

  const nearbyUsers = useMemo<NearbyUser[]>(
    () => [
      {
        id: "lena",
        name: "Lena",
        distanceInMeters: 85,
        sharedInterest: "Local art pop-up",
        lastActiveMinutes: 3,
      },
      {
        id: "amir",
        name: "Amir",
        distanceInMeters: 140,
        sharedInterest: "Community gardening",
        lastActiveMinutes: 7,
      },
      {
        id: "noa",
        name: "Noa",
        distanceInMeters: 210,
        sharedInterest: "Night market meetup",
        lastActiveMinutes: 15,
      },
    ],
    []
  );

  const initialMessages = useMemo<Record<string, ChatMessage[]>>(
    () => ({
      lena: [
        {
          id: "lena-1",
          sender: "them",
          text: "Hey! Are you at the art pop-up too?",
          timestamp: new Date().toISOString(),
        },
      ],
      amir: [
        {
          id: "amir-1",
          sender: "them",
          text: "We’re gathering by the herb beds at 6pm if you’d like to join!",
          timestamp: new Date().toISOString(),
        },
      ],
      noa: [
        {
          id: "noa-1",
          sender: "them",
          text: "Thinking about grabbing coffee near the market. Want to team up?",
          timestamp: new Date().toISOString(),
        },
      ],
    }),
    []
  );

  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>(
    initialMessages
  );

  const improvementSuggestions = useMemo(
    () => [
      {
        id: "icebreaker",
        title: "Share a quick icebreaker",
        description:
          "Mention a local event or highlight on the map to make the first message feel relevant.",
      },
      {
        id: "meetup",
        title: "Suggest a safe meetup point",
        description:
          "Pick a public spot from the map—like a café or community hub—when planning to meet.",
      },
      {
        id: "status",
        title: "Keep your status fresh",
        description:
          "Update your availability so nearby people know when you’re ready to chat or collaborate.",
      },
    ],
    []
  );

  const selectedUser = useMemo(
    () => nearbyUsers.find((user) => user.id === selectedUserId) ?? null,
    [nearbyUsers, selectedUserId]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const startRequestingLocation = useCallback(() => {
    isFetchingLocationRef.current = true;
    setIsRequestingLocation(true);
  }, []);

  const stopRequestingLocation = useCallback(() => {
    isFetchingLocationRef.current = false;
    setIsRequestingLocation(false);
  }, []);

  const fetchCurrentLocation = useCallback(async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10_000,
        timeout: 15_000,
      });

      if (!isMountedRef.current) {
        return;
      }

      setLocationError(null);
      setLocation(current);
    } catch (error) {
      console.error("Failed to determine current location", error);

      if (!isMountedRef.current) {
        return;
      }

      const errorCode = (error as { code?: string })?.code;
      setLocation(null);

      if (errorCode === "E_LOCATION_TIMEOUT") {
        setLocationError(
          "It’s taking a while to determine your position. Try again in a moment."
        );
        return;
      }

      if (errorCode === "E_LOCATION_SERVICES_DISABLED") {
        setLocationError(
          "Location services are turned off. Enable them in your system settings to show your position."
        );
        return;
      }

      setLocationError(
        "We couldn't determine your current location. Please try again."
      );
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!isMountedRef.current || isFetchingLocationRef.current) {
      return;
    }

    startRequestingLocation();

    try {
      let permission = await Location.getForegroundPermissionsAsync();

      if (!isMountedRef.current) {
        return;
      }

      if (
        permission.status !== Location.PermissionStatus.GRANTED &&
        permission.canAskAgain
      ) {
        permission = await Location.requestForegroundPermissionsAsync();

        if (!isMountedRef.current) {
          return;
        }
      }

      if (!isMountedRef.current) {
        return;
      }

      setCanAskLocationAgain(permission.canAskAgain);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocation(null);
        setLocationError(
          permission.canAskAgain
            ? "We need permission to show your current location."
            : "Location access is disabled. Enable it in your system settings to see your position."
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!isMountedRef.current) {
        return;
      }

      if (!servicesEnabled) {
        setLocation(null);
        setLocationError(
          "Location services are turned off. Enable them in your system settings to show your position."
        );
        return;
      }

      await fetchCurrentLocation();
    } catch (error) {
      console.error("Failed to request current location", error);
      if (isMountedRef.current) {
        setLocation(null);
        setLocationError(
          "We couldn't determine your current location. Please try again."
        );
      }
    } finally {
      if (isMountedRef.current) {
        stopRequestingLocation();
      }
    }
  }, [fetchCurrentLocation, startRequestingLocation, stopRequestingLocation]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const refreshLocationIfPossible = useCallback(async () => {
    if (!isMountedRef.current || isFetchingLocationRef.current) {
      return;
    }

    startRequestingLocation();

    try {
      const permission = await Location.getForegroundPermissionsAsync();

      if (!isMountedRef.current) {
        return;
      }

      setCanAskLocationAgain(permission.canAskAgain);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocation(null);
        setLocationError(
          permission.canAskAgain
            ? "We need permission to show your current location."
            : "Location access is disabled. Enable it in your system settings to see your position."
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!isMountedRef.current) {
        return;
      }

      if (!servicesEnabled) {
        setLocation(null);
        setLocationError(
          "Location services are turned off. Enable them in your system settings to show your position."
        );
        return;
      }

      await fetchCurrentLocation();
    } catch (error) {
      console.error("Failed to refresh current location", error);

      if (isMountedRef.current) {
        setLocation(null);
        setLocationError(
          "We couldn't determine your current location. Please try again."
        );
      }
    } finally {
      if (isMountedRef.current) {
        stopRequestingLocation();
      }
    }
  }, [fetchCurrentLocation, startRequestingLocation, stopRequestingLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        previousState &&
        (previousState === "inactive" || previousState === "background") &&
        nextState === "active"
      ) {
        refreshLocationIfPossible();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshLocationIfPossible]);

  useEffect(() => {
    if (!location?.coords || !mapRef.current || !shouldUseInteractiveMap) {
      return;
    }

    mapRef.current.focusOn(location.coords);
  }, [location, shouldUseInteractiveMap]);

  const handleDismissOverlay = useCallback(() => {
    setOverlayDismissed(true);
  }, []);

  const handleRestoreOverlay = useCallback(() => {
    setOverlayDismissed(false);
  }, []);

  const handleRetry = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch((error) => {
      console.error("Failed to open settings", error);
    });
  }, []);

  const closeChat = useCallback(() => {
    setChatVisible(false);
    setSelectedUserId(null);
    setDraftMessage("");
  }, []);

  const handleOpenChat = useCallback(() => {
    setActiveBottomTab("messages");
    setChatVisible(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    closeChat();
    setActiveBottomTab("search");
  }, [closeChat]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setDraftMessage("");
  }, []);

  const handleBackToUserList = useCallback(() => {
    setSelectedUserId(null);
    setDraftMessage("");
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!selectedUserId) {
      return;
    }

    const trimmed = draftMessage.trim();
    if (!trimmed) {
      return;
    }

    setMessagesByUser((current) => {
      const existing = current[selectedUserId] ?? [];
      const timestamp = new Date().toISOString();
      const updated = [
        ...existing,
        {
          id: `${selectedUserId}-${timestamp}`,
          sender: "me",
          text: trimmed,
          timestamp,
        },
      ];

      return {
        ...current,
        [selectedUserId]: updated,
      };
    });

    setDraftMessage("");
  }, [draftMessage, selectedUserId]);

  const handleSelectBottomTab = useCallback(
    (tabId: BottomTabId) => {
      if (tabId === "messages") {
        handleOpenChat();
        return;
      }

      setActiveBottomTab(tabId);

      if (isChatVisible) {
        closeChat();
      }
    },
    [closeChat, handleOpenChat, isChatVisible]
  );

  const handleToolbarAction = useCallback(
    (actionId: TopToolbarActionId) => {
      if (actionId === "locate") {
        if (coords) {
          mapRef.current?.focusOn(coords);
        } else {
          requestLocation();
        }
        return;
      }

      if (actionId === "layers") {
        refreshLocationIfPossible();
        return;
      }

      if (actionId === "filters") {
        setOverlayDismissed(false);
      }
    },
    [coords, refreshLocationIfPossible, requestLocation]
  );

  const handleZoomIn = useCallback(() => {
    if (shouldUseInteractiveMap) {
      mapRef.current?.zoomIn();
      return;
    }

    setFallbackZoomLevel((current) =>
      Math.min(current + 1, OSM_MAX_ZOOM_LEVEL)
    );
  }, [shouldUseInteractiveMap]);

  const handleZoomOut = useCallback(() => {
    if (shouldUseInteractiveMap) {
      mapRef.current?.zoomOut();
      return;
    }

    setFallbackZoomLevel((current) =>
      Math.max(current - 1, MIN_STATIC_MAP_ZOOM_LEVEL)
    );
  }, [shouldUseInteractiveMap]);

  const handleOpenInMaps = useCallback(async () => {
    const coords = location?.coords;
    const url = coords
      ? `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=16/${coords.latitude}/${coords.longitude}`
      : "https://www.openstreetmap.org/";

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open maps", error);
    }
  }, [location]);

  const handleMapReady = useCallback(() => {
    setHasMapError(false);
    setIsMapReady(true);
  }, []);

  const handleMapError = useCallback(() => {
    setHasMapError(true);
    setIsMapReady(false);
  }, []);

  const shouldShowLoadingOverlay =
    isRequestingLocation || (shouldUseInteractiveMap && !isMapReady);

  const coords = location?.coords;
  const overlayTitle = coords ? "You’re here" : "Waiting for your location";
  const overlayDescription = coords
    ? `Latitude ${coords.latitude.toFixed(4)}, Longitude ${coords.longitude.toFixed(4)}`
    : "Grant location access so we can highlight where you are right now.";

  const mapRegion = coords ? createRegionFromCoords(coords) : DEFAULT_REGION;
  const mapZoomLevel = coords ? 15 : DEFAULT_COORDINATES.zoomLevel;
  const [fallbackZoomLevel, setFallbackZoomLevel] = useState(mapZoomLevel);

  useEffect(() => {
    setFallbackZoomLevel(mapZoomLevel);
  }, [mapZoomLevel]);

  const mapUnavailableMessage = (() => {
    if (hasMapError) {
      return "Interactive map tiles couldn’t be loaded right now. Showing a static preview instead.";
    }

    if (!isMobilePlatform) {
      return "Interactive OpenStreetMap tiles are only available on iOS and Android devices.";
    }

    return "Map preview is currently unavailable.";
  })();

  const fallbackMapUrl = useMemo(() => {
    const latitude = coords?.latitude ?? mapRegion.latitude;
    const longitude = coords?.longitude ?? mapRegion.longitude;
    const zoom = shouldUseInteractiveMap ? mapZoomLevel : fallbackZoomLevel;
    const marker = coords ? `&markers=${latitude},${longitude},lightblue1` : "";
    return `${STATIC_MAP_BASE_URL}?center=${latitude},${longitude}&zoom=${zoom}&size=600x600${marker}`;
  }, [
    coords,
    fallbackZoomLevel,
    mapRegion.latitude,
    mapRegion.longitude,
    mapZoomLevel,
    shouldUseInteractiveMap,
  ]);

  return (
    <View style={styles.container}>
      {shouldUseInteractiveMap ? (
        <InteractiveMap
          ref={mapRef}
          initialCoordinates={{
            latitude: mapRegion.latitude,
            longitude: mapRegion.longitude,
          }}
          initialZoom={mapZoomLevel}
          marker={
            coords
              ? { latitude: coords.latitude, longitude: coords.longitude }
              : null
          }
          maxZoom={OSM_MAX_ZOOM_LEVEL}
          onReady={handleMapReady}
          onError={handleMapError}
          style={styles.map}
          tileUrlTemplate={OSM_TILE_URL}
        />
      ) : fallbackMapUrl ? (
        <View style={styles.map}>
          <Image
            source={{ uri: fallbackMapUrl }}
            style={styles.staticMap}
            resizeMode="cover"
            accessibilityLabel="OpenStreetMap view showing your current location"
            accessibilityRole="image"
          />
        </View>
      ) : (
        <View style={styles.mapUnavailable}>
          <Text style={styles.mapUnavailableText}>{mapUnavailableMessage}</Text>
        </View>
      )}

      <View style={styles.topToolbarContainer}>
        <Pressable
          accessibilityHint="Search for places and meetups"
          accessibilityRole="button"
          onPress={() => handleSelectBottomTab("search")}
          style={({ pressed }) => [
            styles.searchBar,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.light.icon}
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>Search the map</Text>
          <View style={styles.searchTrailingIcons}>
            <Ionicons
              name="mic-outline"
              size={18}
              color={Colors.light.icon}
            />
            <Ionicons
              name="qr-code-outline"
              size={18}
              color={Colors.light.icon}
              style={styles.scanIcon}
            />
          </View>
        </Pressable>

        <View style={styles.topToolbarActions}>
          {TOP_TOOLBAR_ACTIONS.map((action, index) => (
            <Pressable
              key={action.id}
              accessibilityLabel={action.label}
              accessibilityRole="button"
              onPress={() => handleToolbarAction(action.id)}
              style={({ pressed }) => [
                styles.topToolbarAction,
                index === 0 && styles.topToolbarActionFirst,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={Colors.light.text}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.mapControls}>
        <Pressable
          accessibilityLabel="Zoom in"
          accessibilityRole="button"
          onPress={handleZoomIn}
          style={({ pressed }) => [
            styles.mapControlButton,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="add" size={22} color={Colors.light.text} />
        </Pressable>
        <Pressable
          accessibilityLabel="Zoom out"
          accessibilityRole="button"
          onPress={handleZoomOut}
          style={({ pressed }) => [
            styles.mapControlButton,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="remove" size={22} color={Colors.light.text} />
        </Pressable>
      </View>

      <View pointerEvents="none" style={styles.attributionContainer}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
      </View>

      {shouldShowLoadingOverlay && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={Colors.light.tint} size="large" />
          <Text style={styles.loadingText}>Centering on your location…</Text>
        </View>
      )}

      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Can’t show your position</Text>
          <Text style={styles.errorDescription}>{locationError}</Text>
          <View style={styles.errorActions}>
            {canAskLocationAgain && (
              <Pressable
                accessibilityRole="button"
                onPress={handleRetry}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.secondaryActionText}>Try again</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={handleOpenSettings}
              style={({ pressed }) => [
                styles.errorAction,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.errorActionText}>Open settings</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!locationError && !isOverlayDismissed && (
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Hide your location details"
            accessibilityRole="button"
            hitSlop={12}
            onPress={handleDismissOverlay}
            style={({ pressed }) => [
              styles.overlayDismiss,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.overlayDismissLabel}>Dismiss</Text>
          </Pressable>
          <Text style={styles.locationEyebrow}>Your location</Text>
          <Text style={styles.locationTitle}>{overlayTitle}</Text>
          <Text style={styles.locationDescription}>{overlayDescription}</Text>
          <Pressable
            accessibilityHint="Opens OpenStreetMap centered on your coordinates"
            accessibilityRole="button"
            disabled={!coords}
            onPress={handleOpenInMaps}
            style={({ pressed }) => [
              styles.ctaButton,
              (!coords || pressed) && { opacity: coords ? 0.85 : 0.5 },
            ]}
          >
            <Text style={styles.ctaLabel}>
              {coords ? "Open in OpenStreetMap" : "Waiting for permission…"}
            </Text>
          </Pressable>
        </View>
      )}

      {!locationError && isOverlayDismissed && (
        <Pressable
          accessibilityHint="Shows your location details again"
          accessibilityLabel="Show your location information"
          accessibilityRole="button"
          onPress={handleRestoreOverlay}
          style={({ pressed }) => [
            styles.overlayRestore,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.overlayRestoreLabel}>Show details</Text>
        </Pressable>
      )}

      <View style={styles.bottomToolbar}>
        {BOTTOM_TABS.map((tab) => {
          const isActive = activeBottomTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              onPress={() => handleSelectBottomTab(tab.id)}
              style={({ pressed }) => [
                styles.bottomToolbarItem,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View
                style={[
                  styles.bottomToolbarIcon,
                  isActive && styles.bottomToolbarIconActive,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={22}
                  color={isActive ? Colors.light.tint : Colors.light.icon}
                />
              </View>
              <Text
                style={[
                  styles.bottomToolbarLabel,
                  isActive && styles.bottomToolbarLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isChatVisible}
        onRequestClose={handleCloseChat}
      >
        <View style={styles.chatBackdrop}>
          <Pressable
            accessibilityLabel="Close nearby chat"
            onPress={handleCloseChat}
            style={StyleSheet.absoluteFill}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.chatSheetContainer}
          >
            <View style={styles.chatSheet}>
              {selectedUser ? (
                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <Pressable
                      accessibilityLabel="Back to nearby people"
                      onPress={handleBackToUserList}
                      style={({ pressed }) => [
                        styles.chatHeaderButton,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.chatHeaderButtonLabel}>Back</Text>
                    </Pressable>
                    <View style={styles.chatHeaderTitleGroup}>
                      <Text style={styles.chatHeaderTitle}>{selectedUser.name}</Text>
                      <Text style={styles.chatHeaderSubtitle}>
                        {`${selectedUser.sharedInterest} • ${selectedUser.distanceInMeters}m away`}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel="Close chat"
                      onPress={handleCloseChat}
                      style={({ pressed }) => [
                        styles.chatHeaderButton,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.chatHeaderButtonLabel}>Close</Text>
                    </Pressable>
                  </View>
                  <FlatList
                    accessibilityRole="text"
                    contentContainerStyle={styles.chatMessages}
                    data={messagesByUser[selectedUser.id] ?? []}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View
                        style={[
                          styles.chatBubble,
                          item.sender === "me"
                            ? styles.chatBubbleMe
                            : styles.chatBubbleThem,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chatBubbleText,
                            item.sender === "me"
                              ? styles.chatBubbleTextMe
                              : styles.chatBubbleTextThem,
                          ]}
                        >
                          {item.text}
                        </Text>
                      </View>
                    )}
                  />
                  <View style={styles.chatInputRow}>
                    <TextInput
                      accessibilityLabel={`Message ${selectedUser.name}`}
                      onChangeText={setDraftMessage}
                      placeholder="Type a message…"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      style={styles.chatInput}
                      value={draftMessage}
                      multiline
                    />
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSendMessage}
                      style={({ pressed }) => [
                        styles.chatSendButton,
                        (pressed || !draftMessage.trim()) && { opacity: 0.8 },
                      ]}
                      disabled={!draftMessage.trim()}
                    >
                      <Text style={styles.chatSendButtonLabel}>Send</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.chatDirectory}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatHeaderTitle}>Nearby chat</Text>
                    <Pressable
                      accessibilityLabel="Close nearby chat"
                      onPress={handleCloseChat}
                      style={({ pressed }) => [
                        styles.chatHeaderButton,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.chatHeaderButtonLabel}>Close</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.chatIntro}>
                    {"Reach out to people exploring the same area. Tap a profile to start chatting."}
                  </Text>
                  <FlatList
                    data={nearbyUsers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.chatList}
                    renderItem={({ item }) => (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleSelectUser(item.id)}
                        style={({ pressed }) => [
                          styles.chatUserCard,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text style={styles.chatUserName}>{item.name}</Text>
                        <Text style={styles.chatUserMeta}>
                          {`${Math.round(item.distanceInMeters)}m • Active ${item.lastActiveMinutes} min ago`}
                        </Text>
                        <Text style={styles.chatUserInterest}>
                          {`Shared interest: ${item.sharedInterest}`}
                        </Text>
                      </Pressable>
                    )}
                  />
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Tips to improve your chats</Text>
                    {improvementSuggestions.map((suggestion) => (
                      <View key={suggestion.id} style={styles.suggestionCard}>
                        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                        <Text style={styles.suggestionDescription}>
                          {suggestion.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    flex: 1,
  },
  staticMap: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mapUnavailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  mapUnavailableText: {
    textAlign: "center",
    color: Colors.light.text,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  attributionContainer: {
    position: "absolute",
    left: 16,
    bottom: 132,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  attributionText: {
    color: Colors.light.background,
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.background,
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 140,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    padding: 20,
    paddingTop: 32,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  overlayDismiss: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  overlayDismissLabel: {
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: Colors.light.icon,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
  overlayRestore: {
    position: "absolute",
    right: 24,
    bottom: 140,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  overlayRestoreLabel: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  locationEyebrow: {
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 8,
    fontFamily: Fonts.sans,
  },
  locationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
    fontFamily: Fonts.rounded,
  },
  locationDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.icon,
    marginBottom: 16,
    fontFamily: Fonts.serif,
  },
  ctaButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 999,
  },
  ctaLabel: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  errorContainer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 140,
    backgroundColor: "rgba(18, 18, 18, 0.94)",
    padding: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
  },
  errorActions: {
    flexDirection: "row",
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 6,
    fontFamily: Fonts.rounded,
  },
  errorDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.dark.text,
    fontFamily: Fonts.serif,
  },
  errorAction: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 999,
  },
  errorActionText: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 12,
  },
  secondaryActionText: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  topToolbarContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 52,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: Colors.light.icon,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  searchTrailingIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanIcon: {
    marginLeft: 10,
  },
  topToolbarActions: {
    flexDirection: "row",
    marginLeft: 12,
  },
  topToolbarAction: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  topToolbarActionFirst: {
    marginLeft: 0,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 200,
  },
  mapControlButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  bottomToolbar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bottomToolbarItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
  },
  bottomToolbarIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  bottomToolbarIconActive: {
    backgroundColor: "rgba(10, 126, 164, 0.12)",
  },
  bottomToolbarLabel: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.light.icon,
    fontFamily: Fonts.sans,
  },
  bottomToolbarLabelActive: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  chatBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  chatSheetContainer: {
    width: "100%",
  },
  chatSheet: {
    maxHeight: "80%",
    backgroundColor: "#0F0F0F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  chatHeaderTitleGroup: {
    flex: 1,
    marginHorizontal: 12,
  },
  chatHeaderTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  chatHeaderSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: Fonts.sans,
    marginTop: 2,
  },
  chatHeaderButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chatHeaderButtonLabel: {
    color: Colors.light.tint,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  chatMessages: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  chatBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatBubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.tint,
  },
  chatBubbleThem: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chatBubbleText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  chatBubbleTextMe: {
    color: Colors.dark.text,
  },
  chatBubbleTextThem: {
    color: Colors.dark.text,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  chatSendButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chatSendButtonLabel: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  chatDirectory: {
    flex: 1,
  },
  chatIntro: {
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    fontFamily: Fonts.sans,
  },
  chatList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  chatUserCard: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  chatUserName: {
    color: Colors.dark.text,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  chatUserMeta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 4,
    fontFamily: Fonts.sans,
  },
  chatUserInterest: {
    color: Colors.dark.text,
    fontSize: 13,
    marginTop: 8,
    fontFamily: Fonts.serif,
  },
  suggestionsContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  suggestionsTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  suggestionCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionTitle: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  suggestionDescription: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    fontFamily: Fonts.serif,
  },
});
