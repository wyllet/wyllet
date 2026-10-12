import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/components/blog/blog.module.css'
import { coverOf, coverSize, posts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Release notes and engineering write-ups from the team behind Wyllet, the open-source wallet connector for React dApps.',
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/rss.xml' } },
}

const formatDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export default function BlogIndex() {
  const [first, ...rest] = posts
  return (
    <div className={`container ${styles.index}`}>
      <header className={styles.indexHead}>
        <h1>Blog</h1>
        <p>
          Releases and the engineering behind them. Follow along with the <a href="/rss.xml">RSS feed</a>.
        </p>
      </header>
      {first && (
        <Link href={`/blog/${first.slug}`} className={styles.feature}>
          <Image
            src={coverOf(first.slug)}
            alt=""
            {...coverSize}
            priority
            sizes="(max-width: 960px) 100vw, 920px"
            className={styles.featureCover}
          />
          <time dateTime={first.date}>{formatDate(first.date)}</time>
          <h2>{first.title}</h2>
          <p>{first.description}</p>
          <span className={styles.readMore}>Read the post</span>
        </Link>
      )}
      <ul className={styles.list}>
        {rest.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>
              <Image src={coverOf(p.slug)} alt="" {...coverSize} sizes="(max-width: 640px) 100vw, 280px" className={styles.thumb} />
              <div>
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
