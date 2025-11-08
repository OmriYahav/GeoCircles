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
    fontFamily: typography.family.semiBold,
    fontSize: typography.size.xl,
    color: colors.text,
    letterSpacing: 0.2,
  },
  subheading: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
    color: colors.subtitle,
  },
  body: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    color: colors.subtitle,
    lineHeight: typography.lineHeight.relaxed,
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
