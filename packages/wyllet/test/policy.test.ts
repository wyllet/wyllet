// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Supply-chain policy: Wyllet ships zero third-party runtime dependencies.
// Everything it imports at runtime must be a peer the dApp already controls.
const ALLOWED = ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query', '@walletconnect/ethereum-provider']
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

describe('dependency policy', () => {
  it('has no runtime dependencies', () => {
    expect(pkg.dependencies ?? {}).toEqual({})
  })

  it('only declares allowed peers', () => {
    expect(Object.keys(pkg.peerDependencies).sort()).toEqual([...ALLOWED].sort())
  })

  const dist = new URL('../dist/index.js', import.meta.url)
  it.skipIf(!existsSync(dist))('built bundle only imports allowed peers', () => {
    const code = readFileSync(dist, 'utf8')
    const specifiers = [...code.matchAll(/(?:from|import)\s*\(?\s*['"]([^'".][^'"]*)['"]/g)].map((m) => m[1]!)
    const roots = new Set(specifiers.map((s) => (s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0]!)))
    for (const root of roots) expect(ALLOWED, `unexpected runtime import "${root}"`).toContain(root)
  })
})
