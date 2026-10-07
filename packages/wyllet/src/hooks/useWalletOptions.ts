import { useMemo, useSyncExternalStore } from 'react'
import { useConnectors, type Connector } from 'wagmi'
import { WALLET_ID_KEY } from '../config/getDefaultConfig'
import { useWylletContext } from '../core/context'
import { browserWallet } from '../wallets/presets'
import type { Wallet } from '../wallets/types'

export type WalletAction = 'connect' | 'walletConnect' | 'get'

export interface WalletOption {
  wallet: Wallet
  /** Connector used for a direct connection (installed extension or dedicated connector). */
  connector?: Connector
  installed: boolean
  recent: boolean
  /** What happens when the user picks this wallet. */
  action: WalletAction
}

export interface WalletGroup {
  id: 'installed' | 'popular' | 'more'
  wallets: WalletOption[]
}

const toArray = (v: string | readonly string[] | undefined) => (v === undefined ? [] : typeof v === 'string' ? [v] : [...v])

function matches(connector: Connector, wallet: Wallet): boolean {
  if ((connector as unknown as Record<string, unknown>)[WALLET_ID_KEY] === wallet.id) return true
  if (wallet.connectorId && connector.id === wallet.connectorId) return true
  const rdns = toArray(wallet.rdns)
  if (!rdns.length) return false
  return rdns.includes(connector.id) || toArray(connector.rdns).some((r) => rdns.includes(r))
}

/** EIP-6963 connectors are created from announced providers; wagmi gives them `id === rdns` (e.g. `io.metamask`). */
const isAnnounced = (c: Connector) => c.type === 'injected' && c.id.includes('.')

const hasWindowEthereum = () =>
  typeof window !== 'undefined' && !!(window as unknown as { ethereum?: unknown }).ethereum

const noopSubscribe = () => () => {}

/** Merges the configured wallet list with what's actually available in this browser. */
export function useWalletOptions(): { groups: WalletGroup[]; all: WalletOption[]; walletConnectConnector?: Connector } {
  const { options, recentWalletIds } = useWylletContext()
  const connectors = useConnectors()
  const injectedAvailable = useSyncExternalStore(noopSubscribe, hasWindowEthereum, () => false)

  return useMemo(() => {
    const wcConnector = connectors.find((c) => c.type === 'walletConnect')
    const used = new Set<string>()
    const result: WalletOption[] = []

    for (const wallet of options.wallets) {
      const connector = connectors.find((c) => matches(c, wallet))
      if (wallet.id === 'walletConnect' && !wcConnector) continue
      const installed = !!connector && isAnnounced(connector)
      if (connector) used.add(connector.uid)
      const canWalletConnect = !!wallet.walletConnect && !!wcConnector
      const action: WalletAction = connector ? 'connect' : canWalletConnect ? 'walletConnect' : 'get'
      if (action === 'get' && !wallet.downloadUrls) continue
      result.push({
        // Prefer the official icon/name announced by the extension.
        wallet: installed ? { ...wallet, icon: connector.icon ?? wallet.icon } : wallet,
        connector,
        installed,
        recent: recentWalletIds.includes(wallet.id),
        action,
      })
    }

    // Installed extensions the dApp didn't list explicitly still deserve a spot.
    const announced = connectors.filter(isAnnounced)
    for (const connector of announced) {
      if (used.has(connector.uid)) continue
      const wallet: Wallet = { id: connector.id, name: connector.name, icon: connector.icon ?? browserWallet().icon, rdns: connector.id }
      result.push({ wallet, connector, installed: true, recent: recentWalletIds.includes(wallet.id), action: 'connect' })
    }

    // Plain `window.ethereum` (in-app browsers, older extensions) when nothing announced itself.
    const generic = connectors.find((c) => c.id === 'injected')
    if (generic && !announced.length && injectedAvailable && !result.some((o) => o.wallet.id === 'injected')) {
      const wallet = browserWallet()
      result.unshift({ wallet, connector: generic, installed: true, recent: recentWalletIds.includes(wallet.id), action: 'connect' })
    }

    const recentRank = (o: WalletOption) => {
      const i = recentWalletIds.indexOf(o.wallet.id)
      return i === -1 ? Number.MAX_SAFE_INTEGER : i
    }
    const installed = result.filter((o) => o.installed || o.recent).sort((a, b) => recentRank(a) - recentRank(b))
    const rest = result.filter((o) => !installed.includes(o))
    const popular = rest.filter((o) => o.wallet.featured !== false)
    const more = rest.filter((o) => o.wallet.featured === false)

    const groups: WalletGroup[] = [
      { id: 'installed' as const, wallets: installed },
      { id: 'popular' as const, wallets: popular },
      { id: 'more' as const, wallets: more },
    ].filter((g) => g.wallets.length > 0)

    return { groups, all: [...installed, ...popular, ...more], walletConnectConnector: wcConnector }
  }, [connectors, options.wallets, recentWalletIds, injectedAvailable])
}
