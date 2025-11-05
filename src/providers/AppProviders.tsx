import React, { useEffect } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  MD3LightTheme,
  Provider as PaperProvider,
  type MD3Theme,
} from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";

import { FavoritesProvider } from "../context/FavoritesContext";
import { UserProfileProvider } from "../context/UserProfileContext";
import { ChatConversationsProvider } from "../context/ChatConversationsContext";
import { BusinessProvider } from "../context/BusinessContext";
import { AuthProvider } from "../contexts/AuthContext";
import KeyboardDismissView from "../components/KeyboardDismissView";
import BusinessProximityManager from "../../components/BusinessProximityManager";
import { colors } from "../theme";

const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 18,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primarySoft,
    secondary: colors.secondary,
    secondaryContainer: colors.secondarySoft,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceMuted,
    outline: colors.border,
    outlineVariant: colors.divider,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.muted,
  },
};

export type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    let isMounted = true;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const manageSplashScreen = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (error) {
        console.warn("Failed to prevent auto-hiding the splash screen", error);
      }

      timeout = setTimeout(() => {
        if (!isMounted) {
          return;
        }

        SplashScreen.hideAsync().catch((hideError) => {
          console.warn("Failed to hide splash screen", hideError);
        });
      }, 500);
    };

    manageSplashScreen();

    return () => {
      isMounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AuthProvider>
            <UserProfileProvider>
              <BusinessProvider>
                <ChatConversationsProvider>
                  <FavoritesProvider>
                    <StatusBar
                      barStyle="dark-content"
                      backgroundColor={colors.background}
                    />
                    <KeyboardDismissView>
                      <View style={{ flex: 1, backgroundColor: colors.background }}>
                        {children}
                      </View>
                    </KeyboardDismissView>
                    <BusinessProximityManager />
                  </FavoritesProvider>
                </ChatConversationsProvider>
              </BusinessProvider>
            </UserProfileProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export { paperTheme };
