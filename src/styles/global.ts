import { StyleSheet } from "react-native";

import { colors, radii, shadows, spacing, typography } from "../theme";

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.sm,
  },
  elevatedCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  mutedCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  heading: {
    fontFamily: typography.family.heading,
    fontSize: typography.size.xl,
    color: colors.text,
    letterSpacing: 0.2,
  },
  subheading: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.lg,
    color: colors.subtitle,
  },
  body: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.relaxed,
  },
  title: {
    fontFamily: "Heebo_700Bold",
    fontSize: 24,
    color: "#2F6B3A",
  },
  subtitle: {
    fontFamily: "Heebo_400Regular",
    fontSize: 16,
    color: "#618C68",
    lineHeight: 22,
  },
  paragraph: {
    fontFamily: "Heebo_400Regular",
    fontSize: 15,
    color: "#444444",
    lineHeight: 24,
  },
  caption: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    borderRadius: radii.xs,
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceMuted,
  },
});
