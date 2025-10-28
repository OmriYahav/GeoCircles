import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Platform, StyleProp, ViewStyle } from "react-native";
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

type ExpoGoMapViewProps = {
  style?: StyleProp<ViewStyle>;
  initialRegion: { latitude: number; longitude: number; latitudeDelta: number };
  activeLayer: { id: string; urlTemplate: string; maximumZ?: number };
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

const BASE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha512-mmcwqYEFbM0ek7nL3e0g6wrezsKVsG7e6Qvcps225y7sY9qsK0kGugHgdGXcw53BJ38qRAjPR9UCeFgrrJQ0iw=="
      crossorigin=""
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
        background-color: #f8fafc;
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
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha512-v3Z8+Kztr9n6obrN1Nsx3Rp3XIanFkFJxuxMxkvZWS9Vyuk3F7S3Uz7DnkLelxUYfL3UX0rDhm0Ve5m9aItC4Q=="
      crossorigin=""
    ></script>
    <script>
      const INITIAL_LATITUDE = __INITIAL_LAT__;
      const INITIAL_LONGITUDE = __INITIAL_LNG__;
      const INITIAL_ZOOM = __INITIAL_ZOOM__;

      const map = L.map("map", { zoomControl: false }).setView(
        [INITIAL_LATITUDE, INITIAL_LONGITUDE],
        INITIAL_ZOOM
      );

      let tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const overlays = {
        selectedPlace: null,
        conversationMarkers: {},
        traffic: [],
        hiking: [],
        transport: [],
        userMarker: null,
        userCircle: null,
        route: null,
      };

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

      function removeLayer(layer) {
        if (layer) {
          map.removeLayer(layer);
        }
      }

      function resetCollection(collection) {
        collection.forEach(removeLayer);
        return [];
      }

      function applyData(data) {
        if (data.tileLayer) {
          removeLayer(tileLayer);
          tileLayer = L.tileLayer(data.tileLayer.urlTemplate, {
            maxZoom: data.tileLayer.maximumZ || 19,
          }).addTo(map);
        }

        if (overlays.selectedPlace) {
          map.removeLayer(overlays.selectedPlace);
          overlays.selectedPlace = null;
        }
        if (data.selectedPlace) {
          const marker = L.marker([
            data.selectedPlace.latitude,
            data.selectedPlace.longitude,
          ]);
          marker.bindPopup(
            '<div class="popup"><div class="popup-title">' +
              escapeHtml(data.selectedPlace.displayName) +
              "</div></div>",
            { closeButton: false }
          );
          overlays.selectedPlace = marker.addTo(map);
        }

        Object.values(overlays.conversationMarkers).forEach(removeLayer);
        overlays.conversationMarkers = {};
        (data.conversations || []).forEach(function (conversation) {
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

          const marker = L.circleMarker(
            [conversation.latitude, conversation.longitude],
            {
              radius: 8,
              color: conversation.pinColor || "#9333ea",
              weight: 2,
              fillColor: conversation.pinColor || "#9333ea",
              fillOpacity: 0.9,
            }
          );

          marker.bindPopup(popupHtml, { closeButton: false });
          marker.on("click", function (event) {
            if (event?.originalEvent?.stopPropagation) {
              event.originalEvent.stopPropagation();
            }
            marker.openPopup();
            window.ReactNativeWebView?.postMessage(
              JSON.stringify({ type: "conversation", id: conversation.id })
            );
          });

          overlays.conversationMarkers[conversation.id] = marker.addTo(map);
        });

        overlays.traffic = resetCollection(overlays.traffic);
        (data.trafficSegments || []).forEach(function (segment) {
          const polyline = L.polyline(
            segment.map(function (point) {
              return [point.latitude, point.longitude];
            }),
            {
              color: "rgba(239, 68, 68, 0.85)",
              weight: 4,
            }
          ).addTo(map);
          overlays.traffic.push(polyline);
        });

        overlays.hiking = resetCollection(overlays.hiking);
        (data.hikingTrails || []).forEach(function (segment) {
          const polyline = L.polyline(
            segment.map(function (point) {
              return [point.latitude, point.longitude];
            }),
            {
              color: "rgba(34,197,94,0.85)",
              weight: 4,
              dashArray: "6,6",
            }
          ).addTo(map);
          overlays.hiking.push(polyline);
        });

        overlays.transport = resetCollection(overlays.transport);
        (data.transportPoints || []).forEach(function (point) {
          const marker = L.circleMarker([point.latitude, point.longitude], {
            radius: 6,
            color: "#6366f1",
            weight: 2,
            fillColor: "#6366f1",
            fillOpacity: 0.9,
          }).addTo(map);

          marker.bindPopup(
            '<div class="popup"><div class="popup-title">' +
              escapeHtml(point.label) +
              "</div></div>",
            { closeButton: false }
          );

          overlays.transport.push(marker);
        });

        if (overlays.userMarker) {
          map.removeLayer(overlays.userMarker);
          overlays.userMarker = null;
        }
        if (overlays.userCircle) {
          map.removeLayer(overlays.userCircle);
          overlays.userCircle = null;
        }
        if (data.userLocation) {
          overlays.userMarker = L.circleMarker(
            [data.userLocation.latitude, data.userLocation.longitude],
            {
              radius: 7,
              color: "#1d4ed8",
              weight: 2,
              fillColor: "#1d4ed8",
              fillOpacity: 0.9,
            }
          ).addTo(map);

          overlays.userCircle = L.circle(
            [data.userLocation.latitude, data.userLocation.longitude],
            {
              radius: 120,
              color: "rgba(37,99,235,0.35)",
              fillColor: "rgba(59,130,246,0.15)",
              weight: 1,
            }
          ).addTo(map);
        }

        if (overlays.route) {
          map.removeLayer(overlays.route);
          overlays.route = null;
        }
        if (data.routeCoordinates && data.routeCoordinates.length > 0) {
          overlays.route = L.polyline(
            data.routeCoordinates.map(function (point) {
              return [point.latitude, point.longitude];
            }),
            {
              color: "#2563eb",
              weight: 5,
            }
          ).addTo(map);
        }
      }

      const pendingMessages = [];
      let isReady = false;

      function handleData(message) {
        if (message.type === "updateData") {
          applyData(message.payload || {});
        } else if (message.type === "animateCamera") {
          const { center, zoom, duration } = message.payload || {};
          if (center) {
            map.flyTo(
              [center.latitude, center.longitude],
              typeof zoom === "number" ? zoom : map.getZoom(),
              { duration: duration ? duration / 1000 : 0.65 }
            );
          }
        } else if (message.type === "fitToCoordinates") {
          const coords = message.payload?.coordinates || [];
          if (coords.length > 0) {
            const bounds = L.latLngBounds(
              coords.map(function (point) {
                return [point.latitude, point.longitude];
              })
            );
            const padding = message.payload?.padding ?? 60;
            map.fitBounds(bounds, { padding: [padding, padding] });
          }
        }
      }

      function handleMessage(event) {
        let data;
        try {
          data = JSON.parse(event.data || event);
        } catch (error) {
          return;
        }

        if (!isReady) {
          pendingMessages.push(data);
          return;
        }
        handleData(data);
      }

      document.addEventListener("message", function (event) {
        handleMessage(event.data);
      });
      window.addEventListener("message", function (event) {
        handleMessage(event.data);
      });

      map.on("click", function (event) {
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: "press",
            coordinate: {
              latitude: event.latlng.lat,
              longitude: event.latlng.lng,
            },
          })
        );
      });

      function flushQueue() {
        while (pendingMessages.length > 0) {
          handleData(pendingMessages.shift());
        }
      }

      setTimeout(function () {
        isReady = true;
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({ type: "ready" })
        );
        flushQueue();
      }, 0);
    </script>
  </body>
