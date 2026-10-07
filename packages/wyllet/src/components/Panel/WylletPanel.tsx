import { useEffect, useId, useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import { useWylletContext, type PanelView } from '../../core/context'
import { AccountView } from './AccountView'
import { ConnectView } from './ConnectView'
import { Surface } from './Surface'

/** Hosts the connect + account views inside the configured presentation. */
export function WylletPanel() {
  const { panel, auth } = useWylletContext()
  const { status, address } = useConnection()
  const titleId = useId()
  // Keep rendering the last view while the exit animation plays,
  // and start a fresh connect flow every time the panel opens.
  const [shown, setShown] = useState<PanelView | null>(panel.view)
  const [session, setSession] = useState(0)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (panel.view && !wasOpen.current) setSession((s) => s + 1)
    wasOpen.current = !!panel.view
    if (!panel.view) return
    const ready = status === 'connected' && !(auth.enabled && !auth.isSignedIn(address))
    // Only react to explicit open() calls, not to status changes mid-flow (e.g. the success step).
    if (panel.view === 'connect' && ready) return panel.open('account')
    if (panel.view === 'account' && status !== 'connected') return panel.open('connect')
    setShown(panel.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel.view])

  const view = panel.view ?? shown
  return (
    <Surface open={!!panel.view} onClose={panel.close} labelledBy={titleId}>
      {view === 'account' && status === 'connected' ? (
        <AccountView titleId={titleId} />
      ) : view ? (
        <ConnectView key={session} titleId={titleId} />
      ) : null}
    </Surface>
  )
}
