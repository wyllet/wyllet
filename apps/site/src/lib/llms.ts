import { cacheLife } from 'next/cache'
import { posts } from './blog'
import { getSource, toMarkdown } from './content'
import { docsNav } from './docs'
import { absolute, site } from './site'

/** llms.txt (https://llmstxt.org): a curated index pointing at the Markdown twin of every page. */
export function llmsIndex() {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.summary}`,
    '',
    `Wyllet is published on npm as \`wyllet\` (current version ${site.version}, MIT). Install: \`pnpm add wyllet wagmi viem @tanstack/react-query\`. Source: ${site.github}`,
    '',
    'Key facts:',
    '- Peer dependencies only: react >=18, react-dom >=18, wagmi ^3, viem ^2.15, @tanstack/react-query >=5. Optional: @walletconnect/ethereum-provider for QR and mobile wallets.',
    '- Main exports: WylletProvider, WylletButton, WylletEmbed, getDefaultConfig, useWyllet, useWylletButton, useWylletToast, useWylletActivity, useWylletAuth, ConnectGate, customChain, popularChains, withDefaultTokens, obsidianTheme, porcelainTheme, auroraTheme, terminalTheme.',
    '- Every page below is available as Markdown by adding `.md` to its URL, or by requesting it with `Accept: text/markdown`.',
    '',
    '**Rules for AI coding assistants**',
    '',
    `Follow these when generating a Wyllet integration. Full guide: ${absolute('/docs/ai-assistants.md')}`,
    '',
    '- Install `wyllet wagmi viem @tanstack/react-query`. Add `@walletconnect/ethereum-provider` only when `walletConnectProjectId` is set.',
    '- Build the wagmi config with `getDefaultConfig({ appName, chains, walletConnectProjectId })` from `wyllet`. The first chain is the default. Use `customChain()` for chains not in `viem/chains`.',
    "- Put providers in a `'use client'` component, nested `WagmiProvider` > `QueryClientProvider` > `WylletProvider`. All Wyllet components and hooks render inside `WylletProvider`.",
    '- Do not import any CSS: Wyllet injects its styles.',
    '- Render `<WylletButton />` for the connect button. For a custom trigger use `useWylletButton()`, whose `open(el)` takes an element; `useWyllet().openConnect({ anchor })` takes an options object.',
    '- The `⌘K` shortcut is opt-in: `shortcut="mod+k"`. The popover presentation needs an anchor element.',
    '- In Next.js set `appUrl` and `ssr: true` in `getDefaultConfig`, and create the `QueryClient` inside `useState`.',
    '- `burnerWallet()` is for local development only. Never use it in production.',
    '- Only use props, hooks and options documented on this site.',
    '',
    '**Minimal integration**',
    '',
    '```tsx',
    "'use client'",
    "import { QueryClient, QueryClientProvider } from '@tanstack/react-query'",
    "import { useState, type ReactNode } from 'react'",
    "import { base, mainnet } from 'viem/chains'",
    "import { WagmiProvider } from 'wagmi'",
    "import { getDefaultConfig, WylletButton, WylletProvider } from 'wyllet'",
    '',
    'const config = getDefaultConfig({',
    "  appName: 'My dApp',",
    '  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,',
    '  chains: [mainnet, base],',
    '  ssr: true,',
    '})',
    '',
    'export function Providers({ children }: { children: ReactNode }) {',
    '  const [queryClient] = useState(() => new QueryClient())',
    '  return (',
    '    <WagmiProvider config={config}>',
    '      <QueryClientProvider client={queryClient}>',
    '        <WylletProvider shortcut="mod+k">{children}</WylletProvider>',
    '      </QueryClientProvider>',
    '    </WagmiProvider>',
    '  )',
    '}',
    '',
    '// Anywhere inside <Providers>: <WylletButton />',
    '```',
    '',
  ]
  for (const section of docsNav) {
    lines.push(`## ${section.title}`, '')
    for (const d of section.pages) lines.push(`- [${d.title}](${absolute(`/docs/${d.slug}.md`)}): ${d.description}`)
    lines.push('')
  }
  lines.push('## Blog', '')
  for (const p of posts) lines.push(`- [${p.title}](${absolute(`/blog/${p.slug}.md`)}): ${p.description}`)
  lines.push('', '## Optional', '')
  lines.push(`- [Full documentation in one file](${absolute('/llms-full.txt')})`)
  lines.push(`- [Interactive playground](${absolute('/playground')}): every option, with generated code`)
  lines.push(`- [Changelog](${absolute('/changelog')})`)
  return `${lines.join('\n')}\n`
}

/** Every doc page concatenated, for agents that want the whole manual in one request. */
export async function llmsFull() {
  'use cache'
  cacheLife('max') // content only changes on deploy
  const parts = [`# ${site.name} documentation\n\n> ${site.summary}\n`]
  for (const section of docsNav)
    for (const d of section.pages) {
      const source = await getSource('docs', d.slug).catch(() => null)
      if (source) parts.push(toMarkdown(d.title, d.description, absolute(`/docs/${d.slug}`), source))
    }
  return parts.join('\n---\n\n')
}
