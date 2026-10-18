import type { Page } from '@playwright/test'

export const ACCOUNT_1 = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
export const ACCOUNT_2 = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

export interface WalletOptions {
  /** EIP-6963 identity. Defaults to a generic test wallet; set it to a real wallet's rdns to test detection. */
  name?: string
  rdns?: string
  accounts?: string[]
  chainId?: number
}

/** `fail` is a wallet error that isn't the user saying no (e.g. an internal error). */
export type Decision = 'approve' | 'reject' | 'fail'

/**
 * A scripted browser wallet: a standard EIP-1193 provider announced through EIP-6963, installed before
 * any page script runs. Its connection survives reloads (localStorage), like a real extension's
 * site permission. Tests drive it through `window.__wallet`.
 */
export async function installWallet(page: Page, options: WalletOptions = {}) {
  await page.addInitScript((opts) => {
    const KEY = 'wyllet-e2e-wallet'
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { connected: boolean; chainId: number; accounts: string[] } | null
    const state = {
      connected: saved?.connected ?? false,
      chainId: saved?.chainId ?? opts.chainId ?? 1,
      accounts: saved?.accounts ?? opts.accounts ?? ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
      decide: { connect: 'approve', switch: 'approve', sign: 'approve' } as Record<string, 'approve' | 'reject' | 'fail'>,
      requests: [] as string[],
    }
    const persist = () => localStorage.setItem(KEY, JSON.stringify({ connected: state.connected, chainId: state.chainId, accounts: state.accounts }))
    const listeners = new Map<string, Set<(arg: unknown) => void>>()
    const emit = (event: string, arg: unknown) => listeners.get(event)?.forEach((fn) => fn(arg))
    const hexChain = () => `0x${state.chainId.toString(16)}`
    const rejected = () => Object.assign(new Error('User rejected the request.'), { code: 4001 })
    const failed = () => Object.assign(new Error('Internal error.'), { code: -32603 })

    const provider = {
      isE2EWallet: true,
      async request({ method, params }: { method: string; params?: unknown[] }) {
        state.requests.push(method)
        switch (method) {
          case 'eth_requestAccounts':
          case 'wallet_requestPermissions':
            if (state.decide.connect === 'reject') throw rejected()
            state.connected = true
            persist()
            emit('connect', { chainId: hexChain() })
            return method === 'eth_requestAccounts' ? state.accounts : [{ parentCapability: 'eth_accounts' }]
          case 'eth_accounts':
            return state.connected ? state.accounts : []
          case 'wallet_getPermissions':
            return state.connected ? [{ parentCapability: 'eth_accounts' }] : []
          case 'wallet_revokePermissions':
            state.connected = false
            persist()
            emit('accountsChanged', [])
            return null
          case 'eth_chainId':
            return hexChain()
          case 'net_version':
            return String(state.chainId)
          case 'wallet_switchEthereumChain': {
            if (state.decide.switch === 'reject') throw rejected()
            if (state.decide.switch === 'fail') throw failed()
            const next = parseInt((params?.[0] as { chainId: string }).chainId, 16)
            state.chainId = next
            persist()
            emit('chainChanged', hexChain())
            return null
          }
          case 'wallet_addEthereumChain':
            return null
          case 'personal_sign':
          case 'eth_signTypedData_v4':
            if (state.decide.sign === 'reject') throw rejected()
            return `0x${'11'.repeat(65)}`
          default:
            return null
        }
      },
      on(event: string, fn: (arg: unknown) => void) {
        if (!listeners.has(event)) listeners.set(event, new Set())
        listeners.get(event)!.add(fn)
        return provider
      },
      removeListener(event: string, fn: (arg: unknown) => void) {
        listeners.get(event)?.delete(fn)
        return provider
      },
    }

    const info = {
      uuid: '6f1c3b2e-1d4a-4c8e-9a7b-0e2f5d6c7b8a',
      name: opts.name ?? 'E2E Wallet',
      rdns: opts.rdns ?? 'dev.wyllet.e2e',
      icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%2348ECD2%22/%3E%3C/svg%3E',
    }
    const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: Object.freeze({ info, provider }) }))
    window.addEventListener('eip6963:requestProvider', announce)
    announce()

    Object.assign(window, {
      __wallet: {
        state,
        decide(action: string, decision: 'approve' | 'reject' | 'fail') {
          state.decide[action] = decision
        },
        setAccounts(accounts: string[]) {
          state.accounts = accounts
          persist()
          emit('accountsChanged', state.connected ? accounts : [])
        },
        setChain(chainId: number) {
          state.chainId = chainId
          persist()
          emit('chainChanged', hexChain())
        },
        /** The user disconnects the site from inside the wallet. */
        disconnect() {
          state.connected = false
          persist()
          emit('accountsChanged', [])
        },
      },
    })
  }, options)
}

/** Calls one of the wallet's test controls inside the page. */
export const wallet = {
  decide: (page: Page, action: 'connect' | 'switch' | 'sign', decision: Decision) =>
    page.evaluate(([a, d]) => (window as unknown as { __wallet: { decide(a: string, d: string): void } }).__wallet.decide(a, d), [action, decision] as const),
  setAccounts: (page: Page, accounts: string[]) =>
    page.evaluate((a) => (window as unknown as { __wallet: { setAccounts(a: string[]): void } }).__wallet.setAccounts(a), accounts),
  setChain: (page: Page, chainId: number) =>
    page.evaluate((c) => (window as unknown as { __wallet: { setChain(c: number): void } }).__wallet.setChain(c), chainId),
  disconnect: (page: Page) => page.evaluate(() => (window as unknown as { __wallet: { disconnect(): void } }).__wallet.disconnect()),
}

/** Records every CSP violation the page reports, from the very first script. */
export async function trackCspViolations(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = []
    document.addEventListener('securitypolicyviolation', (e) => seen.push(`${e.violatedDirective} ${e.blockedURI || ''} ${e.sample || ''}`.trim()))
    Object.assign(window, { __cspViolations: seen })
  })
  return () => page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations)
}
