import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, shadows, spacing, typography } from "../theme";

type MapLayerButtonProps = {
  mode: "standard" | "satellite";
  onToggle: () => void;
};

export default function MapLayerButton({ mode, onToggle }: MapLayerButtonProps) {
  const label = mode === "satellite" ? "Satellite" : "Map";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${mode === "satellite" ? "map" : "satellite"} view`}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onToggle}
      hitSlop={8}
    >
      <View style={styles.content}>
        <Ionicons name="layers-outline" size={20} color={colors.text.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.md,
  },
  pressed: {
    opacity: 0.92,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
});
