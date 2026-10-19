/**
 * Saudi Soft design tokens for React Native (iOS, Android) and shared logic.
 *
 * Source of truth: saudi-soft `skills/saudi-soft/references/theme-bridge.css`.
 * Every value below mirrors a CSS variable there (light = `:root`, dark = `.dark`).
 * Edit this file and theme-bridge.css in the same change, value for value.
 *
 * Copy this file into the app as `src/theme/tokens.ts`. It has no imports, so
 * logic, pieces and tests can all read it. Web pieces read the CSS variables
 * instead (Tailwind classes such as `bg-primary`), never this file.
 *
 * Changes from CSS, on purpose:
 * - `rgb(r g b / a)` is written as `rgba(r, g, b, a)`.
 * - rem radius values are written in points (0.75rem = 12).
 */

/** SA green ladder (`--sa-50` … `--sa-900`). Rebrands replace these values only. */
export const sa = {
  light: {
    50: '#f3fcf6',
    100: '#dff6e7',
    200: '#b8eacb',
    300: '#88d8ad',
    400: '#54c08a',
    500: '#25935f',
    600: '#1b8354',
    700: '#166a45',
    800: '#14573a',
    900: '#104631',
  },
  dark: {
    50: '#0c1f16',
    100: '#0f2a1c',
    200: '#14573a',
    300: '#1b8354',
    400: '#25935f',
    500: '#3dba78',
    600: '#3daf6e',
    700: '#2f8f5a',
    800: '#1f6b42',
    900: '#88d8ad',
  },
} as const;

/** Neutral ladder (`--gray-*`). Dark mode inverts it. */
export const gray = {
  light: {
    0: '#ffffff',
    25: '#fcfcfd',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d2d6db',
    400: '#9da4ae',
    600: '#4d5761',
    700: '#384250',
    900: '#111927',
    950: '#0d121c',
  },
  dark: {
    0: '#0b1220',
    25: '#0f1724',
    50: '#141c2b',
    100: '#1c2536',
    200: '#2a3447',
    300: '#3d4a5c',
    400: '#6b7789',
    600: '#b0b8c4',
    700: '#d0d5dd',
    900: '#f0f2f5',
    950: '#ffffff',
  },
} as const;

