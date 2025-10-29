export const DEFAULT_COORDINATES = {
  latitude: 40.7128,
  longitude: -74.006,
  zoomLevel: 11,
};

export type GoogleMapStyleElement = {
  elementType?: string;
  featureType?: string;
  stylers: Array<{
    color?: string;
    visibility?: string;
    lightness?: number;
    weight?: number;
  }>;
};

export const GOOGLE_DARK_MAP_STYLE: GoogleMapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1d1d1d" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d2d2d" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d0d0d0" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    stylers: [{ color: "#0b3d5c" }],
  },
];
