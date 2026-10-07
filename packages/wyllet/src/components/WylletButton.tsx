import { useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import { mainnet } from 'viem/chains'
import { useBalance, useConnection, useEnsName } from 'wagmi'
import type { AuthStatus } from '../auth/types'
import { useWylletContext, type AccountTab } from '../core/context'
import { cx, formatAmount, shortenAddress, shortcutLabel } from '../utils'
import { Avatar } from './Avatar'
import { SafeBoundary } from './SafeBoundary'
import { ChainIcon } from './ChainIcon'
import { AlertIcon, Spinner, WalletGlyph } from './primitives/Icons'

export interface WylletButtonState {
  /** False during SSR / first render — render a placeholder to avoid hydration mismatches. */
  mounted: boolean
  status: 'disconnected' | 'connecting' | 'reconnecting' | 'connected'
  account?: {
    address: Address
    displayName: string
    ensName?: string | null
    balance?: { formatted: string; symbol: string; value: bigint; decimals: number }
  }
  chain?: { id: number; name: string; unsupported: boolean }
  /** `undefined` when no auth adapter is configured. */
  authStatus?: AuthStatus
  /** Does the right thing: connect when disconnected, otherwise the account panel. Pass an element to anchor popovers. */
  open(anchor?: Element | null): void
  openConnect(anchor?: Element | null): void
  openAccount(anchor?: Element | null, tab?: AccountTab): void
}

/** Headless state for building your own button. Powers `<WylletButton>`. */
export function useWylletButton(): WylletButtonState {
  const { panel, options, auth } = useWylletContext()
  const { address, chainId, chain, status } = useConnection()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { data: ensName } = useEnsName({ address, chainId: mainnet.id, query: { enabled: options.ens && !!address } })
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })

  const connected = status === 'connected' && !!address
  const needsAuth = auth.enabled && !auth.isSignedIn(address)
  return {
    mounted,
    status,
    account: connected
      ? {
          address,
          ensName,
          displayName: ensName ?? shortenAddress(address),
          balance: balance && {
            value: balance.value,
            decimals: balance.decimals,
            symbol: balance.symbol,
            formatted: formatAmount(balance.value, balance.decimals),
          },
        }
      : undefined,
    chain: connected && chainId !== undefined ? { id: chainId, name: chain?.name ?? `Chain ${chainId}`, unsupported: !chain } : undefined,
    // Per-account: a session for another address reads as unauthenticated.
    authStatus: auth.enabled ? (auth.status === 'authenticated' && !auth.isSignedIn(address) ? 'unauthenticated' : auth.status) : undefined,
    open: (anchor) => panel.open(connected && !needsAuth ? 'account' : 'connect', { anchor }),
    openConnect: (anchor) => panel.open('connect', { anchor }),
    openAccount: (anchor, tab) => panel.open('account', { anchor, tab }),
  }
}

export interface WylletButtonProps {
  /** Text when disconnected. */
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** `full` = avatar + name + balance, `compact` = avatar + name, `avatar` = avatar only. */
  display?: 'full' | 'compact' | 'avatar'
  className?: string
}

/**
 * The Wyllet Island: a single morphing control.
 * Disconnected it's a call to action; connected it shows identity, network and balance at a glance.
 */
export function WylletButton(props: WylletButtonProps) {
  // Outside the boundary on purpose: a missing <WylletProvider> is a setup error that must surface loudly.
  const { scope, t, panel } = useWylletContext()
  const { status, address, chainId } = useConnection()
  // If the island ever crashes, users still get a working (plain) connect button, and it retries on the next change.
  const fallback = (
    <button type="button" data-wyllet={scope} className={cx('wy-island', 'wy-island-cta', props.className)} onClick={() => panel.open(address ? 'account' : 'connect')}>
      <span>{props.label ?? t.connect}</span>
    </button>
  )
  return (
    <SafeBoundary fallback={fallback} resetKey={`${status}:${address}:${chainId}`}>
      <IslandButton {...props} />
    </SafeBoundary>
  )
}

function IslandButton({ label, size = 'md', display = 'full', className }: WylletButtonProps) {
  const { scope, t, options } = useWylletContext()
  const state = useWylletButton()
  const ref = useRef<HTMLButtonElement>(null)
  const { mounted, account, chain, status, authStatus } = state
  const busy = mounted && (status === 'connecting' || status === 'reconnecting')
  const base = cx('wy-island', `wy-island-${size}`, options.classNames.island, className)

  if (!mounted || !account) {
    return (
      <button
        ref={ref}
        type="button"
        data-wyllet={scope}
        className={cx(base, 'wy-island-cta')}
        onClick={() => state.openConnect(ref.current)}
        disabled={!mounted}
        style={mounted ? undefined : { visibility: 'hidden' }}
      >
        <span className="wy-island-cta-icon">{busy ? <Spinner size={15} /> : <WalletGlyph size={15} />}</span>
        <span>{busy ? t.connecting : (label ?? t.connect)}</span>
        {options.shortcut && <kbd className="wy-island-kbd">{shortcutLabel(options.shortcut)}</kbd>}
      </button>
    )
  }

  const needsAuth = authStatus !== undefined && authStatus !== 'authenticated'
  const unsupported = chain?.unsupported

  return (
    <button
      ref={ref}
      type="button"
      data-wyllet={scope}
      className={cx(base, 'wy-island-account', unsupported && 'wy-island-warn', needsAuth && 'wy-island-auth')}
      onClick={() => (needsAuth ? state.openConnect(ref.current) : state.openAccount(ref.current, unsupported ? 'networks' : undefined))}
      aria-label={unsupported ? t.wrongNetwork : account.displayName}
    >
      <span className="wy-island-avatar">
        <Avatar address={account.address} size={size === 'sm' ? 22 : size === 'lg' ? 30 : 26} />
        {chain && (
          <span className="wy-island-chain">{unsupported ? <AlertIcon size={10} /> : <ChainIcon chainId={chain.id} size={13} />}</span>
        )}
      </span>
      {display !== 'avatar' && (
        <span className="wy-island-name">{needsAuth ? t.verify : unsupported ? t.wrongNetwork : account.displayName}</span>
      )}
      {display === 'full' && !needsAuth && !unsupported && account.balance && (
        <span className="wy-island-balance">
          {account.balance.formatted}
          <small>{account.balance.symbol}</small>
        </span>
      )}
      <span className={cx('wy-island-status', needsAuth && 'wy-pending')} aria-hidden />
    </button>
  )
}
