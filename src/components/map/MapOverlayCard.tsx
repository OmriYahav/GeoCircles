import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radii, shadows, spacing } from "../../theme";

type MapOverlayCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function MapOverlayCard({ children, style }: MapOverlayCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
