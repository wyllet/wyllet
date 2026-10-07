import { describe, expect, it } from 'vitest'
import { format } from '../src/i18n/en'
import { buildThemeCss, obsidianTheme, porcelainTheme, mergeDeep, themeToCssVars } from '../src/theme'
import { formatAmount, isUserRejection, matchesShortcut, shortenAddress } from '../src/utils'
import { tokenIconUri } from '../src/tokens/tokens'

describe('formatAmount', () => {
  const eth = (v: string) => BigInt(Math.round(Number(v) * 1e6)) * 10n ** 12n
  it.each([
    ['0', '0'],
    ['0.00001', '<0.0001'],
    ['0.1234567', '0.1235'],
    ['1.5', '1.5'],
    ['12.3456', '12.35'],
    ['12345', '12.3K'],
    ['2500000', '2.5M'],
  ])('%s → %s', (input, expected) => expect(formatAmount(eth(input), 18)).toBe(expected))
})

describe('shortenAddress', () => {
  it('keeps both ends', () => {
    expect(shortenAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234…5678')
  })
})

describe('isUserRejection', () => {
  it('detects EIP-1193 4001 deep in the cause chain', () => {
    expect(isUserRejection({ cause: { cause: { code: 4001 } } })).toBe(true)
    expect(isUserRejection(new Error('boom'))).toBe(false)
  })
})

describe('themes', () => {
  it('applies preset knobs', () => {
    const theme = obsidianTheme({ accentColor: '#ff0000', radius: 'sharp', overlayBlur: 'none' })
    expect(theme.colors.accent).toBe('#ff0000')
    expect(theme.radii.panel).toBe('4px')
    expect(theme.effects.overlayBlur).toBe('none')
  })

  it('deep merges overrides without mutating the base', () => {
    const base = porcelainTheme()
    const merged = mergeDeep(base, { colors: { text: 'red' } })
    expect(merged.colors.text).toBe('red')
    expect(merged.colors.accent).toBe(base.colors.accent)
    expect(base.colors.text).not.toBe('red')
  })

  it('emits kebab-cased css variables', () => {
    expect(themeToCssVars(porcelainTheme())['--wy-colors-accent-foreground']).toBe('#FFFFFF')
    expect(themeToCssVars(obsidianTheme())['--wy-colors-island-background']).toBeDefined()
  })

  it('follows the OS for light/dark pairs in auto mode', () => {
    const css = buildThemeCss({ light: porcelainTheme(), dark: obsidianTheme() }, 'auto', 'x')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(buildThemeCss({ light: porcelainTheme(), dark: obsidianTheme() }, 'dark', 'x')).not.toContain('@media')
  })
})

describe('i18n format', () => {
  it('interpolates placeholders and leaves unknown ones', () => {
    expect(format('Open {name} {x}', { name: 'Rainbow' })).toBe('Open Rainbow {x}')
  })
})

describe('shortcuts', () => {
  it('matches mod+k on the current platform', () => {
    const mac = /mac/i.test(navigator.platform || navigator.userAgent)
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: mac, ctrlKey: !mac })
    expect(matchesShortcut(e, 'mod+k')).toBe(true)
    expect(matchesShortcut(new KeyboardEvent('keydown', { key: 'k' }), 'mod+k')).toBe(false)
  })
})

describe('token icons', () => {
  it('has brand marks and falls back to a monogram', () => {
    expect(tokenIconUri('USDC')).toContain('data:image/svg+xml')
    expect(tokenIconUri('USDC')).not.toBe(tokenIconUri('XYZ'))
    expect(decodeURIComponent(tokenIconUri('XYZ'))).toContain('>X<')
  })
})
