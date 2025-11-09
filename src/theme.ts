import { Platform } from "react-native";

const baseColors = {
  bgFrom: "#FAF9F4",
  bgTo: "#FAF9F4",
  primary: "#3C6E47",
  primarySoft: "#E6F0E3",
  text: "#3C6E47",
  subtitle: "#707070",
  cardBg: "#FFFFFF",
  shadow: "rgba(60, 110, 71, 0.12)",
  buttonBg: "#E6F0E3",
  buttonText: "#3C6E47",
};

export const colors = {
  ...baseColors,
  background: baseColors.bgFrom,
  surface: baseColors.cardBg,
  surfaceMuted: "#F1EFE6",
  surfaceElevated: baseColors.cardBg,
  secondary: baseColors.primarySoft,
  secondarySoft: "#F3F6F0",
  accent: baseColors.primary,
  border: "#E3E8E3",
  divider: "#E4E8E1",
  primaryTint: "rgba(60, 110, 71, 0.16)",
  textMuted: "rgba(60, 110, 71, 0.65)",
  textInverse: "#FFFFFF",
  buttonBg: baseColors.buttonBg,
  buttonText: baseColors.buttonText,
};

const defaultFontFamily = Platform.select({
  ios: "Heebo_400Regular",
  android: "Heebo_400Regular",
  default: "Heebo_400Regular",
});

export const typography = {
  title: 28,
  subtitle: 18,
  body: 15,
  small: 13,
  line: 1.7,
  fontFamily: defaultFontFamily ?? "Heebo_400Regular",
  family: {
    heading: "Heebo_700Bold",
    regular: defaultFontFamily ?? "Heebo_400Regular",
    medium: "Heebo_500Medium",
    semiBold: "Heebo_600SemiBold",
    bold: "Heebo_700Bold",
  },
  size: {
    caption: 12,
    xs: 13,
    sm: 15,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  lineHeight: {
    tight: 18,
    comfy: 22,
    relaxed: 26,
    spacious: 32,
  },
};

const createSpacing = () => {
  const spacingFn = ((n: number) => n * 8) as ((n: number) => number) & {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };

  return Object.assign(spacingFn, {
    xxs: 4,
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  });
};

export const spacing = createSpacing();

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, xxl: 36, pill: 999 } as const;
export const radii = radius;

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

export const gradients = {
  primary: [colors.bgFrom, colors.bgTo] as [string, string],
};

export const theme = {
  colors,
  spacing,
  radius,
  radii,
  shadows,
  typography,
  gradients,
};

export type AppTheme = typeof theme;

export { colors as palette };
