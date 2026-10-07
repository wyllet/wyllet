import type { Chain, Transport } from 'viem'
import { createConfig, http, injected, type Config, type CreateConfigParameters, type CreateConnectorFn } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'
import { defaultWallets } from '../wallets/presets'
import type { Wallet } from '../wallets/types'
import { registerApp, type AppInfo } from './registry'

export interface DefaultConfigParameters<chains extends readonly [Chain, ...Chain[]]>
  extends Omit<CreateConfigParameters<chains>, 'chains' | 'transports' | 'connectors'> {
  /** Your dApp's name. Shown in wallets during connection and in the modal. */
  appName: string
  appDescription?: string
  /** Defaults to `window.location.origin`. */
  appUrl?: string
  /** Square icon URL shown inside wallets. */
  appIcon?: string
  /**
   * Free at https://cloud.reown.com. Enables QR / mobile connections.
   * Requires `@walletconnect/ethereum-provider` to be installed in your app (an optional peer dependency).
   */
  walletConnectProjectId?: string
  /**
   * Networks your dApp supports, in priority order (the first one is the default).
   * Mix `popularChains`, anything from `viem/chains`, and your own `customChain(...)`.
   */
  chains: chains
  /** Defaults to the public RPC of each chain. Use your own RPC in production. */
  transports?: Partial<Record<chains[number]['id'], Transport>>
  /** Wallets shown in the connect modal, in order. Defaults to `defaultWallets()`. */
  wallets?: Wallet[]
  /** Extra wagmi connectors to append as-is. */
  connectors?: CreateConnectorFn[]
}

/** Tags a connector so the modal knows which wallet it belongs to. */
export const WALLET_ID_KEY = 'wylletWalletId'

/**
 * One call to get a production-ready wagmi config: EIP-6963 discovery, WalletConnect,
 * your wallet list and app metadata — all wired up for `<WylletProvider>`.
 */
export function getDefaultConfig<const chains extends readonly [Chain, ...Chain[]]>(
  parameters: DefaultConfigParameters<chains>,
): Config<chains, Record<chains[number]['id'], Transport>> {
  const {
    appName,
    appDescription,
    appUrl,
    appIcon,
    walletConnectProjectId,
    chains,
    transports: transportOverrides,
    wallets = defaultWallets(),
    connectors: extraConnectors = [],
    ...rest
  } = parameters

  const url = appUrl ?? (typeof window !== 'undefined' ? window.location.origin : undefined)
  const connectors: CreateConnectorFn[] = []

  if (walletConnectProjectId && wallets.some((w) => w.walletConnect)) {
    connectors.push(
      walletConnect({
        projectId: walletConnectProjectId,
        showQrModal: false,
        metadata: {
          name: appName,
          description: appDescription ?? appName,
          url: url ?? 'https://wyllet.dev',
          icons: appIcon ? [appIcon] : [],
        },
      }),
    )
  }

  for (const wallet of wallets) {
    const create = wallet.createConnector
    if (!create) continue
    const fn = create()
    connectors.push(((config) => ({ ...fn(config), [WALLET_ID_KEY]: wallet.id })) as CreateConnectorFn)
  }

  // Generic window.ethereum fallback for browsers / in-app webviews without EIP-6963.
  connectors.push(injected({ shimDisconnect: true }))
  connectors.push(...extraConnectors)

  const transports = Object.fromEntries(
    chains.map((chain) => [chain.id, (transportOverrides as Record<number, Transport> | undefined)?.[chain.id] ?? http()]),
  ) as Record<chains[number]['id'], Transport>

  const config = createConfig({ ...rest, chains, transports, connectors } as CreateConfigParameters<chains>)
  registerApp(config as unknown as Config, {
    wallets,
    appInfo: { name: appName, description: appDescription, url, icon: appIcon },
    walletConnectProjectId,
  })
  return config as Config<chains, Record<chains[number]['id'], Transport>>
}

export type { AppInfo }
