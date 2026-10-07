import { defineChain, type Chain } from 'viem'

/** Visual metadata Wyllet reads from `chain.custom.wyllet`. */
export interface ChainExtras {
  /** Chain logo (URL or data URI). */
  icon?: string
  /** Brand color, used for the generated monogram when there is no icon. */
  color?: string
  /** Icon for the native currency in the Tokens tab. */
  nativeIcon?: string
}

export interface CustomChainInput extends ChainExtras {
  id: number
  name: string
  /** HTTPS JSON-RPC endpoint. */
  rpcUrl: string
  nativeCurrency?: { name: string; symbol: string; decimals: number }
  /** e.g. `https://explorer.example.org` */
  explorerUrl?: string
  testnet?: boolean
}

/**
 * Define any EVM chain in one call — your own L2, an appchain, a devnet.
 * Works anywhere wagmi/viem expect a `Chain`, and carries Wyllet's icon metadata.
 *
 * ```ts
 * const zora = customChain({ id: 7777777, name: 'Zora', rpcUrl: 'https://rpc.zora.energy', icon: '/zora.svg' })
 * getDefaultConfig({ chains: [mainnet, zora], ... })
 * ```
 */
export function customChain(input: CustomChainInput): Chain {
  const { id, name, rpcUrl, nativeCurrency, explorerUrl, testnet, icon, color, nativeIcon } = input
  return defineChain({
    id,
    name,
    nativeCurrency: nativeCurrency ?? { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
    ...(explorerUrl && { blockExplorers: { default: { name: `${name} Explorer`, url: explorerUrl.replace(/\/$/, '') } } }),
    testnet,
    custom: { wyllet: { icon, color, nativeIcon } satisfies ChainExtras },
  })
}

export function chainExtras(chain: Chain | undefined): ChainExtras | undefined {
  return (chain?.custom as { wyllet?: ChainExtras } | undefined)?.wyllet
}
