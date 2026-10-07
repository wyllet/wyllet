import { useEffect, useRef, type HTMLAttributes } from 'react'
import { cx } from '../../utils'

/**
 * Scroll container without a visible scrollbar. Instead, the edges fade out
 * while there is more content in that direction, so overflow stays discoverable.
 */
export function ScrollArea({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = outer.current
    if (!el) return
    const update = () => {
      el.dataset.fadeTop = String(el.scrollTop > 2)
      el.dataset.fadeBottom = String(el.scrollTop + el.clientHeight < el.scrollHeight - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    if (typeof ResizeObserver === 'undefined') return () => el.removeEventListener('scroll', update)
    const observer = new ResizeObserver(update)
    observer.observe(el)
    if (inner.current) observer.observe(inner.current)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={outer} className={cx('wy-scroll', className)} {...rest}>
      <div ref={inner} className="wy-scroll-inner">
        {children}
      </div>
    </div>
  )
}
