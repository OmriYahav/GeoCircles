import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import MapOverlayCard from "./MapOverlayCard";
import { Palette } from "../../../constants/theme";

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
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Palette.danger,
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },
  message: {
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 14,
  },
});
