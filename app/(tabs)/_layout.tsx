import React from "react";
import { Tabs } from "expo-router";

import BottomTabNavigator from "../../src/components/BottomTabNavigator";
import { colors, spacing } from "../../src/theme";
import { TAB_BAR_HEIGHT } from "../../constants/layout";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      sceneContainerStyle={{
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: TAB_BAR_HEIGHT + spacing.xl,
      }}
      tabBar={(props) => <BottomTabNavigator {...props} />}
    >
      <Tabs.Screen name="map" options={{ title: "Home" }} />
      <Tabs.Screen name="saved-spots" options={{ title: "Workshops" }} />
      <Tabs.Screen name="my-spots" options={{ title: "Tips" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
