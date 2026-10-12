'use client'

import { useSite, type SiteTheme } from './Providers'
import { MoonIcon, SunIcon, SystemIcon } from './Icons'
import styles from './chrome.module.css'

const order: SiteTheme[] = ['system', 'light', 'dark']
const label: Record<SiteTheme, string> = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' }

export function ThemeToggle() {
  const { theme, setTheme } = useSite()
  const next = order[(order.indexOf(theme) + 1) % order.length]!
  return (
    <button type="button" className={styles.iconLink} onClick={() => setTheme(next)} aria-label={`${label[theme]}. Switch to ${next}.`} title={label[theme]}>
      {theme === 'light' ? <SunIcon /> : theme === 'dark' ? <MoonIcon /> : <SystemIcon />}
    </button>
  )
}
