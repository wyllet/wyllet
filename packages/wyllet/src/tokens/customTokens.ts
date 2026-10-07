import { createStore } from '../core/createStore'
import { isAddress } from 'viem'
import { storage, storageKey } from '../utils'
import type { Token, TokenList } from './tokens'

const STORAGE_KEY = storageKey('customTokens')

const isToken = (t: unknown): t is Token => {
  const x = t as Partial<Token> | null
  return !!x && typeof x.address === 'string' && isAddress(x.address, { strict: false }) && typeof x.symbol === 'string' && Number.isInteger(x.decimals) && x.decimals! >= 0 && x.decimals! <= 77
}

/** Keep only well-formed tokens under numeric chain ids. */
const sanitize = (value: unknown): TokenList =>
  Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([id, list]) => /^\d+$/.test(id) && Array.isArray(list))
      .map(([id, list]) => [Number(id), (list as unknown[]).filter(isToken)]),
  )

/** Tokens the user imported by contract address, per chain. Persisted in localStorage. */
export function createCustomTokenStore() {
  const store = createStore<TokenList>(storage.get(STORAGE_KEY, {}, sanitize))
  store.subscribe(() => storage.set(STORAGE_KEY, store.get()))
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

  return {
    store,
    add(chainId: number, token: Token) {
      store.set((all) => ({ ...all, [chainId]: [...(all[chainId] ?? []).filter((t) => !same(t.address, token.address)), token] }))
    },
    remove(chainId: number, address: string) {
      store.set((all) => ({ ...all, [chainId]: (all[chainId] ?? []).filter((t) => !same(t.address, address)) }))
    },
  }
}

export type CustomTokenStore = ReturnType<typeof createCustomTokenStore>
