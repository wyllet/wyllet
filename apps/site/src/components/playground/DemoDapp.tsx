'use client'

import { useSendTransaction, useSignMessage } from 'wagmi'
import { Avatar, ChainIcon, ConnectGate, TokenIcon, useWyllet, useWylletActivity, useWylletButton, useWylletChains, useWylletToast, WylletButton } from 'wyllet'
import { useSite } from '../Providers'
import styles from './playground.module.css'

const short = (s: string) => `${s.slice(0, 10)}…${s.slice(-6)}`
const errorText = (e: unknown) => (e as { shortMessage?: string; message?: string }).shortMessage ?? (e as Error).message
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

function Card({ title, api, wide, children }: { title: string; api: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={styles.card} data-wide={wide || undefined} aria-label={title}>
      <code className={styles.api}>{api}</code>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function SignCard() {
  const toast = useWylletToast()
  const { log } = useWylletActivity()
  const { mutateAsync: signMessage, isPending } = useSignMessage()
  const { isConnected } = useWyllet()
  const sign = async () => {
    try {
      const signature = await signMessage({ message: 'gm from Wyllet' })
      toast.success('Message signed', { description: short(signature) })
      log({ title: 'Signed “gm”', status: 'success' })
    } catch (e) {
      toast.error('Signature rejected', { description: errorText(e) })
    }
  }
  return (
    <Card title="Sign a message" api="useSignMessage()">
      <p>wagmi hooks work as usual. Results show up as toasts and in the activity timeline.</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={sign} disabled={isPending || !isConnected}>
        {isPending ? 'Check your wallet' : isConnected ? 'Sign “gm”' : 'Connect first'}
      </button>
    </Card>
  )
}

function TxCard() {
  const toast = useWylletToast()
  const { address, isConnected } = useWyllet()
  const { addTransaction } = useWylletActivity()
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction()
  const send = async () => {
    try {
      const hash = await sendTransaction({ to: address!, value: BigInt(0) })
      addTransaction({ hash, description: 'Send 0 ETH to self' })
    } catch (e) {
      toast.error('Transaction failed', { description: errorText(e) })
    }
  }
  return (
    <Card title="Track a transaction" api="addTransaction({ hash })">
      <p>A tracked hash gets a pending toast, then a confirmed one, plus a timeline entry that survives a reload. The demo wallet has no gas, so expect it to fail.</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={send} disabled={isPending || !isConnected}>
        {isPending ? 'Approve in wallet' : isConnected ? 'Send 0 ETH to self' : 'Connect first'}
      </button>
    </Card>
  )
}

function ToastCard() {
  const toast = useWylletToast()
  return (
    <Card title="Toasts" api="useWylletToast()">
      <p>Imperative and promise-aware. Change the position in the Studio.</p>
      <div className={styles.row}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.success('Position opened', { description: '2.4 ETH at 3x' })}>
          Success
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.error('Swap failed', { description: 'Slippage tolerance exceeded' })}>
          Error
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.promise(wait(2400), { loading: 'Bridging to Base', success: 'Bridged 0.5 ETH', error: 'Bridge failed' })}>
          Promise
        </button>
      </div>
    </Card>
  )
}

function HeadlessCard() {
  const { mounted, account, chain, open } = useWylletButton()
  return (
    <Card title="Build your own button" api="useWylletButton()">
      <p>Wyllet keeps the state, the panel and the anchoring. You draw the trigger.</p>
      {mounted && (
        <button type="button" className={styles.byo} onClick={(e) => open(e.currentTarget)}>
          {account ? (
            <>
              <Avatar address={account.address} size={18} />
              {account.displayName}
              {chain && <ChainIcon chainId={chain.id} size={16} />}
            </>
          ) : (
            <>
              <span className={styles.byoDot} aria-hidden /> plug_in_wallet()
            </>
          )}
        </button>
      )}
    </Card>
  )
}

function VaultCard() {
  const { account, chain, open } = useWylletButton()
  return (
    <Card title="Members-only vault" api="<ConnectGate>" wide>
      <p>Connected, on a supported network, and signed in if SIWE is on. One component.</p>
      <ConnectGate description="Connect a wallet to open the vault.">
        <div className={styles.vault}>
          <Avatar address={account?.address ?? '0x0'} size={48} />
          <div>
            <div className={styles.vaultName}>{account?.displayName}</div>
            <div className={styles.vaultMeta}>
              {account?.balance ? `${account.balance.formatted} ${account.balance.symbol}` : 'No balance'} on {chain?.name}
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => open(e.currentTarget)}>
            Open wallet
          </button>
        </div>
      </ConnectGate>
    </Card>
  )
}

const tokens: Array<[string, number]> = [
  ['ETH', 1],
  ['USDC', 8453],
  ['USDT', 42161],
  ['DAI', 1],
  ['WBTC', 1],
  ['OP', 10],
  ['ARB', 42161],
  ['DEGEN', 8453],
]

function ChainsCard() {
  const { openTab, isConnected } = useWyllet()
  const { chains } = useWylletChains()
  return (
    <Card title="Your chains and tokens, your order" api="customChain() · withDefaultTokens() · chainOrder" wide>
      <p>
        This demo mixes <code>popularChains</code> with Zora from <code>customChain()</code>, pins DEGEN on Base above the blue chips, and
        reorders networks with <code>chainOrder</code>. Try Network order in the Studio.
      </p>
      <ul className={styles.chips}>
        {chains.map((c) => (
          <li key={c.id}>
            <span aria-hidden>
              <ChainIcon chainId={c.id} size={20} />
            </span>
            {c.name}
          </li>
        ))}
      </ul>
      <ul className={styles.chips}>
        {tokens.map(([symbol, chainId]) => (
          <li key={symbol}>
            <span aria-hidden>
              <TokenIcon symbol={symbol} chainId={chainId} size={22} />
            </span>
            {symbol}
          </li>
        ))}
      </ul>
      <div className={styles.row}>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!isConnected} onClick={(e) => openTab('networks', { anchor: e.currentTarget })}>
          Open networks
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!isConnected} onClick={(e) => openTab('tokens', { anchor: e.currentTarget })}>
          Open tokens
        </button>
      </div>
    </Card>
  )
}

export function DemoDapp() {
  const { settings } = useSite()
  return (
    <div className={styles.preview}>
      <div className={styles.dappBar}>
        <span className={styles.dappLogo}>
          <span aria-hidden className={styles.dappMark} />
          Acme Finance
        </span>
        <WylletButton size={settings.buttonSize} display={settings.display} />
      </div>
      <div className={styles.grid}>
        <VaultCard />
        <SignCard />
        <TxCard />
        <ToastCard />
        <HeadlessCard />
        <ChainsCard />
      </div>
    </div>
  )
}
