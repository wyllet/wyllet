/**
 * Single source of truth for the docs: navigation, sitemap, llms.txt and metadata all read from here.
 * Each entry maps to `src/content/docs/<slug>.mdx` (body only, no H1: the page title comes from here).
 */
export interface DocPage {
  slug: string
  title: string
  /** One sentence; used for <meta description>, search results and llms.txt. */
  description: string
}

export interface DocSection {
  title: string
  pages: DocPage[]
}

export const docsNav: DocSection[] = [
  {
    title: 'Getting started',
    pages: [
      { slug: 'introduction', title: 'Introduction', description: 'What Wyllet is, what it includes, and how it fits into a wagmi + viem dApp.' },
      { slug: 'installation', title: 'Installation', description: 'Install Wyllet and its peer dependencies, and enable WalletConnect.' },
      { slug: 'quick-start', title: 'Quick start', description: 'Add a working connect button to a React dApp in a few minutes.' },
      { slug: 'nextjs', title: 'Next.js', description: 'Use Wyllet with the Next.js App Router, server components and SSR.' },
      { slug: 'ai-assistants', title: 'Build with AI assistants', description: 'Give Cursor, Claude Code, Copilot or ChatGPT the Wyllet docs and the rules for a correct integration.' },
    ],
  },
  {
    title: 'Core concepts',
    pages: [
      { slug: 'configuration', title: 'Configuration', description: 'Create a wagmi config with getDefaultConfig: app info, chains, transports and wallets.' },
      { slug: 'provider', title: 'WylletProvider', description: 'Every WylletProvider prop: theme, appearance, tokens, auth, messages and callbacks.' },
      { slug: 'wyllet-button', title: 'WylletButton', description: 'The Island button, its display options, and building your own trigger with useWylletButton.' },
      { slug: 'presentations', title: 'Presentations', description: 'Open the panel as a drawer, an anchored popover, a modal or a mobile bottom sheet.' },
    ],
  },
  {
    title: 'Customization',
    pages: [
      { slug: 'theming', title: 'Theming', description: 'Theme presets, design tokens as CSS variables, light and dark mode, and custom themes.' },
      { slug: 'class-names', title: 'Class names', description: 'Attach your own classes (including Tailwind) to individual Wyllet elements.' },
      { slug: 'i18n', title: 'Translations', description: 'Rename any string or translate the entire interface.' },
    ],
  },
  {
    title: 'Wallets',
    pages: [
      { slug: 'wallets', title: 'Wallets', description: 'Built-in wallets, EIP-6963 detection, custom wallets and connectors.' },
      { slug: 'all-wallets', title: 'All wallets', description: 'The searchable WalletConnect directory with official logos and per-wallet app links.' },
      { slug: 'walletconnect', title: 'WalletConnect', description: 'Project IDs, domain allowlists, QR codes and how mobile app links work.' },
    ],
  },
  {
    title: 'Chains and tokens',
    pages: [
      { slug: 'chains', title: 'Chains', description: 'popularChains, customChain() and arranging the Networks tab with chainOrder.' },
      { slug: 'tokens', title: 'Tokens', description: 'Token lists, withDefaultTokens, pinning, sorting and user token import.' },
    ],
  },
  {
    title: 'Features',
    pages: [
      { slug: 'account-panel', title: 'Account panel', description: 'Account summary, identity card, tokens, activity, networks and receive.' },
      { slug: 'activity', title: 'Activity and transactions', description: 'Track transactions and log custom events in the activity timeline.' },
      { slug: 'toasts', title: 'Toasts', description: 'Themed, promise-aware notifications with useWylletToast.' },
      { slug: 'siwe', title: 'Sign-In With Ethereum', description: 'Add a SIWE verification step to the connect flow with an auth adapter.' },
      { slug: 'connect-gate', title: 'ConnectGate', description: 'Render content only when users are connected, on a supported network and signed in.' },
    ],
  },
  {
    title: 'Reference',
    pages: [
      { slug: 'hooks', title: 'Hooks', description: 'API reference for every Wyllet hook: useWyllet, useWylletButton, useWylletToast, useWylletActivity, useWylletAuth and more.' },
      { slug: 'components', title: 'Components', description: 'API reference for every Wyllet component: WylletButton, ConnectGate, Avatar, ChainIcon, TokenIcon, QRCode and more.' },
      { slug: 'utilities', title: 'Utilities and types', description: 'Helper functions and the TypeScript types Wyllet exports.' },
    ],
  },
  {
    title: 'Guides',
    pages: [
      { slug: 'security', title: 'Security', description: 'Zero runtime dependencies, provenance, CSP and what Wyllet does and does not do.' },
      { slug: 'migrate-from-rainbowkit', title: 'Migrate from RainbowKit', description: 'Map RainbowKit concepts to Wyllet and switch a dApp over step by step.' },
      { slug: 'faq', title: 'FAQ', description: 'Answers to common questions about Wyllet: pricing, wallets, chains, Next.js, styling, security and data collection.' },
    ],
  },
]

export const allDocs: DocPage[] = docsNav.flatMap((s) => s.pages)

export function findDoc(slug: string) {
  const index = allDocs.findIndex((d) => d.slug === slug)
  if (index === -1) return undefined
  const section = docsNav.find((s) => s.pages.some((p) => p.slug === slug))!
  return { doc: allDocs[index]!, section, prev: allDocs[index - 1], next: allDocs[index + 1] }
}
