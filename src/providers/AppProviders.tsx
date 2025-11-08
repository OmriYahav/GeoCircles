import React, { useEffect } from "react";
import { I18nManager, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  MD3LightTheme,
  Provider as PaperProvider,
  type MD3Theme,
} from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Courgette_400Regular } from "@expo-google-fonts/courgette";
import {
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_600SemiBold,
  Heebo_700Bold,
} from "@expo-google-fonts/heebo";

import { FavoritesProvider } from "../context/FavoritesContext";
import { UserProfileProvider } from "../context/UserProfileContext";
import { ChatConversationsProvider } from "../context/ChatConversationsContext";
import { BusinessProvider } from "../context/BusinessContext";
import { AuthProvider } from "../contexts/AuthContext";
import KeyboardDismissView from "../components/KeyboardDismissView";
import { colors } from "../theme";
import { MenuProvider } from "../context/MenuContext";

const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 22,
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
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
  },
};

export type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  const [fontsLoaded] = useFonts({
    Courgette_400Regular,
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
  });

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch((error) => {
      console.warn("Failed to prevent auto-hiding the splash screen", error);
    });
  }, []);

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    let isMounted = true;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    timeout = setTimeout(() => {
      if (!isMounted) {
        return;
      }

      SplashScreen.hideAsync().catch((hideError) => {
        console.warn("Failed to hide splash screen", hideError);
      });
    }, 350);

    return () => {
      isMounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
                      <MenuProvider>
                        <View style={{ flex: 1, backgroundColor: colors.background }}>
                          {children}
                        </View>
                      </MenuProvider>
                    </KeyboardDismissView>
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
