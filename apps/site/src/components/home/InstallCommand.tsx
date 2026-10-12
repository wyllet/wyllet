'use client'

import { useState } from 'react'
import { useCopyToClipboard } from 'wyllet'
import { CheckIcon, CopyIcon } from '../Icons'
import styles from './home.module.css'

const managers = {
  pnpm: 'pnpm add wyllet wagmi viem @tanstack/react-query',
  npm: 'npm i wyllet wagmi viem @tanstack/react-query',
  yarn: 'yarn add wyllet wagmi viem @tanstack/react-query',
  bun: 'bun add wyllet wagmi viem @tanstack/react-query',
} as const
type Manager = keyof typeof managers

export function InstallCommand() {
  const [pm, setPm] = useState<Manager>('pnpm')
  const { copied, copy } = useCopyToClipboard()
  return (
    <div className={styles.install}>
      <div className={styles.installTabs} role="tablist" aria-label="Package manager">
        {(Object.keys(managers) as Manager[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={pm === m} onClick={() => setPm(m)}>
            {m}
          </button>
        ))}
      </div>
      <div className={styles.installRow}>
        <code tabIndex={0}>
          <span aria-hidden>$ </span>
          {managers[pm]}
        </code>
        <button type="button" className={styles.copyButton} onClick={() => copy(managers[pm])} aria-label={copied ? 'Copied' : 'Copy install command'}>
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      </div>
    </div>
  )
}
