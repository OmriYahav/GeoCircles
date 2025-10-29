import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Palette } from "../../../constants/theme";
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
    gap: 14,
    backgroundColor: Palette.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.25)",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
  },
  statValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
