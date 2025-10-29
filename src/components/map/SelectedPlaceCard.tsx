import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { SearchResult } from "../../services/MapService";
import MapOverlayCard from "./MapOverlayCard";
import { Palette } from "../../../constants/theme";

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
      <Button mode="contained" onPress={onSave} style={styles.button} icon="heart-outline">
        Save to favorites
      </Button>
    </MapOverlayCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Palette.primaryTint,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.primary,
  },
  coordinates: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 14,
    paddingHorizontal: 4,
  },
});
