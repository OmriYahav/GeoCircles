import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";

import { Colors, Fonts } from "../../constants/theme";

type MapCameraPosition = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  duration?: number;
};

type NativeMapRef = {
  setCameraPosition: (position: MapCameraPosition) => void;
};

type ExpoMapsModule = {
  AppleMaps: { View: React.ComponentType<unknown> };
  GoogleMaps: { View: React.ComponentType<unknown> };
};

const DEFAULT_CAMERA: MapCameraPosition = {
  coordinates: {
    latitude: 40.7128,
    longitude: -74.006,
  },
  zoom: 11,
};

function createCameraFromCoords(
  coords: Location.LocationObjectCoords
): MapCameraPosition {
  return {
    coordinates: {
      latitude: coords.latitude,
      longitude: coords.longitude,
    },
    zoom: 15,
  };
}

export default function MapScreen() {
  const [isOverlayDismissed, setOverlayDismissed] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [canAskLocationAgain, setCanAskLocationAgain] = useState(true);
  const [expoMapsModule, setExpoMapsModule] = useState<ExpoMapsModule | null>(null);
  const mapRef = useRef<NativeMapRef | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    let isActive = true;

    if (Platform.OS === "ios" || Platform.OS === "android") {
      // eslint-disable-next-line import/no-unresolved
      import("expo-maps")
        .then((module) => {
          if (isActive) {
            setExpoMapsModule(module as ExpoMapsModule);
          }
        })
        .catch((error) => {
          console.error("Failed to load maps module", error);
          if (isActive) {
            setExpoMapsModule(null);
            setIsMapReady(true);
          }
        });
    } else {
      setExpoMapsModule(null);
      setIsMapReady(true);
    }

    return () => {
      isActive = false;
    };
  }, []);

  const MapComponent = useMemo(() => {
    if (!expoMapsModule) {
      return null;
    }

    if (Platform.OS === "ios") {
      return expoMapsModule.AppleMaps.View;
    }

    if (Platform.OS === "android") {
      return expoMapsModule.GoogleMaps.View;
    }

    return null;
  }, [expoMapsModule]);

  useEffect(() => {
    if (!MapComponent && Platform.OS === "web") {
      setIsMapReady(true);
    }
  }, [MapComponent]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestLocation = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setIsRequestingLocation(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

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

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!isMountedRef.current) {
        return;
      }

      setLocationError(null);
      setLocation(current);
    } catch (error) {
      console.error("Failed to determine current location", error);
      if (isMountedRef.current) {
        setLocation(null);
        setLocationError(
          "We couldn't determine your current location. Please try again."
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsRequestingLocation(false);
      }
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!location?.coords || !mapRef.current) {
      return;
    }

    const camera = createCameraFromCoords(location.coords);

    if (Platform.OS === "android") {
      mapRef.current?.setCameraPosition({
        ...camera,
        duration: 700,
      });
    } else if (Platform.OS === "ios") {
      mapRef.current?.setCameraPosition(camera);
    }
  }, [location]);

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

  const handleOpenInMaps = useCallback(async () => {
    const coords = location?.coords;
    const url = coords
      ? `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
      : "https://maps.google.com";

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
    setIsMapReady(true);
  }, []);

  const handleMapRef = useCallback((ref: NativeMapRef | null) => {
    mapRef.current = ref;
  }, []);

  const isLoading = isRequestingLocation || !isMapReady;

  const coords = location?.coords;
  const overlayTitle = coords ? "You’re here" : "Waiting for your location";
  const overlayDescription = coords
    ? `Latitude ${coords.latitude.toFixed(4)}, Longitude ${coords.longitude.toFixed(4)}`
    : "Grant location access so we can highlight where you are right now.";

  const circleOverlay = useMemo(() => {
    if (!coords?.accuracy || Platform.OS === "web") {
      return undefined;
    }

    return [
      {
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        radius: Math.min(Math.max(coords.accuracy, 25), 500),
        color: "rgba(56, 132, 255, 0.2)",
        lineColor: "rgba(56, 132, 255, 0.5)",
      },
    ];
  }, [coords]);

  const mapCamera = coords ? createCameraFromCoords(coords) : DEFAULT_CAMERA;

  const mapProperties = useMemo(
    () => ({
      isMyLocationEnabled: true,
    }),
    []
  );

  const mapUiSettings = useMemo(
    () => ({
      myLocationButtonEnabled: true,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {MapComponent ? (
        <MapComponent
          ref={handleMapRef as never}
          style={styles.map}
          cameraPosition={mapCamera}
          properties={mapProperties as never}
          uiSettings={mapUiSettings as never}
          circles={circleOverlay as never}
          onMapLoaded={Platform.OS === "android" ? handleMapReady : undefined}
          onLayout={Platform.OS === "ios" ? handleMapReady : undefined}
          accessibilityLabel="Map showing your current location"
          accessibilityRole="image"
        />
      ) : (
        <View style={styles.mapUnavailable}>
          <Text style={styles.mapUnavailableText}>
            Maps are only available on iOS and Android devices.
          </Text>
        </View>
      )}

      {isLoading && (
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
            accessibilityHint="Opens Google Maps centered on your coordinates"
            accessibilityRole="button"
            disabled={!coords}
            onPress={handleOpenInMaps}
            style={({ pressed }) => [
              styles.ctaButton,
              (!coords || pressed) && { opacity: coords ? 0.85 : 0.5 },
            ]}
          >
            <Text style={styles.ctaLabel}>
              {coords ? "Open in Google Maps" : "Waiting for permission…"}
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
    bottom: 32,
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
    bottom: 32,
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
    bottom: 32,
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
});