/** Semantic colors. Names follow the shadcn variables in camelCase. */
export const colors = {
  light: {
    background: gray.light[25],
    foreground: gray.light[950],
    card: gray.light[0],
    cardForeground: gray.light[950],
    popover: gray.light[0],
    popoverForeground: gray.light[950],

    primary: sa.light[600], // #1B8354, also the iOS app tint
    primaryForeground: '#ffffff',
    primaryHover: sa.light[700], // #166A45
    primaryActive: sa.light[800],
    primarySubtle: sa.light[50],

    secondary: sa.light[700],
    secondaryForeground: '#ffffff',
    muted: gray.light[100],
    mutedForeground: gray.light[600],
    accent: sa.light[500],
    accentForeground: '#ffffff',
    destructive: '#d92d20',
    destructiveForeground: '#ffffff',

    border: gray.light[200],
    input: gray.light[200],
    ring: sa.light[600],
    label: gray.light[700],

    sidebar: gray.light[0],
    sidebarForeground: gray.light[900],
    sidebarPrimary: sa.light[600],
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: sa.light[50],
    sidebarAccentForeground: sa.light[700],
    sidebarBorder: gray.light[200],
    sidebarRing: sa.light[600],

    chart1: sa.light[600],
    chart2: sa.light[400],
    chart3: sa.light[800],
    chart4: sa.light[300],
    chart5: sa.light[500],

    success: '#079455',
    warning: '#dc6803',
    info: '#1570ef',
    statusSuccessBg: '#ecfdf3',
    statusSuccessBorder: '#abefc6',
    statusWarningBg: '#fffaeb',
    statusWarningBorder: '#fedf89',
    statusErrorBg: '#fef3f2',
    statusErrorBorder: '#fecdca',
    statusInfoBg: '#eff8ff',
    statusInfoBorder: '#b2ddff',

    overlay: 'rgba(13, 18, 28, 0.4)',
  },
  dark: {
    background: gray.dark[25],
    foreground: gray.dark[950],
    card: gray.dark[0],
    cardForeground: gray.dark[950],
    popover: gray.dark[0],
    popoverForeground: gray.dark[950],

    primary: sa.dark[600],
    primaryForeground: '#0b1220',
    primaryHover: sa.dark[500],
    primaryActive: sa.dark[700],
    primarySubtle: sa.dark[50],

    secondary: sa.dark[700],
    secondaryForeground: '#ffffff',
    muted: gray.dark[100],
    mutedForeground: gray.dark[600],
    accent: sa.dark[500],
    accentForeground: '#0b1220',
    destructive: '#f04438',
    destructiveForeground: '#ffffff',

    border: gray.dark[200],
    input: gray.dark[200],
    ring: sa.dark[600],
    label: gray.dark[700],

    sidebar: gray.dark[0],
    sidebarForeground: gray.dark[900],
    sidebarPrimary: sa.dark[600],
    sidebarPrimaryForeground: '#0b1220',
    sidebarAccent: sa.dark[50],
    sidebarAccentForeground: sa.dark[900],
    sidebarBorder: gray.dark[200],
    sidebarRing: sa.dark[600],

    chart1: sa.dark[600],
    chart2: sa.dark[400],
    chart3: sa.dark[300],
    chart4: sa.dark[500],
    chart5: sa.dark[700],

    success: '#47cd89',
    warning: '#fdb022',
    info: '#53b0fd',
    statusSuccessBg: 'rgba(7, 148, 85, 0.15)',
    statusSuccessBorder: 'rgba(71, 205, 137, 0.4)',
    statusWarningBg: 'rgba(220, 104, 3, 0.15)',
    statusWarningBorder: 'rgba(253, 176, 34, 0.4)',
    statusErrorBg: 'rgba(240, 68, 56, 0.15)',
    statusErrorBorder: 'rgba(240, 68, 56, 0.4)',
    statusInfoBg: 'rgba(21, 112, 239, 0.15)',
    statusInfoBorder: 'rgba(83, 176, 253, 0.4)',

    overlay: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

/** Radius ladder in points: controls 10 (md), cards and dialogs 12 (lg). */
export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

/**
 * Spacing scale in points. Keys are Tailwind steps, so web `gap-4` ports to
 * `gap={4}` (16pt) with no arithmetic.
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/**
 * Font families. Native loads each weight as its own family
 * (`@expo-google-fonts/ibm-plex-sans-arabic`), so pick the family by weight
 * and leave `fontWeight` unset. System chrome (bars, tabs, alerts, menus)
 * keeps the system font.
 */
export const fontFamily = {
  native: {
    400: 'IBMPlexSansArabic_400Regular',
    500: 'IBMPlexSansArabic_500Medium',
    600: 'IBMPlexSansArabic_600SemiBold',
    700: 'IBMPlexSansArabic_700Bold',
  },
  /** Mirrors `--font-sans-soft`; used by web pieces through CSS. */
  web: '"IBM Plex Sans Arabic", "Work Sans", ui-sans-serif, system-ui, sans-serif',
  /** Mirrors `--font-mono-soft`. */
  webMono: '"Inconsolata", ui-monospace, SFMono-Regular, monospace',
} as const;

/** Type scale (size / line height in points), Tailwind defaults. */
export const fontSize = {
  xs: { size: 12, lineHeight: 16 },
  sm: { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg: { size: 18, lineHeight: 28 },
  xl: { size: 20, lineHeight: 28 },
  '2xl': { size: 24, lineHeight: 32 },
  '3xl': { size: 30, lineHeight: 36 },
} as const;

/** App shell metrics (web Soft shell; iOS and Android use system bars). */
export const layout = {
  sidebarWidth: 280,
  sidebarCollapsedWidth: 72,
  topbarHeight: 64,
  /** Window width where the size class becomes `regular` (Tailwind `md`). */
  regularMinWidth: 768,
} as const;

/** Elevation ladder (`--soft-shadow-e1…e6`) as React Native `boxShadow` strings. */
export const shadow = {
  light: {
    e1: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
    e2: '0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px 0 rgba(16, 24, 40, 0.06)',
    e3: '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
    e4: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
    e5: '0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)',
    e6: '0 24px 48px -12px rgba(16, 24, 40, 0.18)',
  },
  dark: {
    e1: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    e2: '0 2px 4px -1px rgba(0, 0, 0, 0.35)',
    e3: '0 4px 8px -2px rgba(0, 0, 0, 0.4)',
    e4: '0 8px 16px -4px rgba(0, 0, 0, 0.45)',
    e5: '0 16px 32px -8px rgba(0, 0, 0, 0.5)',
    e6: '0 24px 48px -12px rgba(0, 0, 0, 0.55)',
  },
} as const;

/** Soft gradients (`--gradient-1`, `--gradient-2`), derived from the SA ladder. */
export const gradient = {
  gradient1: { angle: 90, from: 600, to: 500 },
  gradient2: { angle: 45, from: 700, to: 600 },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof (typeof colors)['light'];
export type RadiusToken = keyof typeof radius;
export type SpaceToken = keyof typeof spacing;
export type FontWeightToken = keyof (typeof fontFamily)['native'];
export type FontSizeToken = keyof typeof fontSize;
export type ShadowToken = keyof (typeof shadow)['light'];

/** `alpha('#1b8354', 0.1)` → `'rgba(27, 131, 84, 0.1)'`. Use for Soft tints such as `from-primary/10`. */
export function alpha(hex: string, opacity: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** CSS `linear-gradient(...)` string for RN `experimental_backgroundImage` or web. */
export function gradientCss(name: keyof typeof gradient, scheme: ColorScheme): string {
  const { angle, from, to } = gradient[name];
  return `linear-gradient(${angle}deg, ${sa[scheme][from]} 0%, ${sa[scheme][to]} 100%)`;
}
