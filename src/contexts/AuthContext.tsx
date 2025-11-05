import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import type { AuthSessionResult } from "expo-auth-session";
import {
  GoogleAuthProvider,
  OAuthProvider,
  User,
  signInWithCredential,
} from "firebase/auth";

import {
  emailPasswordSignIn,
  emailPasswordSignUp,
  observeAuthState,
  signOutUser,
} from "../services/auth";
import { getAuthClient } from "../services/firebaseApp";

WebBrowser.maybeCompleteAuthSession();

type AuthProviderName = "email" | "google" | "apple";

type AuthenticatedUser = {
  id: string;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
};

type AuthSessionRecord = {
  provider: AuthProviderName;
  token: string | null;
  user: AuthenticatedUser;
};

type AuthContextValue = {
  user: AuthenticatedUser | null;
  token: string | null;
  provider: AuthProviderName | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticatingProvider: AuthProviderName | null;
  signInWithEmail: (email: string, password: string) => Promise<AuthenticatedUser | null>;
  createAccountWithEmail: (
    email: string,
    password: string
  ) => Promise<AuthenticatedUser | null>;
  signInWithGoogle: () => Promise<AuthenticatedUser | null>;
  signInWithApple: () => Promise<AuthenticatedUser | null>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = "@openspot:auth-session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

type GoogleAuthConfig = {
  clientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
  expoClientId?: string;
};

function resolveGoogleConfig(): GoogleAuthConfig | null {
  const expoConfig = Constants.expoConfig ?? (Constants.manifest as Record<string, unknown> | undefined);
  const extra = (expoConfig?.extra ?? {}) as Record<string, unknown>;
  const googleConfig = extra.googleAuth as GoogleAuthConfig | undefined;
  if (!googleConfig) {
    return null;
  }
  return googleConfig;
}

function mapFirebaseProviderId(providerId: string | null | undefined): AuthProviderName {
  if (!providerId) {
    return "email";
  }
  if (providerId.includes("google")) {
    return "google";
  }
  if (providerId.includes("apple")) {
    return "apple";
  }
  return "email";
}

function buildSessionFromFirebase(
  user: User,
  token: string | null,
  fallbackProvider: AuthProviderName
): AuthSessionRecord {
  const providerData = user.providerData[0];
  const provider = providerData
    ? mapFirebaseProviderId(providerData.providerId)
    : fallbackProvider;
  return {
    provider,
    token,
    user: {
      id: user.uid,
      name: user.displayName ?? providerData?.displayName ?? user.email ?? "Explorer",
      email: user.email ?? providerData?.email ?? null,
      photoUrl: user.photoURL ?? providerData?.photoURL ?? null,
    },
  };
}

async function persistSession(record: AuthSessionRecord | null) {
  try {
    if (!record) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.warn("Failed to persist auth session", error);
  }
}

async function fetchGoogleProfile(accessToken: string) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as {
      sub?: string;
      name?: string;
      given_name?: string;
      email?: string;
      picture?: string;
    };
  } catch (error) {
    console.warn("Failed to fetch Google profile", error);
    return null;
  }
}

