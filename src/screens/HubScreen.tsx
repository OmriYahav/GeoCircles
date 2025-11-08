import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, Avatar } from "react-native-paper";

import { colors, radii, shadows, spacing, typography } from "../theme";
import { globalStyles } from "../styles/global";

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
      ListHeaderComponent={
        <View style={styles.header}> 
          <Text style={styles.title}>Curated spots nearby</Text>
          <Text style={styles.subtitle}>
            Discover vibrant meetups and creative hubs formed by locals within a
            short walk from you.
          </Text>
        </View>
      }
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
    ...globalStyles.screen,
  },
  list: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.xxl,
    color: colors.text,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.relaxed,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  avatar: {
    marginRight: spacing.lg,
    backgroundColor: colors.primaryTint,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.lg,
    color: colors.text,
  },
  cardDescription: {
    marginTop: spacing.xs,
    color: colors.subtitle,
    fontFamily: typography.family.regular,
    lineHeight: typography.lineHeight.relaxed,
  },
  cardMeta: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontFamily: typography.family.medium,
  },
});
