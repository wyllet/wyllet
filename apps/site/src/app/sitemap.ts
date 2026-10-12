import type { MetadataRoute } from 'next'
import { posts } from '@/lib/blog'
import { allDocs } from '@/lib/docs'
import { absolute } from '@/lib/site'

/** Content dates are fixed (no `new Date()`), so the sitemap stays static and lastModified is honest. */
const RELEASED = '2026-10-07'

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' = 'monthly', lastModified = RELEASED) => ({
    url: absolute(path),
    lastModified,
    changeFrequency,
    priority,
  })
  return [
    page('/', 1, 'weekly'),
    page('/docs', 0.9, 'weekly'),
    page('/features', 0.8),
    page('/playground', 0.8),
    page('/blog', 0.7, 'weekly'),
    page('/changelog', 0.6, 'weekly'),
    ...allDocs.map((d) => page(`/docs/${d.slug}`, d.slug === 'quick-start' || d.slug === 'installation' ? 0.9 : 0.7)),
    ...posts.map((p) => page(`/blog/${p.slug}`, 0.6, 'monthly', p.date)),
  ]
}
