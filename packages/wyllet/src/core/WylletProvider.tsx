import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import type { Address } from 'viem'
import { mainnet } from 'viem/chains'
import { useConfig, useConnection, useConnectionEffect } from 'wagmi'
import { createActivityTracker } from '../activity/activity'
import type { WylletAuthAdapter } from '../auth/types'
import { useAuthController } from '../auth/useAuthController'
import { WylletPanel } from '../components/Panel/WylletPanel'
import { SafeBoundary } from '../components/SafeBoundary'
import { Toaster } from '../components/Toaster'
import { getRegistration, type AppInfo } from '../config/registry'
import { en, format, type Messages } from '../i18n/en'
import { css as baseCss } from '../styles/css'
import { buildThemeCss } from '../theme/cssVars'
import { obsidianTheme, porcelainTheme } from '../theme/presets'
import type { ColorMode, ThemeInput } from '../theme/types'
import { createToastStore } from '../toast/toastStore'
import { createCustomTokenStore } from '../tokens/customTokens'
import { defaultTokens, toTokenList, type TokenEntry, type TokenList } from '../tokens/tokens'
import { matchesShortcut, storage, storageKey } from '../utils'
import { defaultWallets } from '../wallets/presets'
import type { Wallet } from '../wallets/types'
import { useStore } from './createStore'
import {
  useWylletContext,
  WylletContext,
  type AccountTab,
  type Appearance,
  type CustomAvatarProps,
  type OpenOptions,
  type PanelView,
  type ResolvedOptions,
  type WylletContextValue,
  type WylletSlot,
} from './context'

export interface WylletProviderProps {
  children: ReactNode
  /** A theme, or `{ light, dark }` to follow `colorMode`. Defaults to Porcelain (light) + Obsidian (dark). */
  theme?: ThemeInput
  /** Only used with a `{ light, dark }` theme pair. Default `auto` (follows the OS). */
  colorMode?: ColorMode
  appearance?: Appearance
  /** Overrides app info passed to `getDefaultConfig`. */
  appInfo?: Partial<AppInfo>
  /** Overrides the wallet list passed to `getDefaultConfig` (needed with a hand-written wagmi config). */
  wallets?: Wallet[]
  /**
   * Tokens shown in the account panel, for everyone. `'default'` = blue chips on popular chains, `false` = native only,
   * or your own list (`TokenList` or a flat `TokenEntry[]`). Combine with the defaults via `withDefaultTokens(...)`.
   * List order is display priority; `pinned: true` keeps a token on top.
   */
  tokens?: TokenList | TokenEntry[] | 'default' | false
  /** Arrange the Networks tab: these chain ids first, in this order, then the rest in config order. */
  chainOrder?: number[]
  /** Also let users import their own ERC-20s by contract address (saved in their browser). Default `false`. */
  allowTokenImport?: boolean
  /** WalletConnect project id, for hand-written wagmi configs (taken from `getDefaultConfig` otherwise). */
  walletConnectProjectId?: string
  /** Keyboard shortcut that toggles the panel, e.g. `'mod+k'` (⌘K / Ctrl+K). Off by default. */
  shortcut?: string
  /** Rename or translate any string. */
  messages?: Partial<Messages>
  /** Extra class names for individual elements. */
  classNames?: Partial<Record<WylletSlot, string>>
  /** Custom chain icons by chain id. */
  chainIcons?: Record<number, string>
  /** Replace the generated gradient avatar. */
  avatar?: ComponentType<CustomAvatarProps>
  /** Sign-In With Ethereum (or any signature auth). */
  auth?: WylletAuthAdapter
  /** Custom footer content in the connect panel (replaces the terms notice). */
  disclaimer?: ReactNode
  /** Resolve ENS names and avatars (requires mainnet in your config). Default `true`. */
  ens?: boolean
  /** Inject Wyllet's stylesheet. Set `false` and import `wyllet/styles.css` yourself for strict CSP. */
  injectStyles?: boolean
  onConnect?: (info: { address: Address; chainId: number; connectorId: string; isReconnected: boolean }) => void
  onDisconnect?: () => void
}

const RECENT_KEY = storageKey('recentWallets')

const defaultAppearance: Required<Appearance> = {
  presentation: 'drawer',
  drawerSide: 'right',
  identityCard: false,
  cardTilt: true,
  accountTabs: ['tokens', 'activity', 'networks'],
  closeOnConnect: true,
  tokenSort: 'balance',
  walletDirectory: true,
  walletSearch: 'auto',
  branding: true,
  mobileSheet: true,
  toastPosition: 'top-center',
  disableAnimations: false,
}

const defaultTheme: ThemeInput = { light: porcelainTheme(), dark: obsidianTheme() }

