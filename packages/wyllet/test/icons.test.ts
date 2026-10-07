// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { networkIcons } from '../src/chains/brandIcons'
import { chainIconDataUri } from '../src/chains/chainMeta'
import { tokenBrandIcons } from '../src/tokens/brandIcons'
import { tokenIconUri } from '../src/tokens/tokens'
import * as walletIcons from '../src/wallets/brandIcons'
import { defaultTokens, defaultWallets, popularChains } from '../src'

const all: Record<string, string> = {
  ...Object.fromEntries(Object.entries(walletIcons).map(([k, v]) => [`wallet:${k}`, v])),
  ...Object.fromEntries(Object.entries(networkIcons).map(([k, v]) => [`network:${k}`, v])),
  ...Object.fromEntries(Object.entries(tokenBrandIcons).map(([k, v]) => [`token:${k}`, v])),
}

describe('bundled brand artwork', () => {
  for (const [name, uri] of Object.entries(all)) {
    it(`${name} is a well-formed, static data URI`, () => {
      expect(uri).toMatch(/^data:image\/(svg\+xml|png)[;,]/)
      if (uri.startsWith('data:image/svg+xml,')) {
        const body = uri.slice('data:image/svg+xml,'.length)
        expect(body).not.toContain('#') // would start a URL fragment and truncate the image
        const svg = decodeURIComponent(body)
        expect(svg).toMatch(/^<svg[\s\S]*<\/svg>$/)
        expect(svg).not.toMatch(/<script|\son\w+\s*=|<foreignObject|href="(?!#|data:)/i)
      }
    })
  }

  it('default wallets ship official artwork only', () => {
    const official = new Set<string>(Object.values(walletIcons))
    for (const w of defaultWallets().filter((w) => w.id !== 'walletConnect')) expect(official.has(w.icon), w.name).toBe(true)
  })

  it('popular chains use official artwork, except BNB (approval required)', () => {
    const official = new Set<string>(Object.values(networkIcons))
    for (const c of popularChains) expect(official.has(chainIconDataUri(c.id, c.name)), c.name).toBe(c.id !== 56)
  })

  it('default token lists use official artwork', () => {
    const official = new Set<string>([...Object.values(tokenBrandIcons), ...Object.values(networkIcons)])
    for (const tokens of Object.values(defaultTokens)) for (const t of tokens) expect(official.has(tokenIconUri(t.symbol)), t.symbol).toBe(true)
  })
})
