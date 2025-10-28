import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";

import AppNavigator from "./navigation/AppNavigator";
import { FavoritesProvider } from "./context/FavoritesContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <FavoritesProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </FavoritesProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
