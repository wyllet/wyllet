import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Point at the library source so the playground hot-reloads while you hack on wyllet.
    // Remove this alias to test against the built package in `packages/wyllet/dist`.
    alias: {
      wyllet: fileURLToPath(new URL('../../packages/wyllet/src/index.ts', import.meta.url)),
    },
  },
})
