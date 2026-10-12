import type { ReactNode } from 'react'

/**
 * Section headings settle in as they scroll into view, using a CSS scroll-driven animation.
 * No JavaScript, never hidden in the server HTML, and skipped entirely for reduced motion or older browsers.
 */
export function Reveal({ children, className, align = 'center' }: { children: ReactNode; className?: string; align?: 'center' | 'left' }) {
  return (
    <div className={`reveal ${className ?? ''}`} data-align={align}>
      {children}
    </div>
  )
}
