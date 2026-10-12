'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useCopyToClipboard, useWyllet, type Presentation } from 'wyllet'
import { generateCode } from '@/lib/codegen'
import { accents, presetAccent, type Preset, type StudioSettings } from '@/lib/studio'
import { walletConnectProjectId } from '@/lib/wagmi'
import { useSite } from '../Providers'
import styles from './playground.module.css'

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange(v: T): void }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel} id={`seg-${label}`}>
        {label}
      </span>
      <div className={styles.seg} role="radiogroup" aria-labelledby={`seg-${label}`}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={o === value} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange(v: boolean): void; label: string; hint?: string }) {
  return (
    <label className={styles.toggle}>
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden />
    </label>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className={styles.group}>
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

const presentations: Array<{ id: Presentation; label: string }> = [
  { id: 'drawer', label: 'Drawer' },
  { id: 'popover', label: 'Popover' },
  { id: 'modal', label: 'Modal' },
]

const presets: Array<{ id: Preset; label: string }> = [
  { id: 'auto', label: 'Auto' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'porcelain', label: 'Porcelain' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'terminal', label: 'Terminal' },
]

export function Studio() {
  const { settings: s, set, reset } = useSite()
  const [tab, setTab] = useState<'design' | 'code'>('design')
  const { openConnect, openAccount, openTab, isConnected } = useWyllet()
  const code = useMemo(() => generateCode(s), [s])
  const { copied, copy } = useCopyToClipboard()

  return (
    <aside id="studio" className={styles.panel} aria-label="Studio">
      <div className={styles.panelHead}>
        <div className={styles.tabs} role="tablist" aria-label="Studio view">
          <button type="button" role="tab" aria-selected={tab === 'design'} onClick={() => setTab('design')}>
            Studio
          </button>
          <button type="button" role="tab" aria-selected={tab === 'code'} onClick={() => setTab('code')}>
            Code
          </button>
        </div>
        <button type="button" className={styles.ghost} onClick={reset}>
          Reset
        </button>
      </div>

      {tab === 'code' ? (
        <div className={styles.codeWrap}>
          <button type="button" className={styles.copy} onClick={() => copy(code)}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <pre tabIndex={0} aria-label="Generated code">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <div className={styles.panelBody}>
          <div className={styles.quick}>
            <button type="button" onClick={(e) => openConnect({ anchor: e.currentTarget })}>
              Connect
            </button>
            <button type="button" onClick={(e) => openAccount({ anchor: e.currentTarget })} disabled={!isConnected}>
              Account
            </button>
            <button type="button" onClick={(e) => openTab('activity', { anchor: e.currentTarget })} disabled={!isConnected}>
              Activity
            </button>
          </div>

          <Group title="Presentation">
            <div className={styles.pCards}>
              {presentations.map((p) => (
                <button key={p.id} type="button" className={styles.pCard} aria-pressed={s.presentation === p.id} onClick={() => set('presentation', p.id)}>
                  <span className={styles.pArt} data-p={p.id} aria-hidden>
                    <span />
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
            {s.presentation === 'drawer' && <Segmented label="Drawer side" value={s.drawerSide} options={['left', 'right'] as const} onChange={(v) => set('drawerSide', v)} />}
          </Group>

          <Group title="Theme">
            <div className={styles.presetGrid}>
              {presets.map((p) => (
                <button key={p.id} type="button" className={styles.preset} aria-pressed={s.preset === p.id} onClick={() => set('preset', p.id)}>
                  <span className={styles.presetSwatch} data-preset={p.id} style={{ ['--a' as string]: p.id === 'auto' ? '#C6F432' : presetAccent[p.id] }} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Accent</span>
              <div className={styles.swatches}>
                <button type="button" className={styles.swatch} data-auto aria-pressed={s.accent === null} onClick={() => set('accent', null)} aria-label="Preset accent">
                  A
                </button>
                {accents.map((c) => (
                  <button key={c} type="button" className={styles.swatch} style={{ background: c }} aria-pressed={c === s.accent} aria-label={`Accent ${c}`} onClick={() => set('accent', c)} />
                ))}
                <label className={`${styles.swatch} ${styles.picker}`} title="Custom color">
                  <input type="color" value={s.accent ?? '#C6F432'} onChange={(e) => set('accent', e.target.value)} aria-label="Custom accent color" />
                </label>
              </div>
            </div>
            <Segmented label="Corners" value={s.radius} options={['sharp', 'soft', 'round', 'pill'] as const} onChange={(v) => set('radius', v)} />
            <Segmented label="Font" value={s.font} options={['default', 'system', 'rounded', 'mono'] as const} onChange={(v) => set('font', v)} />
            <Segmented label="Backdrop" value={s.overlayBlur} options={['none', 'subtle', 'heavy'] as const} onChange={(v) => set('overlayBlur', v)} />
          </Group>

          <Group title="Island button">
            <Segmented label="Size" value={s.buttonSize} options={['sm', 'md', 'lg'] as const} onChange={(v) => set('buttonSize', v)} />
            <Segmented label="Display" value={s.display} options={['full', 'compact', 'avatar'] as const} onChange={(v) => set('display', v)} />
            <Toggle label="⌘K shortcut" hint="Toggle the panel from anywhere" checked={s.shortcut} onChange={(v) => set('shortcut', v)} />
          </Group>

          <Group title="Account panel">
            <Toggle label="Identity card" hint="A generative card instead of the compact summary" checked={s.identityCard} onChange={(v) => set('identityCard', v)} />
            {s.identityCard && <Toggle label="3D tilt" checked={s.cardTilt} onChange={(v) => set('cardTilt', v)} />}
            <Toggle label="Close after connecting" checked={s.closeOnConnect} onChange={(v) => set('closeOnConnect', v)} />
          </Group>

          <Group title="Features">
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="toast-pos">
                Toast position
              </label>
              <select id="toast-pos" className={styles.select} value={s.toastPosition} onChange={(e) => set('toastPosition', e.target.value as StudioSettings['toastPosition'])}>
                {['top-center', 'top-right', 'top-left', 'bottom-center', 'bottom-right', 'bottom-left'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <Segmented label="Language" value={s.locale} options={['en', 'es'] as const} onChange={(v) => set('locale', v)} />
            <Segmented label="Network order" value={s.networkOrder} options={['config', 'l2-first', 'zora-first'] as const} onChange={(v) => set('networkOrder', v)} />
            <Segmented label="Token sort" value={s.tokenSort} options={['balance', 'list'] as const} onChange={(v) => set('tokenSort', v)} />
            <Toggle label="Token import" hint="Let users add tokens by contract address" checked={s.tokenImport} onChange={(v) => set('tokenImport', v)} />
            <Toggle label="Sign-In With Ethereum" hint="A verify step after connecting" checked={s.siwe} onChange={(v) => set('siwe', v)} />
            <Toggle label="Wyllet branding" hint="“Powered by Wyllet” in the panel footer" checked={s.branding} onChange={(v) => set('branding', v)} />
            <Toggle label="Disable animations" checked={s.disableAnimations} onChange={(v) => set('disableAnimations', v)} />
          </Group>

          {!walletConnectProjectId && (
            <p className={styles.note}>
              QR codes and mobile wallets need a WalletConnect project ID. Use <b>Demo wallet</b> to try everything else.
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
