import { useMemo } from 'react'
import { erc20Abi, formatGwei, type Address } from 'viem'
import { useBalance, useChains, useConnection, useGasPrice, useReadContracts, useSwitchChain, useWatchAsset } from 'wagmi'
import type { ActivityItem } from '../../activity/activity'
import { chainExtras } from '../../chains/custom'
import { useWylletContext } from '../../core/context'
import { useWylletActivity, useWylletChains, useWylletTokens } from '../../hooks'
import { format } from '../../i18n/en'
import { cx, explorerUrl, formatAmount, isUserRejection, relativeTime } from '../../utils'
import { ChainIcon } from '../ChainIcon'
import { AlertIcon, CheckIcon, CloseIcon, ExternalIcon, GasIcon, GlobeIcon, InfoIcon, PlugIcon, PowerIcon, PlusIcon, ShieldIcon, Spinner, SuccessIcon, WalletGlyph } from '../primitives/Icons'
import { TokenIcon } from '../TokenIcon'

/* ------------------------------------------------------------------ Tokens */

export function TokensTab({ address, onImport }: { address: Address; onImport(): void }) {
  const { t, options } = useWylletContext()
  const { chainId, chain } = useConnection()
  const { tokens, removeToken, canImport } = useWylletTokens()
  const { mutate: watchAsset } = useWatchAsset()
  const { data: native, isLoading } = useBalance({ address })
  const { data: balances } = useReadContracts({
    contracts: tokens.map((token) => ({ address: token.address, abi: erc20Abi, functionName: 'balanceOf', args: [address] }) as const),
    query: { enabled: tokens.length > 0 },
  })

  // Pinned first, then (in `balance` mode) tokens you hold — always stable in the dApp's list order.
  const rows = useMemo(() => {
    const byBalance = options.appearance.tokenSort === 'balance'
    const group = (token: (typeof tokens)[number], value: bigint) => (token.pinned ? 0 : byBalance && value > 0n ? 1 : 2)
    return tokens
      .map((token, i) => ({ token, i, value: (balances?.[i]?.result as bigint | undefined) ?? 0n }))
      .sort((a, b) => group(a.token, a.value) - group(b.token, b.value) || a.i - b.i)
  }, [tokens, balances, options.appearance.tokenSort])

  if (isLoading)
    return (
      <div className="wy-list">
        {[0, 1, 2].map((i) => (
          <div key={i} className="wy-skeleton-row" />
        ))}
      </div>
    )

  const nativeSymbol = native?.symbol ?? chain?.nativeCurrency.symbol ?? 'ETH'
  return (
    <div className="wy-list">
      <div className="wy-token-row wy-enter-row" style={{ ['--i' as string]: 0 }}>
        <TokenIcon symbol={nativeSymbol} src={chainExtras(chain)?.nativeIcon} chainId={chainId} size={34} />
        <div className="wy-row-main">
          <span className="wy-row-title">{nativeSymbol}</span>
          <span className="wy-row-sub">{chain?.nativeCurrency.name ?? nativeSymbol}</span>
        </div>
        <span className="wy-amount">{native ? formatAmount(native.value, native.decimals) : '0'}</span>
      </div>
      {rows.map(({ token, value }, i) => (
        <div key={token.address} className={cx('wy-token-row wy-enter-row', value === 0n && 'wy-zero')} style={{ ['--i' as string]: i + 1 }}>
          <TokenIcon symbol={token.symbol} src={token.icon} chainId={chainId} size={34} />
          <div className="wy-row-main">
            <span className="wy-row-title">
              {token.symbol}
              {token.custom && <span className="wy-pill">{t.custom}</span>}
              {token.pinned && <span className="wy-pin" aria-hidden>●</span>}
            </span>
            {token.name && <span className="wy-row-sub">{token.name}</span>}
          </div>
          <span className="wy-amount">{formatAmount(value, token.decimals)}</span>
          <span className="wy-row-tools">
            <button
              type="button"
              className="wy-icon-btn wy-icon-btn-sm"
              title={t.addToWallet}
              aria-label={`${t.addToWallet}: ${token.symbol}`}
              onClick={() => watchAsset({ type: 'ERC20', options: { address: token.address, symbol: token.symbol, decimals: token.decimals, image: token.icon } })}
            >
              <WalletGlyph size={13} />
            </button>
            {token.custom && (
              <button
                type="button"
                className="wy-icon-btn wy-icon-btn-sm wy-danger-hover"
                title={t.removeToken}
                aria-label={`${t.removeToken}: ${token.symbol}`}
                onClick={() => removeToken(token.address)}
              >
                <CloseIcon size={13} />
              </button>
            )}
          </span>
        </div>
      ))}
      {tokens.length === 0 && <p className="wy-empty-sm">{format(t.noTokens, { network: chain?.name ?? '' })}</p>}
      {canImport && chain && (
        <button type="button" className="wy-add-row" onClick={onImport}>
          <PlusIcon size={15} />
          {t.importToken}
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Activity */

const kindIcon = (item: ActivityItem) => {
  if (item.kind === 'transaction')
    return item.status === 'pending' ? <Spinner size={16} /> : item.status === 'success' ? <SuccessIcon size={16} /> : <AlertIcon size={16} />
  if (item.kind === 'connect') return <PlugIcon size={16} />
  if (item.kind === 'disconnect') return <PowerIcon size={16} />
  if (item.kind === 'network') return <GlobeIcon size={16} />
  if (item.kind === 'signIn') return <ShieldIcon size={16} />
  return item.status === 'failed' ? <AlertIcon size={16} /> : item.status === 'success' ? <SuccessIcon size={16} /> : <InfoIcon size={16} />
}

export function ActivityTab() {
  const { t } = useWylletContext()
  const { activity, clearActivity } = useWylletActivity()
  const chains = useChains()

  const groups = useMemo(() => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86_400_000).toDateString()
    const map = new Map<string, ActivityItem[]>()
    for (const item of activity) {
      const day = new Date(item.timestamp).toDateString()
      const label =
        day === today ? t.today : day === yesterday ? t.yesterday : new Date(item.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
      map.set(label, [...(map.get(label) ?? []), item])
    }
    return [...map.entries()]
  }, [activity, t])

  if (activity.length === 0)
    return (
      <div className="wy-empty-state">
        <span className="wy-empty-icon">
          <SuccessIcon size={20} />
        </span>
        <p>{t.noActivity}</p>
      </div>
    )

  return (
    <div className="wy-timeline">
      <button type="button" className="wy-text-btn wy-timeline-clear" onClick={clearActivity}>
        {t.clearActivity}
      </button>
      {groups.map(([label, items]) => (
        <section key={label}>
          <div className="wy-section-label">{label}</div>
          <ol>
            {items.map((item, i) => {
              const chain = chains.find((c) => c.id === item.chainId)
              const href = item.hash ? explorerUrl(chain, `tx/${item.hash}`) : undefined
              return (
                <li key={item.id} className={cx('wy-event', `wy-event-${item.kind}`, `wy-status-${item.status}`)} style={{ ['--i' as string]: i }}>
                  <span className="wy-event-icon">{kindIcon(item)}</span>
                  <div className="wy-row-main">
                    <span className="wy-row-title">{item.title}</span>
                    <span className="wy-row-sub">
                      {relativeTime(item.timestamp, t)}
                      {chain && ` · ${chain.name}`}
                    </span>
                  </div>
                  {href && (
                    <a className="wy-icon-btn wy-icon-btn-sm" href={href} target="_blank" rel="noreferrer noopener" aria-label={t.viewTransaction}>
                      <ExternalIcon size={13} />
                    </a>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ Networks */

export function NetworksTab() {
  const { t } = useWylletContext()
  const { chains } = useWylletChains()
  const { chainId, chain: active } = useConnection()
  const { mutate: switchChain, isPending, variables, error } = useSwitchChain()
  const { data: gas } = useGasPrice({ chainId: active?.id, query: { enabled: !!active, refetchInterval: 12_000 } })

  return (
    <div className="wy-list">
      {chainId !== undefined && !active && (
        <div className="wy-banner">
          <AlertIcon size={16} />
          <span>{t.wrongNetworkDescription}</span>
        </div>
      )}
      {active && gas !== undefined && (
        <div className="wy-gas">
          <GasIcon size={15} />
          <span>{t.gas}</span>
          <strong>{Number(formatGwei(gas)).toFixed(Number(formatGwei(gas)) < 1 ? 3 : 1)} gwei</strong>
          <span className="wy-live-dot" />
        </div>
      )}
      <div className="wy-chain-grid">
        {chains.map((chain, i) => {
          const current = chain.id === chainId
          const pending = isPending && variables?.chainId === chain.id
          return (
            <button
              key={chain.id}
              type="button"
              className={cx('wy-chain-tile wy-enter-row', current && 'wy-current')}
              style={{ ['--i' as string]: i }}
              disabled={isPending || current}
              aria-current={current || undefined}
              onClick={() => switchChain({ chainId: chain.id })}
            >
              <ChainIcon chainId={chain.id} size={26} />
              <span className="wy-chain-tile-name">{chain.name}</span>
              {chain.testnet && <span className="wy-tag">{t.testnet}</span>}
              <span className="wy-chain-tile-state">
                {pending ? <Spinner size={14} /> : current ? <CheckIcon size={14} /> : null}
              </span>
            </button>
          )
        })}
      </div>
      {isPending && <p className="wy-hint wy-center">{t.switching}</p>}
      {error && !isUserRejection(error) && <p className="wy-error-text">{t.switchFailed}</p>}
    </div>
  )
}
