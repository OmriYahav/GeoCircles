import React from "react";
import { Stack } from "expo-router";

export default function WorkshopsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "modal" }}>
      <Stack.Screen name="healthy-baking" options={{ headerShown: false }} />
      <Stack.Screen name="healthy-cooking" options={{ headerShown: false }} />
      <Stack.Screen name="natural-cosmetics" options={{ headerShown: false }} />
      <Stack.Screen name="healthy-hosting" options={{ headerShown: false }} />
    </Stack>
  );
}
