import { Platform } from "react-native";

const baseColors = {
  bgFrom: "#F8F4ED",
  bgTo: "#E9F2E3",
  primary: "#2F6D3A",
  primarySoft: "#A9C9A4",
  text: "#2F6D3A",
  subtitle: "#6D8571",
  cardBg: "#FFFFFF",
  shadow: "rgba(47, 109, 58, 0.12)",
  buttonBg: "#E9F2E3",
  buttonText: "#2F6D3A",
};

export const colors = {
  ...baseColors,
  background: baseColors.bgFrom,
  surface: baseColors.cardBg,
  surfaceMuted: "#F4F1E9",
  surfaceElevated: baseColors.cardBg,
  secondary: baseColors.primarySoft,
  secondarySoft: "#DDEAD7",
  accent: baseColors.primary,
  border: "#E3E8E3",
  divider: "#E4E8E1",
  primaryTint: "rgba(47, 109, 58, 0.18)",
  textMuted: baseColors.subtitle,
  textInverse: "#FFFFFF",
  buttonBg: baseColors.buttonBg,
  buttonText: baseColors.buttonText,
};

const defaultFontFamily = Platform.select({
  ios: "System",
  android: "System",
  default: "System",
});

export const typography = {
  title: 34,
  subtitle: 18,
  body: 16,
  small: 14,
  line: 1.7,
  fontFamily: defaultFontFamily ?? "System",
  family: {
    heading: defaultFontFamily ?? "System",
    regular: defaultFontFamily ?? "System",
    medium: defaultFontFamily ?? "System",
    semiBold: defaultFontFamily ?? "System",
    bold: defaultFontFamily ?? "System",
  },
  size: {
    caption: 12,
    xs: 13,
    sm: 15,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 34,
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
