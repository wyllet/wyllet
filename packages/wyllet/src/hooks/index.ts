import { useCallback, useMemo, useState } from 'react'
import type { Address, Hash } from 'viem'
import { useChains, useConnection } from 'wagmi'
import type { Token } from '../tokens/tokens'
import type { ActivityItem } from '../activity/activity'
import { useWylletContext, type AccountTab, type OpenOptions, type PanelView } from '../core/context'
import { useStore } from '../core/createStore'
import type { ToastApi } from '../toast/toastStore'

/** Control the Wyllet panel from anywhere. */
export function useWyllet() {
  const { panel, auth } = useWylletContext()
  const { status, address, chainId } = useConnection()
  return useMemo(
    () => ({
      /** Open a view. Pass `{ anchor: element }` to anchor the popover presentation. */
      open: (view: PanelView = status === 'connected' ? 'account' : 'connect', options?: OpenOptions) => panel.open(view, options),
      close: panel.close,
      openConnect: (options?: OpenOptions) => panel.open('connect', options),
      openAccount: (options?: OpenOptions) => panel.open('account', options),
      /** Jump straight to a tab of the account panel. */
      openTab: (tab: AccountTab, options?: OpenOptions) => panel.open('account', { ...options, tab }),
      /** Currently open view, or `null`. */
      view: panel.view,
      isConnected: status === 'connected',
      address,
      chainId,
      authStatus: auth.enabled ? (auth.status === 'authenticated' && !auth.isSignedIn(address) ? 'unauthenticated' : auth.status) : undefined,
    }),
    [panel, status, address, chainId, auth],
  )
}

/** Themed toasts: `toast.success('Saved')`, `toast.promise(p, {...})`. */
export function useWylletToast(): ToastApi {
  return useWylletContext().toasts.api
}

/**
 * The account's activity timeline (transactions, connects, network switches, sign-ins).
 *
 * ```ts
 * const { addTransaction } = useWylletActivity()
 * const hash = await writeContractAsync(...)
 * addTransaction({ hash, description: 'Mint 1 NFT' }) // pending → confirmed toast + timeline entry
 * ```
 */
export function useWylletActivity() {
  const { activity: tracker } = useWylletContext()
  const { address, chainId } = useConnection()
  const all = useStore(tracker.store)
  const activity = useMemo<ActivityItem[]>(() => (address ? all.filter((x) => x.account === address.toLowerCase()) : []), [all, address])

  /**
   * Track a transaction. Defaults to the connected account and chain; pass `account` / `chainId`
   * explicitly if the wallet may disconnect before you call this. Returns `false` if no account is known.
   */
  const addTransaction = useCallback(
    (tx: { hash: Hash; description?: string; chainId?: number; account?: Address; toast?: boolean }): boolean => {
      const account = tx.account ?? address
      const onChain = tx.chainId ?? chainId
      if (!account || onChain === undefined) return false
      tracker.addTransaction({ ...tx, chainId: onChain, account })
      return true
    },
    [tracker, address, chainId],
  )
  /** Add your own entry, e.g. `log({ title: 'Staked 10 ETH', status: 'success' })`. Returns `false` if no account is known. */
  const log = useCallback(
    (entry: { title: string; description?: string; status?: ActivityItem['status']; account?: Address }): boolean => {
      const account = entry.account ?? address
      if (!account) return false
      tracker.log({ kind: 'custom', status: 'info', ...entry, account, chainId })
      return true
    },
    [tracker, address, chainId],
  )
  const clearActivity = useCallback(() => address && tracker.clear(address), [tracker, address])
  return { activity, addTransaction, log, clearActivity }
}

/** Sign-In With Ethereum state (requires the `auth` prop on `<WylletProvider>`). */
export function useWylletAuth() {
  const { auth, panel } = useWylletContext()
  const { address } = useConnection()
  return {
    enabled: auth.enabled,
    /** Per connected account: a session for a different address reads as `unauthenticated`. */
    status: auth.status === 'authenticated' && !auth.isSignedIn(address) ? ('unauthenticated' as const) : auth.status,
    /** Opens the panel at the sign-in step (connecting first if needed). */
    signIn: (options?: OpenOptions) => panel.open('connect', options),
    signOut: auth.signOut,
  }
}

/** Copy text with a transient `copied` flag. */
export function useCopyToClipboard(resetMs = 1600) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetMs)
        return true
      } catch {
        return false
      }
    },
    [resetMs],
  )
  return { copied, copy }
}

/** A token plus whether the user imported it (removable). */
export type ListedToken = Token & { custom?: boolean }

/**
 * Tokens for a chain (defaults to the connected one): your configured list plus anything the user imported.
 * `importToken` / `removeToken` let you manage user tokens from your own UI too.
 */
export function useWylletTokens(chainId?: number) {
  const { options, customTokens } = useWylletContext()
  const imported = useStore(customTokens.store)
  const { chainId: connectedChainId } = useConnection()
  const id = chainId ?? connectedChainId

  const tokens = useMemo<ListedToken[]>(() => {
    if (id === undefined) return []
    const configured = options.tokens[id] ?? []
    const known = new Set(configured.map((t) => t.address.toLowerCase()))
    const mine = options.allowTokenImport ? (imported[id] ?? []).filter((t) => !known.has(t.address.toLowerCase())) : []
    return [...configured, ...mine.map((t) => ({ ...t, custom: true }))]
  }, [options.tokens, options.allowTokenImport, imported, id])

  const importToken = useCallback(
    (token: Token, onChainId = id) => onChainId !== undefined && customTokens.add(onChainId, token),
    [customTokens, id],
  )
  const removeToken = useCallback(
    (address: string, onChainId = id) => onChainId !== undefined && customTokens.remove(onChainId, address),
    [customTokens, id],
  )
  return { tokens, importToken, removeToken, canImport: options.allowTokenImport }
}

/** Your configured chains, arranged by the provider's `chainOrder`. */
export function useWylletChains() {
  const { options } = useWylletContext()
  const chains = useChains()
  return useMemo(() => {
    const rank = (id: number) => {
      const i = options.chainOrder.indexOf(id)
      return i === -1 ? Number.MAX_SAFE_INTEGER : i
    }
    return { chains: [...chains].sort((a, b) => rank(a.id) - rank(b.id)) }
  }, [chains, options.chainOrder])
}
