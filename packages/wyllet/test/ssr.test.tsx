// @vitest-environment node
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToString } from 'react-dom/server'
import { base, mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { WagmiProvider } from 'wagmi'
import { burnerWallet, ConnectGate, defaultWallets, getDefaultConfig, WylletButton, WylletProvider } from '../src'

// Next.js / Remix render on the server first: nothing may touch window, document or localStorage during render.
describe('server rendering', () => {
  it('renders the provider, button and gate without browser globals', () => {
    expect(typeof window).toBe('undefined')
    const config = getDefaultConfig({
      appName: 'SSR',
      chains: [mainnet, base],
      wallets: [...defaultWallets(), burnerWallet()],
      walletConnectProjectId: 'test',
      ssr: true,
    })
    const html = renderToString(
      <WagmiProvider config={config}>
        <QueryClientProvider client={new QueryClient()}>
          <WylletProvider shortcut="mod+k" appearance={{ presentation: 'popover', identityCard: true }}>
            <WylletButton />
            <ConnectGate>
              <p>secret</p>
            </ConnectGate>
          </WylletProvider>
        </QueryClientProvider>
      </WagmiProvider>,
    )
    expect(html).toContain('data-wyllet')
    expect(html).toContain('wy-island')
    expect(html).not.toContain('secret') // gated content never leaks into server HTML
  })
})
