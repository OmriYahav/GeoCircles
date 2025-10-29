import { useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import Constants from "expo-constants";
import { onSnapshot, collection, doc, getDoc } from "firebase/firestore";

import { useBusinessContext, Business } from "../src/context/BusinessContext";
import { useUserProfile } from "../src/context/UserProfileContext";
import { getFirestoreClient } from "../src/services/firebaseApp";
import {
  markBusinessOfferDisplayed,
  markBusinessVisitLogged,
  recordBusinessVisit,
  shouldDisplayBusinessOffer,
  shouldLogBusinessVisit,
} from "../src/services/businessTelemetry";
import { calculateDistanceMeters, parseBusinessDocument } from "../src/utils/business";
import { navigationRef } from "../src/navigation/AppNavigator";

const BUSINESS_GEOFENCE_TASK = "BUSINESS_GEOFENCE";
const LOCATION_UPDATE_INTERVAL = 60_000;
const LOCATION_DISTANCE_INTERVAL = 100;
const CURRENT_USER_ID_KEY = "@openspot:current-user-id";

const businessRegistry = new Map<string, Business>();
let geofenceTaskRegistered = false;
const appOwnership = Constants.appOwnership ?? "standalone";
const isExpoGo = appOwnership === "expo";
const supportsBusinessProximity = !isExpoGo;

type GeofenceEventData = {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
};

function getBusinessFromRegistry(id: string): Business | undefined {
  return businessRegistry.get(id);
}

async function fetchBusinessById(id: string): Promise<Business | null> {
  const firestore = getFirestoreClient();
  if (!firestore) {
    return null;
  }
  try {
    const snapshot = await getDoc(doc(firestore, "businesses", id));
    if (!snapshot.exists()) {
      return null;
    }
    const parsed = parseBusinessDocument(id, snapshot.data());
    if (parsed) {
      businessRegistry.set(parsed.id, parsed);
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to fetch business", error);
    return null;
  }
}

async function getStoredUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
  } catch (error) {
    console.warn("Failed to read stored user id", error);
    return null;
  }
}

