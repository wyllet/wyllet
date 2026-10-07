import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mainnet } from 'viem/chains'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WagmiProvider } from 'wagmi'
import { directoryDeepLink, fetchDirectoryPage } from '../src/directory/directory'
import { getDefaultConfig, walletConnectWallet, WylletButton, WylletProvider } from '../src'

const URI = 'wc:abc@2?relay-protocol=irn&symKey=def'
const E = encodeURIComponent(URI)

const listing = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  image_url: { md: `https://registry.example/logo/${id}.png` },
  chains: ['eip155:1'],
  mobile: { native: null, universal: null },
  ...extra,
})

function mockRegistry(pages: Record<string, unknown>[], total: number) {
  const fetchMock = vi.fn(async (url: string) => {
    const page = Number(new URL(url).searchParams.get('page') ?? 1)
    const search = new URL(url).searchParams.get('search')?.toLowerCase()
    // Like the real registry, search runs across every wallet (results start again at page 1).
    let listings = search ? Object.assign({}, ...pages) : (pages[page - 1] ?? {})
    if (search) listings = page > 1 ? {} : Object.fromEntries(Object.entries(listings).filter(([, l]) => (l as { name: string }).name.toLowerCase().includes(search)))
    return new Response(JSON.stringify({ listings, total }), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('wallet directory', () => {
  it('formats deep links exactly like Reown', () => {
    expect(directoryDeepLink({ mobile: { universal: 'https://metamask.app.link', native: 'metamask://' } }, URI)).toBe(`https://metamask.app.link/wc?uri=${E}`)
    expect(directoryDeepLink({ mobile: { universal: 'https://my.tt/wc/' } }, URI)).toBe(`https://my.tt/wc/wc?uri=${E}`)
    expect(directoryDeepLink({ mobile: { native: 'trust://' } }, URI)).toBe(`trust://wc?uri=${E}`)
    expect(directoryDeepLink({ mobile: { native: 'rainbow' } }, URI)).toBe(`rainbow://wc?uri=${E}`)
    expect(directoryDeepLink({ mobile: {} }, URI)).toBeUndefined()
  })

  it('keeps EVM wallets only and does not cache failures', async () => {
    mockRegistry([{ a: listing('a', 'EVM Wallet'), b: listing('b', 'Solana Only', { chains: ['solana:mainnet'] }), c: { id: 'c', name: 'No logo' } }], 3)
    const page = await fetchDirectoryPage('pid-1', 1)
    expect(page.wallets.map((w) => w.name)).toEqual(['EVM Wallet'])

    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    await expect(fetchDirectoryPage('pid-2', 1)).rejects.toThrow()
    mockRegistry([{ a: listing('a', 'Back online') }], 1)
    expect((await fetchDirectoryPage('pid-2', 1)).wallets[0]?.name).toBe('Back online')
  })

  it('opens "All wallets", pages and searches the registry', async () => {
    const page1 = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`w${i}`, listing(`w${i}`, `Wallet ${i}`)]))
    const page2 = { rb: listing('rb', 'Rainbow'), tw: listing('tw', 'Trust Wallet') }
    const fetchMock = mockRegistry([page1, page2], 42)
    const user = userEvent.setup()
    const config = getDefaultConfig({ appName: 'Test', chains: [mainnet], wallets: [walletConnectWallet()], walletConnectProjectId: 'pid-ui' })
    render(
      <WagmiProvider config={config}>
        <QueryClientProvider client={new QueryClient()}>
          <WylletProvider ens={false} tokens={false} appearance={{ disableAnimations: true }}>
            <WylletButton />
          </WylletProvider>
        </QueryClientProvider>
      </WagmiProvider>,
    )
    await user.click((await screen.findAllByRole('button', { name: 'Connect' }))[0]!)
    await user.click(await screen.findByRole('button', { name: /All wallets/ }))
    expect(await screen.findByTitle('Wallet 0')).toBeTruthy()
    expect(fetchMock.mock.calls[0]![0]).toContain('projectId=pid-ui')

    await user.click(screen.getByRole('button', { name: 'Show more' }))
    expect(await screen.findByTitle('Rainbow')).toBeTruthy()

    await user.type(screen.getByRole('searchbox'), 'trust')
    await waitFor(() => expect(screen.queryByTitle('Wallet 0')).toBeNull())
    expect(screen.getByTitle('Trust Wallet')).toBeTruthy()
  })
})
