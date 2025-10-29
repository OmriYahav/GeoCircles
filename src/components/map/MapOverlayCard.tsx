import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Palette } from "../../../constants/theme";

type MapOverlayCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function MapOverlayCard({ children, style }: MapOverlayCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 22,
    padding: 18,
    shadowColor: "rgba(15, 23, 42, 0.2)",
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
});
