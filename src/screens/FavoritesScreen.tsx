import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { useFavorites } from "../context/FavoritesContext";
import BackToMapButton from "../components/BackToMapButton";
import { Palette } from "../../constants/theme";
import ScreenScaffold from "../components/layout/ScreenScaffold";

export default function FavoritesScreen() {
  const { favorites, removeFavorite, clearFavorites, isReady } = useFavorites();

  if (!isReady) {
    return (
      <ScreenScaffold contentStyle={styles.loadingContent}>
        <View style={styles.emptyState}>
          <Text variant="bodyLarge">Loading your saved places…</Text>
        </View>
      </ScreenScaffold>
    );
  }

  if (favorites.length === 0) {
    return (
      <ScreenScaffold contentStyle={styles.loadingContent}>
        <View style={styles.emptyState}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No favorites yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Save a location from the map search to access it quickly here.
          </Text>
          <BackToMapButton style={[styles.backButton, styles.emptyBackButton]} />
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold contentStyle={styles.listContent}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={favorites}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.headerActions}>
            <BackToMapButton style={styles.backButton} />
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
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
    flex: 1,
  },
  listContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
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
    padding: 18,
    borderRadius: 18,
    backgroundColor: Palette.surface,
    shadowColor: "rgba(15, 23, 42, 0.14)",
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
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
    color: Palette.textPrimary,
  },
  cardSubtitle: {
    marginTop: 4,
    color: Palette.textMuted,
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
    backgroundColor: Palette.background,
  },
  emptyTitle: {
    fontWeight: "700",
    marginBottom: 12,
    color: Palette.textPrimary,
  },
  emptySubtitle: {
    color: Palette.textMuted,
    textAlign: "center",
  },
});
