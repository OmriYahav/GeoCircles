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

import { Colors, Palette } from "../../constants/theme";

const TAB_ITEMS = [
  { name: "search", label: "Search", icon: "search-outline" as const },
  { name: "favorites", label: "Favorites", icon: "heart-outline" as const },
  { name: "messages", label: "Messages", icon: "chatbubbles-outline" as const },
  { name: "profile", label: "Profile", icon: "person-circle-outline" as const },
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
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_ITEMS.find((item) => item.name === route.name);
        if (!config) {
          return null;
        }

        const onPress = () => {
          if (route.name === "search") {
            navigation.navigate(route.name, {
              params: {
                triggerType: "focusSearch",
                triggerTimestamp: Date.now().toString(),
              },
              merge: true,
            });
            return;
          }

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
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: Palette.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    justifyContent: "space-between",
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
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
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
