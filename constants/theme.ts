/**
 * Runner Way App Theme Configuration
 * Inspired by the reference design with emerald accent colors
 */

import { Platform } from "react-native";

// Primary brand colors
export const Colors = {
  // Emerald - Main brand color
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  // Zinc - Neutral colors
  zinc: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },

  // Accent colors
  blue: {
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
  },

  purple: {
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
  },

  pink: {
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
  },

  amber: {
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },

  orange: {
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },

  red: {
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
  },

  // UI colors
  light: {
    text: "#18181b",
    background: "#ffffff",
    tint: "#10b981",
    icon: "#71717a",
    tabIconDefault: "#71717a",
    tabIconSelected: "#10b981",
    card: "#ffffff",
    border: "rgba(0, 0, 0, 0.1)",
  },
  dark: {
    text: "#fafafa",
    background: "#09090b",
    tint: "#10b981",
    icon: "#71717a",
    tabIconDefault: "#71717a",
    tabIconSelected: "#10b981",
    card: "#18181b",
    border: "#27272a",
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

// Border radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

// Font sizes
export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};

// Font weights
export const FontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});
