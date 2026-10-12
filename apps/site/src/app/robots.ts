import type { MetadataRoute } from 'next'
import { absolute } from '@/lib/site'

/** Everyone is welcome, including AI search and training crawlers: the docs exist to be read and cited. */
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
  'cohere-ai',
  'Meta-ExternalAgent',
  'DuckAssistBot',
  'MistralAI-User',
  'Amazonbot',
  'YouBot',
]

export default function robots(): MetadataRoute.Robots {
  // Deploy previews and branch deploys on Netlify must never be indexed.
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production') return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/' }, ...aiCrawlers.map((userAgent) => ({ userAgent, allow: '/' }))],
    sitemap: absolute('/sitemap.xml'),
    host: absolute('/'),
  }
}
