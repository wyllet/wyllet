import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { mock, WagmiProvider } from 'wagmi'
import { ConnectGate, getDefaultConfig, useWylletActivity, useWylletButton, WylletButton, WylletProvider, type Presentation, type Wallet } from '../src'

const account = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

function setup(children: ReactNode, presentation: Presentation = 'drawer') {
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
        <WylletProvider ens={false} tokens={false} appearance={{ disableAnimations: true, presentation }}>
          {children}
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  )
}

function ActivityProbe() {
  const { activity } = useWylletActivity()
  return <output data-testid="activity">{activity.map((a) => a.title).join('|')}</output>
}

describe('connect flow', () => {
  it.each(['drawer', 'popover', 'modal'] as const)('connects through the %s panel and unlocks the gate', async (presentation) => {
    const user = userEvent.setup()
    setup(
      <>
        <WylletButton />
        <ConnectGate>
          <p>secret area</p>
        </ConnectGate>
        <ActivityProbe />
      </>,
      presentation,
    )

    const [connect] = await screen.findAllByRole('button', { name: 'Connect' })
    await user.click(connect!)
    expect(await screen.findByRole('dialog', { name: 'Connect to Test dApp' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /Mock Wallet/ }))

    expect(await screen.findByText('Connected', { selector: '.wy-step-label' })).toBeTruthy()
    await waitFor(() => expect(screen.getByRole('button', { name: '0xd8dA…6045' })).toBeTruthy())
    expect(screen.getByText('secret area')).toBeTruthy()
    expect(screen.getByTestId('activity').textContent).toContain('Connected Mock')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 3000 })
  })

  it('supports keyboard selection with number keys', async () => {
    const user = userEvent.setup()
    setup(<WylletButton />)
    await user.click((await screen.findAllByRole('button', { name: 'Connect' }))[0]!)
    await screen.findByRole('dialog')
    await act(async () => {
      await user.keyboard('1')
    })
    await waitFor(() => expect(screen.getByRole('button', { name: '0xd8dA…6045' })).toBeTruthy())
  })

  it('exposes headless state', async () => {
    function Probe() {
      const { mounted, account } = useWylletButton()
      return <span>{mounted ? (account ? 'yes' : 'no') : 'ssr'}</span>
    }
    setup(<Probe />)
    expect(await screen.findByText('no')).toBeTruthy()
  })
})
