import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Builds against the published package output (packages/wyllet/dist), so the tests cover what ships.
export default defineConfig({
  plugins: [react()],
  // Adds the nonce to Vite's own tags and exposes it as <meta property="csp-nonce"> (see server.mjs).
  html: { cspNonce: 'wyllet-e2e-nonce' },
  build: {
    rollupOptions: { input: { index: 'index.html', nonce: 'nonce.html', inline: 'inline.html' } },
  },
})
