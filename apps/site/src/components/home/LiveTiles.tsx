'use client'

import { ChainIcon, ConnectGate, QRCode, TokenIcon, useWyllet, useWylletActivity, useWylletChains, useWylletToast } from 'wyllet'
import { useSite } from '../Providers'
import styles from './sections.module.css'

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

export function ToastTile() {
  const toast = useWylletToast()
  const { log } = useWylletActivity()
  return (
    <div className={styles.tileActions}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.success('Position opened', { description: '2.4 ETH at 3x' })}>
        Success
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.error('Swap failed', { description: 'Slippage tolerance exceeded' })}>
        Error
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() =>
          toast
            .promise(wait(2200), { loading: 'Bridging to Base', success: 'Bridged 0.5 ETH', error: 'Bridge failed' })
            .then(() => log({ title: 'Bridged 0.5 ETH', status: 'success' }))
        }
      >
        Promise
      </button>
    </div>
  )
}

export function AccountTile() {
  const { openTab, openConnect, isConnected } = useWyllet()
  const go = (tab: 'tokens' | 'activity' | 'networks', el: HTMLElement) => (isConnected ? openTab(tab, { anchor: el }) : openConnect({ anchor: el }))
  return (
    <div className={styles.tileActions}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => go('tokens', e.currentTarget)}>
        Tokens
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => go('activity', e.currentTarget)}>
        Activity
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => go('networks', e.currentTarget)}>
        Networks
      </button>
    </div>
  )
}

const tokenRow: Array<[string, number]> = [
  ['ETH', 1],
  ['USDC', 8453],
  ['USDT', 42161],
  ['DAI', 1],
  ['WBTC', 1],
  ['OP', 10],
  ['ARB', 42161],
  ['DEGEN', 8453],
]

export function ChainsTile() {
  const { chains } = useWylletChains()
  return (
    <div className={styles.iconRows}>
      <ul className={styles.chipRow} aria-label="Networks in this demo">
        {chains.map((c) => (
          <li key={c.id} className={styles.chip}>
            <span aria-hidden>
              <ChainIcon chainId={c.id} size={20} />
            </span>
            {c.name}
          </li>
        ))}
      </ul>
      <ul className={styles.chipRow} aria-label="Tokens in this demo">
        {tokenRow.map(([symbol, chainId]) => (
          <li key={symbol} className={styles.chip}>
            <span aria-hidden>
              <TokenIcon symbol={symbol} chainId={chainId} size={22} />
            </span>
            {symbol}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function QrTile({ value }: { value: string }) {
  return (
    <div className={styles.qr}>
      <QRCode value={value} size={240} logo="/logo.png" />
    </div>
  )
}

export function GateTile() {
  const { settings, set } = useSite()
  const { open } = useWyllet()
  return (
    <div className={styles.gate}>
      <label className={styles.inlineToggle}>
        <input type="checkbox" checked={settings.siwe} onChange={(e) => set('siwe', e.target.checked)} />
        Require Sign-In With Ethereum
      </label>
      <ConnectGate description="Connect a wallet to open the members area.">
        <div className={styles.vault}>
          <strong>You&apos;re in.</strong>
          <span>This box renders only for connected users on a supported network{settings.siwe ? ' who signed in' : ''}.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => open(undefined, { anchor: e.currentTarget })}>
            Open wallet
          </button>
        </div>
      </ConnectGate>
    </div>
  )
}
