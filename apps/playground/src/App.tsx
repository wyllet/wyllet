import { useEffect, useMemo, useState } from 'react'
import { withDefaultTokens, WylletButton, WylletProvider } from 'wyllet'
import { Customizer } from './Customizer'
import { DemoDapp } from './DemoDapp'
import { demoAuthAdapter } from './siwe'
import { buildTheme, defaultSettings, isDarkPreset, networkOrders, presetAccent, spanish, type StudioSettings } from './studio'

const STORAGE_KEY = 'playground.studio.v2'

/** The dApp's own tokens (visible to everyone), pinned above Wyllet's blue chips. */
const tokens = withDefaultTokens([
  { chainId: 8453, address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', symbol: 'DEGEN', decimals: 18, name: 'Degen', pinned: true },
  { chainId: 8453, address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', symbol: 'AERO', decimals: 18, name: 'Aerodrome' },
])

function loadSettings(): StudioSettings {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return defaultSettings
  }
}

export function App() {
  const [settings, setSettings] = useState<StudioSettings>(loadSettings)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)), [settings])
  const set = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  const { theme, colorMode } = useMemo(() => buildTheme(settings), [settings])
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
  const accent = settings.accent ?? (settings.preset === 'auto' ? presetAccent.obsidian : presetAccent[settings.preset])
  const mode = settings.preset === 'auto' ? 'auto' : isDarkPreset(settings.preset) ? 'dark' : 'light'

  return (
    <WylletProvider
      theme={theme}
      colorMode={colorMode}
      appearance={appearance}
      shortcut={settings.shortcut ? 'mod+k' : undefined}
      tokens={tokens}
      chainOrder={networkOrders[settings.networkOrder]}
      allowTokenImport={settings.tokenImport}
      messages={settings.locale === 'es' ? spanish : undefined}
      auth={settings.siwe ? demoAuthAdapter : undefined}
      appInfo={{ termsUrl: 'https://example.com/terms', privacyUrl: 'https://example.com/privacy' }}
    >
      <div className="page" data-mode={mode} data-preset={settings.preset} style={{ ['--accent' as string]: accent }}>
        <div className="bg" aria-hidden>
          <span className="grid-lines" />
          <span className="blob b1" />
          <span className="blob b2" />
        </div>
        <nav className="nav">
          <a className="brand" href="#">
            <img className="logo" src="/logo.png" alt="" width={30} height={30} />
            wyllet
            <span className="tag">v0.1 · playground</span>
          </a>
          <div className="nav-links">
            <a href="#docs">Docs</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
          <WylletButton size={settings.buttonSize} display={settings.display} />
        </nav>

        <div className="layout">
          <main>
            <header className="hero">
              <img className="mascot" src="/logo.png" alt="Wyllet mascot" width={220} height={220} />
              <div className="eyebrow">
                <span className="pulse" /> open source · MIT · wagmi v3 + viem
              </div>
              <h1>
                Wallets,
                <br />
                <span className="hero-accent">without the boilerplate.</span>
              </h1>
              <p>
                Wyllet is the connect layer for serious dApps: an island button, drawer / popover / modal panels, token
                balances, a live activity timeline, SIWE and gating — themeable down to the last token.
              </p>
              <div className="hero-cta">
                <WylletButton size="lg" label="Connect wallet" />
                <code className="install">
                  <span>$</span> pnpm add wyllet
                </code>
                {settings.shortcut && (
                  <span className="hint">
                    or press <kbd>⌘</kbd>
                    <kbd>K</kbd>
                  </span>
                )}
              </div>
            </header>
            <DemoDapp />
          </main>
          <Customizer settings={settings} set={set} reset={() => setSettings(defaultSettings)} />
        </div>
      </div>
    </WylletProvider>
  )
}
