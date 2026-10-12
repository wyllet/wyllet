import Link from 'next/link'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'
import styles from './chrome.module.css'
import { GitHubIcon, MailIcon, RssIcon, XIcon } from './Icons'
import { Logo } from './Logo'

const columns: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/playground', label: 'Playground' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { href: '/docs/quick-start', label: 'Quick start' },
      { href: '/docs/nextjs', label: 'Next.js' },
      { href: '/docs/ai-assistants', label: 'Build with AI' },
      { href: '/docs/theming', label: 'Theming' },
      { href: '/docs/migrate-from-rainbowkit', label: 'Migrate from RainbowKit' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: site.github, label: 'GitHub' },
      { href: site.x, label: `X ${site.xHandle}` },
      { href: site.npm, label: 'npm' },
      { href: site.releases, label: 'Releases' },
      { href: site.issues, label: 'Report an issue' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: `mailto:${site.email}`, label: site.email },
      { href: '/docs/faq', label: 'FAQ' },
      { href: '/docs/security', label: 'Security' },
      { href: site.securityAdvisory, label: 'Report a vulnerability' },
      { href: site.licenseUrl, label: 'MIT License' },
    ],
  },
  {
    title: 'For AI agents',
    links: [
      { href: '/llms.txt', label: 'llms.txt' },
      { href: '/llms-full.txt', label: 'llms-full.txt' },
      { href: '/rss.xml', label: 'RSS feed' },
      { href: '/sitemap.xml', label: 'Sitemap' },
    ],
  },
]

const social: Array<{ href: string; label: string; icon: ReactNode }> = [
  { href: site.github, label: 'Wyllet on GitHub', icon: <GitHubIcon size={18} /> },
  { href: site.x, label: 'Wyllet on X', icon: <XIcon size={16} /> },
  { href: `mailto:${site.email}`, label: `Email ${site.email}`, icon: <MailIcon size={18} /> },
  { href: '/rss.xml', label: 'RSS feed', icon: <RssIcon size={17} /> },
]

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href)

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <Logo />
          <p>The open-source wallet connector for React dApps. Built on wagmi and viem.</p>
          <ul className={styles.social} aria-label="Wyllet elsewhere">
            {social.map((s) => (
              <li key={s.href}>
                <a href={s.href} aria-label={s.label} title={s.label} {...(s.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}>
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.footerMeta}>MIT licensed. v{site.version} on npm with provenance.</p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h2 className={styles.footerTitle}>{c.title}</h2>
            <ul>
              {c.links.map((l) => (
                <li key={l.href}>
                  {isExternal(l.href) ? (
                    <a href={l.href} {...(l.href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} prefetch={false}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`container ${styles.footerBottom}`}>
        <p>Wallet, network and token names and logos are trademarks of their respective owners and are used only to identify them.</p>
      </div>
    </footer>
  )
}
