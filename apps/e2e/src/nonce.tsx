// Strict CSP with a per-response nonce (`style-src 'self' 'nonce-…'`): Wyllet injects its styles with it.
import { createRoot } from 'react-dom/client'
import { App } from './App'

const nonce = document.querySelector<HTMLMetaElement>('meta[property="csp-nonce"]')?.nonce
createRoot(document.getElementById('root')!).render(<App nonce={nonce} />)
