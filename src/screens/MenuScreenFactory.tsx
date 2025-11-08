import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenScaffold from "../components/layout/ScreenScaffold";
import { colors, spacing, typography } from "../theme";

export type MenuScreenConfig = {
  icon: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
};

export function createMenuScreen(config: MenuScreenConfig) {
  function MenuScreen() {
    return (
      <ScreenScaffold contentStyle={styles.screenContent}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
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
      </ScreenScaffold>
    );
  }

  return MenuScreen;
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingHorizontal: 0,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxxl,
  },
  hero: {
    alignItems: "flex-end",
    gap: spacing.md,
    writingDirection: "rtl",
  },
  icon: {
    fontSize: 52,
    textAlign: "right",
  },
  title: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xxl,
    color: colors.text.primary,
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
    writingDirection: "rtl",
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
