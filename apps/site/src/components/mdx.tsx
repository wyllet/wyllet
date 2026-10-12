import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import styles from './mdx.module.css'

export function Callout({ type = 'note', children }: { type?: 'note' | 'warning'; children: ReactNode }) {
  return (
    <aside className={styles.callout} data-type={type} role="note">
      <Image
        src={type === 'warning' ? '/illustrations/mascot-worried.png' : '/illustrations/mascot-wink.png'}
        alt=""
        width={800}
        height={800}
        sizes="44px"
        className={styles.calloutArt}
      />
      <div className={styles.calloutBody}>
        <span className={styles.calloutLabel}>{type === 'warning' ? 'Warning' : 'Note'}</span>
        <div>{children}</div>
      </div>
    </aside>
  )
}

function A({ href = '', children, ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/') || href.startsWith('#'))
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  return (
    <a href={href} target="_blank" rel="noreferrer" {...rest}>
      {children}
    </a>
  )
}

function Table(props: ComponentProps<'table'>) {
  return (
    // Focusable so keyboard users can scroll wide tables on small screens.
    <div className={styles.tableWrap} tabIndex={0}>
      <table {...props} />
    </div>
  )
}

export const mdxComponents: MDXComponents = { Callout, a: A, table: Table }
