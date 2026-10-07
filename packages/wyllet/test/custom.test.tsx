import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { base, mainnet } from 'viem/chains'
import { beforeEach, describe, expect, it } from 'vitest'
import { WagmiProvider } from 'wagmi'
import { chainExtras } from '../src/chains/custom'
import { createCustomTokenStore } from '../src/tokens/customTokens'
import { customChain, defaultTokens, getDefaultConfig, popularChains, toTokenList, useWylletChains, withDefaultTokens, WylletProvider } from '../src'

const appchain = customChain({ id: 424242, name: 'Appchain', rpcUrl: 'https://rpc.appchain.dev', explorerUrl: 'https://scan.appchain.dev/', icon: 'https://x/icon.png' })
const MINE = '0x1111111111111111111111111111111111111111' as const

describe('chains', () => {
  it('customChain builds a viem chain with Wyllet metadata', () => {
    expect(appchain.rpcUrls.default.http).toEqual(['https://rpc.appchain.dev'])
    expect(appchain.blockExplorers?.default.url).toBe('https://scan.appchain.dev')
    expect(appchain.nativeCurrency.symbol).toBe('ETH')
    expect(chainExtras(appchain)?.icon).toBe('https://x/icon.png')
  })

  it('popular presets mix with custom chains in getDefaultConfig', () => {
    const config = getDefaultConfig({ appName: 'T', chains: [...popularChains, appchain], wallets: [] })
    expect(config.chains[0].id).toBe(1)
    expect(config.chains.at(-1)?.id).toBe(424242)
  })

  it('chainOrder arranges the networks without changing the default chain', async () => {
    const config = getDefaultConfig({ appName: 'T', chains: [mainnet, base, appchain], wallets: [] })
    function Probe() {
      return <span>{useWylletChains().chains.map((c) => c.id).join(',')}</span>
    }
    render(
      <WagmiProvider config={config}>
        <QueryClientProvider client={new QueryClient()}>
          <WylletProvider chainOrder={[424242, 8453]} ens={false}>
            <Probe />
          </WylletProvider>
        </QueryClientProvider>
      </WagmiProvider>,
    )
    expect(await screen.findByText('424242,8453,1')).toBeTruthy()
    expect(config.chains[0].id).toBe(1)
  })
})

describe('token lists', () => {
  it('accepts a flat list across chains, keeping order', () => {
    const list = toTokenList([
      { chainId: 8453, address: MINE, symbol: 'A', decimals: 18 },
      { chainId: 1, address: MINE, symbol: 'B', decimals: 18 },
      { chainId: 8453, address: '0x2222222222222222222222222222222222222222', symbol: 'C', decimals: 6 },
    ])
    expect(list[8453]!.map((t) => t.symbol)).toEqual(['A', 'C'])
    expect(list[1]!.map((t) => t.symbol)).toEqual(['B'])
  })

  it('withDefaultTokens puts yours first and removes duplicates', () => {
    const usdcOnBase = defaultTokens[8453]![0]!
    const merged = withDefaultTokens([
      { chainId: 8453, address: MINE, symbol: 'MINE', decimals: 18, pinned: true },
      { chainId: 8453, ...usdcOnBase, address: usdcOnBase.address.toUpperCase().replace('0X', '0x') as `0x${string}` },
      { chainId: 424242, address: MINE, symbol: 'APP', decimals: 18 },
    ])
    expect(merged[8453]![0]!.symbol).toBe('MINE')
    expect(merged[8453]!.filter((t) => t.symbol === 'USDC')).toHaveLength(1)
    expect(merged[1]).toEqual(defaultTokens[1])
    expect(merged[424242]!.map((t) => t.symbol)).toEqual(['APP'])
  })
})

describe('user-imported tokens', () => {
  beforeEach(() => localStorage.clear())

  it('stores per chain, de-duplicates case-insensitively and removes', () => {
    const tokens = createCustomTokenStore()
    const token = { address: '0xAbC0000000000000000000000000000000000001' as const, symbol: 'ABC', decimals: 18 }
    tokens.add(8453, token)
    tokens.add(8453, { ...token, address: '0xabc0000000000000000000000000000000000001' })
    expect(tokens.store.get()[8453]).toHaveLength(1)
    expect(createCustomTokenStore().store.get()[8453]).toHaveLength(1)
    tokens.remove(8453, '0xABC0000000000000000000000000000000000001')
    expect(tokens.store.get()[8453]).toHaveLength(0)
  })
})
