import React from "react";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Palette } from "../../constants/theme";
import { TAB_BAR_HEIGHT } from "../../constants/layout";

const TAB_ICON_MAP: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  search: { label: "Explore", icon: "navigate-circle-outline" },
  favorites: { label: "Favorites", icon: "heart-outline" },
  messages: { label: "Chat", icon: "chatbubbles-outline" },
  profile: { label: "Profile", icon: "person-circle-outline" },
};

type TabButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, isFocused, onPress }: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isFocused ? Palette.primaryTint : "transparent"
    ),
  }));

  return (
    <Animated.View style={[styles.tabButtonContainer, animatedContainerStyle]}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          scale.value = withTiming(0.94, { duration: 90 }, () => {
            scale.value = withTiming(1, { duration: 180 });
          });
          onPress();
        }}
      >
        <Animated.View style={[styles.touchable, animatedButtonStyle]}>
          <Ionicons
            name={icon}
            size={22}
            color={isFocused ? Colors.light.tint : Colors.light.icon}
          />
          <Animated.Text
            style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBarWrapper,
        { paddingBottom: Math.max(insets.bottom, 16) + 8 },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes
          .filter((route) => TAB_ICON_MAP[route.name])
          .map((route) => {
            const config = TAB_ICON_MAP[route.name];
            const routeIndex = state.routes.findIndex(
              (candidate) => candidate.key === route.key
            );
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              navigation.navigate(route.name);
            };

            return (
              <TabButton
                key={route.key}
                label={config.label}
                icon={config.icon}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      sceneContainerStyle={[styles.sceneContainer, { paddingBottom: TAB_BAR_HEIGHT + 32 }]}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  sceneContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Palette.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 28,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 18,
    elevation: 6,
    alignSelf: "center",
    width: "92%",
    maxWidth: 420,
    minHeight: TAB_BAR_HEIGHT,
  },
  tabButtonContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  touchable: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: Palette.primary,
    fontWeight: "700",
  },
});
