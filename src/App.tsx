import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

import AppNavigator from "./navigation/AppNavigator";
import { FavoritesProvider } from "./context/FavoritesContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import { ChatConversationsProvider } from "./context/ChatConversationsContext";
import { BusinessProvider } from "./context/BusinessContext";
import BusinessProximityManager from "../components/BusinessProximityManager";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <UserProfileProvider>
            <BusinessProvider>
              <ChatConversationsProvider>
                <FavoritesProvider>
                  <StatusBar barStyle="dark-content" />
                  <AppNavigator />
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
