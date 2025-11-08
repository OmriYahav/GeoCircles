import React from "react";
import { Stack } from "expo-router";

import AppProviders from "../src/providers/AppProviders";
import { NavigationDrawerProvider } from "../src/contexts/NavigationDrawerContext";

export default function RootLayout() {
  return (
    <NavigationDrawerProvider>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen
            name="conversation/[conversationId]"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="business-offer/[businessId]"
            options={{ headerShown: false }}
          />
        </Stack>
      </AppProviders>
    </NavigationDrawerProvider>
  );
}
