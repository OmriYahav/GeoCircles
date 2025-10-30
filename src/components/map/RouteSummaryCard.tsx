import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../../theme";
import MapOverlayCard from "./MapOverlayCard";

type RouteSummaryCardProps = {
  title: string;
  subtitle: string;
  distanceKilometers: number;
  durationMinutes: number;
};

export default function RouteSummaryCard({
  title,
  subtitle,
  distanceKilometers,
  durationMinutes,
}: RouteSummaryCardProps) {
  return (
    <MapOverlayCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Live navigation</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{distanceKilometers.toFixed(1)} km</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{Math.round(durationMinutes)} min</Text>
        </View>
      </View>
    </MapOverlayCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    color: colors.text.inverse,
    letterSpacing: 0.3,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  pillText: {
    color: colors.text.inverse,
    fontSize: typography.size.xs,
    fontFamily: typography.family.medium,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: "rgba(15,23,42,0.22)",
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: "rgba(255,255,255,0.72)",
    fontFamily: typography.family.medium,
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    color: colors.text.inverse,
  },
});
