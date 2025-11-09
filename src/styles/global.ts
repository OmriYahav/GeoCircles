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
    lineHeight: typography.lineHeight.spacious,
  },
  subheading: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.lg,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.relaxed,
  },
  body: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.relaxed,
  },
  title: {
    fontFamily: "Heebo_700Bold",
    fontSize: typography.size.xl,
    color: "#2F6B3A",
    lineHeight: typography.lineHeight.spacious,
  },
  subtitle: {
    fontFamily: "Heebo_400Regular",
    fontSize: typography.subtitle,
    color: "#618C68",
    lineHeight: Math.round(typography.subtitle * 1.4),
  },
  paragraph: {
    fontFamily: "Heebo_400Regular",
    fontSize: typography.body,
    color: "#444444",
    lineHeight: Math.round(typography.body * 1.6),
  },
  caption: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.caption,
    color: colors.textMuted,
    lineHeight: Math.round(typography.size.caption * 1.3),
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
