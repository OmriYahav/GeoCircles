import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, shadows, spacing, typography } from "../theme";

const TAB_ICON_MAP: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  map: { icon: "home-outline", label: "בית" },
  "my-spots": { icon: "chatbubbles-outline", label: "עצות" },
};

export default function BottomTabNavigator({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
    >
      <View style={styles.container}>
        {state.routes
          .filter((route) => TAB_ICON_MAP[route.name])
          .map((route) => {
            const tabConfig = TAB_ICON_MAP[route.name];
            const routeIndex = state.routes.findIndex((candidate) => candidate.key === route.key);
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              navigation.navigate(route.name);
            };

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.85}
                onPress={onPress}
                style={[styles.tab, isFocused && styles.tabActive]}
              >
                <Ionicons
                  name={tabConfig.icon}
                  size={24}
                  color={isFocused ? colors.primary : colors.secondary}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {tabConfig.label}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
  },
  tabActive: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.secondary,
    fontFamily: typography.family.medium,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: typography.family.semiBold,
  },
});
