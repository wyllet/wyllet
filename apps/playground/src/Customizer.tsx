import { useMemo, useState, type ReactNode } from 'react'
import { useCopyToClipboard, useWyllet, type Presentation } from 'wyllet'
import { generateCode } from './codegen'
import { accents, defaultSettings, presetAccent, type Preset, type StudioSettings } from './studio'
import { walletConnectProjectId } from './wagmi'

type Set = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => void

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange(v: T): void }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={o === value} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange(v: boolean): void; label: string; hint?: string }) {
  return (
    <label className="toggle">
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden />
    </label>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      {children}
    </div>
  )
}

const presentations: Array<{ id: Presentation; label: string }> = [
  { id: 'drawer', label: 'Drawer' },
  { id: 'popover', label: 'Popover' },
  { id: 'modal', label: 'Modal' },
]

function PresentationArt({ id }: { id: Presentation }) {
  return (
    <span className={`p-art p-${id}`} aria-hidden>
      <span className="p-bar" />
      <span className="p-panel" />
    </span>
  )
}

const presets: Array<{ id: Preset; label: string }> = [
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'porcelain', label: 'Porcelain' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'auto', label: 'Auto' },
]

export function Customizer({ settings, set, reset }: { settings: StudioSettings; set: Set; reset(): void }) {
  const [tab, setTab] = useState<'design' | 'code'>('design')
  const { openConnect, openAccount, openTab, isConnected } = useWyllet()
  const code = useMemo(() => generateCode(settings), [settings])
  const { copied, copy } = useCopyToClipboard()
  const s = settings

  return (
    <aside className="panel">
      <div className="panel-head">
        <div className="tabs">
          <button className={tab === 'design' ? 'on' : ''} onClick={() => setTab('design')}>
            Studio
          </button>
          <button className={tab === 'code' ? 'on' : ''} onClick={() => setTab('code')}>
            Code
          </button>
        </div>
        <button className="ghost-btn" onClick={reset} disabled={JSON.stringify(s) === JSON.stringify(defaultSettings)}>
          Reset
        </button>
      </div>

      {tab === 'code' ? (
        <div className="code-wrap">
          <button className="copy-btn" onClick={() => copy(code)}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <div className="panel-body">
          <div className="quick">
            <button onClick={(e) => openConnect({ anchor: e.currentTarget })}>Connect</button>
            <button onClick={(e) => openAccount({ anchor: e.currentTarget })} disabled={!isConnected}>
              Account
            </button>
            <button onClick={(e) => openTab('activity', { anchor: e.currentTarget })} disabled={!isConnected}>
              Activity
            </button>
          </div>

          <h4>Presentation</h4>
          <div className="p-cards">
            {presentations.map((p) => (
              <button key={p.id} className={s.presentation === p.id ? 'p-card on' : 'p-card'} onClick={() => set('presentation', p.id)}>
                <PresentationArt id={p.id} />
                {p.label}
              </button>
            ))}
          </div>
          {s.presentation === 'drawer' && (
            <Field label="Drawer side">
              <Segmented value={s.drawerSide} options={['left', 'right'] as const} onChange={(v) => set('drawerSide', v)} />
            </Field>
          )}

          <h4>Theme</h4>
          <div className="preset-grid">
            {presets.map((p) => (
              <button key={p.id} className={`preset preset-${p.id} ${s.preset === p.id ? 'on' : ''}`} onClick={() => set('preset', p.id)}>
                <span className="preset-swatch" style={{ ['--a' as string]: p.id === 'auto' ? '#C6F432' : presetAccent[p.id] }} />
                {p.label}
              </button>
            ))}
          </div>
          <Field label="Accent">
            <div className="swatches">
              <button className={s.accent === null ? 'swatch auto on' : 'swatch auto'} onClick={() => set('accent', null)} title="Preset default">
                A
              </button>
              {accents.map((c) => (
                <button key={c} className={c === s.accent ? 'swatch on' : 'swatch'} style={{ background: c }} aria-label={c} onClick={() => set('accent', c)} />
              ))}
              <label className="swatch picker" title="Custom color">
                <input type="color" value={s.accent ?? '#C6F432'} onChange={(e) => set('accent', e.target.value)} />
              </label>
            </div>
          </Field>
          <Field label="Corners">
            <Segmented value={s.radius} options={['sharp', 'soft', 'round', 'pill'] as const} onChange={(v) => set('radius', v)} />
          </Field>
          <Field label="Font">
            <Segmented value={s.font} options={['default', 'system', 'rounded', 'mono'] as const} onChange={(v) => set('font', v)} />
          </Field>
          <Field label="Backdrop">
            <Segmented value={s.overlayBlur} options={['none', 'subtle', 'heavy'] as const} onChange={(v) => set('overlayBlur', v)} />
          </Field>

          <h4>Island button</h4>
          <Field label="Size">
            <Segmented value={s.buttonSize} options={['sm', 'md', 'lg'] as const} onChange={(v) => set('buttonSize', v)} />
          </Field>
          <Field label="Display">
            <Segmented value={s.display} options={['full', 'compact', 'avatar'] as const} onChange={(v) => set('display', v)} />
          </Field>
          <Toggle label="⌘K shortcut" hint="Toggle the panel from anywhere" checked={s.shortcut} onChange={(v) => set('shortcut', v)} />

          <h4>Account panel</h4>
          <Toggle label="Identity card" hint="Holographic card instead of the compact summary" checked={s.identityCard} onChange={(v) => set('identityCard', v)} />
          {s.identityCard && <Toggle label="3D tilt" checked={s.cardTilt} onChange={(v) => set('cardTilt', v)} />}
          <Toggle label="Close after connecting" checked={s.closeOnConnect} onChange={(v) => set('closeOnConnect', v)} />

          <h4>Features</h4>
          <Field label="Toasts">
            <select value={s.toastPosition} onChange={(e) => set('toastPosition', e.target.value as StudioSettings['toastPosition'])}>
              {['top-center', 'top-right', 'top-left', 'bottom-center', 'bottom-right', 'bottom-left'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Language">
            <Segmented value={s.locale} options={['en', 'es'] as const} onChange={(v) => set('locale', v)} />
          </Field>
          <Field label="Network order (chainOrder)">
            <Segmented value={s.networkOrder} options={['config', 'l2-first', 'zora-first'] as const} onChange={(v) => set('networkOrder', v)} />
          </Field>
          <Field label="Token sort">
            <Segmented value={s.tokenSort} options={['balance', 'list'] as const} onChange={(v) => set('tokenSort', v)} />
          </Field>
          <Toggle label="Token import" hint="Also let users add their own tokens by address" checked={s.tokenImport} onChange={(v) => set('tokenImport', v)} />
          <Toggle label="Sign-In With Ethereum" hint="Verify step after connecting" checked={s.siwe} onChange={(v) => set('siwe', v)} />
          <Toggle label="Wyllet branding" hint="“Powered by Wyllet” in panel footers" checked={s.branding} onChange={(v) => set('branding', v)} />
          <Toggle label="Disable animations" checked={s.disableAnimations} onChange={(v) => set('disableAnimations', v)} />

          {!walletConnectProjectId && (
            <p className="note">
              QR + mobile wallets need a WalletConnect project id: set <code>VITE_WC_PROJECT_ID</code> in <code>apps/playground/.env.local</code>. Use{' '}
              <b>Burner Wallet</b> to try everything right now.
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
