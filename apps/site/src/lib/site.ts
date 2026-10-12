/** Site-wide constants. Every absolute URL (canonical, OG, sitemap, JSON-LD) is built from `siteUrl`. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wyllet.dev').replace(/\/$/, '')

export const site = {
  name: 'Wyllet',
  title: 'Wyllet: the open-source wallet connector for React dApps',
  tagline: 'One button. Every wallet. Your design.',
  description:
    'Open-source wallet connector for React dApps on wagmi and viem: connect button, account panel, tokens, activity, toasts and SIWE. Zero runtime dependencies.',
  /** Longer summary for llms.txt and JSON-LD, where length limits don't apply. */
  summary:
    'Wyllet is an open-source wallet connector for React dApps built on wagmi and viem. A connect button, account panel, tokens, activity, toasts and Sign-In With Ethereum, themed to match your app, with zero runtime dependencies.',
  domain: 'wyllet.dev',
  github: 'https://github.com/wyllet/wyllet',
  npm: 'https://www.npmjs.com/package/wyllet',
  issues: 'https://github.com/wyllet/wyllet/issues',
  releases: 'https://github.com/wyllet/wyllet/releases',
  licenseUrl: 'https://github.com/wyllet/wyllet/blob/main/LICENSE',
  securityAdvisory: 'https://github.com/wyllet/wyllet/security/advisories/new',
  x: 'https://x.com/wylletdev',
  xHandle: '@wylletdev',
  email: 'support@wyllet.dev',
  version: '1.0.0',
  license: 'MIT',
  keywords: [
    'wallet connector',
    'connect wallet button',
    'wagmi',
    'viem',
    'react',
    'web3',
    'ethereum',
    'dapp',
    'walletconnect',
    'sign-in with ethereum',
    'siwe',
    'rainbowkit alternative',
    'evm',
    'next.js',
  ],
} as const

export const absolute = (path = '/') => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
