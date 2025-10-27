import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from "../../constants/mapbox";
import { Colors, Fonts } from "../../constants/theme";

type MapboxGLModule = typeof import("@rnmapbox/maps");
type MapboxCameraRef = React.ComponentRef<MapboxGLModule["Camera"]> | null;

const isMobilePlatform = Platform.OS === "ios" || Platform.OS === "android";

let MapboxGL: MapboxGLModule | null = null;

if (isMobilePlatform) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    MapboxGL = require("@rnmapbox/maps") as MapboxGLModule;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "@rnmapbox/maps native module is unavailable. Falling back to static map rendering.",
        error
      );
    }
    MapboxGL = null;
  }
}

type MapCameraPosition = {
  centerCoordinate: [number, number];
  zoomLevel: number;
};

const DEFAULT_CAMERA: MapCameraPosition = {
  centerCoordinate: [-74.006, 40.7128],
  zoomLevel: 11,
};

function createCameraFromCoords(
  coords: Location.LocationObjectCoords
): MapCameraPosition {
  return {
    centerCoordinate: [coords.longitude, coords.latitude],
    zoomLevel: 15,
  };
}

export default function MapScreen() {
  const [isOverlayDismissed, setOverlayDismissed] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [canAskLocationAgain, setCanAskLocationAgain] = useState(true);
  const cameraRef = useRef<MapboxCameraRef>(null);
  const isMountedRef = useRef(true);
  const hasMapboxToken = Boolean(MAPBOX_ACCESS_TOKEN);

  useEffect(() => {
    if (!isMobilePlatform || !MapboxGL || !hasMapboxToken) {
      setIsMapReady(true);
      return;
    }

    MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
    MapboxGL.setTelemetryEnabled(false);
    MapboxGL.locationManager?.start?.();

    return () => {
      MapboxGL?.locationManager?.stop?.();
    };
  }, [hasMapboxToken]);

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
    if (!location?.coords || !cameraRef.current || !isMobilePlatform || !MapboxGL) {
      return;
    }

    const camera = createCameraFromCoords(location.coords);

    cameraRef.current.setCamera({
      centerCoordinate: camera.centerCoordinate,
      zoomLevel: camera.zoomLevel,
      animationDuration: Platform.OS === "android" ? 700 : 0,
      animationMode: Platform.OS === "android" ? "easeTo" : "none",
    });
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
      ? `https://www.mapbox.com/directions/?coordinates=${coords.longitude},${coords.latitude}`
      : "https://www.mapbox.com/maps/";

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

  const isMapboxSupported = Boolean(isMobilePlatform && hasMapboxToken && MapboxGL);

  const shouldShowLoadingOverlay =
    isRequestingLocation || (isMapboxSupported && !isMapReady);

  const coords = location?.coords;
  const overlayTitle = coords ? "You’re here" : "Waiting for your location";
  const overlayDescription = coords
    ? `Latitude ${coords.latitude.toFixed(4)}, Longitude ${coords.longitude.toFixed(4)}`
    : "Grant location access so we can highlight where you are right now.";

  const mapCamera = coords ? createCameraFromCoords(coords) : DEFAULT_CAMERA;

  const mapUnavailableMessage = (() => {
    if (!hasMapboxToken) {
      return "Add your Mapbox public access token (EXPO_PUBLIC_MAPBOX_TOKEN) to enable maps.";
    }

    if (!isMobilePlatform) {
      return "Interactive Mapbox maps are only available on iOS and Android devices.";
    }

    if (!MapboxGL) {
      return "Mapbox maps require running the app in a custom development or production build.";
    }

    return "Map preview is currently unavailable.";
  })();

  const fallbackMapUrl = useMemo(() => {
    if (!hasMapboxToken) {
      return null;
    }

    const latitude = coords?.latitude ?? mapCamera.centerCoordinate[1];
    const longitude = coords?.longitude ?? mapCamera.centerCoordinate[0];
    const marker = coords ? `pin-s+3875F6(${longitude},${latitude})/` : "";
    const camera = `${longitude},${latitude},${coords ? 15 : mapCamera.zoomLevel},0`;
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${marker}${camera}/600x600@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }, [coords, hasMapboxToken, mapCamera.centerCoordinate, mapCamera.zoomLevel]);

  return (
    <View style={styles.container}>
      {isMapboxSupported && MapboxGL ? (
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MAPBOX_STYLE_URL}
          logoEnabled={false}
          compassEnabled
          onDidFinishLoadingMap={handleMapReady}
          onDidFinishRenderingMapFully={handleMapReady}
          accessibilityLabel="Map showing your current location"
          accessibilityRole="image"
        >
          <MapboxGL.Camera
            ref={cameraRef}
            centerCoordinate={mapCamera.centerCoordinate}
            zoomLevel={mapCamera.zoomLevel}
          />
          <MapboxGL.UserLocation
            visible
            showsUserHeadingIndicator
          />
          {coords && (
            <MapboxGL.PointAnnotation
              id="current-location"
              coordinate={mapCamera.centerCoordinate}
              title="Your location"
            />
          )}
        </MapboxGL.MapView>
      ) : fallbackMapUrl ? (
        <View style={styles.map}>
          <Image
            source={{ uri: fallbackMapUrl }}
            style={styles.staticMap}
            resizeMode="cover"
            accessibilityLabel="Mapbox map showing your current location"
            accessibilityRole="image"
          />
        </View>
      ) : (
        <View style={styles.mapUnavailable}>
          <Text style={styles.mapUnavailableText}>{mapUnavailableMessage}</Text>
        </View>
      )}

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
            accessibilityHint="Opens Mapbox directions centered on your coordinates"
            accessibilityRole="button"
            disabled={!coords}
            onPress={handleOpenInMaps}
            style={({ pressed }) => [
              styles.ctaButton,
              (!coords || pressed) && { opacity: coords ? 0.85 : 0.5 },
            ]}
          >
            <Text style={styles.ctaLabel}>
              {coords ? "Open in Mapbox" : "Waiting for permission…"}
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
