import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/components/docs/docs.module.css'
import { docsNav } from '@/lib/docs'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Guides and API reference for Wyllet, the open-source wallet connector for React dApps built on wagmi and viem.',
  alternates: { canonical: '/docs' },
}

export default function DocsIndex() {
  return (
    <article className={styles.article}>
      <header className={`${styles.docHeader} ${styles.withArt}`}>
        <Image src="/illustrations/mascot-calm.png" alt="" width={800} height={800} sizes="120px" priority className={styles.headerArt} />
        <h1>Documentation</h1>
        <p className={styles.lede}>
          Everything you need to add Wyllet to a React dApp, from the first install to theming, wallets, tokens and Sign-In With Ethereum.
          New here? Start with the <Link href="/docs/quick-start">quick start</Link>.
        </p>
      </header>
      <div className={styles.overview}>
        {docsNav.map((section) => (
          <section key={section.title} className={styles.overviewSection} aria-labelledby={`s-${section.title}`}>
            <h2 id={`s-${section.title}`}>{section.title}</h2>
            <ul>
              {section.pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/docs/${p.slug}`}>
                    <strong>{p.title}</strong>
                    <span>{p.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}
