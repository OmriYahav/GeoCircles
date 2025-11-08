import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";

import { colors, radii, shadows, spacing, typography } from "../theme";

const SERVICES = [
  { id: "recipes", icon: "🧁", label: "מתכונים בריאים" },
  { id: "workshops", icon: "🥄", label: "סדנאות" },
  { id: "treatments", icon: "🤲", label: "טיפולים" },
  { id: "nutrition", icon: "🌿", label: "עצות תזונה" },
  { id: "blog", icon: "📖", label: "בלוג" },
];

function ServiceCard({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sweet Balance</Text>
        <Text style={styles.subtitle}>איזון רך לחיים מלאים</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={SERVICES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard icon={item.icon} label={item.label} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.size.xxl,
    color: colors.primary,
    fontFamily: typography.family.heading,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
    fontSize: typography.size.md,
    fontFamily: typography.family.regular,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  separator: {
    height: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  cardIcon: {
    fontSize: typography.size.xxl,
    marginRight: spacing.md,
  },
  cardLabel: {
    flex: 1,
    textAlign: "right",
    color: colors.text.primary,
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
  },
});
