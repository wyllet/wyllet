import { allDocs, findDoc } from '@/lib/docs'
import { ogImage, ogSize } from '@/lib/og'

export const alt = 'Wyllet documentation'
export const size = ogSize
export const contentType = 'image/png'

export function generateStaticParams() {
  return allDocs.map((d) => ({ slug: d.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const found = findDoc(slug)
  return ogImage({ title: found?.doc.title ?? 'Documentation', kicker: found ? `Docs / ${found.section.title}` : 'Docs', subtitle: found?.doc.description })
}
