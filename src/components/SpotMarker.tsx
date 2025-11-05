import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors, radii, shadows, spacing, typography } from "../theme";
import type { SpotRecord } from "../services/spots";

type SpotMarkerProps = {
  spot: SpotRecord;
};

export default function SpotMarker({ spot }: SpotMarkerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{spot.title}</Text>
      {spot.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {spot.description}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {/* Display a short user reference to avoid revealing full identifiers on the map. */}
        Created by {spot.userId.slice(0, 6)} · {new Date(spot.createdAt).toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...shadows.sm,
    minWidth: 220,
  },
  title: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text.primary,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.text.muted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.xs,
  },
});
