import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import { useWylletContext, WylletContext, type AccountTab, type PanelState, type PanelView, type WylletContextValue } from '../core/context'
import { cx } from '../utils'
import { AccountView } from './Panel/AccountView'
import { ConnectView } from './Panel/ConnectView'
import { AnimatedHeight } from './primitives/AnimatedHeight'
import { SafeBoundary } from './SafeBoundary'

export interface WylletEmbedProps {
  /** Which view to show. `auto` (default): connect when disconnected, the account panel once connected and signed in. */
  view?: 'auto' | PanelView
  /** Stretch to the parent's height (like the drawer) instead of sizing to the content. */
  fill?: boolean
  className?: string
}

/**
 * The real Wyllet panel rendered inline, inside your own layout: a connect card on a sign-in page,
 * an account panel in a sidebar, or a live preview. No overlay, portal, focus trap or scroll lock.
 * Uses the provider's theme, wallets and options. Its navigation is local, so it never opens the drawer.
 * Wallet detection only exists in the browser, so it renders after mount (an empty box during SSR).
 */
export function WylletEmbed(props: WylletEmbedProps) {
  return (
    <SafeBoundary fallback={null}>
      <Embed {...props} />
    </SafeBoundary>
  )
}

function Embed({ view: forced = 'auto', fill = false, className }: WylletEmbedProps) {
  const ctx = useWylletContext()
  const { status, address } = useConnection()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const titleId = useId()
  const [local, setLocal] = useState<{ view: PanelView | null; tab: AccountTab }>({ view: null, tab: ctx.panel.tab })
  const ready = status === 'connected' && !(ctx.auth.enabled && !ctx.auth.isSignedIn(address))
  const auto: PanelView = ready ? 'account' : 'connect'
  const view: PanelView = forced !== 'auto' ? forced : (local.view ?? auto)

  // A fresh connect flow each time the embed returns to the connect view.
  const session = useRef(0)
  const last = useRef<PanelView | null>(null)
  if (view === 'connect' && last.current !== 'connect') session.current++
  last.current = view

  const panel = useMemo<PanelState>(
    () => ({
      view,
      tab: local.tab,
      anchor: null,
      open: (next, options) => setLocal((s) => ({ view: next, tab: options?.tab ?? s.tab })),
      // "Close" inside an embed means: go back to whatever the connection state calls for.
      close: () => setLocal((s) => ({ ...s, view: null })),
      setTab: (tab) => setLocal((s) => ({ ...s, tab })),
    }),
    [view, local.tab],
  )
  const value = useMemo<WylletContextValue>(() => ({ ...ctx, panel, embedded: true }), [ctx, panel])
  const body = view === 'account' && status === 'connected' ? <AccountView titleId={titleId} /> : <ConnectView key={session.current} titleId={titleId} />

  if (!mounted) return <div data-wyllet={ctx.scope} className={cx('wy-embed', fill && 'wy-embed-fill', className)} aria-busy="true" />

  return (
    <WylletContext.Provider value={value}>
      <div data-wyllet={ctx.scope} className={cx('wy-embed', fill && 'wy-embed-fill', className)}>
        <section className={cx('wy-surface', ctx.options.classNames.panel)} aria-labelledby={titleId}>
          <span className="wy-surface-glow" aria-hidden />
          {fill ? <div className="wy-surface-fill">{body}</div> : <AnimatedHeight>{body}</AnimatedHeight>}
        </section>
      </div>
    </WylletContext.Provider>
  )
}
