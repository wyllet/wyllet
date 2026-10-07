// Provider & config
export { WylletProvider, type WylletProviderProps } from './core/WylletProvider'
export { getDefaultConfig, type DefaultConfigParameters } from './config/getDefaultConfig'
export type { AppInfo } from './config/registry'
export type { AccountTab, Appearance, CustomAvatarProps, OpenOptions, PanelView, Presentation, WylletSlot } from './core/context'

// Components
export { WylletButton, useWylletButton, type WylletButtonProps, type WylletButtonState } from './components/WylletButton'
export { ConnectGate, type ConnectGateProps, type GateReason } from './components/ConnectGate'
export { Avatar, addressGradient, type AvatarProps } from './components/Avatar'
export { ChainIcon, type ChainIconProps } from './components/ChainIcon'
export { TokenIcon, type TokenIconProps } from './components/TokenIcon'
export { WylletMark } from './components/WylletMark'
export { QRCode, type QRCodeProps } from './components/primitives/QRCode'

// Hooks
export {
  useCopyToClipboard,
  useWyllet,
  useWylletActivity,
  useWylletAuth,
  useWylletChains,
  useWylletToast,
  useWylletTokens,
  type ListedToken,
} from './hooks'
export { useWalletOptions, type WalletGroup, type WalletOption } from './hooks/useWalletOptions'

// Theming
export {
  auroraTheme,
  createTheme,
  obsidianTheme,
  porcelainTheme,
  terminalTheme,
  themeToCssVars,
  type BlurScale,
  type ColorMode,
  type DeepPartial,
  type RadiusScale,
  type Theme,
  type ThemeInput,
  type ThemeOptions,
} from './theme'

// Wallets
export {
  browserWallet,
  burnerWallet,
  coinbaseWallet,
  defaultWallets,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from './wallets/presets'
export { burner, type BurnerOptions } from './wallets/burner'
export type { Wallet, WalletDownloadUrls, WalletPresetOptions } from './wallets/types'

// Chains & tokens
export { customChain, type ChainExtras, type CustomChainInput } from './chains/custom'
export { popularChains, popularTestnets } from './chains/popular'
export { defaultTokens, tokenIconUri, toTokenList, withDefaultTokens, type Token, type TokenEntry, type TokenList } from './tokens/tokens'

// Auth
export type { AuthStatus, WylletAuthAdapter } from './auth/types'

// Toasts & activity
export type { Toast, ToastApi, ToastOptions, ToastPosition, ToastStatus } from './toast/toastStore'
export type { ActivityItem, ActivityKind, ActivityStatus } from './activity/activity'

// i18n & utils
export { en, type Messages } from './i18n/en'
export { formatAmount, shortenAddress } from './utils'
