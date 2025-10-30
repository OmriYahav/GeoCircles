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

const TAB_ITEMS = [
  { name: "messages", label: "Chat", icon: "chatbubbles-outline" as const },
];

type TabButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, isFocused, onPress }: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: withTiming(
      isFocused ? Palette.primaryTint : "transparent"
    ),
  }));

  return (
    <Animated.View style={[styles.tabButtonContainer, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          scale.value = withTiming(0.9, { duration: 100 }, () => {
            scale.value = withTiming(1, { duration: 160 });
          });
          onPress();
        }}
        style={styles.touchable}
      >
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
      </TouchableOpacity>
    </Animated.View>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.tabBarWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View style={styles.tabBar}>
        {TAB_ITEMS.map((config) => {
          const routeIndex = state.routes.findIndex(
            (route) => route.name === config.name
          );
          if (routeIndex === -1) {
            return null;
          }

          const isFocused = state.index === routeIndex;

          const onPress = () => {
            navigation.navigate(config.name);
          };

          return (
            <TabButton
              key={config.name}
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
      sceneContainerStyle={styles.sceneContainer}
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
    paddingBottom: 120,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Palette.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    justifyContent: "center",
    borderRadius: 28,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 6,
    alignSelf: "center",
    width: "92%",
    maxWidth: 420,
  },
  tabButtonContainer: {
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 18,
    overflow: "hidden",
    minWidth: 120,
  },
  touchable: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 18,
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
