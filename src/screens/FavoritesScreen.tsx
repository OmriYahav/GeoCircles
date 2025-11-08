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
            Loading your saved favorites…
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
            Save recipes, workshops, or wellness notes you love and they will appear here.
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
              {(item.category || item.notes) && (
                <Text variant="bodySmall" style={styles.cardSubtitle}>
                  {[item.category, item.notes].filter(Boolean).join(" · ")}
                </Text>
              )}
              <Text variant="labelSmall" style={styles.cardMeta}>
                Added {new Date(item.addedAt).toLocaleDateString()}
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
        showsVerticalScrollIndicator={false}
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
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: typography.family.semiBold,
    color: colors.text,
    fontSize: typography.size.md,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
  },
  cardMeta: {
    color: colors.subtitle,
    fontFamily: typography.family.medium,
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
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.xl,
    color: colors.text,
  },
  emptySubtitle: {
    color: colors.subtitle,
    textAlign: "center",
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  loadingLabel: {
    fontFamily: typography.family.medium,
    color: colors.subtitle,
  },
  removeLabel: {
    fontFamily: typography.family.medium,
  },
});
