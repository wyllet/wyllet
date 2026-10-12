import { sepolia } from 'viem/chains'
import { burnerWallet, customChain, defaultWallets, getDefaultConfig, popularChains } from 'wyllet'
import { site, siteUrl } from './site'

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || undefined

/** A branded chain the demo adds with `customChain()`. */
export const zora = customChain({
  id: 7777777,
  name: 'Zora',
  rpcUrl: 'https://rpc.zora.energy',
  explorerUrl: 'https://explorer.zora.energy',
  icon: '/brand/chains/zora.svg',
})

const origin = typeof window === 'undefined' ? siteUrl : window.location.origin

export const config = getDefaultConfig({
  appName: site.name,
  appDescription: 'Try Wyllet, the open-source wallet connector for React dApps.',
  appUrl: origin,
  appIcon: `${origin}/icon.png`,
  walletConnectProjectId,
  chains: [...popularChains, zora, sepolia],
  // The burner wallet lets anyone try the connected state without installing a wallet. It holds no funds.
  wallets: [...defaultWallets(), burnerWallet({ overrides: { name: 'Demo wallet' } })],
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
