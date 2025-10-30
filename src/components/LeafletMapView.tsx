import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import type { LatLng } from "../types/coordinates";
import type { FilterState } from "./FilterBottomSheet";

export type LeafletMapHandle = {
  animateCamera: (
    options: { center: LatLng; zoom?: number },
    config?: { duration?: number }
  ) => void;
  fitToCoordinates: (
    coordinates: LatLng[],
    options?: {
      edgePadding?: { top: number; bottom: number; left: number; right: number };
      animated?: boolean;
    }
  ) => void;
};

type ConversationMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  hostName: string;
  isSelf: boolean;
};

type TransportPoint = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
};

type LeafletMapViewProps = {
  style?: StyleProp<ViewStyle>;
  initialCenter: { latitude: number; longitude: number; zoom: number };
  selectedPlace: { latitude: number; longitude: number; displayName: string } | null;
  conversations: ConversationMarker[];
  transportPoints: TransportPoint[];
  trafficSegments: LatLng[][];
  hikingTrails: LatLng[][];
  routeCoordinates: LatLng[] | null;
  userLocation: ({ latitude: number; longitude: number; radius: number } & {
    accuracy?: number;
  }) | null;
  filters: Pick<FilterState, "traffic" | "hiking" | "transport" | "night">;
  onMapPress?: (coordinate: LatLng) => void;
  onConversationPress?: (conversationId: string) => void;
  mapType?: "standard" | "satellite";
};

type LeafletMessage = {
  type: string;
  payload?: unknown;
};

type LeafletMapDataPayload = {
  selectedPlace: LeafletMapViewProps["selectedPlace"];
  conversations: ConversationMarker[];
  transportPoints: TransportPoint[];
  trafficSegments: LatLng[][];
  hikingTrails: LatLng[][];
  routeCoordinates: LatLng[] | null;
  userLocation: LeafletMapViewProps["userLocation"];
  filters: LeafletMapViewProps["filters"];
};

const NIGHT_OVERLAY_EVENT = "setNightMode";

const DEFAULT_LAYER = {
  tileUrlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
  subdomains: ["a", "b", "c"],
};

const SATELLITE_LAYER = {
  tileUrlTemplate:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS",
  maxZoom: 18,
};

