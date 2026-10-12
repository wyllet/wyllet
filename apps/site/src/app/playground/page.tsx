import type { Metadata } from 'next'
import { DemoDapp } from '@/components/playground/DemoDapp'
import { Studio } from '@/components/playground/Studio'
import styles from '@/components/playground/playground.module.css'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Try every Wyllet option live, from presentations and themes to SIWE and token lists, then copy the generated code.',
  alternates: { canonical: '/playground' },
}

export default function PlaygroundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>Playground</h1>
        <p>
          Change any option in the Studio and the real panel updates. Connect with <b>Demo wallet</b> to see the account panel, then copy
          the code from the Code tab.
        </p>
        <a href="#studio" className={styles.jump}>
          Jump to the Studio
        </a>
      </header>
      <div className={styles.layout}>
        <DemoDapp />
        <Studio />
      </div>
    </div>
  )
}
