import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, Avatar } from "react-native-paper";

import { Palette } from "../../constants/theme";

const dummyHubItems = [
  {
    id: "art-hub",
    title: "Canal Street art market",
    description: "Pop-up gallery with local painters and muralists",
    participants: 12,
  },
  {
    id: "coffee-meet",
    title: "Early risers coffee club",
    description: "Meet for a sunrise brew near the waterfront",
    participants: 8,
  },
  {
    id: "community-garden",
    title: "Community garden shift",
    description: "Help plant herbs and learn sustainable growing tips",
    participants: 17,
  },
];

export default function HubScreen() {
  const items = useMemo(() => dummyHubItems, []);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Avatar.Icon icon="map-marker" size={48} style={styles.avatar} />
          <View style={styles.cardBody}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              {item.description}
            </Text>
            <Text variant="labelMedium" style={styles.cardMeta}>
              {item.participants} people nearby
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  list: {
    padding: 24,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Palette.surface,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: "rgba(15, 23, 42, 0.16)",
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  avatar: {
    marginRight: 16,
    backgroundColor: Palette.primary,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  cardDescription: {
    marginTop: 4,
    color: Palette.textSecondary,
  },
  cardMeta: {
    marginTop: 8,
    color: Palette.textMuted,
  },
});
