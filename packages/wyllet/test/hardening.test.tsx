import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ReactNode } from 'react'
import { normalize } from 'viem/ens'
import { mainnet } from 'viem/chains'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, WagmiProvider } from 'wagmi'
import { createActivityTracker } from '../src/activity/activity'
import { chainIconDataUri } from '../src/chains/chainMeta'
import { createToastStore } from '../src/toast/toastStore'
import { createCustomTokenStore } from '../src/tokens/customTokens'
import { tokenIconUri } from '../src/tokens/tokens'
import { safeNormalize, storageKey } from '../src/utils'
import { burnerWallet, ConnectGate, getDefaultConfig, WylletButton, WylletProvider, type Wallet, type WylletAuthAdapter } from '../src'

const ICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'

describe('hostile onchain data', () => {
  it('ENS names with disallowed characters never throw', () => {
    expect(() => normalize('a b.eth')).toThrow()
    expect(safeNormalize('a b.eth', normalize)).toBeUndefined()
    expect(safeNormalize('vitalik.eth', normalize)).toBe('vitalik.eth')
  })

  it('token / chain monograms survive emoji and markup', () => {
    for (const s of ['🚀MOON', '<script>', '&amp;', '\uD83D', '']) {
      expect(() => tokenIconUri(s)).not.toThrow()
      expect(() => chainIconDataUri(999999, s)).not.toThrow()
    }
    expect(decodeURIComponent(tokenIconUri('🚀MOON'))).toContain('>🚀<')
    expect(decodeURIComponent(tokenIconUri('<x'))).toContain('&#60;')
  })
})

describe('corrupted localStorage', () => {
  beforeEach(() => localStorage.clear())

  it('falls back instead of crashing', () => {
    localStorage.setItem(storageKey('activity'), 'null')
    localStorage.setItem(storageKey('customTokens'), '[1,2,3]')
    const tracker = createActivityTracker({ getConfig: () => ({}) as never, toast: (() => '') as never, getMessages: () => ({}) as never })
    expect(tracker.store.get()).toEqual([])
    expect(() => tracker.resume()).not.toThrow()
    expect(createCustomTokenStore().store.get()).toEqual({})
  })

  it('drops malformed entries but keeps valid ones', () => {
    localStorage.setItem(
      storageKey('customTokens'),
      JSON.stringify({ 8453: [{ address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', symbol: 'DEGEN', decimals: 18 }, { address: 'nope' }, null], abc: [] }),
    )
    expect(createCustomTokenStore().store.get()).toEqual({ 8453: [{ address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', symbol: 'DEGEN', decimals: 18 }] })
  })
})

describe('toasts', () => {
  it('re-showing a toast during its exit animation keeps it', () => {
    vi.useFakeTimers()
    const { store, api, remove } = createToastStore()
    api({ id: 'tx', title: 'Pending', status: 'loading' })
    remove('tx')
    api({ id: 'tx', title: 'Confirmed', status: 'success' })
    vi.advanceTimersByTime(300)
    expect(store.get().map((t) => t.title)).toEqual(['Confirmed'])
    vi.useRealTimers()
  })
})

function setup(children: ReactNode, opts: { wallets?: Wallet[]; auth?: () => WylletAuthAdapter; avatar?: () => never } = {}) {
  const wallets = opts.wallets ?? [{ id: 'mock', name: 'Mock Wallet', icon: ICON, createConnector: () => mock({ accounts: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'] }) }]
  const config = getDefaultConfig({ appName: 'Test', chains: [mainnet], wallets })
  function Harness() {
    const [, force] = useState(0)
    return (
      <WylletProvider
        ens={false}
        tokens={false}
        appearance={{ disableAnimations: true }}
        // A fresh adapter object on every render, like `auth={{ ... }}` written inline.
        auth={opts.auth?.()}
        avatar={opts.avatar}
      >
        <button onClick={() => force((n) => n + 1)}>rerender</button>
        {children}
      </WylletProvider>
    )
  }
  return render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <Harness />
      </QueryClientProvider>
    </WagmiProvider>,
  )
}

describe('auth', () => {
  beforeEach(() => localStorage.clear())

  it('an inline auth adapter stays signed in across re-renders', async () => {
    const user = userEvent.setup()
    const makeAuth = (): WylletAuthAdapter => ({ getNonce: async () => 'abcdefgh12345678', verify: async () => true, signOut: async () => {} })
    setup(
      <>
        <WylletButton />
        <ConnectGate>
          <p>members</p>
        </ConnectGate>
      </>,
      { wallets: [burnerWallet()], auth: makeAuth },
    )
    await user.click((await screen.findAllByRole('button', { name: 'Connect' }))[0]!)
    await user.click(await screen.findByRole('button', { name: /Burner Wallet/ }))
    await user.click(await screen.findByRole('button', { name: 'Sign to verify' }))
    expect(await screen.findByText('members')).toBeTruthy()
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'rerender' }))
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.getByText('members')).toBeTruthy()
  })
})

describe('keyboard quick-pick', () => {
  it('a digit that starts a wallet name searches instead of connecting', async () => {
    const user = userEvent.setup()
    const wallets: Wallet[] = [
      { id: 'mock', name: 'Mock Wallet', icon: ICON, createConnector: () => mock({ accounts: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'] }) },
      ...['1inch Wallet', 'Alpha', 'Beta', 'Gamma', 'Delta'].map((name, i) => ({ id: `w${i}`, name, icon: ICON, downloadUrls: { website: 'https://example.com' } })),
    ]
    setup(<WylletButton />, { wallets })
    await user.click((await screen.findAllByRole('button', { name: 'Connect' }))[0]!)
    const search = await screen.findByRole('searchbox')
    await act(async () => {
      await user.type(search, '1in')
    })
    expect((search as HTMLInputElement).value).toBe('1in')
    expect(screen.queryByRole('button', { name: '0xd8dA…6045' })).toBeNull()
  })
})

describe('safety net', () => {
  it('a crash inside Wyllet UI never takes down the host app', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    setup(
      <>
        <WylletButton />
        <p>host app still here</p>
      </>,
      {
        avatar: () => {
          throw new Error('boom')
        },
      },
    )
    await user.click((await screen.findAllByRole('button', { name: 'Connect' }))[0]!)
    await user.click(await screen.findByRole('button', { name: /Mock Wallet/ }))
    await waitFor(() => expect(error).toHaveBeenCalled())
    expect(screen.getByText('host app still here')).toBeTruthy()
    // The island fell back to a plain, still-working button instead of disappearing.
    expect(document.querySelector('button.wy-island')).toBeTruthy()
    error.mockRestore()
  })
})
