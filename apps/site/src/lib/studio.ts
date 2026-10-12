import type { Appearance, BlurScale, ColorMode, Messages, Presentation, RadiusScale, ThemeInput } from 'wyllet'
import { auroraTheme, obsidianTheme, porcelainTheme, terminalTheme } from 'wyllet'

export type Preset = 'auto' | 'obsidian' | 'porcelain' | 'aurora' | 'terminal'
export type FontChoice = 'default' | 'system' | 'rounded' | 'mono'
export type Locale = 'en' | 'es'
export type NetworkOrder = 'config' | 'l2-first' | 'zora-first'

/** `chainOrder` values for the Studio's network-order control. */
export const networkOrders: Record<NetworkOrder, number[]> = {
  config: [],
  'l2-first': [8453, 10, 42161, 324, 59144, 534352],
  'zora-first': [7777777, 8453],
}

/** Everything the customizer panel can change. */
export interface StudioSettings {
  preset: Preset
  /** `null` = the preset's own accent. */
  accent: string | null
  radius: RadiusScale
  font: FontChoice
  overlayBlur: BlurScale
  presentation: Presentation
  drawerSide: 'left' | 'right'
  identityCard: boolean
  cardTilt: boolean
  closeOnConnect: boolean
  toastPosition: NonNullable<Appearance['toastPosition']>
  branding: boolean
  disableAnimations: boolean
  buttonSize: 'sm' | 'md' | 'lg'
  display: 'full' | 'compact' | 'avatar'
  shortcut: boolean
  tokenImport: boolean
  tokenSort: 'balance' | 'list'
  networkOrder: NetworkOrder
  siwe: boolean
  locale: Locale
}

export const defaultSettings: StudioSettings = {
  preset: 'obsidian',
  accent: null,
  radius: 'round',
  font: 'default',
  overlayBlur: 'subtle',
  presentation: 'drawer',
  drawerSide: 'right',
  identityCard: false,
  cardTilt: true,
  closeOnConnect: true,
  toastPosition: 'top-center',
  branding: true,
  disableAnimations: false,
  buttonSize: 'md',
  display: 'full',
  shortcut: true,
  tokenImport: false,
  tokenSort: 'balance',
  networkOrder: 'config',
  siwe: false,
  locale: 'en',
}

export const presetAccent: Record<Exclude<Preset, 'auto'>, string> = {
  obsidian: '#48ECD2',
  porcelain: '#111114',
  aurora: '#B69CFF',
  terminal: '#3DFF8F',
}

export const accents = ['#48ECD2', '#C6F432', '#3D7BFF', '#9B7CFF', '#FF4FA3', '#FF6B57', '#FFB224', '#111114']

export const fonts: Record<Exclude<FontChoice, 'default'>, string> = {
  system: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  rounded: "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
}

export const readableOn = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#0A0B07' : '#FFFFFF'
}

export const isDarkPreset = (p: Preset) => p === 'obsidian' || p === 'aurora' || p === 'terminal'

export function buildTheme(s: StudioSettings): { theme: ThemeInput; colorMode: ColorMode } {
  const options = {
    ...(s.accent && { accentColor: s.accent, accentColorForeground: readableOn(s.accent) }),
    radius: s.radius,
    ...(s.font !== 'default' && { fontFamily: fonts[s.font] }),
    overlayBlur: s.overlayBlur,
  }
  switch (s.preset) {
    case 'obsidian':
      return { theme: obsidianTheme(options), colorMode: 'dark' }
    case 'porcelain':
      return { theme: porcelainTheme(options), colorMode: 'light' }
    case 'aurora':
      return { theme: auroraTheme(options), colorMode: 'dark' }
    case 'terminal':
      return { theme: terminalTheme(options), colorMode: 'dark' }
    default:
      return { theme: { light: porcelainTheme(options), dark: obsidianTheme(options) }, colorMode: 'auto' }
  }
}

/** Partial translation — any string can be overridden. */
export const spanish: Partial<Messages> = {
  connect: 'Conectar',
  connectTo: 'Conectar a {app}',
  continueWith: 'Continuar con {name}',
  lastUsed: 'Último usado',
  detected: 'Detectada',
  allWallets: 'Todas las billeteras',
  searchWallets: 'Buscar billeteras…',
  scanWithPhone: 'Escanear con móvil',
  noWallet: 'No tengo billetera',
  requesting: 'Esperando a {name}',
  confirmInWallet: 'Aprueba la solicitud en tu billetera para continuar.',
  connected: 'Conectado',
  copyAddress: 'Copiar',
  receive: 'Recibir',
  explorer: 'Explorador',
  disconnect: 'Salir',
  tabTokens: 'Tokens',
  tabActivity: 'Actividad',
  tabNetworks: 'Redes',
  gas: 'Gas',
}
