'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { withDefaultTokens, WylletProvider } from 'wyllet'
import { demoAuthAdapter } from '@/lib/siwe'
import { buildTheme, defaultSettings, networkOrders, spanish, type StudioSettings } from '@/lib/studio'
import { config } from '@/lib/wagmi'

/** The site's own tokens, pinned above Wyllet's blue chips (also a live demo of `withDefaultTokens`). */
const tokens = withDefaultTokens([
  { chainId: 8453, address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', symbol: 'DEGEN', decimals: 18, name: 'Degen', pinned: true },
  { chainId: 8453, address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', symbol: 'AERO', decimals: 18, name: 'Aerodrome' },
])

export type SiteTheme = 'system' | 'light' | 'dark'

interface SiteContextValue {
  /** Every Wyllet knob on the site is driven from here, so the playground and the home page demos share one live provider. */
  settings: StudioSettings
  set<K extends keyof StudioSettings>(key: K, value: StudioSettings[K]): void
  update(patch: Partial<StudioSettings>): void
  reset(): void
  theme: SiteTheme
  setTheme(theme: SiteTheme): void
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used inside <Providers>')
  return ctx
}

const THEME_KEY = 'wyllet-site.theme'
const THEME_EVENT = 'wyllet-site:theme'
const subscribeTheme = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb)
  return () => window.removeEventListener(THEME_EVENT, cb)
}
const readTheme = (): SiteTheme => {
  const t = document.documentElement.getAttribute('data-theme')
  return t === 'light' || t === 'dark' ? t : 'system'
}
const siteDefaults: StudioSettings = { ...defaultSettings, preset: 'auto' }

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [settings, setSettings] = useState<StudioSettings>(siteDefaults)
  // The <html data-theme> attribute (set before paint by the inline script in layout.tsx) is the source of truth.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'system' as SiteTheme)
  const setTheme = useCallback((next: SiteTheme) => {
    const root = document.documentElement
    if (next === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', next)
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, next)
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  const site = useMemo<SiteContextValue>(
    () => ({
      settings,
      set: (key, value) => setSettings((s) => ({ ...s, [key]: value })),
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings(siteDefaults),
      theme,
      setTheme,
    }),
    [settings, theme, setTheme],
  )

  const built = useMemo(() => buildTheme(settings), [settings])
  // The "auto" preset follows the site's own light/dark switch.
  const colorMode = settings.preset === 'auto' && theme !== 'system' ? theme : built.colorMode
  const appearance = useMemo(
    () => ({
      presentation: settings.presentation,
      drawerSide: settings.drawerSide,
      identityCard: settings.identityCard,
      cardTilt: settings.cardTilt,
      closeOnConnect: settings.closeOnConnect,
      tokenSort: settings.tokenSort,
      toastPosition: settings.toastPosition,
      branding: settings.branding,
      disableAnimations: settings.disableAnimations,
    }),
    [settings],
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WylletProvider
          theme={built.theme}
          colorMode={colorMode}
          appearance={appearance}
          shortcut={settings.shortcut ? 'mod+k' : undefined}
          tokens={tokens}
          chainOrder={networkOrders[settings.networkOrder]}
          allowTokenImport={settings.tokenImport}
          messages={settings.locale === 'es' ? spanish : undefined}
          auth={settings.siwe ? demoAuthAdapter : undefined}
          // Same path on server and client (the config's absolute appIcon is for WalletConnect metadata).
          appInfo={{ icon: '/icon.png' }}
        >
          <SiteContext.Provider value={site}>{children}</SiteContext.Provider>
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
