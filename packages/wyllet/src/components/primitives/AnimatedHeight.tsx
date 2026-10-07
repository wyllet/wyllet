import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Smoothly animates its height whenever the content size changes (view transitions inside modals). */
export function AnimatedHeight({ children, className }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>()

  useLayoutEffect(() => {
    const el = inner.current
    if (!el || typeof ResizeObserver === 'undefined') return
    // offsetHeight ignores transforms, so measuring during a scale-in animation stays accurate.
    setHeight(el.offsetHeight)
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={className ? `wy-animated-height ${className}` : 'wy-animated-height'} style={{ height }}>
      <div ref={inner}>{children}</div>
    </div>
  )
}
