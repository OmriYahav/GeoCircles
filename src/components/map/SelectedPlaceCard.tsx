import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { SearchResult } from "../../services/MapService";
import MapOverlayCard from "./MapOverlayCard";
import { colors, radii, spacing, typography } from "../../theme";

type SelectedPlaceCardProps = {
  place: Pick<SearchResult, "displayName" | "latitude" | "longitude">;
  onSave: () => void;
};

export default function SelectedPlaceCard({ place, onSave }: SelectedPlaceCardProps) {
  return (
    <MapOverlayCard style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pinned location</Text>
        </View>
        <Text style={styles.coordinates}>
          {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
        </Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {place.displayName}
      </Text>
      <Button
        mode="contained"
        onPress={onSave}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        icon="heart-outline"
      >
        Save to favorites
      </Button>
    </MapOverlayCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryTint,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.medium,
    color: colors.primary,
  },
  coordinates: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
  },
  title: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  buttonLabel: {
    fontFamily: typography.family.medium,
    letterSpacing: 0.2,
  },
});
