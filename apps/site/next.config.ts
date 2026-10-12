import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'
/** Netlify sets CONTEXT to production, deploy-preview or branch-deploy. Only production may be indexed. */
const isPreview = !!process.env.CONTEXT && process.env.CONTEXT !== 'production'

/**
 * Content Security Policy.
 * Pages are statically prerendered (fast, cacheable, crawlable), so per-request nonces aren't an option:
 * Next's inline bootstrap scripts need 'unsafe-inline'. Everything else is locked down. Wallet traffic
 * (WalletConnect relay, chain RPCs) needs https:/wss: in connect-src.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  'frame-src https://verify.walletconnect.com https://verify.walletconnect.org',
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  // Browsers ignore (and warn about) COOP on plain-HTTP origins such as a dev server on the LAN.
  ...(isDev ? [] : [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }]),
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev only: lets phones and tablets on the same network load the dev server (e.g. http://192.168.1.20:4321).
  allowedDevOrigins: ['127.0.0.1', '192.168.*.*', '10.*.*.*', '172.*.*.*', '*.local'],
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...(isPreview ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] : []),
    ]
  },
  async redirects() {
    const canonical = 'https://wyllet.dev'
    return [
      // Every other domain lands on the canonical one, keeping the path (Netlify also does this at the edge).
      {
        source: '/:path*',
        has: [{ type: 'host' as const, value: '(?:www\\.)?wyllet\\.(?:io|xyz|org)' }],
        destination: `${canonical}/:path*`,
        permanent: true,
      },
      { source: '/:path*', has: [{ type: 'host' as const, value: 'www\\.wyllet\\.dev' }], destination: `${canonical}/:path*`, permanent: true },
      // Short links that are easy to say and share.
      { source: '/github', destination: 'https://github.com/wyllet/wyllet', permanent: false },
      { source: '/npm', destination: 'https://www.npmjs.com/package/wyllet', permanent: false },
      { source: '/x', destination: 'https://x.com/wylletdev', permanent: false },
      { source: '/twitter', destination: 'https://x.com/wylletdev', permanent: false },
      { source: '/issues', destination: 'https://github.com/wyllet/wyllet/issues', permanent: false },
      { source: '/releases', destination: 'https://github.com/wyllet/wyllet/releases', permanent: false },
      { source: '/install', destination: '/docs/installation', permanent: true },
      { source: '/start', destination: '/docs/quick-start', permanent: true },
      { source: '/docs/getting-started', destination: '/docs/quick-start', permanent: true },
      { source: '/security', destination: '/docs/security', permanent: true },
      { source: '/ai', destination: '/docs/ai-assistants', permanent: true },
      { source: '/feed', destination: '/rss.xml', permanent: true },
      { source: '/feed.xml', destination: '/rss.xml', permanent: true },
      { source: '/atom.xml', destination: '/rss.xml', permanent: true },
      { source: '/blog/rss.xml', destination: '/rss.xml', permanent: true },
      { source: '/llm.txt', destination: '/llms.txt', permanent: true },
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
    ]
  },
  async rewrites() {
    // Markdown twins of every doc and post, for AI agents and "copy as Markdown".
    return [
      { source: '/docs/:slug.md', destination: '/md/docs/:slug' },
      { source: '/blog/:slug.md', destination: '/md/blog/:slug' },
    ]
  },
}

const withMDX = createMDX({
  // .md too, so the repo's CHANGELOG.md renders as the /changelog page (single source of truth).
  extension: /\.mdx?$/,
  options: {
    // Turbopack needs plugin names as strings with serializable options.
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [
      'rehype-slug',
      ['rehype-pretty-code', { theme: { dark: 'github-dark-default', light: 'github-light-default' }, keepBackground: false, defaultLang: 'plaintext' }],
    ],
  },
})

export default withMDX(nextConfig)
