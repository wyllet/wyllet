'use client'

import { useState } from 'react'
import { CheckIcon, CopyIcon } from '../Icons'
import styles from './docs.module.css'

/** "Copy page" (as Markdown, for pasting into an AI assistant), the raw .md link, and the GitHub source. */
export function PageActions({ mdHref, editHref }: { mdHref: string; editHref: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = async () => {
    try {
      const res = await fetch(mdHref)
      if (!res.ok) throw new Error(String(res.status))
      await navigator.clipboard.writeText(await res.text())
      setState('copied')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 1800)
  }
  return (
    <div className={styles.actions}>
      <button type="button" onClick={copy}>
        {state === 'copied' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy as Markdown'}
      </button>
      <a href={mdHref}>View .md</a>
      <a href={editHref} target="_blank" rel="noreferrer">
        Edit on GitHub
      </a>
    </div>
  )
}
