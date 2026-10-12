import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { MascotVideo } from '@/components/MascotVideo'
import styles from '@/components/features.module.css'
import { featureGroups } from '@/lib/features'
import { breadcrumbs, graph } from '@/lib/schema'
import { absolute } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Everything in Wyllet: the Island button, four presentations, All wallets, account panel, tokens, activity, toasts, SIWE, themes and zero dependencies.',
  alternates: { canonical: '/features' },
}

export default function FeaturesPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <div className={styles.head}>
          <h1>Everything in the box</h1>
          <p>
            Wyllet covers the whole wallet experience of a dApp, from the first click on Connect to the last confirmed transaction. Each
            feature below links to its documentation.
          </p>
          <div className={styles.actions}>
            <Link href="/playground" className="btn btn-primary">
              Try them in the playground
            </Link>
            <Link href="/docs/quick-start" className="btn btn-ghost">
              Quick start
            </Link>
          </div>
        </div>
        <div className={styles.videoFrame}>
          <MascotVideo className={styles.video} />
        </div>
      </header>
      {featureGroups.map((group, i) => (
        <section key={group.title} className={styles.group} aria-labelledby={`g-${i}`}>
          <div className={styles.groupHead}>
            <Image src={group.art} alt="" width={800} height={800} sizes="120px" className={styles.groupArt} />
            <h2 id={`g-${i}`}>{group.title}</h2>
            <p>{group.intro}</p>
          </div>
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <JsonLd
        data={graph(
          {
            '@type': 'ItemList',
            name: 'Wyllet features',
            url: absolute('/features'),
            itemListElement: featureGroups
              .flatMap((g) => g.items)
              .map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: item.title,
                description: item.body,
                url: absolute(item.href),
              })),
          },
          breadcrumbs([{ name: 'Features', path: '/features' }]),
        )}
      />
    </div>
  )
}
