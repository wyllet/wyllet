import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { base, mainnet } from 'viem/chains'
import { useAccount, WagmiProvider } from 'wagmi'
import {
  coinbaseWallet,
  ConnectGate,
  defaultWallets,
  getDefaultConfig,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
  WylletButton,
  WylletProvider,
  type Presentation,
  type WylletProviderProps,
} from 'wyllet'
import { fakeChain } from './chain'

const params = new URLSearchParams(location.search)

// `?wallets=all` lists every built-in preset, for the compatibility tests.
const wallets =
  params.get('wallets') === 'all'
    ? [metaMaskWallet(), coinbaseWallet(), rainbowWallet(), trustWallet(), phantomWallet(), rabbyWallet(), okxWallet(), walletConnectWallet()]
    : defaultWallets()

const config = getDefaultConfig({
  appName: 'Wyllet E2E',
  wallets,
  chains: [mainnet, base],
  transports: { [mainnet.id]: fakeChain(mainnet.id), [base.id]: fakeChain(base.id) },
})

const presentation = (params.get('p') ?? 'drawer') as Presentation

/** Plain-text connection state for assertions: `status|address|chainId`. */
function State() {
  const { status, address, chainId } = useAccount()
  return <output data-testid="state">{[status, address ?? '', chainId ?? ''].join('|')}</output>
}

export function App(props: Partial<WylletProviderProps>) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WylletProvider ens={false} tokens={false} appearance={{ presentation }} {...props}>
          <main>
            <h1>Wyllet E2E</h1>
            <WylletButton />
            <State />
            <ConnectGate>
              <p data-testid="gated">Members area</p>
            </ConnectGate>
          </main>
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
