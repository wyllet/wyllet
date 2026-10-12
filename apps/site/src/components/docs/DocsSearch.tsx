'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { SearchEntry } from '@/lib/search'
import { SearchIcon } from '../Icons'
import styles from './docs.module.css'

function score(entry: SearchEntry, terms: string[]) {
  const title = entry.title.toLowerCase()
  const heading = entry.heading?.toLowerCase() ?? ''
  const rest = `${entry.section} ${entry.description}`.toLowerCase()
  let total = 0
  for (const t of terms) {
    if (heading.includes(t)) total += heading.startsWith(t) ? 6 : 4
    else if (title.includes(t)) total += title.startsWith(t) ? 5 : 3
    else if (rest.includes(t)) total += 1
    else return 0
  }
  return total + (entry.heading ? 0 : 0.5)
}

export function DocsSearch({ index }: { index: SearchEntry[] }) {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return index.filter((e) => !e.heading).slice(0, 8)
    return index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((x) => x.e)
  }, [index, query])

  const open = () => {
    dialog.current?.showModal()
    setActive(0)
    requestAnimationFrame(() => input.current?.select())
  }
  const go = (href: string) => {
    dialog.current?.close()
    router.push(href)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key !== '/' || e.metaKey || e.ctrlKey || target.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      open()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        className={styles.searchButton}
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Search docs"
        aria-keyshortcuts="/"
      >
        <SearchIcon size={16} />
        <span>Search docs</span>
        <kbd aria-label="Shortcut: slash">/</kbd>
      </button>
      <dialog
        ref={dialog}
        className={styles.searchDialog}
        aria-label="Search documentation"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className={styles.searchBox}>
          <div className={styles.searchField}>
            <SearchIcon size={18} />
            <input
              ref={input}
              type="search"
              placeholder="Search hooks, props, guides…"
              value={query}
              aria-label="Search documentation"
              aria-controls="docs-search-results"
              aria-activedescendant={results[active] ? `docs-result-${active}` : undefined}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActive((i) => Math.min(i + 1, results.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActive((i) => Math.max(i - 1, 0))
                } else if (e.key === 'Enter' && results[active]) {
                  e.preventDefault()
                  go(results[active].href)
                }
              }}
            />
            <kbd>esc</kbd>
          </div>
          <ul id="docs-search-results" role="listbox" className={styles.searchResults}>
            {results.length === 0 && (
              <li className={styles.searchEmpty}>
                <Image src="/illustrations/mascot-sleepy.png" alt="" width={800} height={800} sizes="72px" />
                No matches. Try a hook or prop name, like useWyllet or presentation.
              </li>
            )}
            {results.map((r, i) => (
              <li
                key={r.href}
                id={`docs-result-${i}`}
                role="option"
                aria-selected={i === active}
                className={styles.searchResult}
                onMouseMove={() => setActive(i)}
                onClick={() => go(r.href)}
              >
                <span className={styles.searchTitle}>{r.heading ?? r.title}</span>
                <span className={styles.searchMeta}>{r.heading ? `${r.section} / ${r.title}` : r.description || r.section}</span>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}
