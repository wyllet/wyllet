import { sepolia } from 'viem/chains'
import { burnerWallet, customChain, defaultWallets, getDefaultConfig, popularChains } from 'wyllet'

export const walletConnectProjectId = import.meta.env.VITE_WC_PROJECT_ID as string | undefined

const zoraIcon = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><radialGradient id="z" cx="30%" cy="28%" r="80%"><stop offset="0" stop-color="#FCB8D4"/><stop offset=".35" stop-color="#FF7A00"/><stop offset=".7" stop-color="#2B5DF0"/><stop offset="1" stop-color="#0A0A40"/></radialGradient></defs><circle cx="16" cy="16" r="16" fill="url(#z)"/></svg>',
)}`

/** A chain viem may not ship with (or one you want to brand): one call with `customChain`. */
export const zora = customChain({
  id: 7777777,
  name: 'Zora',
  rpcUrl: 'https://rpc.zora.energy',
  explorerUrl: 'https://explorer.zora.energy',
  icon: zoraIcon,
})

export const config = getDefaultConfig({
  appName: 'Wyllet Playground',
  appDescription: 'Try every Wyllet feature live.',
  appIcon: typeof window !== 'undefined' ? new URL('/logo.png', window.location.origin).href : undefined,
  walletConnectProjectId,
  // Popular presets + your own chains, in priority order (the first is the default).
  chains: [...popularChains, zora, sepolia],
  // Burner wallet lets you try the connected state without installing anything.
  wallets: [...defaultWallets(), burnerWallet()],
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
