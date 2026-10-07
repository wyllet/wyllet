import type { Address, Hash } from 'viem'
import type { Config } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { createStore } from '../core/createStore'
import type { Messages } from '../i18n/en'
import type { ToastApi } from '../toast/toastStore'
import { explorerUrl, storage, storageKey } from '../utils'

export type ActivityKind = 'transaction' | 'connect' | 'disconnect' | 'network' | 'signIn' | 'custom'
export type ActivityStatus = 'pending' | 'success' | 'failed' | 'info'

/** One entry in the account panel's Activity timeline. */
export interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  description?: string
  status: ActivityStatus
  /** Account the entry belongs to (lower-cased). */
  account: Address
  chainId?: number
  hash?: Hash
  timestamp: number
}

const STORAGE_KEY = storageKey('activity')
/** Stop waiting after this long; the item stays `pending` (it may still be mined, or may have been dropped). */
const WATCH_TIMEOUT_MS = 30 * 60_000
/** Pending transactions older than this are not re-watched on page load. */
const RESUME_MAX_AGE_MS = 24 * 60 * 60_000
const KINDS: ActivityKind[] = ['transaction', 'connect', 'disconnect', 'network', 'signIn', 'custom']
const STATUSES: ActivityStatus[] = ['pending', 'success', 'failed', 'info']

const isItem = (v: unknown): v is ActivityItem => {
  const x = v as Partial<ActivityItem> | null
  return (
    !!x &&
    typeof x.id === 'string' &&
    typeof x.title === 'string' &&
    typeof x.account === 'string' &&
    typeof x.timestamp === 'number' &&
    KINDS.includes(x.kind as ActivityKind) &&
    STATUSES.includes(x.status as ActivityStatus)
  )
}
const MAX_PER_ACCOUNT = 50
let counter = 0

export function createActivityTracker(deps: { getConfig: () => Config; toast: ToastApi; getMessages: () => Messages }) {
  const store = createStore<ActivityItem[]>(storage.get<ActivityItem[]>(STORAGE_KEY, [], (v) => (v as unknown[]).filter(isItem)))
  const watching = new Set<Hash>()
  store.subscribe(() => storage.set(STORAGE_KEY, store.get()))

  const patch = (id: string, changes: Partial<ActivityItem>) =>
    store.set((list) => list.map((item) => (item.id === id ? { ...item, ...changes } : item)))

  function push(item: Omit<ActivityItem, 'id' | 'timestamp' | 'account'> & { account: string; id?: string }) {
    const entry: ActivityItem = {
      ...item,
      id: item.id ?? `wy-${Date.now().toString(36)}-${++counter}`,
      account: item.account.toLowerCase() as Address,
      timestamp: Date.now(),
    }
    store.set((list) => {
      const others = list.filter((x) => x.id !== entry.id)
      const mine = others.filter((x) => x.account === entry.account).slice(0, MAX_PER_ACCOUNT - 1)
      return [entry, ...mine, ...others.filter((x) => x.account !== entry.account)]
    })
    return entry
  }

  async function watch(item: ActivityItem, withToast: boolean) {
    if (!item.hash || watching.has(item.hash)) return
    watching.add(item.hash)
    const t = deps.getMessages()
    const config = deps.getConfig()
    const chain = config.chains.find((c) => c.id === item.chainId)
    const href = explorerUrl(chain, `tx/${item.hash}`)
    const action = href ? { label: t.viewTransaction, href } : undefined
    const toastId = `wy-tx-${item.hash}`
    if (withToast) deps.toast({ id: toastId, status: 'loading', title: t.txPending, description: item.title, action })
    let ok = false
    try {
      const receipt = await waitForTransactionReceipt(config, { hash: item.hash, chainId: item.chainId, timeout: WATCH_TIMEOUT_MS })
      ok = receipt.status === 'success'
    } catch (error) {
      watching.delete(item.hash)
      // Not mined within the window: that's "unknown", not "failed". Keep it pending and stop the spinner toast.
      if ((error as { name?: string }).name === 'WaitForTransactionReceiptTimeoutError') {
        if (withToast) deps.toast.dismiss(toastId)
        return
      }
      ok = false
    } finally {
      watching.delete(item.hash)
    }
    patch(item.id, { status: ok ? 'success' : 'failed' })
    if (withToast)
      deps.toast({ id: toastId, status: ok ? 'success' : 'error', title: ok ? t.txConfirmed : t.txFailed, description: item.title, action })
  }

  return {
    store,
    log: push,
    addTransaction(input: { hash: Hash; chainId: number; account: string; description?: string; toast?: boolean }) {
      const item = push({
        id: input.hash,
        kind: 'transaction',
        hash: input.hash,
        chainId: input.chainId,
        account: input.account,
        title: input.description ?? `${input.hash.slice(0, 10)}…${input.hash.slice(-6)}`,
        status: 'pending',
      })
      void watch(item, input.toast ?? true)
    },
    clear(account: string) {
      const a = account.toLowerCase()
      store.set((list) => list.filter((x) => x.account !== a))
    },
    /** Resume watching transactions left pending by a previous page load. */
    resume() {
      const cutoff = Date.now() - RESUME_MAX_AGE_MS
      store
        .get()
        .filter((x) => x.kind === 'transaction' && x.status === 'pending' && x.timestamp > cutoff)
        .forEach((x) => void watch(x, false))
    },
  }
}

export type ActivityTracker = ReturnType<typeof createActivityTracker>
