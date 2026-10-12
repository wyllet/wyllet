import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { mock, WagmiProvider } from 'wagmi'
import { getDefaultConfig, useWyllet, WylletEmbed, WylletProvider, type Wallet } from '../src'

const account = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

function ViewProbe() {
  const { view } = useWyllet()
  return <output data-testid="global-view">{view ?? 'closed'}</output>
}

function setup() {
  const mockWallet: Wallet = {
    id: 'mock',
    name: 'Mock Wallet',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
    createConnector: () => mock({ accounts: [account] }),
  }
  const config = getDefaultConfig({ appName: 'Test dApp', chains: [mainnet], wallets: [mockWallet] })
  return render(
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <WylletProvider ens={false} tokens={false} appearance={{ disableAnimations: true, closeOnConnect: false }}>
          <div data-testid="host">
            <WylletEmbed />
          </div>
          <ViewProbe />
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  )
}

describe('WylletEmbed', () => {
  it('renders the real connect view inline, without a dialog or a close button', async () => {
    setup()
    const host = screen.getByTestId('host')
    expect(await within(host).findByRole('heading', { name: 'Connect to Test dApp' })).toBeTruthy()
    expect(within(host).getByRole('button', { name: /Mock Wallet/ })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(within(host).queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('connects in place and switches to the account view without opening the global panel', async () => {
    const user = userEvent.setup()
    setup()
    const host = screen.getByTestId('host')
    await user.click(await within(host).findByRole('button', { name: /Mock Wallet/ }))
    await waitFor(() => expect(within(host).getByRole('tab', { name: /Tokens/i })).toBeTruthy(), { timeout: 4000 })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByTestId('global-view').textContent).toBe('closed')
  })
})
