import { cacheLife } from 'next/cache'
import { allDocs, docsNav } from './docs'
import { getHeadings, getSource } from './content'

export interface SearchEntry {
  href: string
  title: string
  section: string
  description: string
  /** Heading text this entry points at, when it's a sub-result. */
  heading?: string
}

/** Pages and their headings, built at build time and shipped to the client search. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  'use cache'
  cacheLife('max') // content only changes on deploy
  const entries: SearchEntry[] = []
  for (const section of docsNav)
    for (const doc of section.pages) {
      entries.push({ href: `/docs/${doc.slug}`, title: doc.title, section: section.title, description: doc.description })
      const source = await getSource('docs', doc.slug).catch(() => '')
      for (const h of getHeadings(source))
        entries.push({ href: `/docs/${doc.slug}#${h.id}`, title: doc.title, section: section.title, description: '', heading: h.text })
    }
  return entries
}

export const docCount = allDocs.length
