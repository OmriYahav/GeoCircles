import React from "react";
import { Stack } from "expo-router";

import AppProviders from "../src/providers/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{ headerShown: false, animation: "fade", detachInactiveScreens: false }}
      >
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
