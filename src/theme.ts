import { Platform } from "react-native";

import { colors } from "./theme/colors";

export const gradients = {
  primary: ["#7CA46A", "#6E8B52"],
  accent: ["#B6C49C", "#8FA572"],
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  xs: 10,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

const defaultBodyFont = Platform.select({
  ios: "Heebo_400Regular",
  android: "Heebo_400Regular",
  default: "Heebo_400Regular",
});

export const typography = {
  family: {
    heading: Platform.select({
      ios: "Courgette_400Regular",
      android: "Courgette_400Regular",
      default: "Courgette_400Regular",
    }),
    regular: defaultBodyFont,
    medium: Platform.select({
      ios: "Heebo_500Medium",
      android: "Heebo_500Medium",
      default: "Heebo_500Medium",
    }),
    semiBold: Platform.select({
      ios: "Heebo_600SemiBold",
      android: "Heebo_600SemiBold",
      default: "Heebo_600SemiBold",
    }),
    bold: Platform.select({
      ios: "Heebo_700Bold",
      android: "Heebo_700Bold",
      default: "Heebo_700Bold",
    }),
  },
  size: {
    caption: 12,
    xs: 13,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 26,
    xxl: 34,
  },
  lineHeight: {
    tight: 18,
    comfy: 22,
    relaxed: 28,
    spacious: 34,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography,
  gradients,
};

export type AppTheme = typeof theme;
export { colors };
