import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "../theme";

type ScrollToTopButtonProps = {
  visible: boolean;
  onPress: () => void;
};

export default function ScrollToTopButton({ visible, onPress }: ScrollToTopButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.label}>↑</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: spacing(3),
    left: spacing(3),
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
