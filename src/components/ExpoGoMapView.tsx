import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

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
  mapTypeId: "roadmap" | "satellite" | "terrain" | "hybrid";
  customMapStyle: Record<string, unknown>[] | null;
};

type ExpoGoMapViewProps = {
  apiKey?: string;
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

type MapPayloadInput = Pick<
  ExpoGoMapViewProps,
  | "activeLayer"
  | "conversations"
  | "filters"
  | "hikingTrails"
  | "routeCoordinates"
  | "selectedPlace"
  | "trafficSegments"
  | "transportPoints"
  | "userLocation"
>;

type HtmlConfig = {
  center: { lat: number; lng: number };
  zoom: number;
  layer: MapLayerPayload;
};

function regionToZoom(latitudeDelta: number) {
  if (!latitudeDelta) {
    return 12;
  }
  const zoom = Math.log2(360 / latitudeDelta);
  return Math.max(3, Math.min(18, Math.round(zoom)));
}

function serializeConfig(config: HtmlConfig) {
  return JSON.stringify(config).replace(/</g, "\\u003c");
}

function createHtml(apiKey: string, config: HtmlConfig) {
  const configJson = serializeConfig(config);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <style>
      html,
      body,
      #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background-color: #0f172a;
      }

      .popup {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 160px;
      }

      .popup-title {
        font-weight: 600;
        font-size: 15px;
        color: #0f172a;
      }

      .popup-subtitle {
        color: #475569;
        font-size: 13px;
      }

      .popup-link {
        color: #2563eb;
        font-weight: 600;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const INITIAL_CONFIG = ${configJson};
      const pendingMessages = [];
      const conversationMarkers = new Map();
      const overlays = {
        selectedPlace: null,
        traffic: [],
        hiking: [],
        transport: [],
        userMarker: null,
        userCircle: null,
        route: null,
      };
      let map = null;
      let isReady = false;

      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
          return (
            {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[char] || char
          );
        });
      }

      function clearOverlay(entry) {
        if (!entry) {
          return;
        }
        if (Array.isArray(entry)) {
          entry.forEach(clearOverlay);
          return;
        }
        if (entry.setMap) {
          entry.setMap(null);
        }
        if (entry.close) {
          entry.close();
        }
      }

      function toLatLng(point) {
        return { lat: point.latitude, lng: point.longitude };
      }

      function setLayer(layer) {
        if (!map || !layer) {
          return;
        }
        map.setMapTypeId(layer.mapTypeId || "roadmap");
        map.setOptions({ styles: layer.customMapStyle || null });
      }

      function updateSelectedPlace(payload) {
        clearOverlay(overlays.selectedPlace);
        overlays.selectedPlace = null;
        if (!payload) {
          return;
        }
        overlays.selectedPlace = new google.maps.Marker({
          position: { lat: payload.latitude, lng: payload.longitude },
          map,
          title: payload.displayName,
        });
      }

      function updateConversations(items) {
        conversationMarkers.forEach((entry) => {
          clearOverlay(entry.info);
          clearOverlay(entry.marker);
        });
        conversationMarkers.clear();
        (items || []).forEach((conversation) => {
          const marker = new google.maps.Marker({
            position: { lat: conversation.latitude, lng: conversation.longitude },
            map,
            title: conversation.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: conversation.pinColor || "#9333ea",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            },
          });
          const popupHtml =
            '<div class="popup">' +
            '<div class="popup-title">' +
            escapeHtml(conversation.title) +
            "</div>" +
            '<div class="popup-subtitle">Host: ' +
            escapeHtml(conversation.hostName) +
            "</div>" +
            '<div class="popup-link">Open chat ↗</div>' +
            "</div>";
          const info = new google.maps.InfoWindow({ content: popupHtml });
          marker.addListener("click", () => {
            info.open({ anchor: marker, map });
            window.ReactNativeWebView?.postMessage(
              JSON.stringify({ type: "conversation", id: conversation.id })
            );
          });
          conversationMarkers.set(conversation.id, { marker, info });
        });
      }

      function updatePolylineCollection(current, segments, optionsFactory) {
        clearOverlay(current);
        const next = [];
        (segments || []).forEach((segment) => {
          const polyline = new google.maps.Polyline({
            map,
            path: segment.map(toLatLng),
            ...optionsFactory(),
          });
          next.push(polyline);
        });
        return next;
      }

      function updateTransport(points) {
        clearOverlay(overlays.transport);
        overlays.transport = [];
        (points || []).forEach((point) => {
          const marker = new google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            map,
            title: point.label,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#6366f1",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 6,
            },
          });
          const info = new google.maps.InfoWindow({
            content:
              '<div class="popup"><div class="popup-title">' +
              escapeHtml(point.label) +
              "</div></div>",
          });
          marker.addListener("click", () => {
            info.open({ anchor: marker, map });
          });
          overlays.transport.push(marker);
        });
      }

      function updateUserLocation(location) {
        clearOverlay(overlays.userMarker);
        clearOverlay(overlays.userCircle);
        overlays.userMarker = null;
        overlays.userCircle = null;
        if (!location) {
          return;
        }
        overlays.userMarker = new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map,
          title: "Your location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#1d4ed8",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 7,
          },
        });
        overlays.userCircle = new google.maps.Circle({
          map,
          center: { lat: location.latitude, lng: location.longitude },
          radius: 120,
          strokeColor: "rgba(37,99,235,0.35)",
          strokeWeight: 1,
          fillColor: "rgba(59,130,246,0.15)",
        });
      }

      function updateRoute(coordinates) {
        clearOverlay(overlays.route);
        overlays.route = null;
        if (!coordinates || coordinates.length === 0) {
          return;
        }
        overlays.route = new google.maps.Polyline({
          map,
          path: coordinates.map(toLatLng),
          strokeColor: "#2563eb",
          strokeOpacity: 0.95,
          strokeWeight: 5,
        });
      }

      function applyData(data) {
        if (!map) {
          return;
        }
        if (data.layer) {
          setLayer(data.layer);
        }
        updateSelectedPlace(data.selectedPlace);
        updateConversations(data.conversations || []);
        overlays.traffic = updatePolylineCollection(
          overlays.traffic,
          data.trafficSegments || [],
          () => ({ strokeColor: "rgba(239, 68, 68, 0.85)", strokeWeight: 4 })
        );
        overlays.hiking = updatePolylineCollection(
          overlays.hiking,
          data.hikingTrails || [],
          () => ({
            strokeOpacity: 0,
            strokeWeight: 0,
            icons: [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  scale: 4,
                  strokeColor: "rgba(34,197,94,0.85)",
                },
                offset: "0",
                repeat: "12px",
              },
            ],
          })
        );
        updateTransport(data.transportPoints || []);
        updateUserLocation(data.userLocation || null);
        updateRoute(data.routeCoordinates || []);
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(() => {
            google.maps.event.trigger(map, "resize");
          });
        }
      }

      function handleData(message) {
        if (!map) {
          return;
        }
        if (message.type === "updateData") {
          applyData(message.payload || {});
          return;
        }
        if (message.type === "animateCamera") {
          const { center, zoom } = message.payload || {};
          if (center) {
            map.panTo({ lat: center.latitude, lng: center.longitude });
          }
          if (typeof zoom === "number") {
            map.setZoom(zoom);
          }
          return;
        }
        if (message.type === "fitToCoordinates") {
          const coords = message.payload?.coordinates || [];
          if (coords.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            coords.forEach((coord) => bounds.extend({ lat: coord.latitude, lng: coord.longitude }));
            const padding = message.payload?.padding || 60;
            map.fitBounds(bounds, { padding });
          }
        }
      }

      function flushQueue() {
        while (pendingMessages.length > 0) {
          handleData(pendingMessages.shift());
        }
      }

      function handleMessage(event) {
        let data;
        try {
          data = typeof event === "string" ? JSON.parse(event) : event;
        } catch (error) {
          return;
        }
        if (!data || typeof data.type !== "string") {
          return;
        }
        if (!isReady) {
          pendingMessages.push(data);
          return;
        }
        handleData(data);
      }

      function initMap() {
        const config = INITIAL_CONFIG;
        map = new google.maps.Map(document.getElementById("map"), {
          center: config.center,
          zoom: config.zoom,
          mapTypeId: config.layer?.mapTypeId || "roadmap",
          styles: config.layer?.customMapStyle || null,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        map.addListener("click", (event) => {
          window.ReactNativeWebView?.postMessage(
            JSON.stringify({
              type: "press",
              coordinate: {
                latitude: event.latLng.lat(),
                longitude: event.latLng.lng(),
              },
            })
          );
        });

        isReady = true;
        window.ReactNativeWebView?.postMessage(JSON.stringify({ type: "ready" }));
        flushQueue();
      }

      window.initMap = initMap;

      document.addEventListener("message", (event) => handleMessage(event.data));
      window.addEventListener("message", (event) => handleMessage(event.data));
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
  </body>
</html>`;
}

function createMapPayload(props: MapPayloadInput) {
  const {
    activeLayer,
    conversations,
    filters,
    hikingTrails,
    routeCoordinates,
    selectedPlace,
    trafficSegments,
    transportPoints,
    userLocation,
  } = props;

  return {
    layer: activeLayer,
    selectedPlace,
    conversations,
    trafficSegments: filters.traffic ? trafficSegments : [],
    hikingTrails: filters.hiking ? hikingTrails : [],
    transportPoints: filters.transport ? transportPoints : [],
    userLocation,
    routeCoordinates: routeCoordinates ?? [],
  };
}

const ExpoGoMapView = forwardRef<ExpoGoMapHandle, ExpoGoMapViewProps>((props, ref) => {
  const { initialRegion, onConversationPress, onMapPress, apiKey } = props;

  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);
  const pendingMessagesRef = useRef<object[]>([]);

  const html = useMemo(() => {
    if (!apiKey) {
      return null;
    }
    const zoom = regionToZoom(initialRegion.latitudeDelta);
    return createHtml(apiKey, {
      center: { lat: initialRegion.latitude, lng: initialRegion.longitude },
      zoom,
      layer: props.activeLayer,
    });
  }, [apiKey, initialRegion.latitude, initialRegion.longitude, initialRegion.latitudeDelta, props.activeLayer]);

  const mapPayload = useMemo(
    () =>
      createMapPayload({
        activeLayer: props.activeLayer,
        conversations: props.conversations,
        filters: props.filters,
        hikingTrails: props.hikingTrails,
        routeCoordinates: props.routeCoordinates,
        selectedPlace: props.selectedPlace,
        trafficSegments: props.trafficSegments,
        transportPoints: props.transportPoints,
        userLocation: props.userLocation,
      }),
    [
      props.activeLayer,
      props.conversations,
      props.filters,
      props.hikingTrails,
      props.routeCoordinates,
      props.selectedPlace,
      props.trafficSegments,
      props.transportPoints,
      props.userLocation,
    ]
  );

  const sendMessage = useCallback(
    (message: object) => {
      if (isReadyRef.current) {
        webViewRef.current?.postMessage(JSON.stringify(message));
        return;
      }
      pendingMessagesRef.current.push(message);
    },
    []
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    sendMessage({ type: "updateData", payload: mapPayload });
  }, [mapPayload, sendMessage]);

  useImperativeHandle(
    ref,
    () => ({
      animateCamera: ({ center, zoom }, config) => {
        sendMessage({
          type: "animateCamera",
          payload: {
            center,
            zoom,
            duration: config?.duration,
          },
        });
      },
      fitToCoordinates: (coordinates, options) => {
        sendMessage({
          type: "fitToCoordinates",
          payload: {
            coordinates,
            padding: options?.edgePadding
              ? Math.max(
                  options.edgePadding.top,
                  options.edgePadding.bottom,
                  options.edgePadding.left,
                  options.edgePadding.right
                )
              : 60,
          },
        });
      },
    }),
    [sendMessage]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (!data || typeof data !== "object") {
        return;
      }

      const message = data as { type?: string; [key: string]: unknown };

      if (message.type === "ready") {
        isReadyRef.current = true;
        const queue = pendingMessagesRef.current.splice(0);
        queue.forEach((item) => {
          webViewRef.current?.postMessage(JSON.stringify(item));
        });
        webViewRef.current?.postMessage(
          JSON.stringify({ type: "updateData", payload: mapPayload })
        );
        return;
      }

      if (message.type === "press") {
        const coordinate = message.coordinate as LatLng | undefined;
        if (coordinate && onMapPress) {
          onMapPress(coordinate);
        }
        return;
      }

      if (message.type === "conversation") {
        const identifier = message.id as string | undefined;
        if (identifier && onConversationPress) {
          onConversationPress(identifier);
        }
      }
    },
    [mapPayload, onConversationPress, onMapPress]
  );

  if (!apiKey || !html) {
    return (
      <View style={[styles.missingKeyContainer, props.style]}>
        <Text style={styles.missingKeyTitle}>Google Maps not configured</Text>
        <Text style={styles.missingKeySubtitle}>
          Provide a Google Maps API key in expo.extra.googleMapsApiKey to view the interactive map preview.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={["*"]}
      source={{ html }}
      onMessage={handleMessage}
      javaScriptEnabled
      style={props.style}
      automaticallyAdjustContentInsets={false}
      scrollEnabled={false}
      setSupportMultipleWindows={false}
      incognito
    />
  );
});

ExpoGoMapView.displayName = "ExpoGoMapView";

const styles = StyleSheet.create({
  missingKeyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
  },
  missingKeyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  missingKeySubtitle: {
    color: "rgba(226,232,240,0.85)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ExpoGoMapView;
