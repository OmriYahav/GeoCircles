import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { Palette } from "../../../constants/theme";

type LayerBadgeProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export default function LayerBadge({ label, style }: LayerBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    shadowColor: "rgba(15, 23, 42, 0.22)",
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
