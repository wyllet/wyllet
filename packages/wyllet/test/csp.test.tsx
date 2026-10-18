// @vitest-environment node
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { WagmiProvider } from 'wagmi'
import { Avatar, ConnectGate, getDefaultConfig, obsidianTheme, themeStylesheet, TokenIcon, WylletButton, WylletProvider, type WylletProviderProps } from '../src'

// A strict CSP (`style-src 'self'` or `'nonce-…'`, no 'unsafe-inline') ignores style attributes in server HTML,
// and React doesn't re-apply them on hydration. Nothing Wyllet renders on the server may depend on one.
function render(props: Partial<WylletProviderProps>, children: ReactNode) {
  const config = getDefaultConfig({ appName: 'CSP', chains: [mainnet], ssr: true })
  return renderToString(
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <WylletProvider ens={false} {...props}>
          {children}
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  )
}

const everything = (
  <>
    <WylletButton />
    <ConnectGate>
      <p>secret</p>
    </ConnectGate>
    <Avatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" size={40} />
    <TokenIcon symbol="ETH" chainId={1} size={32} />
  </>
)

describe('strict CSP', () => {
  it('renders no inline style attributes on the server', () => {
    const html = render({}, everything)
    expect(html).toContain('data-wy-pending')
    expect(html).not.toMatch(/\sstyle="/)
  })

  it('draws each address with its own gradient, even across separate renders', () => {
    const one = render({}, <Avatar address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" />)
    const two = render({}, <Avatar address="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" />)
    const ids = (html: string) => [...html.matchAll(/<linearGradient id="([^"]+)"/g)].map((m) => m[1])
    expect(ids(one)).toHaveLength(1)
    expect(ids(one)[0]).not.toBe(ids(two)[0])
  })

  it('adds the nonce to every <style> it renders', () => {
    const html = render({ nonce: 'r4nd0m' }, everything)
    const styles = html.match(/<style[^>]*>/g) ?? []
    expect(styles).toHaveLength(2)
    for (const tag of styles) expect(tag).toContain('nonce="r4nd0m"')
  })

  it('renders no <style> at all when both stylesheets are loaded as files', () => {
    const html = render({ injectStyles: false, injectTheme: false }, everything)
    expect(html).not.toContain('<style')
    expect(html).toContain('data-wyllet') // the theme file still finds every element
  })

  it('builds external theme stylesheets for every Wyllet element', () => {
    const auto = themeStylesheet()
    expect(auto.startsWith('[data-wyllet]{')).toBe(true)
    expect(auto).toContain('@media (prefers-color-scheme: dark){[data-wyllet]{')
    const single = themeStylesheet(obsidianTheme())
    expect(single).toContain('--wy-colors-background:')
    expect(single).not.toContain('@media')
  })
})
