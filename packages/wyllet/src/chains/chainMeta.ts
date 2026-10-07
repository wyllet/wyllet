import { escapeXml, firstGlyph, svgDataUri } from '../utils'
import { networkIcons } from './brandIcons'

// Official network logos by chain id (testnets reuse their mainnet's mark).
// Anything else — including BNB Chain, whose guidelines require approval first — gets a neutral monogram.
// Apps can override any of these with `<WylletProvider chainIcons={{ [chainId]: url }}>` or `customChain({ icon })`.
const officialByChainId: Record<number, string> = {
  1: networkIcons.ethereum,
  11155111: networkIcons.ethereum,
  17000: networkIcons.ethereum,
  10: networkIcons.optimism,
  11155420: networkIcons.optimism,
  42161: networkIcons.arbitrum,
  421614: networkIcons.arbitrum,
  8453: networkIcons.base,
  84532: networkIcons.base,
  137: networkIcons.polygon,
  80002: networkIcons.polygon,
  43114: networkIcons.avalanche,
  43113: networkIcons.avalanche,
  324: networkIcons.zksync,
  300: networkIcons.zksync,
  59144: networkIcons.linea,
  59141: networkIcons.linea,
  534352: networkIcons.scroll,
  534351: networkIcons.scroll,
  100: networkIcons.gnosis,
  10200: networkIcons.gnosis,
  7777777: networkIcons.zora,
  999999999: networkIcons.zora,
  81457: networkIcons.blast,
  168587773: networkIcons.blast,
}

// Wyllet's own generic mark for local dev chains (Hardhat / Anvil).
const LOCAL_DEV = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#6E6E80"/><path d="M11 10l-4 6 4 6M21 10l4 6-4 6M18 9l-4 14" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
)

export function chainIconDataUri(chainId: number, name: string, colorOverride?: string): string {
  if (!colorOverride) {
    const official = officialByChainId[chainId]
    if (official) return official
    if (chainId === 31337) return LOCAL_DEV
  }
  const color = colorOverride ?? monogramColor(name)
  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${escapeXml(color)}"/>` +
      `<text x="16" y="21" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#fff">${escapeXml(firstGlyph(name))}</text></svg>`,
  )
}

function monogramColor(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return `hsl(${Math.abs(hash) % 360} 45% 46%)`
}
