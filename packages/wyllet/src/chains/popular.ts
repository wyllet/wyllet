import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  base,
  baseSepolia,
  bsc,
  linea,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  scroll,
  sepolia,
  zksync,
} from 'viem/chains'

/**
 * Popular mainnets, ready to spread into `getDefaultConfig({ chains })`.
 * All have built-in Wyllet icons. Pick, reorder or mix with `customChain(...)` freely.
 */
export const popularChains = [mainnet, base, optimism, arbitrum, polygon, bsc, avalanche, zksync, linea, scroll] as const

/** Popular testnets. */
export const popularTestnets = [sepolia, baseSepolia, optimismSepolia, arbitrumSepolia, polygonAmoy] as const
