import { useSendTransaction, useSignMessage } from 'wagmi'
import { Avatar, ChainIcon, ConnectGate, TokenIcon, useWyllet, useWylletActivity, useWylletButton, useWylletChains, useWylletToast } from 'wyllet'

const short = (s: string) => `${s.slice(0, 10)}…${s.slice(-6)}`
const errorText = (e: unknown) => (e as { shortMessage?: string; message?: string }).shortMessage ?? (e as Error).message

function SignCard() {
  const toast = useWylletToast()
  const { log } = useWylletActivity()
  const { mutateAsync: signMessage, isPending } = useSignMessage()
  const sign = async () => {
    try {
      const signature = await signMessage({ message: 'gm from Wyllet ✨' })
      toast.success('Message signed', { description: short(signature) })
      log({ title: 'Signed “gm”', status: 'success' })
    } catch (e) {
      toast.error('Signature rejected', { description: errorText(e) })
    }
  }
  return (
    <div className="card">
      <div className="card-kicker">01 · wagmi hooks</div>
      <h3>Sign a message</h3>
      <p>Every wagmi hook works as usual. Results land as island toasts and in the activity timeline.</p>
      <button className="btn" onClick={sign} disabled={isPending}>
        {isPending ? 'Check your wallet…' : 'Sign “gm”'}
      </button>
    </div>
  )
}

function TxCard() {
  const toast = useWylletToast()
  const { address } = useWyllet()
  const { addTransaction } = useWylletActivity()
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction()
  const send = async () => {
    try {
      const hash = await sendTransaction({ to: address!, value: 0n })
      addTransaction({ hash, description: 'Send 0 ETH to self' })
    } catch (e) {
      toast.error('Transaction failed', { description: errorText(e) })
    }
  }
  return (
    <div className="card">
      <div className="card-kicker">02 · activity tracker</div>
      <h3>Send a transaction</h3>
      <p>
        <code>addTransaction(hash)</code> tracks it live: pending → confirmed island, plus a timeline entry.
      </p>
      <button className="btn" onClick={send} disabled={isPending}>
        {isPending ? 'Approve in wallet…' : 'Send 0 ETH to self'}
      </button>
    </div>
  )
}

function ToastCard() {
  const toast = useWylletToast()
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))
  return (
    <div className="card">
      <div className="card-kicker">03 · useWylletToast()</div>
      <h3>Island toasts</h3>
      <p>Imperative, promise-aware notifications that morph in like a dynamic island.</p>
      <div className="btn-row">
        <button className="btn btn-soft" onClick={() => toast.success('Position opened', { description: '2.4 ETH · 3x long' })}>
          Success
        </button>
        <button className="btn btn-soft" onClick={() => toast.error('Swap failed', { description: 'Slippage tolerance exceeded' })}>
          Error
        </button>
        <button
          className="btn btn-soft"
          onClick={() => toast.promise(wait(2400), { loading: 'Bridging to Base…', success: 'Bridged 0.5 ETH', error: 'Bridge failed' })}
        >
          Promise
        </button>
      </div>
    </div>
  )
}

function TokensCard() {
  const tokens: Array<[string, number]> = [
    ['ETH', 1],
    ['USDC', 8453],
    ['USDT', 42161],
    ['DAI', 1],
    ['WBTC', 1],
    ['OP', 10],
    ['ARB', 42161],
    ['POL', 137],
  ]
  return (
    <div className="card">
      <div className="card-kicker">04 · &lt;TokenIcon&gt;</div>
      <h3>Token &amp; chain icons</h3>
      <p>Built-in marks for blue-chip tokens and chains, with chain badges. Zero network requests.</p>
      <div className="token-strip">
        {tokens.map(([symbol, chainId]) => (
          <span key={symbol} className="token-chip">
            <TokenIcon symbol={symbol} chainId={chainId} size={30} />
            {symbol}
          </span>
        ))}
      </div>
    </div>
  )
}

function HeadlessCard() {
  const { mounted, account, chain, open } = useWylletButton()
  return (
    <div className="card">
      <div className="card-kicker">05 · useWylletButton()</div>
      <h3>Headless mode</h3>
      <p>Build any trigger you like — Wyllet keeps the state, panel and anchoring.</p>
      {mounted && (
        <button className="byo" onClick={(e) => open(e.currentTarget)}>
          {account ? (
            <>
              <Avatar address={account.address} size={18} />
              {account.displayName}
              {chain && <ChainIcon chainId={chain.id} size={16} />}
            </>
          ) : (
            <>
              <span className="byo-dot" /> plug_in_wallet()
            </>
          )}
        </button>
      )}
    </div>
  )
}

function VaultCard() {
  const { account, chain, open } = useWylletButton()
  return (
    <div className="card card-wide">
      <div className="card-kicker">06 · &lt;ConnectGate&gt;</div>
      <h3>Members-only vault</h3>
      <p>Gate any UI behind connected + supported network + signed in, with one component.</p>
      <ConnectGate description="Connect a wallet to open the vault.">
        <div className="vault">
          <Avatar address={account?.address ?? '0x0'} size={52} />
          <div>
            <div className="vault-name">{account?.displayName}</div>
            <div className="vault-meta">
              {account?.balance ? `${account.balance.formatted} ${account.balance.symbol}` : '—'} · {chain?.name}
            </div>
          </div>
          <button className="vault-open" onClick={(e) => open(e.currentTarget)}>
            Open wallet →
          </button>
        </div>
      </ConnectGate>
    </div>
  )
}

function CustomCard() {
  const { openTab, isConnected } = useWyllet()
  const { chains } = useWylletChains()
  return (
    <div className="card card-wide">
      <div className="card-kicker">07 · popularChains · customChain() · withDefaultTokens() · chainOrder</div>
      <h3>Your chains &amp; tokens, your order</h3>
      <p>
        Networks and tokens are defined in code, so every user sees the same curated set. This demo mixes <code>popularChains</code> with a
        branded <b>Zora</b> from <code>customChain()</code>, pins <b>DEGEN</b> on Base above the blue chips, and lets you rearrange networks
        with <code>chainOrder</code> (try it in the Studio).
      </p>
      <div className="chain-strip">
        {chains.map((c) => (
          <span key={c.id} className="token-chip">
            <ChainIcon chainId={c.id} size={22} />
            {c.name}
          </span>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-soft" disabled={!isConnected} onClick={(e) => openTab('networks', { anchor: e.currentTarget })}>
          Open networks
        </button>
        <button className="btn btn-soft" disabled={!isConnected} onClick={(e) => openTab('tokens', { anchor: e.currentTarget })}>
          Open tokens
        </button>
      </div>
    </div>
  )
}

export function DemoDapp() {
  return (
    <div className="grid">
      <VaultCard />
      <SignCard />
      <TxCard />
      <ToastCard />
      <TokensCard />
      <HeadlessCard />
      <CustomCard />
    </div>
  )
}
