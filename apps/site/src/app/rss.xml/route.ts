import { posts } from '@/lib/blog'
import { absolute, site } from '@/lib/site'

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

export function GET() {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${absolute(`/blog/${p.slug}`)}</link>
      <guid isPermaLink="true">${absolute(`/blog/${p.slug}`)}</guid>
      <description>${esc(p.description)}</description>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Wyllet blog</title>
    <link>${absolute('/blog')}</link>
    <description>${esc(`News and engineering notes from the team behind ${site.name}.`)}</description>
    <language>en</language>
    <atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
