/** Blog posts. Each maps to `src/content/blog/<slug>.mdx` (body only, no H1). */
export interface Post {
  slug: string
  title: string
  description: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  author: string
  tags: string[]
}

export const posts: Post[] = [
  {
    slug: 'introducing-wyllet',
    title: 'Introducing Wyllet 1.0',
    description: 'An open-source wallet connector for React dApps, built on wagmi and viem, with its own look and no runtime dependencies.',
    date: '2026-10-07',
    author: 'Wyllet team',
    tags: ['release', 'announcement'],
  },
  {
    slug: 'zero-runtime-dependencies',
    title: 'How we shipped a wallet connector with zero runtime dependencies',
    description: 'Why we removed every third-party runtime package, wrote our own QR encoder, and publish with npm provenance.',
    date: '2026-10-07',
    author: 'Wyllet team',
    tags: ['security', 'engineering'],
  },
  {
    slug: 'qr-codes-that-scan',
    title: 'Pretty QR codes that still scan',
    description: 'Our first round-dot QR design decoded in 1 of 40 automated scans. How we measured it, what we shipped, and the test that keeps it honest.',
    date: '2026-10-07',
    author: 'Wyllet team',
    tags: ['engineering', 'walletconnect'],
  },
  {
    slug: 'all-wallets-on-mobile',
    title: 'Why "WalletConnect" kept opening the wrong wallet',
    description: 'Bare wc: links open the phone\'s default wallet. The All wallets directory fixes it with each wallet\'s own app link.',
    date: '2026-10-07',
    author: 'Wyllet team',
    tags: ['walletconnect', 'mobile'],
  },
]

export const findPost = (slug: string) => posts.find((p) => p.slug === slug)

/** Cover art for each post lives at /illustrations/blog-<slug>.jpg (1600 x 840). */
export const coverOf = (slug: string) => `/illustrations/blog-${slug}.jpg`
export const coverSize = { width: 1600, height: 840 }
