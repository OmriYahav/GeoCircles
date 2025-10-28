import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, Avatar } from "react-native-paper";

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
  list: {
    padding: 24,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    marginRight: 16,
    backgroundColor: "#2563eb",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "700",
  },
  cardDescription: {
    marginTop: 4,
    color: "rgba(0,0,0,0.6)",
  },
  cardMeta: {
    marginTop: 8,
    color: "rgba(0,0,0,0.45)",
  },
});
