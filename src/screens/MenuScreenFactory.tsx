import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { colors, spacing, typography } from "../theme";

export type MenuScreenConfig = {
  icon: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
};

export function createMenuScreen(config: MenuScreenConfig) {
  function MenuScreen() {
    const router = useRouter();

    return (
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            accessibilityLabel="חזרה"
            accessibilityRole="button"
            hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonLabel}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>

        <View style={styles.body}>
          {config.paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    );
  }

  return MenuScreen;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonLabel: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
  },
  hero: {
    alignItems: "flex-end",
    gap: spacing.md,
  },
  icon: {
    fontSize: 52,
    textAlign: "right",
  },
  title: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.xxl,
    color: colors.primary,
    textAlign: "right",
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    textAlign: "right",
  },
  body: {
    gap: spacing.lg,
  },
  paragraph: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: colors.text.primary,
    textAlign: "right",
    lineHeight: typography.lineHeight.relaxed,
  },
});

export default createMenuScreen;
