import {
  colors,
  gradients,
  radii,
  shadows,
  spacing,
  theme,
  typography,
  type AppTheme,
} from "../src/theme";

export { colors as Palette, colors, gradients, radii, shadows, spacing, theme, typography };
export type { AppTheme };

export const Colors = {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.textMuted,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: "#ECEDEE",
    background: "#101532",
    tint: "#7180FF",
    icon: "#94A3B8",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#7180FF",
  },
};
