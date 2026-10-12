'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/content'
import styles from './docs.module.css'

/** "On this page" with scroll-spy. */
export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | undefined>(headings[0]?.id)
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -65% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null
  return (
    <nav className={styles.toc} aria-label="On this page">
      <h2>On this page</h2>
      <ul>
        {headings.map((h) => (
          <li key={h.id} data-depth={h.depth}>
            <a href={`#${h.id}`} aria-current={active === h.id ? 'location' : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
