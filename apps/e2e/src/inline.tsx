// Control: default injection with no nonce. Under the strict CSP this must produce violations,
// which proves the CSP tests would catch a regression.
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(<App />)
