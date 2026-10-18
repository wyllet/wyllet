import { mkdir, writeFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'
import { css } from './src/styles/css'
import { auroraTheme, obsidianTheme, porcelainTheme, terminalTheme } from './src/theme/presets'
import { themeStylesheet } from './src/theme/cssVars'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query'],
  banner: { js: "'use client';" },
  async onSuccess() {
    // Plain stylesheets for strict CSP: `injectStyles={false}` loads styles.css, `injectTheme={false}` a theme file.
    await writeFile('dist/styles.css', css)
    await mkdir('dist/themes', { recursive: true })
    const themes = {
      default: themeStylesheet(), // porcelain in light mode, obsidian in dark mode
      obsidian: themeStylesheet(obsidianTheme()),
      porcelain: themeStylesheet(porcelainTheme()),
      aurora: themeStylesheet(auroraTheme()),
      terminal: themeStylesheet(terminalTheme()),
    }
    for (const [name, sheet] of Object.entries(themes)) await writeFile(`dist/themes/${name}.css`, sheet)
  },
})