function createLeafletHtml(initialCenter: LeafletMapViewProps["initialCenter"]) {
  const initialConfig = {
    center: initialCenter,
  };

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <!-- Subresource Integrity is avoided because Android WebView ignores resources with integrity
         attributes, which left the map uninitialized on devices that only showed the fallback
         background color. -->
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      crossorigin=""
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #0f172a;
        touch-action: none;
      }

      #map {
        width: 100%;
        height: 100%;
      }

      #nightOverlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #0b1120;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .marker {
        width: 28px;
        height: 28px;
        border-radius: 14px;
        border: 3px solid #ffffff;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
      }

      .marker--self {
        background-color: #1e3a8a;
      }

      .marker--other {
        background-color: #0ea5e9;
      }

      .marker--selected {
        background-color: #f97316;
      }

      .marker--transport {
        width: 24px;
        height: 24px;
        border-radius: 12px;
        border: 2px solid #ffffff;
        background-color: #312e81;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .leaflet-control-attribution {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="nightOverlay"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      crossorigin=""
    ></script>
    <script>
      const INITIAL_CONFIG = ${JSON.stringify(initialConfig)};
      const DEFAULT_LAYER = ${JSON.stringify(DEFAULT_LAYER)};
      const SATELLITE_LAYER = ${JSON.stringify(SATELLITE_LAYER)};
      const state = {
        baseLayer: null,
        activeLayerType: 'standard',
        selectedLayer: L.layerGroup(),
        conversationLayer: L.layerGroup(),
        transportLayer: L.layerGroup(),
        trafficLayer: L.layerGroup(),
        hikingLayer: L.layerGroup(),
        routeLayer: L.layerGroup(),
        userLocationCircle: null,
        userLocationPoint: null,
      };

      const map = L.map('map', {
        zoomControl: false,
        preferCanvas: true,
      }).setView(
        [INITIAL_CONFIG.center.latitude, INITIAL_CONFIG.center.longitude],
        INITIAL_CONFIG.center.zoom
      );
      map.attributionControl.setPrefix('');

      function createTileLayer(config) {
        const layerOptions = {
          attribution: config.attribution || '',
          maxZoom: config.maxZoom || 19,
        };
        if (Array.isArray(config.subdomains)) {
          layerOptions.subdomains = config.subdomains;
        }
        return L.tileLayer(config.tileUrlTemplate, layerOptions);
      }

      function applyBaseLayer(type) {
        const config = type === 'satellite' ? SATELLITE_LAYER : DEFAULT_LAYER;
        if (state.baseLayer) {
          map.removeLayer(state.baseLayer);
        }
        state.baseLayer = createTileLayer(config);
        state.baseLayer.addTo(map);
        state.activeLayerType = type;
      }

      applyBaseLayer('standard');

      state.selectedLayer.addTo(map);
      state.conversationLayer.addTo(map);
      state.transportLayer.addTo(map);
      state.trafficLayer.addTo(map);
      state.hikingLayer.addTo(map);
      state.routeLayer.addTo(map);

      const icons = {
        selected: L.divIcon({
          className: 'marker marker--selected',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        }),
        conversationSelf: L.divIcon({
          className: 'marker marker--self',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        }),
        conversationOther: L.divIcon({
          className: 'marker marker--other',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        }),
        transport: L.divIcon({
          className: 'marker marker--transport',
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        }),
      };

      function sendMessage(type, payload) {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
        }
      }

      function toLatLngTuple(point) {
        return [point.latitude, point.longitude];
      }

      function setNightOverlay(enabled) {
        const overlay = document.getElementById('nightOverlay');
        if (!overlay) return;
        overlay.style.opacity = enabled ? '0.35' : '0';
      }

      function updateData(data) {
        const {
          selectedPlace,
          conversations,
          transportPoints,
          trafficSegments,
          hikingTrails,
          routeCoordinates,
          userLocation,
          filters,
        } = data;

        state.selectedLayer.clearLayers();
        if (selectedPlace) {
          L.marker([selectedPlace.latitude, selectedPlace.longitude], {
            icon: icons.selected,
          }).addTo(state.selectedLayer);
        }

        state.conversationLayer.clearLayers();
        (conversations || []).forEach((conversation) => {
          const marker = L.marker([conversation.latitude, conversation.longitude], {
            icon: conversation.isSelf ? icons.conversationSelf : icons.conversationOther,
          });
          marker.on('click', (event) => {
            if (event && event.originalEvent) {
              event.originalEvent.stopPropagation();
            }
            sendMessage('conversationPress', { id: conversation.id });
          });
          marker.addTo(state.conversationLayer);
        });

        state.transportLayer.clearLayers();
        (transportPoints || []).forEach((point) => {
          const marker = L.marker([point.latitude, point.longitude], {
            icon: icons.transport,
          });
          marker.bindTooltip(point.label, { direction: 'top', offset: [0, -10], opacity: 0.85 });
          marker.addTo(state.transportLayer);
        });

        state.trafficLayer.clearLayers();
        if (filters && filters.traffic) {
          (trafficSegments || []).forEach((segment) => {
            L.polyline(segment.map(toLatLngTuple), {
              color: 'rgba(239, 68, 68, 0.85)',
              weight: 4,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(state.trafficLayer);
          });
        }

        state.hikingLayer.clearLayers();
        if (filters && filters.hiking) {
          (hikingTrails || []).forEach((segment) => {
            L.polyline(segment.map(toLatLngTuple), {
              color: 'rgba(34,197,94,0.85)',
              weight: 4,
              dashArray: '4 4',
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(state.hikingLayer);
          });
        }

        state.routeLayer.clearLayers();
        if (routeCoordinates && Array.isArray(routeCoordinates) && routeCoordinates.length > 0) {
          L.polyline(routeCoordinates.map(toLatLngTuple), {
            color: '#1e3a8a',
            weight: 5,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(state.routeLayer);
        }

        if (state.userLocationCircle) {
          map.removeLayer(state.userLocationCircle);
          state.userLocationCircle = null;
        }
        if (state.userLocationPoint) {
          map.removeLayer(state.userLocationPoint);
          state.userLocationPoint = null;
        }

        if (userLocation) {
          state.userLocationCircle = L.circle([userLocation.latitude, userLocation.longitude], {
            radius: userLocation.radius || 0,
            color: 'rgba(30,58,138,0.4)',
            fillColor: 'rgba(99,102,241,0.18)',
            fillOpacity: 0.6,
            weight: 1,
          }).addTo(map);
          state.userLocationPoint = L.circleMarker([userLocation.latitude, userLocation.longitude], {
            radius: 6,
            color: '#ffffff',
            weight: 2,
            fillColor: '#1e3a8a',
            fillOpacity: 1,
          }).addTo(map);
        }

        setNightOverlay(Boolean(filters && filters.night));
      }

      function setMapType(type) {
        if (type !== 'satellite' && type !== 'standard') {
          return;
        }
        if (state.activeLayerType === type) {
          return;
        }
        applyBaseLayer(type);
      }

      function animateCamera(payload) {
        if (!payload || !payload.center) {
          return;
        }
        const zoom = typeof payload.zoom === 'number' ? payload.zoom : map.getZoom();
        const durationMs = typeof payload.duration === 'number' ? payload.duration : 650;
        const durationSeconds = Math.max(durationMs / 1000, 0.1);
        map.flyTo([payload.center.latitude, payload.center.longitude], zoom, {
          animate: true,
          duration: durationSeconds,
          easeLinearity: 0.25,
        });
      }

      function fitToCoordinates(payload) {
        if (!payload || !Array.isArray(payload.coordinates) || payload.coordinates.length === 0) {
          return;
        }
        const bounds = L.latLngBounds(payload.coordinates.map(toLatLngTuple));
        const padding = payload.edgePadding || {};
        const options = {
          animate: payload.animated !== false,
          paddingTopLeft: L.point(padding.left || 0, padding.top || 0),
          paddingBottomRight: L.point(padding.right || 0, padding.bottom || 0),
        };
        map.fitBounds(bounds, options);
      }

      function handleMessage(event) {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!data || !data.type) {
          return;
        }
        const { type, payload } = data;
        switch (type) {
          case 'updateData':
            updateData(payload);
            break;
          case 'animateCamera':
            animateCamera(payload);
            break;
          case 'fitToCoordinates':
            fitToCoordinates(payload);
            break;
          case '${NIGHT_OVERLAY_EVENT}':
            setNightOverlay(Boolean(payload.enabled));
            break;
          case 'setMapType':
            setMapType(payload && payload.type);
            break;
          default:
            break;
        }
      }

      setTimeout(() => {
        map.invalidateSize();
        sendMessage('ready', null);
      }, 0);

      map.on('click', (event) => {
        if (!event || !event.latlng) {
          return;
        }
        sendMessage('mapPress', {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      });

      document.addEventListener('message', handleMessage);
      window.addEventListener('message', handleMessage);
    </script>
  </body>
</html>`;
}

const LeafletMapView = forwardRef(
  (
    {
      style,
      initialCenter,
      selectedPlace,
      conversations,
      transportPoints,
      trafficSegments,
      hikingTrails,
      routeCoordinates,
      userLocation,
      filters,
      onMapPress,
      onConversationPress,
      mapType = "standard",
    }: LeafletMapViewProps,
    ref: ForwardedRef<LeafletMapHandle>
  ) => {
    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);
    const pendingMessagesRef = useRef<string[]>([]);
    const html = useMemo(() => createLeafletHtml(initialCenter), [initialCenter]);

    const postMessage = useCallback((message: LeafletMessage) => {
      const serialized = JSON.stringify(message);
      if (isReadyRef.current) {
        webViewRef.current?.postMessage(serialized);
      } else {
        pendingMessagesRef.current.push(serialized);
      }
    }, []);

    const flushPendingMessages = useCallback(() => {
      if (!isReadyRef.current) {
        return;
      }
      const buffer = pendingMessagesRef.current;
      pendingMessagesRef.current = [];
      buffer.forEach((message) => {
        webViewRef.current?.postMessage(message);
      });
    }, []);

    const mapDataPayload = useMemo<LeafletMapDataPayload>(
      () => ({
        selectedPlace,
        conversations,
        transportPoints,
        trafficSegments,
        hikingTrails,
        routeCoordinates,
        userLocation,
        filters,
      }),
      [
        conversations,
        filters,
        hikingTrails,
        routeCoordinates,
        selectedPlace,
        trafficSegments,
        transportPoints,
        userLocation,
      ]
    );

    const sendDataUpdate = useCallback(() => {
      postMessage({ type: "updateData", payload: mapDataPayload });
    }, [mapDataPayload, postMessage]);

    useEffect(() => {
      sendDataUpdate();
    }, [sendDataUpdate]);

    useEffect(() => {
      postMessage({ type: "setMapType", payload: { type: mapType } });
    }, [mapType, postMessage]);

    useImperativeHandle(
      ref,
      () => ({
        animateCamera: (options, config) => {
          postMessage({
            type: "animateCamera",
            payload: {
              center: options.center,
              zoom: options.zoom,
              duration: config?.duration,
            },
          });
        },
        fitToCoordinates: (coordinates, options) => {
          postMessage({
            type: "fitToCoordinates",
            payload: {
              coordinates,
              edgePadding: options?.edgePadding,
              animated: options?.animated,
            },
          });
        },
      }),
      [postMessage]
    );

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        let data: LeafletMessage | null = null;
        try {
          data = JSON.parse(event.nativeEvent.data ?? "null") as LeafletMessage | null;
        } catch {
          return;
        }

        if (!data || !data.type) {
          return;
        }

        switch (data.type) {
          case "ready":
            isReadyRef.current = true;
            flushPendingMessages();
            sendDataUpdate();
            break;
          case "mapPress":
            if (data.payload && typeof onMapPress === "function") {
              const payload = data.payload as { latitude?: number; longitude?: number };
              if (
                typeof payload.latitude === "number" &&
                typeof payload.longitude === "number"
              ) {
                onMapPress({ latitude: payload.latitude, longitude: payload.longitude });
              }
            }
            break;
          case "conversationPress":
            if (data.payload && typeof onConversationPress === "function") {
              const payload = data.payload as { id?: string };
              if (payload.id) {
                onConversationPress(payload.id);
              }
            }
            break;
          default:
            break;
        }
      },
      [flushPendingMessages, onConversationPress, onMapPress, sendDataUpdate]
    );

    return (
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        style={style}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        automaticallyAdjustContentInsets={false}
        scrollEnabled={false}
      />
    );
  }
);

LeafletMapView.displayName = "LeafletMapView";

export default LeafletMapView;
