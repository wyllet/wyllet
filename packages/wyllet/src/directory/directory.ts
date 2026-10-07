/**
 * WalletConnect wallet registry (Reown Cloud Explorer API). Wallets submit their own listing,
 * logo and deep links, so everything shown here is official. Only used when a WalletConnect
 * project id is configured, and only fetched when the user opens "All wallets".
 */

const API = 'https://explorer-api.walletconnect.com/v3/wallets'
export const DIRECTORY_PAGE_SIZE = 40

export interface DirectoryWallet {
  id: string
  name: string
  /** Official logo URL served by the registry. */
  icon: string
  rdns?: string
  mobile: { native?: string; universal?: string }
  homepage?: string
  ios?: string
  android?: string
  chrome?: string
}

export interface DirectoryPage {
  wallets: DirectoryWallet[]
  total: number
}

interface Listing {
  id: string
  name: string
  homepage?: string | null
  image_url?: { sm?: string; md?: string; lg?: string } | null
  rdns?: string | null
  chains?: string[] | null
  mobile?: { native?: string | null; universal?: string | null } | null
  app?: { ios?: string | null; android?: string | null; chrome?: string | null } | null
}

const nonEmpty = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined)

function toWallet(l: Listing): DirectoryWallet | undefined {
  const icon = l.image_url?.md ?? l.image_url?.sm
  if (!l.id || !l.name || !icon) return undefined
  return {
    id: l.id,
    name: l.name,
    icon,
    rdns: nonEmpty(l.rdns),
    mobile: { native: nonEmpty(l.mobile?.native), universal: nonEmpty(l.mobile?.universal) },
    homepage: nonEmpty(l.homepage),
    ios: nonEmpty(l.app?.ios),
    android: nonEmpty(l.app?.android),
    chrome: nonEmpty(l.app?.chrome),
  }
}

const cache = new Map<string, Promise<DirectoryPage>>()

/** One page of EVM wallets that support WalletConnect v2. Results are cached for the session. */
export function fetchDirectoryPage(projectId: string, page: number, search = ''): Promise<DirectoryPage> {
  const key = `${projectId}|${page}|${search.trim().toLowerCase()}`
  const hit = cache.get(key)
  if (hit) return hit
  const params = new URLSearchParams({ projectId, entries: String(DIRECTORY_PAGE_SIZE), page: String(page), version: '2' })
  if (search.trim()) params.set('search', search.trim())
  const request = fetch(`${API}?${params}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Wallet registry responded ${res.status}`)
      return res.json() as Promise<{ listings?: Record<string, Listing>; total?: number }>
    })
    .then((json) => ({
      wallets: Object.values(json.listings ?? {})
        .filter((l) => !l.chains || l.chains.some((c) => c.startsWith('eip155:')))
        .map(toWallet)
        .filter((w): w is DirectoryWallet => !!w),
      total: typeof json.total === 'number' ? json.total : 0,
    }))
  // Don't cache failures, so "Retry" really retries.
  request.catch(() => cache.delete(key))
  cache.set(key, request)
  return request
}

/**
 * Link that opens a specific wallet app with a WalletConnect URI — formatted exactly like Reown's
 * own modal so every registry wallet behaves as its developers expect. Prefers universal links.
 */
export function directoryDeepLink(wallet: Pick<DirectoryWallet, 'mobile'>, uri: string): string | undefined {
  const encoded = encodeURIComponent(uri)
  const { universal, native } = wallet.mobile
  if (universal) return `${universal.endsWith('/') ? universal : `${universal}/`}wc?uri=${encoded}`
  if (native) {
    let base = native.includes('://') ? native : `${native.replaceAll('/', '').replaceAll(':', '')}://`
    if (!base.endsWith('/')) base = `${base}/`
    return `${base}wc?uri=${encoded}`
  }
  return undefined
}
