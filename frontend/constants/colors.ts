// MATELIOR design system — matte black, premium, minimal
export const colors = {
  background: "#0B0B0C",
  surface: "#141416",
  surfaceSecondary: "#1C1C1F",
  border: "#2A2A2E",
  borderStrong: "#3A3A3F",

  primaryText: "#F5F4F2",
  secondaryText: "#B8B6B2",
  mutedText: "#7A7873",

  accent: "#C9A227", // muted gunmetal-gold accent
  silver: "#9AA0A6",
  gunmetal: "#4A4E54",

  error: "#D9534F",
  success: "#3FA76B",
  warning: "#D9A441",

  overlay: "rgba(0,0,0,0.6)",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
};

export const typography = {
  display: { fontSize: 34, fontWeight: "300" as const, letterSpacing: 0.5 },
  h1: { fontSize: 26, fontWeight: "500" as const, letterSpacing: 0.3 },
  h2: { fontSize: 20, fontWeight: "500" as const, letterSpacing: 0.2 },
  h3: { fontSize: 16, fontWeight: "600" as const, letterSpacing: 0.2 },
  body: { fontSize: 15, fontWeight: "400" as const },
  bodySmall: { fontSize: 13, fontWeight: "400" as const },
  caption: { fontSize: 11, fontWeight: "400" as const, letterSpacing: 0.5 },
  button: { fontSize: 14, fontWeight: "600" as const, letterSpacing: 1 },
  price: { fontSize: 16, fontWeight: "600" as const },
};
