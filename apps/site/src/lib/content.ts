import { cacheLife } from 'next/cache'
import GithubSlugger from 'github-slugger'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type ContentKind = 'docs' | 'blog'

export interface Heading {
  depth: 2 | 3
  text: string
  id: string
}

const root = path.join(process.cwd(), 'src', 'content')

/** Raw MDX source of a doc or post. Cached, so it is read once at build time. */
export async function getSource(kind: ContentKind, slug: string): Promise<string> {
  'use cache'
  cacheLife('max') // content only changes on deploy
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug: ${slug}`)
  return readFile(path.join(root, kind, `${slug}.mdx`), 'utf8')
}

/** Strips inline markdown so heading text matches what rehype-slug sees. */
export function plainText(md: string) {
  return md
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .trim()
}

/** `##` and `###` headings (outside code fences), with the same ids rehype-slug generates. */
export function getHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let fenced = false
  for (const line of source.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    if (fenced) continue
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const depth = m[1]!.length
    const text = plainText(m[2]!)
    const id = slugger.slug(text)
    if (depth === 2 || depth === 3) headings.push({ depth, text, id })
  }
  return headings
}

/** Markdown twin for AI agents: MDX-only syntax converted to plain Markdown. */
export function toMarkdown(title: string, description: string, url: string, source: string) {
  const body = source.replace(/<Callout(?:\s+type="(\w+)")?>([\s\S]*?)<\/Callout>/g, (_, type: string | undefined, inner: string) => {
    const lines = inner.trim().split('\n')
    lines[0] = `**${type === 'warning' ? 'Warning' : 'Note'}:** ${lines[0]}`
    return lines.map((l) => (l ? `> ${l}` : '>')).join('\n')
  })
  return `# ${title}\n\n> ${description}\n\nSource: ${url}\n\n${body.trim()}\n`
}

/** Approximate reading time in minutes. */
export function readingTime(source: string) {
  return Math.max(1, Math.round(source.split(/\s+/).length / 230))
}
