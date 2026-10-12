'use client'

import { motion } from 'motion/react'
import { useWyllet, WylletButton, WylletEmbed, type Presentation } from 'wyllet'
import type { Preset } from '@/lib/studio'
import { useSite } from '../Providers'
import styles from './sections.module.css'

const presentations: Array<{ id: Presentation; label: string; note: string }> = [
  { id: 'drawer', label: 'Drawer', note: 'A floating side panel. The default.' },
  { id: 'popover', label: 'Popover', note: 'Anchored to the button that opened it.' },
  { id: 'modal', label: 'Modal', note: 'A centered dialog over a dimmed page.' },
]

const presets: Array<{ id: Preset; label: string; swatch: string }> = [
  { id: 'auto', label: 'Match site', swatch: 'linear-gradient(135deg, #F1F8F6 50%, #06110F 50%)' },
  { id: 'obsidian', label: 'Obsidian', swatch: '#48ECD2' },
  { id: 'porcelain', label: 'Porcelain', swatch: '#111114' },
  { id: 'aurora', label: 'Aurora', swatch: 'linear-gradient(135deg, #B69CFF, #5CE1FF)' },
  { id: 'terminal', label: 'Terminal', swatch: '#3DFF8F' },
]

const themeFn: Record<Preset, string> = {
  auto: '{ light: porcelainTheme(), dark: obsidianTheme() }',
  obsidian: 'obsidianTheme()',
  porcelain: 'porcelainTheme()',
  aurora: 'auroraTheme()',
  terminal: 'terminalTheme()',
}

export function PresentationDemo() {
  const { settings, update } = useSite()
  const { open } = useWyllet()
  const current = presentations.find((p) => p.id === settings.presentation) ?? presentations[0]!

  return (
    <div className={styles.demo}>
      <div className={styles.demoControls}>
        <fieldset className={styles.fieldset}>
          <legend>Presentation</legend>
          <div className={styles.choiceRow}>
            {presentations.map((p) => (
              <label key={p.id} className={styles.choice} data-on={settings.presentation === p.id || undefined}>
                <input type="radio" name="presentation" value={p.id} checked={settings.presentation === p.id} onChange={() => update({ presentation: p.id })} />
                {p.label}
              </label>
            ))}
          </div>
          <p className={styles.choiceNote}>{current.note} On phones, every presentation becomes a bottom sheet you can drag.</p>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Theme</legend>
          <div className={styles.choiceRow}>
            {presets.map((p) => (
              <label key={p.id} className={styles.choice} data-on={settings.preset === p.id || undefined}>
                <input type="radio" name="preset" value={p.id} checked={settings.preset === p.id} onChange={() => update({ preset: p.id, accent: null })} />
                <span className={styles.swatch} style={{ background: p.swatch }} aria-hidden />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="button" className="btn btn-primary" onClick={(e) => open(undefined, { anchor: e.currentTarget })}>
          Open it full size
        </button>

        <pre className={styles.snippet} aria-label="Code for this setup" tabIndex={0}>
          <code>{`<WylletProvider\n  theme={${themeFn[settings.preset]}}\n  appearance={{ presentation: '${settings.presentation}' }}\n/>`}</code>
        </pre>
      </div>

      {/* The real panel (<WylletEmbed>), placed the way the chosen presentation would place it. Try connecting right here. */}
      <div className={styles.screen}>
        <div className={styles.screenBar}>
          <span aria-hidden />
          <span aria-hidden />
          <span aria-hidden />
          <div className={styles.screenButton}>
            <WylletButton size="sm" display="compact" />
          </div>
        </div>
        <div className={styles.screenPage} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        {settings.presentation === 'modal' && <div className={styles.screenScrim} aria-hidden />}
        <motion.div layout className={styles.embedSlot} data-p={settings.presentation} transition={{ type: 'spring', stiffness: 260, damping: 28 }}>
          <WylletEmbed fill />
        </motion.div>
      </div>
    </div>
  )
}
