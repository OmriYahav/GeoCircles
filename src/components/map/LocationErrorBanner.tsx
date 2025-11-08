import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import MapOverlayCard from "./MapOverlayCard";
import { colors, radii, spacing, typography } from "../../theme";

type LocationErrorBannerProps = {
  message: string;
  onRetry: () => void;
};

export default function LocationErrorBanner({
  message,
  onRetry,
}: LocationErrorBannerProps) {
  return (
    <MapOverlayCard style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Location unavailable</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      <Button
        mode="contained-tonal"
        icon="refresh"
        onPress={onRetry}
        style={styles.button}
      >
        Try again
      </Button>
    </MapOverlayCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
  },
  badgeText: {
    fontSize: typography.size.xs,
    color: colors.textInverse,
    fontFamily: typography.family.semiBold,
  },
  message: {
    color: colors.subtitle,
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
});
