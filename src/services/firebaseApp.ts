import Constants from "expo-constants";
import {
  FirebaseApp,
  FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

function resolveFirebaseConfig(): FirebaseOptions | null {
  const expoConfig = Constants.expoConfig ?? (Constants.manifest as any);
  const extra = expoConfig?.extra as Record<string, unknown> | undefined;
  const config = extra?.firebase as FirebaseOptions | undefined;
  if (config) {
    return config;
  }
  if (getApps().length > 0) {
    return null;
  }
  console.warn(
    "Firebase configuration is missing. Provide expoConfig.extra.firebase to enable Firestore features."
  );
  return null;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (getApps().length > 0) {
    firebaseApp = getApp();
    return firebaseApp;
  }

  const config = resolveFirebaseConfig();
  if (!config) {
    return null;
  }

  firebaseApp = initializeApp(config);
  return firebaseApp;
}

export function getFirestoreClient(): Firestore | null {
  if (firestore) {
    return firestore;
  }
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  firestore = getFirestore(app);
  return firestore;
}

export function getAuthClient(): Auth | null {
  if (auth) {
    return auth;
  }
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  auth = getAuth(app);
  return auth;
}

