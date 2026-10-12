'use client'

import { useCopyToClipboard } from 'wyllet'
import { CheckIcon, CopyIcon } from './Icons'

export function CopyButton({ text, className, label = 'Copy code' }: { text: string; className?: string; label?: string }) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <button type="button" className={className} onClick={() => copy(text)} aria-label={copied ? 'Copied' : label} title={copied ? 'Copied' : label}>
      {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
    </button>
  )
}
