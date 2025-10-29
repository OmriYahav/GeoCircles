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
import KeyboardDismissView from "../components/KeyboardDismissView";
import BusinessProximityManager from "../../components/BusinessProximityManager";
import { Colors, Palette } from "../../constants/theme";

const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 14,
  colors: {
    ...MD3LightTheme.colors,
    primary: Palette.primary,
    primaryContainer: Palette.primarySoft,
    secondary: Palette.accent,
    background: Palette.background,
    surface: Palette.surface,
    surfaceVariant: Palette.surfaceMuted,
    outline: Palette.border,
    outlineVariant: Palette.border,
    onSurface: Palette.textPrimary,
    onSurfaceVariant: Palette.textMuted,
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
          <UserProfileProvider>
            <BusinessProvider>
              <ChatConversationsProvider>
                <FavoritesProvider>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor={Colors.light.background}
                  />
                  <KeyboardDismissView>
                    <View style={{ flex: 1 }}>{children}</View>
                  </KeyboardDismissView>
                  <BusinessProximityManager />
                </FavoritesProvider>
              </ChatConversationsProvider>
            </BusinessProvider>
          </UserProfileProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export { paperTheme };
