// Light theme — matches the site's :root CSS vars
// oklch(1 0 0) = #ffffff, oklch(0.145 0 0) = #1a1a1a, etc.
export const COLORS = {
  // Core theme (light)
  bg: "#ffffff",           // oklch(1 0 0) --background
  fg: "#1a1a1a",           // oklch(0.145 0 0) --foreground
  card: "#ffffff",         // oklch(1 0 0) --card
  cardFg: "#1a1a1a",      // oklch(0.145 0 0) --card-foreground
  primary: "#2e2e2e",     // oklch(0.205 0 0) --primary
  primaryFg: "#fafafa",   // oklch(0.985 0 0) --primary-foreground
  secondary: "#f5f5f5",   // oklch(0.97 0 0) --secondary
  muted: "#f5f5f5",       // oklch(0.97 0 0) --muted
  mutedFg: "#737373",     // oklch(0.556 0 0) --muted-foreground
  border: "#e5e5e5",      // oklch(0.922 0 0) --border
  ring: "#a3a3a3",        // oklch(0.708 0 0) --ring

  // Semantic
  green: "#22c55e",       // success / allow
  red: "#ef4444",         // destructive / deny
  white: "#ffffff",
  black: "#000000",

  // Terminal (keep dark for contrast against light page)
  terminalBg: "#1a1a1a",
  terminalFg: "#e5e5e5",
  terminalGreen: "#4ade80",
  terminalRed: "#f87171",
  terminalYellow: "#facc15",
  terminalCyan: "#22d3ee",
  terminalMagenta: "#c084fc",
  terminalDim: "#737373",
};

export const FONTS = {
  sans: "'Geist', 'Inter', system-ui, -apple-system, sans-serif",
  mono: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
};