export function WylletProvider(props: WylletProviderProps) {
  const {
    children,
    theme = defaultTheme,
    colorMode = 'auto',
    appearance,
    appInfo,
    wallets,
    tokens = 'default',
    allowTokenImport = false,
    chainOrder,
    walletConnectProjectId,
    shortcut,
    messages,
    classNames,
    chainIcons,
    avatar,
    auth: authAdapter,
    disclaimer,
    ens = true,
    injectStyles = true,
    onConnect,
    onDisconnect,
  } = props

  const config = useConfig()
  const registration = getRegistration(config)
  const scope = `wy${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const t = useMemo<Messages>(() => ({ ...en, ...messages }), [messages])

  const options = useMemo<ResolvedOptions>(
    () => ({
      appInfo: { name: 'this app', ...registration?.appInfo, ...appInfo },
      wallets: wallets ?? registration?.wallets ?? defaultWallets(),
      appearance: { ...defaultAppearance, ...appearance },
      classNames: classNames ?? {},
      chainIcons: chainIcons ?? {},
      tokens: tokens === 'default' ? defaultTokens : tokens === false ? {} : toTokenList(tokens),
      chainOrder: chainOrder ?? [],
      walletConnectProjectId: walletConnectProjectId ?? registration?.walletConnectProjectId,
      avatar,
      disclaimer,
      shortcut: shortcut ?? null,
      allowTokenImport,
      ens: ens && config.chains.some((c) => c.id === mainnet.id),
    }),
    [registration, appInfo, wallets, appearance, classNames, chainIcons, tokens, allowTokenImport, chainOrder, walletConnectProjectId, avatar, disclaimer, shortcut, ens, config.chains],
  )

  // Imperative stores live for the lifetime of the provider.
  const latest = useRef({ config, t })
  latest.current = { config, t }
  const [toasts] = useState(createToastStore)
  const [activity] = useState(() =>
    createActivityTracker({ getConfig: () => latest.current.config, getMessages: () => latest.current.t, toast: toasts.api }),
  )
  useEffect(() => activity.resume(), [activity])
  const [customTokens] = useState(createCustomTokenStore)

  // Panel state
  const [view, setView] = useState<PanelView | null>(null)
  const [tab, setTab] = useState<AccountTab>('tokens')
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const open = useCallback((next: PanelView, opts: OpenOptions = {}) => {
    setAnchor(opts.anchor ? opts.anchor.getBoundingClientRect() : null)
    if (opts.tab) setTab(opts.tab)
    setView(next)
  }, [])
  const close = useCallback(() => setView(null), [])
  const panel = useMemo(() => ({ view, tab, anchor, open, close, setTab }), [view, tab, anchor, open, close])

  const [recentWalletIds, setRecent] = useState<string[]>([])
  useEffect(() => setRecent(storage.get<string[]>(RECENT_KEY, [], (v) => (v as unknown[]).filter((x): x is string => typeof x === 'string'))), [])
  const markRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 3)
      storage.set(RECENT_KEY, next)
      return next
    })
  }, [])

  const auth = useAuthController(authAdapter)
  const { address, chainId, chain, status } = useConnection()

  // Activity timeline: connects, disconnects and network switches.
  const lastAddress = useRef<Address | undefined>(undefined)
  if (address) lastAddress.current = address
  const callbacks = useRef({ onConnect, onDisconnect })
  callbacks.current = { onConnect, onDisconnect }
  useConnectionEffect({
    onConnect({ address: a, chainId: c, connector, isReconnected }) {
      if (!isReconnected) activity.log({ kind: 'connect', status: 'info', account: a, chainId: c, title: format(latest.current.t.activityConnected, { name: connector.name }) })
      callbacks.current.onConnect?.({ address: a, chainId: c, connectorId: connector.id, isReconnected })
    },
    onDisconnect() {
      if (lastAddress.current) activity.log({ kind: 'disconnect', status: 'info', account: lastAddress.current, title: latest.current.t.activityDisconnected })
      callbacks.current.onDisconnect?.()
      setView((v) => (v === 'account' ? null : v))
    },
  })
  const previousChain = useRef(chainId)
  useEffect(() => {
    const before = previousChain.current
    previousChain.current = chainId
    if (status !== 'connected' || !address || before === undefined || chainId === undefined || before === chainId) return
    activity.log({ kind: 'network', status: 'info', account: address, chainId, title: format(latest.current.t.activitySwitched, { name: chain?.name ?? `#${chainId}` }) })
  }, [chainId, chain, address, status, activity])

  // Global keyboard shortcut.
  useEffect(() => {
    if (!options.shortcut) return
    const combo = options.shortcut
    const onKey = (e: KeyboardEvent) => {
      if (!matchesShortcut(e, combo)) return
      e.preventDefault()
      setView((v) => (v ? null : status === 'connected' && !(auth.enabled && !auth.isSignedIn(address)) ? 'account' : 'connect'))
      setAnchor(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [options.shortcut, status, address, auth])

  const value = useMemo<WylletContextValue>(
    () => ({ scope, options, t, panel, toasts, activity, customTokens, auth, recentWalletIds, markRecent }),
    [scope, options, t, panel, toasts, activity, customTokens, auth, recentWalletIds, markRecent],
  )

  const themeCss = useMemo(() => buildThemeCss(theme, colorMode, scope), [theme, colorMode, scope])

  return (
    <WylletContext.Provider value={value}>
      {injectStyles && <style data-wyllet-styles="">{baseCss}</style>}
      <style data-wyllet-theme={scope}>{themeCss}</style>
      {children}
      <SafeBoundary onError={close} resetKey={view}>
        <WylletPanel />
      </SafeBoundary>
      <ToasterHost />
    </WylletContext.Provider>
  )
}

/** Toasts behind their own safety net, which resets whenever the toast list changes. */
function ToasterHost() {
  const { toasts } = useWylletContext()
  const list = useStore(toasts.store)
  return (
    <SafeBoundary resetKey={list}>
      <Toaster />
    </SafeBoundary>
  )
}
