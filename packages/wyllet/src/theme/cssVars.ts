import { obsidianTheme, porcelainTheme } from './presets'
import type { ColorMode, Theme, ThemeInput } from './types'

const toKebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** Flattens a theme into `--wy-<group>-<token>` custom properties. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [group, tokens] of Object.entries(theme)) {
    for (const [token, value] of Object.entries(tokens as Record<string, string>)) {
      vars[`--wy-${toKebab(group)}-${toKebab(token)}`] = value
    }
  }
  return vars
}

const declarations = (theme: Theme) =>
  Object.entries(themeToCssVars(theme))
    .map(([k, v]) => `${k}:${v};`)
    .join('')

export function isThemePair(input: ThemeInput): input is { light: Theme; dark: Theme } {
  return 'light' in input && 'dark' in input
}

/**
 * Produces the stylesheet that binds a theme to every element rendered with
 * `data-wyllet="<scope>"`. Light/dark pairs follow the OS in `auto` mode.
 */
export function buildThemeCss(input: ThemeInput, colorMode: ColorMode, scope: string): string {
  return themeCssFor(input, colorMode, `[data-wyllet="${scope}"]`)
}

/**
 * The theme as a plain stylesheet for every Wyllet element on the page, for apps that load it as a file
 * (`<WylletProvider injectTheme={false}>`) so their CSP needs no inline styles. The prebuilt
 * `wyllet/themes/*.css` files are this function's output for each preset.
 */
export function themeStylesheet(input: ThemeInput = { light: porcelainTheme(), dark: obsidianTheme() }, colorMode: ColorMode = 'auto'): string {
  return themeCssFor(input, colorMode, '[data-wyllet]')
}

function themeCssFor(input: ThemeInput, colorMode: ColorMode, selector: string): string {
  if (!isThemePair(input)) return `${selector}{${declarations(input)}}`
  if (colorMode === 'light') return `${selector}{${declarations(input.light)}color-scheme:light;}`
  if (colorMode === 'dark') return `${selector}{${declarations(input.dark)}color-scheme:dark;}`
  return (
    `${selector}{${declarations(input.light)}color-scheme:light;}` +
    `@media (prefers-color-scheme: dark){${selector}{${declarations(input.dark)}color-scheme:dark;}}`
  )
}
