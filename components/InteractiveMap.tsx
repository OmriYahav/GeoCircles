import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleProp, ViewStyle } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type InteractiveMapMessage =
  | { type: "ready" }
  | {
      type: "updateLocation";
      coords: Coordinates;
      animate?: boolean;
    }
  | { type: "clearMarker" };

type InteractiveMapProps = {
  initialCoordinates: Coordinates;
  initialZoom: number;
  marker?: Coordinates | null;
  maxZoom: number;
  tileUrlTemplate: string;
  style?: StyleProp<ViewStyle>;
  onReady?: () => void;
  onError?: () => void;
};

export type InteractiveMapHandle = {
  focusOn: (coords: Coordinates) => void;
};

function createHtmlTemplate({
  initialCoordinates,
  initialZoom,
  tileUrlTemplate,
  maxZoom,
}: Pick<
  InteractiveMapProps,
  "initialCoordinates" | "initialZoom" | "tileUrlTemplate" | "maxZoom"
>) {
  const tileUrl = tileUrlTemplate.replace(/\\/g, "\\");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      crossorigin=""
    />
    <style>
      html,
      body,
      #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: transparent;
      }
      .leaflet-pane,
      .leaflet-top,
      .leaflet-bottom {
        z-index: 1;
      }
    </style>
  </head>
  <body>
    <div id="map" role="img" aria-label="Interactive map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      crossorigin=""
    ></script>
    <script>
      function postReadyMessage(attempt = 0) {
        const MAX_ATTEMPTS = 60;

        if (
          window.ReactNativeWebView &&
          typeof window.ReactNativeWebView.postMessage === 'function'
        ) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'ready' })
          );
          return;
        }

        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => postReadyMessage(attempt + 1), 100);
        }
      }

      const initialCenter = [${initialCoordinates.latitude}, ${initialCoordinates.longitude}];
      const initialZoom = ${initialZoom};
      const maxZoom = ${maxZoom};
      const tileUrlTemplate = ${JSON.stringify(tileUrl)};

      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        closePopupOnClick: false,
      }).setView(initialCenter, initialZoom);

      L.tileLayer(tileUrlTemplate, {
        maxZoom,
        tileSize: 256,
        updateWhenIdle: true,
        updateWhenZooming: false,
      }).addTo(map);

      map.whenReady(() => postReadyMessage());

      let marker = null;

      function focusOn(coords, animate) {
        if (!coords) {
          return;
        }

        const { latitude, longitude } = coords;
        const latLng = [latitude, longitude];

        if (!marker) {
          marker = L.marker(latLng, {
            keyboard: true,
            title: 'Your location',
          }).addTo(map);
        } else {
          marker.setLatLng(latLng);
        }

        if (animate) {
          map.flyTo(latLng, Math.max(map.getZoom(), 15), {
            animate: true,
            duration: 0.7,
          });
        } else {
          map.setView(latLng, Math.max(map.getZoom(), 15), { animate: false });
        }
      }

      function handleMessage(data) {
        if (!data || typeof data.type !== 'string') {
          return;
        }

        if (data.type === 'updateLocation' && data.coords) {
          focusOn(data.coords, data.animate !== false);
          return;
        }

        if (data.type === 'clearMarker') {
          if (marker) {
            map.removeLayer(marker);
            marker = null;
          }
          map.setView(initialCenter, initialZoom, { animate: false });
        }
      }

      function parseEvent(event) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          handleMessage(data);
        } catch (error) {
          console.warn('Failed to parse message from React Native', error);
        }
      }

      document.addEventListener('message', parseEvent);
      window.addEventListener('message', parseEvent);

      if (document.readyState === 'complete') {
        postReadyMessage();
      } else {
        window.addEventListener('load', () => postReadyMessage());
      }
    </script>
  </body>
</html>`;
}

const InteractiveMap = forwardRef<InteractiveMapHandle, InteractiveMapProps>(
  (
    {
      initialCoordinates,
      initialZoom,
      marker,
      maxZoom,
      tileUrlTemplate,
      style,
      onReady,
      onError,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);
    const hasNotifiedReadyRef = useRef(false);
    const pendingMarkerRef = useRef<Coordinates | null>(marker ?? null);

    const defaultCoordinatesRef = useRef(initialCoordinates);
    const defaultZoomRef = useRef(initialZoom);

    const html = useMemo(
      () =>
        createHtmlTemplate({
          initialCoordinates: defaultCoordinatesRef.current,
          initialZoom: defaultZoomRef.current,
          maxZoom,
          tileUrlTemplate,
        }),
      [maxZoom, tileUrlTemplate]
    );

    const postMessage = useCallback(
      (message: InteractiveMapMessage) => {
        const payload = JSON.stringify(message);
        // WebView on Android expects postMessage on the ref; on iOS, evaluateJavaScript is used internally.
        webViewRef.current?.postMessage(payload);
      },
      []
    );

    const focusOn = useCallback(
      (coords: Coordinates, animate = true) => {
        pendingMarkerRef.current = coords;

        if (!isReadyRef.current) {
          return;
        }

        postMessage({ type: "updateLocation", coords, animate });
      },
      [postMessage]
    );

    const flushPendingMarker = useCallback(() => {
      if (!pendingMarkerRef.current) {
        return;
      }

      postMessage({
        type: "updateLocation",
        coords: pendingMarkerRef.current,
        animate: false,
      });
    }, [postMessage]);

    const notifyReady = useCallback(() => {
      if (hasNotifiedReadyRef.current) {
        return;
      }

      hasNotifiedReadyRef.current = true;
      onReady?.();
    }, [onReady]);

    useImperativeHandle(
      ref,
      () => ({
        focusOn(coords: Coordinates) {
          focusOn(coords);
        },
      }),
      [focusOn]
    );

    useEffect(() => {
      if (!marker) {
        pendingMarkerRef.current = null;
        if (isReadyRef.current) {
          postMessage({ type: "clearMarker" });
        }
        return;
      }

      focusOn(marker, false);
    }, [focusOn, marker, postMessage]);

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data) as InteractiveMapMessage;
          if (data.type === "ready") {
            isReadyRef.current = true;

            if (pendingMarkerRef.current) {
              flushPendingMarker();
            }

            notifyReady();
          }
        } catch (error) {
          console.warn("Failed to handle message from map", error);
        }
      },
      [flushPendingMarker, notifyReady]
    );

    const handleLoadEnd = useCallback(() => {
      if (isReadyRef.current) {
        notifyReady();
        return;
      }

      isReadyRef.current = true;

      requestAnimationFrame(() => {
        flushPendingMarker();
        notifyReady();
      });
    }, [flushPendingMarker, notifyReady]);

    const handleError = useCallback(() => {
      onError?.();
    }, [onError]);

    return (
      <WebView
        ref={webViewRef}
        injectedJavaScriptBeforeContentLoaded={"true;"}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        onError={handleError}
        onHttpError={handleError}
        originWhitelist={["*"]}
        scrollEnabled={false}
        source={{ html }}
        style={style}
        javaScriptEnabled
        domStorageEnabled
        automaticallyAdjustContentInsets={false}
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        testID="interactive-map"
      />
    );
  }
);

InteractiveMap.displayName = "InteractiveMap";

export default InteractiveMap;
