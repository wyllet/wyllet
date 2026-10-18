// Strict CSP without nonces (`style-src 'self'`): Wyllet's styles and theme load as files.
import 'wyllet/styles.css'
import 'wyllet/themes/default.css'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(<App injectStyles={false} injectTheme={false} />)
