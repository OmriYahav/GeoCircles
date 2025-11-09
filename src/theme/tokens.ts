import { computeLineHeight, scaleFont } from "../theme";

export const colors = {
  bg0: "rgba(255,255,255,0.96)",
  bg1: "rgba(255,255,255,0.9)",
  accent: "#3C6E47",
  accentSoft: "#E6F0E3",
  text: "#3C6E47",
  divider: "rgba(60,110,71,0.14)",
  shadow: "rgba(60,110,71,0.12)",
};

export const radius = { xl: 28, lg: 20, md: 14, sm: 10 };
export const spacing = { xxl: 32, xl: 24, lg: 18, md: 14, sm: 10, xs: 6 };
export const font = {
  h1: scaleFont(34),
  h2: scaleFont(24),
  lead: scaleFont(18),
  body: scaleFont(16),
  small: scaleFont(13),
};

export const lineHeight = {
  h1: computeLineHeight(34, 1.22),
  lead: computeLineHeight(18, 1.35),
  body: computeLineHeight(16, 1.5),
  small: computeLineHeight(13, 1.45),
};
