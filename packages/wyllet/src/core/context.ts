import { createContext, useContext, type ComponentType, type ReactNode } from 'react'
import type { ActivityTracker } from '../activity/activity'
import type { AuthController } from '../auth/useAuthController'
import type { AppInfo } from '../config/registry'
import type { Messages } from '../i18n/en'
import type { ToastController, ToastPosition } from '../toast/toastStore'
import type { CustomTokenStore } from '../tokens/customTokens'
import type { TokenList } from '../tokens/tokens'
import type { Wallet } from '../wallets/types'

export type PanelView = 'connect' | 'account'
export type AccountTab = 'tokens' | 'activity' | 'networks'

/**
 * How the Wyllet panel enters the screen:
 * - `drawer`: full-height side panel (default)
 * - `popover`: anchored to the button that opened it, like a dropdown
 * - `modal`: centered dialog
 * Phones always get a draggable bottom sheet unless `mobileSheet` is false.
 */
export type Presentation = 'drawer' | 'popover' | 'modal'

/** Elements you can attach your own class names to (Tailwind friendly). */
export type WylletSlot = 'overlay' | 'panel' | 'island' | 'walletRow' | 'primaryButton' | 'identityCard' | 'toast'

export interface CustomAvatarProps {
  address: string
  ensImage?: string | null
  size: number
}

export interface Appearance {
  /** Default `drawer`. */
  presentation?: Presentation
  /** Side the drawer slides in from. Default `right`. */
  drawerSide?: 'left' | 'right'
  /** Show a generative holographic card instead of the compact account summary. Default `false`. */
  identityCard?: boolean
  /** 3D tilt + light sheen that follows the pointer on the identity card. Default `true`. */
  cardTilt?: boolean
  /** Tabs shown in the account panel, in order. Default all three. */
  accountTabs?: AccountTab[]
  /** Close the panel automatically after a successful connection. Default `true`. */
  closeOnConnect?: boolean
  /** Search field in the wallet list. Default `auto` (6+ wallets). */
  walletSearch?: boolean | 'auto'
  /** “Powered by Wyllet” badge in the panel footers. Default `true`. */
  branding?: boolean
  /** Bottom sheet on phones. Default `true`. */
  mobileSheet?: boolean
  /**
   * Token order in the Tokens tab. `balance` (default): pinned, then tokens you hold, then the rest — each in list order.
   * `list`: pinned first, then exactly your list order.
   */
  tokenSort?: 'balance' | 'list'
  /**
   * "All wallets": a searchable list of ~500 WalletConnect wallets (official logos and deep links from the
   * WalletConnect registry), opened from the WalletConnect option. Requires a WalletConnect project id. Default `true`.
   */
  walletDirectory?: boolean
  /** Default `top-center` (the activity island). */
  toastPosition?: ToastPosition
  /** Turn off all transitions. `prefers-reduced-motion` is respected automatically. */
  disableAnimations?: boolean
}

export interface ResolvedOptions {
  appInfo: AppInfo
  wallets: Wallet[]
  appearance: Required<Appearance>
  classNames: Partial<Record<WylletSlot, string>>
  chainIcons: Record<number, string>
  tokens: TokenList
  avatar?: ComponentType<CustomAvatarProps>
  disclaimer?: ReactNode
  shortcut: string | null
  /** Users can import ERC-20 tokens by contract address. */
  allowTokenImport: boolean
  /** WalletConnect project id (from `getDefaultConfig` or the provider prop); enables the wallet directory. */
  walletConnectProjectId?: string
  /** Chain ids shown first in the Networks tab, in this order. */
  chainOrder: number[]
  /** Show an ENS name/avatar when mainnet is configured. */
  ens: boolean
}

export interface OpenOptions {
  /** Element the popover presentation anchors to. */
  anchor?: Element | null
  /** Account panel tab to show. */
  tab?: AccountTab
}

export interface PanelState {
  view: PanelView | null
  tab: AccountTab
  anchor: DOMRect | null
  open(view: PanelView, options?: OpenOptions): void
  close(): void
  setTab(tab: AccountTab): void
}

export interface WylletContextValue {
  scope: string
  options: ResolvedOptions
  t: Messages
  panel: PanelState
  toasts: ToastController
  activity: ActivityTracker
  customTokens: CustomTokenStore
  auth: AuthController
  recentWalletIds: string[]
  markRecent(walletId: string): void
}

export const WylletContext = createContext<WylletContextValue | null>(null)

export function useWylletContext(): WylletContextValue {
  const ctx = useContext(WylletContext)
  if (!ctx) throw new Error('Wyllet hooks and components must be rendered inside <WylletProvider>.')
  return ctx
}
