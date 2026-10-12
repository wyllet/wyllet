'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { docsNav } from '@/lib/docs'
import styles from './docs.module.css'

export function DocsSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const current = docsNav.flatMap((s) => s.pages).find((p) => pathname === `/docs/${p.slug}`)
  return (
    <nav className={styles.nav} data-open={open || undefined} aria-label="Docs pages">
      <button type="button" className={styles.navToggle} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{current ? current.title : 'Overview'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className={styles.navList}>
        <Link href="/docs" className={styles.navLink} aria-current={pathname === '/docs' ? 'page' : undefined} onClick={() => setOpen(false)}>
          Overview
        </Link>
        {docsNav.map((section) => (
          <div key={section.title} className={styles.navSection}>
            <h2>{section.title}</h2>
            <ul>
              {section.pages.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/docs/${p.slug}`}
                    className={styles.navLink}
                    aria-current={pathname === `/docs/${p.slug}` ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
