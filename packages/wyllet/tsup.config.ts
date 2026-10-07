import { writeFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'
import { css } from './src/styles/css'

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
    // Plain stylesheet for apps that set `injectStyles={false}` (strict CSP, etc).
    await writeFile('dist/styles.css', css)
  },
})
