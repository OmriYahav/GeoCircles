import { Platform } from "react-native";

const textPalette = {
  primary: "#2D4636",
  secondary: "#5B6D61",
  muted: "#8AA093",
  inverse: "#FFFFFF",
};

const spacingValues = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

type SpacingFunction = ((n: number) => number) & typeof spacingValues;

const createSpacing = (): SpacingFunction => {
  const spacingFn = ((n: number) => n * 8) as SpacingFunction;
  return Object.assign(spacingFn, spacingValues);
};

export const spacing = createSpacing();

export const colors = {
  bgFrom: "#F7F0E8",
  bgTo: "#EAF2EA",
  primary: "#2F6E44",
  primarySoft: "#3C7F51",
  secondary: "#3C7F51",
  secondarySoft: "#D9E7D9",
  accent: "#6DA88B",
  background: "#F7F0E8",
  surface: "#FFFFFF",
  surfaceMuted: "#F4F7F2",
  surfaceElevated: "#FFFFFF",
  border: "#E1E7E1",
  divider: "#E6EDE6",
  primaryTint: "rgba(47, 110, 68, 0.18)",
  text: textPalette,
  cardBg: "#FFFFFF",
  shadow: "rgba(0,0,0,0.08)",
};

export const gradients = {
  primary: ["#F7F0E8", "#EAF2EA"],
  accent: ["#EAF2EA", "#CDE2CF"],
};

export const radii = {
  xs: 10,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
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
  title: 34,
  subtitle: 18,
  body: 16,
  small: 14,
  line: 1.7,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  radius,
  shadows,
  typography,
  gradients,
};

export type AppTheme = typeof theme;
export { colors as palette };
