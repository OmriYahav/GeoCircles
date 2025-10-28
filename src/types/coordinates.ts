export type LatLng = {
  latitude: number;
  longitude: number;
};

export type MapPressEvent = {
  nativeEvent: {
    coordinate: LatLng;
    position: { x: number; y: number };
    action?: string;
  };
};
