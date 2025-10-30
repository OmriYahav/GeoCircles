import { Platform } from "react-native";

export const colors = {
  primary: "#4C6EF5",
  primarySoft: "#EEF0FF",
  primaryTint: "rgba(76, 110, 245, 0.16)",
  secondary: "#A855F7",
  secondarySoft: "#F5E8FF",
  success: "#34D399",
  warning: "#F59E0B",
  danger: "#F87171",
  background: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceElevated: "#FBFCFF",
  surfaceMuted: "#EDF1FA",
  border: "#E2E8F6",
  divider: "#D8E0F0",
  text: {
    primary: "#1E2550",
    secondary: "#5B628A",
    muted: "#7C83AD",
    inverse: "#FFFFFF",
  },
  overlay: "rgba(16, 24, 40, 0.2)",
  shadow: "rgba(15, 23, 42, 0.12)",
};

export const gradients = {
  primary: ["#5F7BFF", "#5065F4"],
  accent: ["#8B5CF6", "#6366F1"],
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
};

const baseFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export const typography = {
  family: {
    regular: baseFontFamily,
    medium: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    semiBold: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    bold: Platform.OS === "ios" ? "System" : "sans-serif-bold",
  },
  size: {
    caption: 12,
    xs: 13,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  lineHeight: {
    tight: 18,
    comfy: 22,
    relaxed: 26,
    spacious: 32,
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
