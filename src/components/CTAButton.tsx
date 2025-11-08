import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "../theme";

type CTAButtonProps = {
  title: string;
  onPress: () => void;
};

export default function CTAButton({ title, onPress }: CTAButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
