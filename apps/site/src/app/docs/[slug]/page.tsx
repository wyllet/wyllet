import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageActions } from '@/components/docs/PageActions'
import { Toc } from '@/components/docs/Toc'
import styles from '@/components/docs/docs.module.css'
import { JsonLd } from '@/components/JsonLd'
import { getHeadings, getSource } from '@/lib/content'
import { allDocs, findDoc } from '@/lib/docs'
import { breadcrumbs, graph } from '@/lib/schema'
import { absolute, site } from '@/lib/site'

export function generateStaticParams() {
  return allDocs.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: PageProps<'/docs/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const found = findDoc(slug)
  if (!found) return {}
  const { doc, section } = found
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/docs/${slug}`, types: { 'text/markdown': `/docs/${slug}.md` } },
    openGraph: { type: 'article', url: `/docs/${slug}`, title: `${doc.title} | Wyllet docs`, description: doc.description, section: section.title },
    twitter: { title: `${doc.title} | Wyllet docs`, description: doc.description },
  }
}

export default function DocPage({ params }: PageProps<'/docs/[slug]'>) {
  return (
    <Suspense fallback={<div className={styles.skeleton} aria-busy="true" aria-label="Loading page" />}>
      <Doc params={params} />
    </Suspense>
  )
}

async function Doc({ params }: { params: PageProps<'/docs/[slug]'>['params'] }) {
  const { slug } = await params
  const found = findDoc(slug)
  if (!found) notFound()
  const { doc, section, prev, next } = found
  const { default: Content } = await import(`@/content/docs/${slug}.mdx`)
  const headings = getHeadings(await getSource('docs', slug))

  return (
    <div className={styles.docGrid}>
      <article className={styles.article}>
        <header className={styles.docHeader}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link href="/docs">Docs</Link>
            <span aria-hidden>/</span>
            <span>{section.title}</span>
          </nav>
          <h1>{doc.title}</h1>
          <p className={styles.lede}>{doc.description}</p>
          <PageActions mdHref={`/docs/${slug}.md`} editHref={`${site.github}/blob/main/apps/site/src/content/docs/${slug}.mdx`} />
        </header>
        <div className={styles.prose}>
          <Content />
        </div>
        <nav className={styles.pager} aria-label="Previous and next pages">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} rel="prev">
              <span>Previous</span>
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/docs/${next.slug}`} rel="next" data-next>
              <span>Next</span>
              {next.title}
            </Link>
          )}
        </nav>
      </article>
      <aside className={styles.tocWrap}>
        <Toc headings={headings} />
      </aside>
      <JsonLd
        data={graph(
          {
            '@type': 'TechArticle',
            headline: doc.title,
            description: doc.description,
            url: absolute(`/docs/${slug}`),
            articleSection: section.title,
            inLanguage: 'en',
            isPartOf: { '@id': absolute('/#website') },
            about: { '@id': absolute('/#software') },
            publisher: { '@id': absolute('/#organization') },
            proficiencyLevel: 'Beginner',
          },
          breadcrumbs([
            { name: 'Docs', path: '/docs' },
            { name: doc.title, path: `/docs/${slug}` },
          ]),
        )}
      />
    </div>
  )
}
