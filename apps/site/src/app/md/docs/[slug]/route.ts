import { getSource, toMarkdown } from '@/lib/content'
import { allDocs, findDoc } from '@/lib/docs'
import { absolute } from '@/lib/site'

export function generateStaticParams() {
  return allDocs.map((d) => ({ slug: d.slug }))
}

/** Served at /docs/<slug>.md (see rewrites in next.config.ts). */
export async function GET(_req: Request, { params }: RouteContext<'/md/docs/[slug]'>) {
  const { slug } = await params
  const found = findDoc(slug)
  if (!found) return new Response('Not found', { status: 404 })
  const url = absolute(`/docs/${slug}`)
  const body = toMarkdown(found.doc.title, found.doc.description, url, await getSource('docs', slug))
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', Link: `<${url}>; rel="canonical"` },
  })
}
