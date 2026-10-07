import { useEffect, useState, type ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { useWylletContext } from '../core/context'
import { cx } from '../utils'
import { AlertIcon, ShieldIcon, WalletGlyph } from './primitives/Icons'

export type GateReason = 'disconnected' | 'wrongNetwork' | 'unauthenticated'

export interface ConnectGateProps {
  children: ReactNode
  /** Also require a supported network. Default `true`. */
  requireSupportedChain?: boolean
  /** Also require Sign-In With Ethereum (when an auth adapter is set). Default `true`. */
  requireAuth?: boolean
  /** Replace the default prompt. */
  fallback?: ReactNode | ((reason: GateReason) => ReactNode)
  title?: ReactNode
  description?: ReactNode
  className?: string
}

/** Renders children only when the user is ready (connected, right network, signed in). */
export function ConnectGate({ children, requireSupportedChain = true, requireAuth = true, fallback, title, description, className }: ConnectGateProps) {
  const { scope, t, panel, auth } = useWylletContext()
  const { status, chain, chainId, address } = useConnection()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const reason: GateReason | null =
    status !== 'connected'
      ? 'disconnected'
      : requireSupportedChain && chainId !== undefined && !chain
        ? 'wrongNetwork'
        : requireAuth && auth.enabled && !auth.isSignedIn(address)
          ? 'unauthenticated'
          : null

  if (mounted && !reason) return <>{children}</>
  const r = reason ?? 'disconnected'
  if (fallback !== undefined) return <>{typeof fallback === 'function' ? fallback(r) : fallback}</>

  const content = {
    disconnected: { icon: <WalletGlyph size={20} />, title: title ?? t.gateTitle, body: description ?? t.gateBody, cta: t.connect },
    wrongNetwork: { icon: <AlertIcon size={20} />, title: t.wrongNetwork, body: t.wrongNetworkDescription, cta: t.tabNetworks },
    unauthenticated: { icon: <ShieldIcon size={20} />, title: t.signInTitle, body: t.signInBody, cta: t.verify },
  }[r]

  return (
    <div data-wyllet={scope} className={cx('wy-gate', `wy-gate-${r}`, className)} style={mounted ? undefined : { visibility: 'hidden' }}>
      <span className="wy-gate-lock" aria-hidden>
        {content.icon}
      </span>
      <div className="wy-gate-text">
        <h3>{content.title}</h3>
        <p>{content.body}</p>
      </div>
      <button
        type="button"
        className="wy-btn wy-btn-primary"
        onClick={(e) => panel.open(r === 'wrongNetwork' ? 'account' : 'connect', { anchor: e.currentTarget, tab: 'networks' })}
      >
        {content.cta}
      </button>
    </div>
  )
}