</html>`;

function regionToZoom(latitudeDelta: number) {
  if (!latitudeDelta) {
    return 12;
  }
  const zoom = Math.log2(360 / latitudeDelta);
  return Math.max(2, Math.min(18, Math.round(zoom)));
}

function serializeHtml(html: string, region: ExpoGoMapViewProps["initialRegion"]) {
  const zoom = regionToZoom(region.latitudeDelta);
  return html
    .replace(/__INITIAL_LAT__/g, String(region.latitude))
    .replace(/__INITIAL_LNG__/g, String(region.longitude))
    .replace(/__INITIAL_ZOOM__/g, String(zoom));
}

function createMapPayload(props: ExpoGoMapViewProps) {
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
    tileLayer: {
      id: activeLayer.id,
      urlTemplate: activeLayer.urlTemplate,
      maximumZ: activeLayer.maximumZ,
    },
    selectedPlace,
    conversations,
    trafficSegments: filters.traffic ? trafficSegments : [],
    hikingTrails: filters.hiking ? hikingTrails : [],
    transportPoints: filters.transport ? transportPoints : [],
    userLocation,
    routeCoordinates: routeCoordinates ?? [],
  };
}

const ExpoGoMapView = forwardRef<ExpoGoMapHandle, ExpoGoMapViewProps>(
  (props, ref) => {
    const { initialRegion, onConversationPress, onMapPress } = props;

    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);
    const pendingMessagesRef = useRef<object[]>([]);

    const html = useMemo(() => serializeHtml(BASE_HTML, initialRegion), [initialRegion]);

    const mapPayload = useMemo(() => createMapPayload(props), [props]);

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
  }
);

ExpoGoMapView.displayName = "ExpoGoMapView";

export default ExpoGoMapView;
