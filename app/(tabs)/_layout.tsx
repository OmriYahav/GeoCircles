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

import { colors, radii, shadows, spacing, typography } from "../../src/theme";
import { TAB_BAR_HEIGHT } from "../../constants/layout";

const TAB_ICON_MAP: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  search: { label: "Map", icon: "navigate-circle-outline" },
  favorites: { label: "Favorites", icon: "heart-outline" },
  messages: { label: "Messages", icon: "chatbubbles-outline" },
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
      isFocused ? colors.primaryTint : "transparent"
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
            size={24}
            color={isFocused ? colors.primary : colors.text.muted}
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
    <View pointerEvents="box-none" style={styles.tabBarWrapper}>
      <View
        style={[
          styles.tabBarBackground,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
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
      sceneContainerStyle={[
        styles.sceneContainer,
        { paddingBottom: TAB_BAR_HEIGHT + spacing.lg },
      ]}
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
  },
  tabBarBackground: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    ...shadows.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  sceneContainer: {
    flex: 1,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    minHeight: TAB_BAR_HEIGHT,
  },
  tabButtonContainer: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  touchable: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  tabLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    fontFamily: typography.family.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: typography.family.semiBold,
  },
});
