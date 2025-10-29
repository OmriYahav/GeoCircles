/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Palette = {
  /** Primary brand color used for buttons and highlights */
  primary: '#1E3A8A',
  /** Lighter variant of the primary color used for subtle accents */
  primarySoft: '#E0E7FF',
  /** Muted overlay for elevated primary elements */
  primaryTint: 'rgba(30, 58, 138, 0.12)',
  /** Accent color for emphasis such as warnings or highlights */
  accent: '#F97316',
  /** Base background color for screens */
  background: '#F4F6FB',
  /** Default surface color for cards */
  surface: '#FFFFFF',
  /** Muted surface for elevated sections */
  surfaceMuted: '#EEF2FF',
  /** Subtle border color */
  border: '#E2E8F0',
  /** High-emphasis text color */
  textPrimary: '#0F172A',
  /** Medium-emphasis text color */
  textSecondary: '#475569',
  /** Low-emphasis text color */
  textMuted: '#64748B',
  /** Success state color */
  success: '#16A34A',
  /** Error state color */
  danger: '#DC2626',
};

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.textMuted,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',
    tint: '#60A5FA',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#60A5FA',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
