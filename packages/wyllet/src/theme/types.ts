/**
 * Every visual decision Wyllet makes is a token in this object.
 * Tokens are emitted as CSS custom properties (`--wy-*`), so you can also
 * override any of them from your own stylesheet.
 */
export interface Theme {
  colors: {
    /** Brand color: primary actions, focus, live indicators. */
    accent: string
    /** Text/icon color placed on top of `accent`. */
    accentForeground: string
    /** Second brand color, blended with `accent` in gradients (identity card, hairlines). */
    accentSecondary: string
    /** Panel background. */
    background: string
    /** Rows, cards and secondary buttons. */
    surface: string
    surfaceHover: string
    surfaceActive: string
    border: string
    /** Primary text. */
    text: string
    /** Secondary text (labels, captions). */
    textSecondary: string
    /** Tertiary text (hints, disabled, kbd). */
    textTertiary: string
    /** Page overlay behind the panel. */
    overlay: string
    success: string
    danger: string
    warning: string
    /** The Wyllet Island button. */
    islandBackground: string
    islandText: string
    qrForeground: string
    qrBackground: string
  }
  radii: {
    panel: string
    card: string
    button: string
    /** Small elements: badges, kbd, chips. */
    badge: string
    /** Wallet icons. */
    icon: string
  }
  fonts: {
    body: string
    /** Used for labels, addresses, numbers and keyboard hints. */
    mono: string
  }
  shadows: {
    panel: string
    island: string
    toast: string
  }
  effects: {
    /** `backdrop-filter` applied to the page overlay. */
    overlayBlur: string
    /** `backdrop-filter` applied to the panel (glass themes). */
    panelBlur: string
    /** Opacity of the accent glow behind active elements (0–1). */
    glow: string
  }
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

export type RadiusScale = 'sharp' | 'soft' | 'round' | 'pill'
export type BlurScale = 'none' | 'subtle' | 'heavy'

/** Quick knobs accepted by every theme preset. */
export interface ThemeOptions {
  accentColor?: string
  accentColorForeground?: string
  accentSecondary?: string
  radius?: RadiusScale
  fontFamily?: string
  overlayBlur?: BlurScale
  /** Escape hatch: deep-merged on top of the preset after the knobs above. */
  overrides?: DeepPartial<Theme>
}

/** Either a single theme, or a light/dark pair that follows `colorMode`. */
export type ThemeInput = Theme | { light: Theme; dark: Theme }

export type ColorMode = 'light' | 'dark' | 'auto'
