'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WylletButton } from 'wyllet'
import { site } from '@/lib/site'
import styles from './chrome.module.css'
import { CloseIcon, GitHubIcon, MailIcon, MenuIcon, XIcon } from './Icons'
import { Logo } from './Logo'
import { useSite, type SiteTheme } from './Providers'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { href: '/docs', label: 'Docs' },
  { href: '/features', label: 'Features' },
  { href: '/playground', label: 'Playground' },
  { href: '/blog', label: 'Blog' },
]
const menuLinks = [...links, { href: '/changelog', label: 'Changelog' }]
const themes: Array<{ id: SiteTheme; label: string }> = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export function Nav() {
  const pathname = usePathname()
  const { theme, setTheme } = useSite()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // While the menu is open: Escape closes it, the page behind can't scroll, and growing past the breakpoint closes it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const wide = window.matchMedia('(min-width: 861px)')
    const onWide = () => wide.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    document.documentElement.classList.add('menu-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
      document.documentElement.classList.remove('menu-open')
    }
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const close = () => setOpen(false)

  return (
    <>
      <header className={styles.header} data-scrolled={scrolled || undefined} data-open={open || undefined}>
        <nav className={`container ${styles.nav}`} aria-label="Main">
          <Logo />
          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <a
              className={`${styles.iconLink} ${styles.desktopOnly}`}
              href={site.github}
              target="_blank"
              rel="noreferrer"
              aria-label="Wyllet on GitHub"
            >
              <GitHubIcon />
            </a>
            <a
              className={`${styles.iconLink} ${styles.desktopOnly}`}
              href={site.x}
              target="_blank"
              rel="noreferrer"
              aria-label="Wyllet on X"
            >
              <XIcon size={16} />
            </a>
            <span className={styles.desktopOnly}>
              <ThemeToggle />
            </span>
            <div className={styles.connect}>
              <WylletButton size="sm" display="compact" />
            </div>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Outside <header>: its backdrop-filter would otherwise trap this fixed sheet inside the bar. */}
      <div id="mobile-menu" className={styles.mobileMenu} hidden={!open}>
        <div className={`container ${styles.mobileInner}`}>
          <ul className={styles.mobileLinks}>
            {menuLinks.map((l, i) => (
              <li key={l.href} style={{ animationDelay: `${i * 35}ms` }}>
                <Link href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} onClick={close}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileFoot}>
            <div className={styles.themeSwitch} role="radiogroup" aria-label="Theme">
              {themes.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className={styles.mobileExternal}>
              <a href={site.github} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <GitHubIcon size={16} /> GitHub
              </a>
              <a href={site.x} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <XIcon size={14} /> {site.xHandle}
              </a>
              <a href={site.npm} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                npm
              </a>
              <a href={`mailto:${site.email}`} className="btn btn-ghost btn-sm">
                <MailIcon size={16} /> Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
