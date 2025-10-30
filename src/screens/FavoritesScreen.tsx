import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { useFavorites } from "../context/FavoritesContext";
import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, radii, shadows, spacing, typography } from "../theme";

export default function FavoritesScreen() {
  const { favorites, removeFavorite, clearFavorites, isReady } = useFavorites();

  if (!isReady) {
    return (
      <ScreenScaffold contentStyle={styles.loadingContent}>
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.loadingLabel}>
            Loading your saved places…
          </Text>
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
            <Button
              mode="contained-tonal"
              onPress={clearFavorites}
              style={styles.clearButton}
              labelStyle={styles.clearLabel}
            >
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
            <Button
              mode="text"
              onPress={() => removeFavorite(item.id)}
              labelStyle={styles.removeLabel}
              textColor={colors.primary}
            >
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
  },
  listContent: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardBody: {
    flex: 1,
    marginRight: spacing.lg,
  },
  cardTitle: {
    fontFamily: typography.family.semiBold,
    color: colors.text.primary,
    fontSize: typography.size.md,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  clearButton: {
    borderRadius: radii.pill,
    backgroundColor: colors.primaryTint,
  },
  clearLabel: {
    fontFamily: typography.family.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxxl,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.xl,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  emptySubtitle: {
    color: colors.text.secondary,
    textAlign: "center",
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  loadingLabel: {
    fontFamily: typography.family.medium,
    color: colors.text.secondary,
  },
  removeLabel: {
    fontFamily: typography.family.medium,
  },
});
