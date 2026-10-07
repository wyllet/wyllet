import type { BlurScale, DeepPartial, RadiusScale, Theme, ThemeOptions } from './types'

const FONT_BODY =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
const FONT_MONO = "'JetBrains Mono', 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

const RADII: Record<RadiusScale, Theme['radii']> = {
  sharp: { panel: '4px', card: '3px', button: '3px', badge: '2px', icon: '3px' },
  soft: { panel: '14px', card: '10px', button: '10px', badge: '6px', icon: '9px' },
  round: { panel: '24px', card: '16px', button: '14px', badge: '8px', icon: '12px' },
  pill: { panel: '28px', card: '20px', button: '999px', badge: '999px', icon: '14px' },
}

const BLUR: Record<BlurScale, string> = {
  none: 'none',
  subtle: 'blur(3px)',
  heavy: 'blur(16px) saturate(120%)',
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Deep-merges `overrides` into `base` without mutating either. */
export function mergeDeep<T>(base: T, overrides?: DeepPartial<T>): T {
  if (!overrides) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue
    const current = out[key]
    out[key] = isObject(current) && isObject(value) ? mergeDeep(current, value) : value
  }
  return out as T
}

/** Build a theme from a base theme plus partial overrides. */
export function createTheme(base: Theme, overrides?: DeepPartial<Theme>): Theme {
  return mergeDeep(base, overrides)
}

function applyOptions(base: Theme, options: ThemeOptions = {}): Theme {
  const knobs: DeepPartial<Theme> = {
    colors: {
      ...(options.accentColor && { accent: options.accentColor }),
      ...(options.accentColorForeground && { accentForeground: options.accentColorForeground }),
      ...(options.accentSecondary && { accentSecondary: options.accentSecondary }),
    },
    ...(options.radius && { radii: RADII[options.radius] }),
    ...(options.fontFamily && { fonts: { body: options.fontFamily } }),
    ...(options.overlayBlur && { effects: { overlayBlur: BLUR[options.overlayBlur] } }),
  }
  return mergeDeep(mergeDeep(base, knobs), options.overrides)
}

const obsidian: Theme = {
  colors: {
    accent: '#48ECD2',
    accentForeground: '#03201B',
    accentSecondary: '#C6F432',
    background: '#0C0C10',
    surface: '#16161C',
    surfaceHover: '#1D1D25',
    surfaceActive: '#25252F',
    border: 'rgba(255, 255, 255, 0.075)',
    text: '#F2F2F5',
    textSecondary: '#9C9CAC',
    textTertiary: '#5E5E6E',
    overlay: 'rgba(4, 4, 8, 0.42)',
    success: '#4ADE80',
    danger: '#FF5A5F',
    warning: '#FBBF24',
    islandBackground: '#111116',
    islandText: '#F2F2F5',
    qrForeground: '#0C0C10',
    qrBackground: '#F4F4F6',
  },
  radii: RADII.round,
  fonts: { body: FONT_BODY, mono: FONT_MONO },
  shadows: {
    panel: '0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px -20px rgba(0,0,0,0.75), 0 12px 24px -12px rgba(0,0,0,0.5)',
    island: '0 0 0 1px rgba(255,255,255,0.07), 0 8px 24px -8px rgba(0,0,0,0.6)',
    toast: '0 0 0 1px rgba(255,255,255,0.08), 0 18px 40px -12px rgba(0,0,0,0.7)',
  },
  effects: { overlayBlur: BLUR.subtle, panelBlur: 'none', glow: '0.35' },
}

const porcelain: Theme = {
  colors: {
    accent: '#111114',
    accentForeground: '#FFFFFF',
    accentSecondary: '#7B61FF',
    background: '#FFFFFF',
    surface: '#F4F4F2',
    surfaceHover: '#ECECE9',
    surfaceActive: '#E3E3DF',
    border: 'rgba(17, 17, 20, 0.08)',
    text: '#111114',
    textSecondary: '#62626B',
    textTertiary: '#A0A0A8',
    overlay: 'rgba(240, 240, 236, 0.5)',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    islandBackground: '#FFFFFF',
    islandText: '#111114',
    qrForeground: '#111114',
    qrBackground: '#FFFFFF',
  },
  radii: RADII.round,
  fonts: { body: FONT_BODY, mono: FONT_MONO },
  shadows: {
    panel: '0 0 0 1px rgba(17,17,20,0.06), 0 30px 70px -24px rgba(17,17,20,0.28), 0 10px 20px -12px rgba(17,17,20,0.12)',
    island: '0 0 0 1px rgba(17,17,20,0.08), 0 6px 20px -8px rgba(17,17,20,0.18)',
    toast: '0 0 0 1px rgba(17,17,20,0.07), 0 16px 40px -14px rgba(17,17,20,0.3)',
  },
  effects: { overlayBlur: BLUR.none, panelBlur: 'none', glow: '0.18' },
}

const aurora: Theme = mergeDeep(obsidian, {
  colors: {
    accent: '#B69CFF',
    accentForeground: '#14092E',
    accentSecondary: '#5CE1FF',
    background: 'rgba(20, 16, 34, 0.58)',
    surface: 'rgba(255, 255, 255, 0.055)',
    surfaceHover: 'rgba(255, 255, 255, 0.09)',
    surfaceActive: 'rgba(255, 255, 255, 0.13)',
    border: 'rgba(255, 255, 255, 0.11)',
    overlay: 'rgba(10, 6, 24, 0.25)',
    islandBackground: 'rgba(28, 22, 46, 0.65)',
  },
  shadows: { panel: '0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 90px -20px rgba(0,0,0,0.6)' },
  effects: { panelBlur: 'blur(30px) saturate(180%)', glow: '0.5' },
})

const terminal: Theme = mergeDeep(obsidian, {
  colors: {
    accent: '#3DFF8F',
    accentForeground: '#001A0B',
    accentSecondary: '#3DFF8F',
    background: '#050705',
    surface: '#0C110D',
    surfaceHover: '#121A14',
    surfaceActive: '#18241B',
    border: 'rgba(61, 255, 143, 0.16)',
    text: '#D7FFE5',
    textSecondary: '#7FB894',
    textTertiary: '#3F6B4F',
    islandBackground: '#050705',
    islandText: '#D7FFE5',
  },
  radii: RADII.sharp,
  fonts: { body: FONT_MONO },
  shadows: {
    panel: '0 0 0 1px rgba(61,255,143,0.22), 0 0 60px -20px rgba(61,255,143,0.35)',
    island: '0 0 0 1px rgba(61,255,143,0.3)',
    toast: '0 0 0 1px rgba(61,255,143,0.25), 0 10px 30px -10px rgba(0,0,0,0.8)',
  },
  effects: { overlayBlur: BLUR.none, glow: '0.6' },
})

/** Deep graphite with Wyllet's signature mint accent. */
export const obsidianTheme = (options?: ThemeOptions): Theme => applyOptions(obsidian, options)
/** Warm paper white with ink-black actions. */
export const porcelainTheme = (options?: ThemeOptions): Theme => applyOptions(porcelain, options)
/** Frosted translucent glass with a violet → cyan glow. Best over colorful backgrounds. */
export const auroraTheme = (options?: ThemeOptions): Theme => applyOptions(aurora, options)
/** Monospace, sharp corners, phosphor green. For protocols with a hacker soul. */
export const terminalTheme = (options?: ThemeOptions): Theme => applyOptions(terminal, options)
