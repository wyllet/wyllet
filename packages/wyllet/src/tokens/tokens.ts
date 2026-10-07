import type { Address } from 'viem'
import { networkIcons } from '../chains/brandIcons'
import { tokenBrandIcons } from './brandIcons'
import { escapeXml, firstGlyph, svgDataUri } from '../utils'

export interface Token {
  address: Address
  symbol: string
  decimals: number
  name?: string
  /** Image URL / data URI. Falls back to Wyllet's built-in icons, then a monogram. */
  icon?: string
  /** Always show this token at the top of the list (in list order), regardless of balance. */
  pinned?: boolean
}

/** Tokens to show in the account panel, per chain id. Array order = display priority. */
export type TokenList = Record<number, Token[]>

/** A token plus the chain it lives on — handy for writing one flat list. */
export type TokenEntry = Token & { chainId: number }

/** Normalizes a flat `TokenEntry[]` or a `TokenList` into a `TokenList`. */
export function toTokenList(input: TokenList | TokenEntry[]): TokenList {
  if (!Array.isArray(input)) return input
  const list: TokenList = {}
  for (const { chainId, ...token } of input) (list[chainId] ??= []).push(token)
  return list
}

/**
 * Your tokens first, then Wyllet's blue chips (duplicates removed).
 *
 * ```ts
 * <WylletProvider tokens={withDefaultTokens([{ chainId: 8453, address: '0x…', symbol: 'MYTKN', decimals: 18, pinned: true }])} />
 * ```
 */
export function withDefaultTokens(custom: TokenList | TokenEntry[]): TokenList {
  const mine = toTokenList(custom)
  const out: TokenList = {}
  for (const id of new Set([...Object.keys(mine), ...Object.keys(defaultTokens)].map(Number))) {
    const own = mine[id] ?? []
    const seen = new Set(own.map((t) => t.address.toLowerCase()))
    out[id] = [...own, ...(defaultTokens[id] ?? []).filter((t) => !seen.has(t.address.toLowerCase()))]
  }
  return out
}

const t = (address: string, symbol: string, decimals: number, name: string): Token => ({
  address: address as Address,
  symbol,
  decimals,
  name,
})

/** Blue-chip tokens on popular networks. Pass `tokens="default"` (the default) to use these. */
export const defaultTokens: TokenList = {
  1: [
    t('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'USDC', 6, 'USD Coin'),
    t('0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT', 6, 'Tether'),
    t('0x6b175474e89094c44da98b954eedeac495271d0f', 'DAI', 18, 'Dai'),
    t('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'WETH', 18, 'Wrapped Ether'),
    t('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 'WBTC', 8, 'Wrapped Bitcoin'),
  ],
  8453: [
    t('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', 'USDC', 6, 'USD Coin'),
    t('0x4200000000000000000000000000000000000006', 'WETH', 18, 'Wrapped Ether'),
    t('0x50c5725949a6f0c72e6c4a641f24049a917db0cb', 'DAI', 18, 'Dai'),
  ],
  10: [
    t('0x0b2c639c533813f4aa9d7837caf62653d097ff85', 'USDC', 6, 'USD Coin'),
    t('0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', 'USDT', 6, 'Tether'),
    t('0x4200000000000000000000000000000000000006', 'WETH', 18, 'Wrapped Ether'),
    t('0x4200000000000000000000000000000000000042', 'OP', 18, 'Optimism'),
  ],
  42161: [
    t('0xaf88d065e77c8cc2239327c5edb3a432268e5831', 'USDC', 6, 'USD Coin'),
    t('0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', 'USDT', 6, 'Tether'),
    t('0x82af49447d8a07e3bd95bd0d56f35241523fbab1', 'WETH', 18, 'Wrapped Ether'),
    t('0x912ce59144191c1204e64559fe8253a0e49e6548', 'ARB', 18, 'Arbitrum'),
  ],
  137: [
    t('0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', 'USDC', 6, 'USD Coin'),
    t('0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 'USDT', 6, 'Tether'),
    t('0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 'WETH', 18, 'Wrapped Ether'),
  ],
}

// ---------------------------------------------------------------- icons

const circle = (bg: string, body: string) =>
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${bg}"/>${body}</svg>`)

const letter = (ch: string, size = 15) =>
  `<text x="16" y="${16 + size * 0.36}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${size}" font-weight="800" fill="#fff">${escapeXml(ch)}</text>`

/**
 * Official token artwork. Native/governance tokens of a network reuse that network's official mark
 * unless the project publishes a separate token logo (OP does). No artwork bundled for BNB (approval
 * required by BNB Chain's guidelines) — it gets a neutral monogram like any unknown token.
 */
const tokenIcons: Record<string, string> = {
  ...tokenBrandIcons,
  ETH: networkIcons.ethereum,
  WETH: networkIcons.ethereum,
  ARB: networkIcons.arbitrum,
  POL: networkIcons.polygon,
  MATIC: networkIcons.polygon,
  AVAX: networkIcons.avalanche,
}

function hue(symbol: string) {
  let h = 0
  for (const ch of symbol) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h) % 360
}

/** Icon for a token symbol: official artwork when bundled, otherwise a neutral generated monogram. */
export function tokenIconUri(symbol: string): string {
  return tokenIcons[symbol] ?? tokenIcons[symbol.toUpperCase()] ?? circle(`hsl(${hue(symbol)} 45% 44%)`, letter(firstGlyph(symbol), 14))
}
