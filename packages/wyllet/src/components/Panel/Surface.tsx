import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useWylletContext, type Presentation } from '../../core/context'
import { cx } from '../../utils'
import { AnimatedHeight } from '../primitives/AnimatedHeight'

const EXIT_MS = 240
const POPOVER_WIDTH = 392
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

type Mode = Presentation | 'sheet'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

function popoverPosition(anchor: DOMRect): CSSProperties {
  const gap = 10
  const margin = 12
  const vw = window.innerWidth
  const vh = window.innerHeight
  const preferRight = anchor.left + anchor.width / 2 > vw / 2
  let left = preferRight ? anchor.right - POPOVER_WIDTH : anchor.left
  left = Math.min(Math.max(margin, left), vw - POPOVER_WIDTH - margin)
  const below = vh - anchor.bottom - gap - margin
  const above = anchor.top - gap - margin
  const placeAbove = below < 360 && above > below
  const originX = anchor.left + anchor.width / 2 - left
  const available = placeAbove ? above : below
  const base = { left, maxHeight: available, ['--wy-avail' as string]: `${available}px` }
  return placeAbove
    ? { ...base, bottom: vh - anchor.top + gap, transformOrigin: `${originX}px bottom` }
    : { ...base, top: anchor.bottom + gap, transformOrigin: `${originX}px top` }
}

export interface SurfaceProps {
  open: boolean
  onClose(): void
  labelledBy: string
  children: ReactNode
}

/**
 * The one container every Wyllet view renders into.
 * Handles presentation (drawer / popover / modal / sheet), portal, focus trap,
 * scroll lock, Esc + outside-click dismissal and enter/exit motion.
 */
export function Surface({ open, onClose, labelledBy, children }: SurfaceProps) {
  const { scope, options, panel } = useWylletContext()
  const { presentation, drawerSide, disableAnimations, mobileSheet } = options.appearance
  const phone = useMediaQuery('(max-width: 640px)')
  const mode: Mode = phone && mobileSheet ? 'sheet' : presentation === 'popover' && !panel.anchor ? 'modal' : presentation

  const [rendered, setRendered] = useState(open)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (open) return setRendered(true)
    if (!rendered) return
    if (disableAnimations) return setRendered(false)
    const timer = setTimeout(() => setRendered(false), EXIT_MS)
    return () => clearTimeout(timer)
  }, [open, rendered, disableAnimations])

  useLayoutEffect(() => {
    if (!open) return
    restoreFocus.current = document.activeElement as HTMLElement | null
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      restoreFocus.current?.focus?.({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    if (!open || !rendered) return
    const el = surfaceRef.current
    const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el
    first?.focus({ preventScroll: true })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !el) return
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null)
      if (!items.length) return e.preventDefault()
      const firstItem = items[0]!
      const lastItem = items[items.length - 1]!
      // Focus fell outside (e.g. onto <body>): pull it back in instead of letting Tab reach the page.
      if (!el.contains(document.activeElement)) {
        e.preventDefault()
        ;(e.shiftKey ? lastItem : firstItem).focus()
        return
      }
      if (e.shiftKey && (document.activeElement === firstItem || document.activeElement === el)) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    // When a view change removes the focused element, focus drops to <body>; move it back into the dialog.
    // Some browsers fire no event at all when the focused node is removed, so also re-check after DOM changes.
    let frame = 0
    const recover = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!el || el.contains(document.activeElement)) return
        // Only reclaim focus that was lost (on <body>), never focus the user deliberately moved elsewhere (e.g. a toast).
        if (document.activeElement && document.activeElement !== document.body) return
        ;(el.querySelector<HTMLElement>('[data-autofocus]') ?? el).focus({ preventScroll: true })
      })
    }
    const onFocusOut = (e: FocusEvent) => {
      if (!e.relatedTarget) recover()
    }
    const observer = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(recover)
    if (el) observer?.observe(el, { childList: true, subtree: true })
    document.addEventListener('keydown', onKeyDown, true)
    el?.addEventListener('focusout', onFocusOut)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      document.removeEventListener('keydown', onKeyDown, true)
      el?.removeEventListener('focusout', onFocusOut)
    }
  }, [open, rendered])

  const drag = useSheetDrag(surfaceRef, () => onCloseRef.current())

  if (!rendered || typeof document === 'undefined') return null

  const style = mode === 'popover' && panel.anchor ? popoverPosition(panel.anchor) : undefined

  return createPortal(
    <div
      data-wyllet={scope}
      className={cx('wy-layer', `wy-mode-${mode}`, mode === 'drawer' && `wy-side-${drawerSide}`, disableAnimations && 'wy-no-motion')}
      data-state={open ? 'open' : 'closed'}
    >
      <div className={cx('wy-overlay', options.classNames.overlay)} onPointerDown={() => onClose()} />
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cx('wy-surface', options.classNames.panel)}
        style={style}
      >
        <span className="wy-surface-glow" aria-hidden />
        {mode === 'sheet' && <div className="wy-sheet-handle" onPointerDown={drag} aria-hidden />}
        {mode === 'drawer' ? <div className="wy-surface-fill">{children}</div> : <AnimatedHeight>{children}</AnimatedHeight>}
      </div>
    </div>,
    document.body,
  )
}

/** Drag the bottom sheet down to dismiss. Cancelled gestures snap back; listeners never outlive the sheet. */
function useSheetDrag(ref: RefObject<HTMLDivElement | null>, onDismiss: () => void) {
  const cleanup = useRef<() => void>(() => {})
  useEffect(() => () => cleanup.current(), [])
  return (e: ReactPointerEvent) => {
    const el = ref.current
    if (!el) return
    cleanup.current()
    const startY = e.clientY
    const startTime = performance.now()
    let delta = 0
    el.style.transition = 'none'
    const move = (ev: PointerEvent) => {
      delta = Math.max(0, ev.clientY - startY)
      el.style.transform = `translateY(${delta}px)`
    }
    const detach = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      cleanup.current = () => {}
    }
    const up = () => {
      detach()
      el.style.transition = ''
      const velocity = delta / Math.max(1, performance.now() - startTime)
      if (delta > 120 || velocity > 0.6) onDismiss()
      else el.style.transform = ''
    }
    const cancel = () => {
      detach()
      el.style.transition = ''
      el.style.transform = ''
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    cleanup.current = cancel
  }
}
