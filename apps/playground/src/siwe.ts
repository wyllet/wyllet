import { verifyMessage } from 'viem'
import { parseSiweMessage } from 'viem/siwe'
import type { WylletAuthAdapter } from 'wyllet'

/**
 * A client-only SIWE adapter for the demo. In production, `getNonce`, `verify`
 * and `signOut` call your backend (which issues and checks the session cookie).
 */
const SESSION_KEY = 'playground.siwe.session'
let nonce = ''

export const demoAuthAdapter: WylletAuthAdapter = {
  statement: 'Sign in to the Wyllet Playground.',
  async getNonce() {
    nonce = crypto.randomUUID().replace(/-/g, '')
    return nonce
  },
  async verify({ message, signature, address }) {
    const parsed = parseSiweMessage(message)
    if (parsed.nonce !== nonce) return false
    const ok = await verifyMessage({ address, message, signature })
    if (ok) sessionStorage.setItem(SESSION_KEY, address)
    return ok
  },
  async signOut() {
    sessionStorage.removeItem(SESSION_KEY)
  },
  async getSession() {
    const address = sessionStorage.getItem(SESSION_KEY)
    return address ? { address: address as `0x${string}` } : null
  },
}
