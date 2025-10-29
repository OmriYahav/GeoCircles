import React from "react";
import { Stack } from "expo-router";

import AppProviders from "../src/providers/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
  );
}
