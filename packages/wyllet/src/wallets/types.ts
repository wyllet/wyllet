import type { CreateConnectorFn } from 'wagmi'

export interface WalletDownloadUrls {
  browserExtension?: string
  ios?: string
  android?: string
  website?: string
}

/**
 * A wallet as it appears in the connect modal. Wyllet resolves *how* to connect at click time:
 *
 * 1. an announced EIP-6963 provider whose `rdns` matches  → connect directly
 * 2. a dedicated connector (`createConnector` / `connectorId`) → connect directly
 * 3. `walletConnect` support → QR code (desktop) or deep link (mobile)
 * 4. otherwise → "Get {wallet}" screen with download links
 */
export interface Wallet {
  /** Stable id. Also used as the "recent wallet" key. */
  id: string
  name: string
  /** Image URL or data URI. Installed wallets use the icon they announce instead. */
  icon: string
  /** Shown behind transparent icons. */
  iconBackground?: string
  /** EIP-6963 reverse-DNS identifier(s) used to detect the browser extension. */
  rdns?: string | readonly string[]
  /** Id of a wagmi connector in your config that should be used for this wallet. */
  connectorId?: string
  /** Supply a dedicated wagmi connector (SDK wallets, embedded wallets, burner, ...). */
  createConnector?: () => CreateConnectorFn
  /** Supports WalletConnect. `mobileUri` builds the deep link that opens the app on phones. */
  walletConnect?: { mobileUri?: (uri: string) => string }
  downloadUrls?: WalletDownloadUrls
  /** Short description used on the "Get wallet" screen. */
  description?: string
  /** Wallets with `featured: true` are surfaced in the "Popular" group. Defaults to true. */
  featured?: boolean
}

/** Options accepted by every built-in wallet preset. */
export interface WalletPresetOptions {
  /** Replace how this wallet connects, e.g. `() => coinbaseWallet({ appName })` from `wagmi/connectors`. */
  connector?: () => CreateConnectorFn
  /** Override anything else (name, icon, links...). */
  overrides?: Partial<Omit<Wallet, 'createConnector'>>
}
