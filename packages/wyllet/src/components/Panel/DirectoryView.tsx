import { useState } from 'react'
import { useWylletContext } from '../../core/context'
import type { DirectoryWallet } from '../../directory/directory'
import { useWalletDirectory } from '../../hooks/useWalletDirectory'
import { format } from '../../i18n/en'
import { cx } from '../../utils'
import { QrIcon, SearchIcon, Spinner } from '../primitives/Icons'

/** "All wallets": searchable grid over the WalletConnect registry. */
export function DirectoryView({ onPick, onGenericQr }: { onPick(wallet: DirectoryWallet): void; onGenericQr?(): void }) {
  const { t, options } = useWylletContext()
  const [query, setQuery] = useState('')
  const { wallets, total, status, hasMore, loadMore, retry } = useWalletDirectory(options.walletConnectProjectId, query)

  return (
    <div className="wy-directory wy-enter">
      <label className="wy-search">
        <SearchIcon size={15} />
        <input
          data-autofocus
          type="search"
          value={query}
          placeholder={total ? format(t.directorySearch, { count: total }) : t.searchWallets}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t.searchWallets}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      {status === 'error' && wallets.length === 0 ? (
        <div className="wy-empty-state">
          <p>{t.directoryError}</p>
          <button type="button" className="wy-btn wy-btn-secondary" onClick={retry}>
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <div className={cx('wy-directory-grid', status === 'loading' && wallets.length === 0 && 'wy-loading')} aria-busy={status === 'loading'}>
            {wallets.length === 0 && status === 'loading'
              ? Array.from({ length: 12 }, (_, i) => <span key={i} className="wy-directory-skeleton" />)
              : wallets.map((w, i) => (
                  <button
                    key={w.id}
                    type="button"
                    className="wy-directory-tile"
                    style={{ ['--i' as string]: Math.min(i, 20) }}
                    onClick={() => onPick(w)}
                    title={w.name}
                  >
                    <span className="wy-wallet-icon" style={{ width: 48, height: 48 }}>
                      <img src={w.icon} alt="" width={48} height={48} loading="lazy" draggable={false} />
                    </span>
                    <span className="wy-directory-name">{w.name}</span>
                  </button>
                ))}
          </div>
          {status === 'ready' && wallets.length === 0 && <p className="wy-empty">{format(t.directoryEmpty, { query })}</p>}
          {hasMore && (
            <button type="button" className="wy-btn wy-btn-ghost wy-directory-more" onClick={loadMore}>
              {t.showMore}
            </button>
          )}
          {status === 'loading' && wallets.length > 0 && (
            <div className="wy-directory-more">
              <Spinner size={16} />
            </div>
          )}
        </>
      )}

      {onGenericQr && (
        <button type="button" className="wy-btn wy-btn-ghost" onClick={onGenericQr}>
          <QrIcon size={15} />
          {t.useGenericQr}
        </button>
      )}
    </div>
  )
}
