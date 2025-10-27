import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { WebView as WebViewType } from "react-native-webview";

import { Colors, Fonts } from "../../constants/theme";

const FEATURED_LOCATION = {
  name: "New York City",
  description:
    "Explore the heart of NYC — zoom, pan, and uncover vibrant neighborhoods and iconic landmarks.",
  embedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193571.43830260472!2d-74.11808643851677!3d40.70582543401667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzIxLjAiTiA3NMKwMDcnMzAuMCJX!5e0!3m2!1sen!2sus!4v1699999999999",
  externalUrl:
    "https://maps.google.com/?q=New+York+City%2C+NY%2C+USA&z=12",
};

export default function MapScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOverlayDismissed, setOverlayDismissed] = useState(false);
  const webViewRef = useRef<WebViewType>(null);

  const html = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body, html { margin: 0; padding: 0; height: 100%; background: #000; }
          iframe { border: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <iframe
          src="${FEATURED_LOCATION.embedUrl}"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </body>
    </html>
  `,
    []
  );

  const handleMapReady = useCallback(() => {
    setLoadError(null);
    setIsLoading(false);
  }, []);

  const handleMapError = useCallback(() => {
    setLoadError("We couldn't load the interactive map. Please try again.");
    setIsLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleOpenInMaps = useCallback(async () => {
    try {
      const canOpen = await Linking.canOpenURL(FEATURED_LOCATION.externalUrl);
      if (canOpen) {
        Linking.openURL(FEATURED_LOCATION.externalUrl);
      }
    } catch (error) {
      console.error("Failed to open maps", error);
    }
  }, []);

  const handleDismissOverlay = useCallback(() => {
    setOverlayDismissed(true);
  }, []);

  const handleRestoreOverlay = useCallback(() => {
    setOverlayDismissed(false);
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
        onLoadEnd={handleMapReady}
        onError={handleMapError}
      />

      {isLoading && !loadError && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={Colors.light.tint} size="large" />
          <Text style={styles.loadingText}>Loading map experience…</Text>
        </View>
      )}

      {loadError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Map unavailable</Text>
          <Text style={styles.errorDescription}>{loadError}</Text>
          <View style={styles.errorActions}>
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
            <Pressable
              accessibilityRole="button"
              onPress={handleOpenInMaps}
              style={({ pressed }) => [
                styles.errorAction,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.errorActionText}>Open in Google Maps</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!loadError && !isOverlayDismissed && (
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Hide featured area information"
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
          <Text style={styles.locationEyebrow}>Featured Area</Text>
          <Text style={styles.locationTitle}>{FEATURED_LOCATION.name}</Text>
          <Text style={styles.locationDescription}>
            {FEATURED_LOCATION.description}
          </Text>
          <Pressable
            accessibilityHint="Opens Google Maps with this location"
            accessibilityRole="button"
            onPress={handleOpenInMaps}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.ctaLabel}>Continue in Google Maps</Text>
          </Pressable>
        </View>
      )}

      {!loadError && isOverlayDismissed && (
        <Pressable
          accessibilityHint="Shows information about the featured area again"
          accessibilityLabel="Show featured area information"
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
    color: Colors.dark.icon,
    marginBottom: 16,
    fontFamily: Fonts.sans,
  },
  errorAction: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
  },
  errorActionText: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "transparent",
    marginEnd: 12,
  },
  secondaryActionText: {
    color: Colors.dark.text,
    fontWeight: "500",
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
});
