import React from "react";
import { FlatList, Keyboard, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";

import { useFavorites } from "../context/FavoritesContext";

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { favorites, removeFavorite, clearFavorites, isReady } = useFavorites();

  const handleBackToMap = () => {
    Keyboard.dismiss();
    navigation.navigate("Search" as never, { screen: "Map" } as never);
  };

  if (!isReady) {
    return (
      <View style={styles.emptyState}>
        <Text variant="bodyLarge">Loading your saved places…</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text variant="titleMedium" style={styles.emptyTitle}>
          No favorites yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Save a location from the map search to access it quickly here.
        </Text>
        <Button
          mode="contained"
          onPress={handleBackToMap}
          style={[styles.backButton, styles.emptyBackButton]}
        >
          Back to map
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={favorites}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <View style={styles.headerActions}>
          <Button mode="contained" onPress={handleBackToMap} style={styles.backButton}>
            Back to map
          </Button>
          <Button mode="contained-tonal" onPress={clearFavorites} style={styles.clearButton}>
            Clear all
          </Button>
        </View>
      )}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <View style={styles.cardBody}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.cardSubtitle}>
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>
          </View>
          <Button mode="text" onPress={() => removeFavorite(item.id)}>
            Remove
          </Button>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 24,
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardBody: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontWeight: "700",
  },
  cardSubtitle: {
    marginTop: 4,
    color: "rgba(0,0,0,0.6)",
  },
  clearButton: {
    borderRadius: 12,
  },
  backButton: {
    borderRadius: 12,
  },
  emptyBackButton: {
    marginTop: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  emptySubtitle: {
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
  },
});
