import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";

export type UserLocationState = {
  coords: Location.LocationObjectCoords | null;
  heading: number | null;
  timestamp: number | null;
};

export type UseUserLocationResult = {
  isLoading: boolean;
  error: string | null;
  location: UserLocationState;
  permissionStatus: Location.PermissionStatus | null;
  canAskAgain: boolean;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<void>;
};

const LOCATION_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.Balanced,
  maximumAge: 2_000,
  timeInterval: 2_000,
};

export default function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocationState>({
    coords: null,
    heading: null,
    timestamp: null,
  });
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canAskAgainRef = useRef(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateLocation = useCallback((value: Location.LocationObject) => {
    setLocation({
      coords: value.coords,
      heading: value?.coords.heading ?? null,
      timestamp: value.timestamp ?? Date.now(),
    });
  }, []);

  const loadCurrentPosition = useCallback(async () => {
    try {
      const current = await Location.getCurrentPositionAsync(LOCATION_OPTIONS);
      if (!isMountedRef.current) {
        return;
      }
      setError(null);
      updateLocation(current);
    } catch (err) {
      console.error("Failed to read current position", err);
      if (!isMountedRef.current) {
        return;
      }
      setError(
        "We couldn't determine your position. Check your GPS settings and try again."
      );
    }
  }, [updateLocation]);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      let statusResult = await Location.getForegroundPermissionsAsync();
      if (!isMountedRef.current) {
        return;
      }

      if (statusResult.status !== Location.PermissionStatus.GRANTED) {
        if (statusResult.canAskAgain) {
          statusResult = await Location.requestForegroundPermissionsAsync();
        }
      }

      if (!isMountedRef.current) {
        return;
      }

      setPermissionStatus(statusResult.status);
      canAskAgainRef.current = statusResult.canAskAgain;

      if (statusResult.status !== Location.PermissionStatus.GRANTED) {
        setLocation({ coords: null, heading: null, timestamp: null });
        setError(
          statusResult.canAskAgain
            ? "Location access is required to show your position on the map."
            : "Location permissions are disabled. Enable them in Settings to continue."
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!isMountedRef.current) {
        return;
      }

      if (!servicesEnabled) {
        setLocation({ coords: null, heading: null, timestamp: null });
        setError("Location services appear to be off. Enable them and try again.");
        return;
      }

      await loadCurrentPosition();
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [loadCurrentPosition]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusResult = await Location.getForegroundPermissionsAsync();
      if (!isMountedRef.current) {
        return;
      }

      setPermissionStatus(statusResult.status);
      canAskAgainRef.current = statusResult.canAskAgain;

      if (statusResult.status !== Location.PermissionStatus.GRANTED) {
        setError(
          statusResult.canAskAgain
            ? "Location access is required to show your position on the map."
            : "Location permissions are disabled. Enable them in Settings to continue."
        );
        setLocation({ coords: null, heading: null, timestamp: null });
        return;
      }

      await loadCurrentPosition();
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [loadCurrentPosition]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const result = useMemo<UseUserLocationResult>(
    () => ({
      isLoading,
      error,
      location,
      permissionStatus,
      canAskAgain: canAskAgainRef.current,
      refresh,
      requestPermission,
    }),
    [error, isLoading, location, permissionStatus, refresh, requestPermission]
  );

  return result;
}
