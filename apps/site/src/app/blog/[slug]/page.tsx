import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '@/components/blog/blog.module.css'
import docStyles from '@/components/docs/docs.module.css'
import { PageActions } from '@/components/docs/PageActions'
import { JsonLd } from '@/components/JsonLd'
import { coverOf, coverSize, findPost, posts } from '@/lib/blog'
import { getSource, readingTime } from '@/lib/content'
import { breadcrumbs, graph } from '@/lib/schema'
import { absolute, site } from '@/lib/site'

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) return {}
  return {
    // Long titles skip the "| Wyllet" suffix so they stay within what search results display.
    title: post.title.length > 56 ? { absolute: post.title } : post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}`, types: { 'text/markdown': `/blog/${slug}.md` } },
    openGraph: {
      type: 'article',
      url: `/blog/${slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: { title: post.title, description: post.description },
  }
}

const formatDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

export default function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<div className={`container ${docStyles.skeleton}`} aria-busy="true" aria-label="Loading post" />}>
      <Post params={params} />
    </Suspense>
  )
}

async function Post({ params }: { params: PageProps<'/blog/[slug]'>['params'] }) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) notFound()
  const { default: Content } = await import(`@/content/blog/${slug}.mdx`)
  const minutes = readingTime(await getSource('blog', slug))
  const more = posts.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <article className={`container ${styles.post}`}>
      <header className={styles.postHead}>
        <Link href="/blog" className={styles.back}>
          Blog
        </Link>
        <h1>{post.title}</h1>
        <p className={styles.postLede}>{post.description}</p>
        <p className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden> / </span>
          {minutes} min read
          <span aria-hidden> / </span>
          {post.author}
        </p>
        <PageActions mdHref={`/blog/${slug}.md`} editHref={`${site.github}/blob/main/apps/site/src/content/blog/${slug}.mdx`} />
      </header>
      <Image src={coverOf(slug)} alt="" {...coverSize} priority sizes="(max-width: 840px) 100vw, 800px" className={styles.cover} />
      <div className={`${docStyles.prose} ${styles.body}`}>
        <Content />
      </div>
      {more.length > 0 && (
        <aside className={styles.more} aria-labelledby="more-posts">
          <h2 id="more-posts">More from the blog</h2>
          <ul>
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>
                  <strong>{p.title}</strong>
                  <span>{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <JsonLd
        data={graph(
          {
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            url: absolute(`/blog/${slug}`),
            mainEntityOfPage: absolute(`/blog/${slug}`),
            image: [absolute(coverOf(slug)), absolute(`/blog/${slug}/opengraph-image`)],
            keywords: post.tags.join(', '),
            author: { '@type': 'Organization', name: post.author, url: absolute('/') },
            publisher: { '@id': absolute('/#organization') },
            inLanguage: 'en',
          },
          breadcrumbs([
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        )}
      />
    </article>
  )
}