function formatAppleName(fullName: AppleAuthentication.AppleAuthenticationFullName | null): string | null {
  if (!fullName) {
    return null;
  }
  const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return parts.join(" ");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSessionRecord | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [authenticatingProvider, setAuthenticatingProvider] =
    useState<AuthProviderName | null>(null);

  const googleConfig = useMemo(resolveGoogleConfig, []);
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    expoClientId: googleConfig?.expoClientId,
    clientId: googleConfig?.clientId,
    iosClientId: googleConfig?.iosClientId,
    androidClientId: googleConfig?.androidClientId,
    webClientId: googleConfig?.webClientId,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthSessionRecord;
          setSession(parsed);
        }
      } catch (error) {
        console.warn("Failed to restore auth session", error);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  useEffect(() => {
    return observeAuthState(async (firebaseUser) => {
      if (!firebaseUser || firebaseUser.isAnonymous) {
        return;
      }
      try {
        const token = await firebaseUser.getIdToken();
        const nextSession = buildSessionFromFirebase(
          firebaseUser,
          token,
          mapFirebaseProviderId(firebaseUser.providerData[0]?.providerId)
        );
        setSession(nextSession);
        await persistSession(nextSession);
      } catch (error) {
        console.warn("Failed to synchronize Firebase auth session", error);
      }
    });
  }, []);

  useEffect(() => {
    if (!googleResponse) {
      return;
    }
    if (googleResponse.type === "error") {
      console.warn("Google auth session error", googleResponse.error);
    }
  }, [googleResponse]);

  const updateSession = useCallback(async (nextSession: AuthSessionRecord | null) => {
    setSession(nextSession);
    await persistSession(nextSession);
  }, []);

  const handleEmailSignIn = useCallback<
    AuthContextValue["signInWithEmail"]
  >(async (email, password) => {
    setAuthenticatingProvider("email");
    try {
      const firebaseUser = await emailPasswordSignIn(email, password);
      const token = await firebaseUser.getIdToken();
      const nextSession = buildSessionFromFirebase(
        firebaseUser,
        token,
        "email"
      );
      await updateSession(nextSession);
      return nextSession.user;
    } catch (error) {
      throw error;
    } finally {
      setAuthenticatingProvider(null);
    }
  }, [updateSession]);

  const handleEmailSignUp = useCallback<
    AuthContextValue["createAccountWithEmail"]
  >(async (email, password) => {
    setAuthenticatingProvider("email");
    try {
      const firebaseUser = await emailPasswordSignUp(email, password);
      const token = await firebaseUser.getIdToken();
      const nextSession = buildSessionFromFirebase(
        firebaseUser,
        token,
        "email"
      );
      await updateSession(nextSession);
      return nextSession.user;
    } catch (error) {
      throw error;
    } finally {
      setAuthenticatingProvider(null);
    }
  }, [updateSession]);

  const handleGoogleSignIn = useCallback(async () => {
    if (!promptGoogleAsync) {
      throw new Error("Google sign-in is not configured");
    }
    setAuthenticatingProvider("google");
    try {
      const result: AuthSessionResult | null = await promptGoogleAsync({
        useProxy: true,
        showInRecents: true,
      });

      if (!result || result.type === "dismiss" || result.type === "cancel") {
        return null;
      }

      if (result.type !== "success" || !result.authentication) {
        throw new Error("We couldn't complete Google sign-in. Please try again.");
      }

      const { idToken, accessToken } = result.authentication;
      let profile = accessToken ? await fetchGoogleProfile(accessToken) : null;
      let firebaseSession: AuthSessionRecord | null = null;

      const auth = getAuthClient();
      if (auth && idToken) {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          const token = await userCredential.user.getIdToken();
          firebaseSession = buildSessionFromFirebase(userCredential.user, token, "google");
        } catch (firebaseError) {
          console.warn("Failed to sign in with Google credential", firebaseError);
        }
      }

      const nextSession =
        firebaseSession ??
        ({
          provider: "google" as const,
          token: idToken ?? accessToken ?? null,
          user: {
            id: profile?.sub ?? `google-${Date.now()}`,
            name: profile?.name ?? profile?.given_name ?? "Google user",
            email: profile?.email ?? null,
            photoUrl: profile?.picture ?? null,
          },
        } satisfies AuthSessionRecord);

      await updateSession(nextSession);
      return nextSession.user;
    } finally {
      setAuthenticatingProvider(null);
    }
  }, [promptGoogleAsync, updateSession]);

  const handleAppleSignIn = useCallback(async () => {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sign in with Apple is not available on this device");
    }
    setAuthenticatingProvider("apple");
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      const fullName = formatAppleName(credential.fullName ?? null);
      const auth = getAuthClient();
      let firebaseSession: AuthSessionRecord | null = null;

      if (auth && credential.identityToken) {
        try {
          const provider = new OAuthProvider("apple.com");
          const firebaseCredential = provider.credential({
            idToken: credential.identityToken,
            rawNonce: credential.nonce ?? undefined,
          });
          const userCredential = await signInWithCredential(auth, firebaseCredential);
          const token = await userCredential.user.getIdToken();
          firebaseSession = buildSessionFromFirebase(userCredential.user, token, "apple");
        } catch (firebaseError) {
          console.warn("Failed to sign in with Apple credential", firebaseError);
        }
      }

      const nextSession =
        firebaseSession ??
        ({
          provider: "apple" as const,
          token: credential.identityToken ?? null,
          user: {
            id: credential.user ?? `apple-${Date.now()}`,
            name: fullName ?? "Apple user",
            email: credential.email ?? null,
            photoUrl: null,
          },
        } satisfies AuthSessionRecord);

      await updateSession(nextSession);
      return nextSession.user;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code?: string }).code;
        if (code === "ERR_CANCELED") {
          return null;
        }
      }
      throw error;
    } finally {
      setAuthenticatingProvider(null);
    }
  }, [updateSession]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.warn("Failed to sign out from Firebase", error);
    } finally {
      await updateSession(null);
    }
  }, [updateSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      provider: session?.provider ?? null,
      isAuthenticated: !!session,
      isLoading: isHydrating,
      authenticatingProvider,
      signInWithEmail: handleEmailSignIn,
      createAccountWithEmail: handleEmailSignUp,
      signInWithGoogle: handleGoogleSignIn,
      signInWithApple: handleAppleSignIn,
      signOut: handleSignOut,
    }),
    [
      authenticatingProvider,
      handleAppleSignIn,
      handleEmailSignIn,
      handleEmailSignUp,
      handleGoogleSignIn,
      handleSignOut,
      isHydrating,
      session,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
