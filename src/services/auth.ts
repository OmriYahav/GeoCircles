import { FirebaseError } from "firebase/app";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getAuthClient } from "./firebaseApp";

export type AuthStateChangeCallback = (user: User | null) => void;

function mapFirebaseError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    return new Error(error.message);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error("Unexpected authentication error");
}

export function observeAuthState(callback: AuthStateChangeCallback): () => void {
  const auth = getAuthClient();
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback, (error) => {
    console.warn("Auth state listener failed", error);
    callback(null);
  });
}

// Ensures a Firebase user exists for the current session. Falls back to
// anonymous authentication so existing functionality keeps working without
// forcing a sign-in flow.
export async function ensureUser(): Promise<User | null> {
  const auth = getAuthClient();
  if (!auth) {
    return null;
  }
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const credential = await signInAnonymously(auth);
    return credential.user ?? null;
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function emailPasswordSignIn(
  email: string,
  password: string
): Promise<User> {
  const auth = getAuthClient();
  if (!auth) {
    throw new Error("Authentication service is not configured");
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function emailPasswordSignUp(
  email: string,
  password: string
): Promise<User> {
  const auth = getAuthClient();
  if (!auth) {
    throw new Error("Authentication service is not configured");
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw mapFirebaseError(error);
  }
}

export async function signOutUser(): Promise<void> {
  const auth = getAuthClient();
  if (!auth) {
    return;
  }
  try {
    await signOut(auth);
  } catch (error) {
    throw mapFirebaseError(error);
  }
}
