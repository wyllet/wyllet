import { getSource, toMarkdown } from '@/lib/content'
import { findPost, posts } from '@/lib/blog'
import { absolute } from '@/lib/site'

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

/** Served at /blog/<slug>.md (see rewrites in next.config.ts). */
export async function GET(_req: Request, { params }: RouteContext<'/md/blog/[slug]'>) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) return new Response('Not found', { status: 404 })
  const url = absolute(`/blog/${slug}`)
  const body = toMarkdown(post.title, `${post.description} (${post.date})`, url, await getSource('blog', slug))
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', Link: `<${url}>; rel="canonical"` },
  })
}
