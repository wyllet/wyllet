import { coverOf, findPost, posts } from '@/lib/blog'
import { ogCoverImage, ogImage, ogSize } from '@/lib/og'

export const alt = 'Wyllet blog'
export const size = ogSize
export const contentType = 'image/png'

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) return ogImage({ title: 'Blog', kicker: 'Blog' })
  return ogCoverImage({ title: post.title, cover: coverOf(post.slug), kicker: 'Blog' })
}
