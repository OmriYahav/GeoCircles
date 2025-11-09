import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type CTAButtonProps = {
  title: string;
  onPress: () => void;
};

export default function CTAButton({ title, onPress }: CTAButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonBg,
    borderRadius: radius.pill,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    alignSelf: "flex-end",
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    color: colors.buttonText,
    fontSize: typography.size.lg,
    fontFamily: "Heebo_600SemiBold",
  },
  pressed: {
    transform: [{ scale: 1.05 }],
    opacity: 0.9,
  },
});