async function triggerBusinessNotification(business: Business) {
  if (!supportsBusinessProximity) {
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 Special offer at ${business.name}`,
        body: business.offerText,
        data: { businessId: business.id },
        sound: "default",
        attachments: business.logoUrl
          ? [{ url: business.logoUrl, identifier: `${business.id}-logo` }]
          : undefined,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Failed to schedule business notification", error);
  }
}

async function processBusinessEntry({
  business,
  userId,
  distance,
  location,
}: {
  business: Business;
  userId?: string | null;
  distance?: number;
  location?: { latitude: number; longitude: number } | null;
}) {
  const now = Date.now();
  if (await shouldDisplayBusinessOffer(business.id, now)) {
    await triggerBusinessNotification(business);
    await markBusinessOfferDisplayed(business.id, now);
  }

  if (!userId) {
    userId = await getStoredUserId();
  }

  if (userId && (await shouldLogBusinessVisit(business.id, now))) {
    await recordBusinessVisit({
      businessId: business.id,
      userId,
      distance: distance ?? business.radius,
      location,
    });
    await markBusinessVisitLogged(business.id, now);
  }
}

async function ensureGeofenceTaskRegistered() {
  if (!supportsBusinessProximity) {
    return;
  }
  if (geofenceTaskRegistered) {
    return;
  }

  TaskManager.defineTask(
    BUSINESS_GEOFENCE_TASK,
    async ({ data, error }: { data?: GeofenceEventData; error?: Error | null }) => {
      if (error) {
        console.warn("Business geofence task error", error);
        return;
      }

      if (!data || data.eventType !== Location.GeofencingEventType.Enter) {
        return;
      }

      const businessId = data.region?.identifier;
      if (!businessId) {
        return;
      }

      const business =
        getBusinessFromRegistry(businessId) ?? (await fetchBusinessById(businessId));
      if (!business) {
        return;
      }

      let coords: { latitude: number; longitude: number } | null = null;
      try {
        const latest = await Location.getLastKnownPositionAsync();
        if (latest?.coords) {
          coords = {
            latitude: latest.coords.latitude,
            longitude: latest.coords.longitude,
          };
        }
      } catch (positionError) {
        console.warn("Failed to get last known position", positionError);
      }

      const distance = coords
        ? calculateDistanceMeters(
            coords.latitude,
            coords.longitude,
            business.latitude,
            business.longitude
          )
        : business.radius;

      await processBusinessEntry({
        business,
        userId: await getStoredUserId(),
        distance,
        location: coords,
      });
    }
  );

  geofenceTaskRegistered = true;
}

async function syncGeofences(businesses: Business[]) {
  if (!supportsBusinessProximity) {
    return;
  }
  await ensureGeofenceTaskRegistered();
  const regions = businesses.map((business) => ({
    identifier: business.id,
    latitude: business.latitude,
    longitude: business.longitude,
    radius: Math.max(25, business.radius),
    notifyOnEnter: true,
    notifyOnExit: false,
  }));

  try {
    const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(
      BUSINESS_GEOFENCE_TASK
    );
    if (alreadyRegistered) {
      await Location.stopGeofencingAsync(BUSINESS_GEOFENCE_TASK);
    }
    if (regions.length > 0) {
      await Location.startGeofencingAsync(BUSINESS_GEOFENCE_TASK, regions);
    }
  } catch (error) {
    console.warn("Failed to sync business geofences", error);
  }
}

function handleNotificationResponses() {
  if (!supportsBusinessProximity) {
    return;
  }
  Notifications.addNotificationResponseReceivedListener((response) => {
    const businessId = response.notification.request.content.data?.businessId;
    if (typeof businessId === "string" && businessId.length > 0) {
      const navigateToOffer = () =>
        navigationRef.navigate("Search" as never, {
          screen: "BusinessOffer",
          params: { businessId },
        } as never);

      if (navigationRef.isReady()) {
        navigateToOffer();
      } else {
        const unsubscribe = navigationRef.addListener("state", () => {
          if (navigationRef.isReady()) {
            navigateToOffer();
            unsubscribe();
          }
        });
      }
    }
  });
}

let notificationResponseHandlerRegistered = false;

const BusinessProximityManager = () => {
  const { setNearbyBusiness } = useBusinessContext();
  const { profile } = useUserProfile();
  const activeBusinessIdRef = useRef<string | null>(null);
  const businessesRef = useRef<Business[]>([]);
  const geofenceSyncRef = useRef<string[]>([]);

  useEffect(() => {
    if (!supportsBusinessProximity) {
      if (__DEV__) {
        console.info(
          "Business proximity alerts are disabled in Expo Go. Build a development client to enable background geofencing."
        );
      }
      return;
    }
    AsyncStorage.setItem(CURRENT_USER_ID_KEY, profile.id).catch((error) => {
      console.warn("Failed to persist current user id", error);
    });
  }, [profile.id]);

  useEffect(() => {
    if (!supportsBusinessProximity) {
      return;
    }
    (async () => {
      await Notifications.requestPermissionsAsync();
      if (!notificationResponseHandlerRegistered) {
        handleNotificationResponses();
        notificationResponseHandlerRegistered = true;
      }
    })();
  }, []);

  const handleLocationUpdate = useCallback(
    async (location: Location.LocationObject) => {
      const coords = location.coords;
      if (!coords) {
        return;
      }
      let closest: { business: Business; distance: number } | null = null;
      businessesRef.current.forEach((business) => {
        const distance = calculateDistanceMeters(
          coords.latitude,
          coords.longitude,
          business.latitude,
          business.longitude
        );
        if (distance <= business.radius) {
          if (!closest || distance < closest.distance) {
            closest = { business, distance };
          }
        }
      });

      if (closest) {
        setNearbyBusiness(closest.business);
        if (activeBusinessIdRef.current !== closest.business.id) {
          activeBusinessIdRef.current = closest.business.id;
          await processBusinessEntry({
            business: closest.business,
            userId: profile.id,
            distance: closest.distance,
            location: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          });
        }
      } else {
        if (activeBusinessIdRef.current) {
          activeBusinessIdRef.current = null;
        }
        setNearbyBusiness(null);
      }
    },
    [profile.id, setNearbyBusiness]
  );

  useEffect(() => {
    if (!supportsBusinessProximity) {
      return;
    }
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startWatching = async () => {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      let status = currentPermission.status;
      if (status !== Location.PermissionStatus.GRANTED) {
        const request = await Location.requestForegroundPermissionsAsync();
        status = request.status;
      }

      if (status !== Location.PermissionStatus.GRANTED) {
        console.warn("Location permission not granted for business offers");
        return;
      }

      await ensureGeofenceTaskRegistered();

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: LOCATION_DISTANCE_INTERVAL,
        },
        (locationUpdate) => {
          if (isMounted) {
            handleLocationUpdate(locationUpdate);
          }
        }
      );
    };

    startWatching();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [handleLocationUpdate]);

  useEffect(() => {
    if (!supportsBusinessProximity) {
      return () => undefined;
    }
    const firestore = getFirestoreClient();
    if (!firestore) {
      return () => undefined;
    }

    const unsubscribe = onSnapshot(collection(firestore, "businesses"), (snapshot) => {
      const nextBusinesses: Business[] = [];
      snapshot.forEach((docSnapshot) => {
        const parsed = parseBusinessDocument(docSnapshot.id, docSnapshot.data());
        if (parsed) {
          nextBusinesses.push(parsed);
          businessRegistry.set(parsed.id, parsed);
        }
      });
      businessesRef.current = nextBusinesses;

      const nextIds = nextBusinesses.map((item) => item.id).sort();
      if (JSON.stringify(nextIds) !== JSON.stringify(geofenceSyncRef.current)) {
        geofenceSyncRef.current = nextIds;
        syncGeofences(nextBusinesses).catch((error) => {
          console.warn("Failed to update business geofences", error);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default BusinessProximityManager;

