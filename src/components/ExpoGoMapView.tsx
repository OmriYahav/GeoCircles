import React, {
  forwardRef,
  useImperativeHandle,
} from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import type { LatLng } from "../types/coordinates";
import type { FilterState } from "./FilterBottomSheet";

export type ExpoGoMapHandle = {
  animateCamera: (
    options: { center: LatLng; zoom?: number },
    config?: { duration?: number }
  ) => void;
  fitToCoordinates: (
    coordinates: LatLng[],
    options?: { edgePadding?: { top: number; bottom: number; left: number; right: number } }
  ) => void;
};

type ConversationMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  hostName: string;
  pinColor: string;
};

type TransportPoint = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
};

type MapLayerPayload = {
  id: string;
  styleURL: string;
};

type ExpoGoMapViewProps = {
  accessToken?: string;
  style?: StyleProp<ViewStyle>;
  initialRegion: { latitude: number; longitude: number; latitudeDelta: number };
  activeLayer: MapLayerPayload;
  selectedPlace: { latitude: number; longitude: number; displayName: string } | null;
  conversations: ConversationMarker[];
  transportPoints: TransportPoint[];
  trafficSegments: LatLng[][];
  hikingTrails: LatLng[][];
  userLocation: LatLng | null;
  routeCoordinates: LatLng[] | null;
  filters: Pick<FilterState, "traffic" | "hiking" | "transport">;
  onMapPress?: (coordinate: LatLng) => void;
  onConversationPress?: (conversationId: string) => void;
};

const ExpoGoMapView = forwardRef<ExpoGoMapHandle, ExpoGoMapViewProps>((props, ref) => {
  useImperativeHandle(
    ref,
    () => ({
      animateCamera: () => {
        // No-op: the preview view does not support camera animations.
      },
      fitToCoordinates: () => {
        // No-op: the preview view does not support camera animations.
      },
    }),
    []
  );

  const message = props.accessToken
    ? "Expo Go doesn't include the Mapbox native module. Build a development client to unlock the interactive map experience."
    : "Provide a Mapbox access token in expo.extra.mapboxAccessToken (or set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN) to enable the map preview.";

  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.title}>Map preview unavailable</Text>
      <Text style={styles.subtitle}>{message}</Text>
    </View>
  );
});

ExpoGoMapView.displayName = "ExpoGoMapView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(226,232,240,0.85)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ExpoGoMapView;
