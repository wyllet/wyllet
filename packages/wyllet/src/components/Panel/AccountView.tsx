import { useState } from 'react'
import { mainnet } from 'viem/chains'
import { useBalance, useConnection, useDisconnect, useEnsName } from 'wagmi'
import { useWylletContext, type AccountTab } from '../../core/context'
import { useCopyToClipboard } from '../../hooks'
import { format } from '../../i18n/en'
import { cx, explorerUrl, formatAmount, shortenAddress } from '../../utils'
import { Avatar } from '../Avatar'
import { ChainIcon } from '../ChainIcon'
import { AlertIcon, ArrowDownIcon, CheckIcon, ChevronDownIcon, CopyIcon, ExternalIcon, PowerIcon } from '../primitives/Icons'
import { QRCode } from '../primitives/QRCode'
import { ScrollArea } from '../primitives/ScrollArea'
import { ActivityTab, NetworksTab, TokensTab } from './accountTabs'
import { ImportTokenView } from './customViews'
import { IdentityCard } from './IdentityCard'
import { BrandBadge, PanelHeader } from './shared'

export function AccountView({ titleId }: { titleId: string }) {
  const { t, options, panel, auth } = useWylletContext()
  const { address, chain, chainId } = useConnection()
  const { mutate: disconnect } = useDisconnect()
  const { copied, copy } = useCopyToClipboard()
  const [sub, setSub] = useState<'receive' | 'importToken' | null>(null)
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id, query: { enabled: options.ens && !!address } })
  const { data: balance } = useBalance({ address, query: { enabled: !!address } })

  if (!address) return null
  const tabs = options.appearance.accountTabs
  const tab: AccountTab = chainId !== undefined && !chain ? 'networks' : tabs.includes(panel.tab) ? panel.tab : tabs[0] ?? 'tokens'
  const href = explorerUrl(chain, `address/${address}`)
  const withCard = options.appearance.identityCard
  const formattedBalance = balance ? formatAmount(balance.value, balance.decimals) : undefined

  if (sub === 'importToken')
    return (
      <>
        <PanelHeader titleId={titleId} title={t.importToken} onBack={() => setSub(null)} onClose={panel.close} />
        <ScrollArea className="wy-body">
          <ImportTokenView onDone={() => setSub(null)} />
        </ScrollArea>
      </>
    )

  if (sub === 'receive')
    return (
      <>
        <PanelHeader titleId={titleId} title={t.receiveTitle} onBack={() => setSub(null)} onClose={panel.close} />
        <ScrollArea className="wy-body">
          <div className="wy-step wy-enter">
            <div className="wy-qr-frame">
              <div className="wy-qr-inner">
                <QRCode value={address} size={256} />
              </div>
            </div>
            <div className="wy-receive-address">
              <Avatar address={address} size={22} />
              <code>{address}</code>
            </div>
            <button type="button" className="wy-btn wy-btn-primary" onClick={() => copy(address)} data-autofocus>
              {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
              {copied ? t.copied : t.copyAddress}
            </button>
            {chain && <p className="wy-hint">{format(t.receiveNote, { network: chain.name })}</p>}
          </div>
        </ScrollArea>
      </>
    )

  const chainChip =
    chainId !== undefined ? (
      <button type="button" className={cx('wy-chain-chip', !chain && 'wy-chain-chip-bad')} onClick={() => panel.setTab('networks')}>
        {chain ? <ChainIcon chainId={chainId} size={16} /> : <AlertIcon size={14} />}
        <span>{chain?.name ?? t.wrongNetwork}</span>
        <ChevronDownIcon size={13} className="wy-dim" />
      </button>
    ) : undefined

  return (
    <>
      <PanelHeader titleId={titleId} title={<span className="wy-sr">{ensName ?? address}</span>} leading={chainChip} onClose={panel.close} />

      {/* Fixed part: identity, quick actions and tabs never scroll away. */}
      <div className="wy-account-top">
        {withCard ? (
          <IdentityCard
            address={address}
            ensName={ensName}
            balance={formattedBalance}
            symbol={balance?.symbol}
            chainId={chain ? chainId : undefined}
            chainName={chain?.name}
          />
        ) : (
        <div className="wy-summary">
          <Avatar address={address} size={48} />
          <div className="wy-summary-main">
            <button type="button" className="wy-summary-name" onClick={() => copy(address)} title={t.copyAddress}>
              <span>{ensName ?? shortenAddress(address)}</span>
              <span className={cx('wy-summary-copy', copied && 'wy-copied')}>{copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}</span>
            </button>
            <div className="wy-summary-balance">
              {formattedBalance ?? '—'}
              <small>{balance?.symbol}</small>
            </div>
          </div>
        </div>
        )}

        <div className="wy-quick-actions">
          {withCard && (
            <button type="button" className="wy-quick-action" onClick={() => copy(address)}>
              {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
              {copied ? t.copied : t.copyAddress}
            </button>
          )}
          <button type="button" className="wy-quick-action" onClick={() => setSub('receive')}>
            <ArrowDownIcon size={15} />
            {t.receive}
          </button>
          {href && (
            <a className="wy-quick-action" href={href} target="_blank" rel="noreferrer noopener">
              <ExternalIcon size={15} />
              {t.explorer}
            </a>
          )}
          <button
            type="button"
            className="wy-quick-action wy-quick-danger"
            aria-label={t.disconnect}
            title={t.disconnect}
            onClick={() => {
              if (auth.enabled) void auth.signOut()
              disconnect()
              panel.close()
            }}
          >
            <PowerIcon size={16} />
          </button>
        </div>

        {tabs.length > 0 && (
          <div className="wy-tabs" role="tablist" style={{ ['--n' as string]: tabs.length, ['--x' as string]: tabs.indexOf(tab) }}>
            <span className="wy-tabs-indicator" aria-hidden />
            {tabs.map((id) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className={cx(tab === id && 'wy-on')} onClick={() => panel.setTab(id)}>
                {id === 'tokens' ? t.tabTokens : id === 'activity' ? t.tabActivity : t.tabNetworks}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Only the tab content scrolls. */}
      {tabs.length > 0 && (
        <ScrollArea className={cx('wy-body wy-account-scroll', withCard && 'wy-with-card')}>
          <div className="wy-tab-panel" key={tab}>
            {tab === 'tokens' && <TokensTab address={address} onImport={() => setSub('importToken')} />}
            {tab === 'activity' && <ActivityTab />}
            {tab === 'networks' && <NetworksTab />}
          </div>
        </ScrollArea>
      )}
      {options.appearance.branding && (
        <footer className="wy-account-foot">
          <BrandBadge />
        </footer>
      )}
    </>
  )
}
