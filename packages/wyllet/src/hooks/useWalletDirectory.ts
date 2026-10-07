import { useCallback, useEffect, useState } from 'react'
import { DIRECTORY_PAGE_SIZE, fetchDirectoryPage, type DirectoryWallet } from '../directory/directory'

/** Paged, debounced search over the WalletConnect wallet registry. */
export function useWalletDirectory(projectId: string | undefined, query: string) {
  const [term, setTerm] = useState(query)
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [wallets, setWallets] = useState<DirectoryWallet[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  // Debounce typing; a new search starts over at page 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(query)
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setStatus('loading')
    fetchDirectoryPage(projectId, page, term)
      .then((res) => {
        if (cancelled) return
        setTotal(res.total)
        setWallets((prev) => {
          if (page === 1) return res.wallets
          const seen = new Set(prev.map((w) => w.id))
          return [...prev, ...res.wallets.filter((w) => !seen.has(w.id))]
        })
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [projectId, page, term, attempt])

  const loadMore = useCallback(() => setPage((p) => p + 1), [])
  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  // `total` also counts non-EVM listings we filter out, so compare pages fetched, not wallets kept.
  const hasMore = status === 'ready' && page * DIRECTORY_PAGE_SIZE < total

  return { wallets, total, status, hasMore, loadMore, retry }
}
