import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { Address } from 'viem'
import { useConnect, useConnection, useDisconnect, type Connector } from 'wagmi'
import { useWylletContext } from '../../core/context'
import { useWalletOptions, type WalletOption } from '../../hooks/useWalletOptions'
import { format } from '../../i18n/en'
import { cx, isMobileDevice } from '../../utils'
import { walletConnectWallet } from '../../wallets/presets'
import { ArrowRightIcon, ChevronRightIcon, HelpIcon, QrIcon, SearchIcon } from '../primitives/Icons'
import { ScrollArea } from '../primitives/ScrollArea'
import { directoryDeepLink, type DirectoryWallet } from '../../directory/directory'
import { ConnectingStep, GetStep, OnboardingStep, QrStep, SignInStep, SuccessStep } from './connectSteps'
import { DirectoryView } from './DirectoryView'
import { BrandBadge, Kbd, PanelHeader, WalletIcon } from './shared'

type Route =
  | { name: 'list' }
  | { name: 'onboarding' }
  | { name: 'signIn' }
  | { name: 'success' }
  | { name: 'connecting'; option: WalletOption }
  | { name: 'qr'; option?: WalletOption }
  | { name: 'get'; option: WalletOption }
  | { name: 'directory' }

const SUCCESS_MS = 1100

export function ConnectView({ titleId }: { titleId: string }) {
  const { panel, t, options, auth, markRecent } = useWylletContext()
  const { all, groups, walletConnectConnector } = useWalletOptions()
  const { status, address } = useConnection()
  const { mutateAsync: connect } = useConnect()
  const { mutate: disconnect } = useDisconnect()

  const needsSignIn = auth.enabled && auth.status !== 'loading' && !auth.isSignedIn(address)
  const [route, setRoute] = useState<Route>(() => (status === 'connected' && needsSignIn ? { name: 'signIn' } : { name: 'list' }))
  const [error, setError] = useState<unknown>(null)
  const [uri, setUri] = useState<string>()
  // Steps opened from "All wallets" go back there, not to the main list.
  const [fromDirectory, setFromDirectory] = useState(false)
  const directoryEnabled = !!walletConnectConnector && options.appearance.walletDirectory && !!options.walletConnectProjectId
  const attempt = useRef(0)
  // Read auth at completion time, not from the closure captured when the user clicked.
  const authRef = useRef(auth)
  authRef.current = auth
  const successTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(
    () => () => {
      attempt.current++
      clearTimeout(successTimer.current)
    },
    [],
  )

  const finish = useCallback(
    (option: WalletOption, account: Address | undefined) => {
      markRecent(option.wallet.id)
      // A restored session for a different account doesn't count.
      if (authRef.current.enabled && !authRef.current.isSignedIn(account)) return setRoute({ name: 'signIn' })
      setRoute({ name: 'success' })
      successTimer.current = setTimeout(() => (options.appearance.closeOnConnect ? panel.close() : panel.open('account')), SUCCESS_MS)
    },
    [markRecent, options.appearance.closeOnConnect, panel],
  )

  const run = useCallback(
    async (option: WalletOption, connector: Connector, onUri?: (uri: string) => void) => {
      const id = ++attempt.current
      setError(null)
      setUri(undefined)
      const onMessage = ({ type, data }: { type: string; data?: unknown }) => {
        if (type !== 'display_uri' || id !== attempt.current) return
        setUri(data as string)
        onUri?.(data as string)
      }
      if (onUri) connector.emitter.on('message', onMessage)
      try {
        const result = await connect({ connector })
        const account = result.accounts[0] as Address | { address: Address } | undefined
        if (id === attempt.current) finish(option, typeof account === 'object' ? account.address : account)
      } catch (e) {
        if (id === attempt.current) setError(e)
      } finally {
        if (onUri) connector.emitter.off('message', onMessage)
      }
    },
    [connect, finish],
  )

  const startWalletConnect = useCallback(
    (option: WalletOption | undefined) => {
      if (!walletConnectConnector) return
      const mobile = isMobileDevice()
      const target = option ?? { wallet: walletConnectWallet(), installed: false, recent: false, action: 'walletConnect' as const }
      setRoute(mobile ? { name: 'connecting', option: target } : { name: 'qr', option })
      void run(target, walletConnectConnector, (wcUri) => {
        const link = target.wallet.walletConnect?.mobileUri?.(wcUri)
        if (mobile && link) window.location.href = link
      })
    },
    [run, walletConnectConnector],
  )

  const select = useCallback(
    (option: WalletOption) => {
      if (option.action === 'get') return setRoute({ name: 'get', option })
      if (option.action === 'connect' && option.connector) {
        setRoute({ name: 'connecting', option })
        return void run(option, option.connector)
      }
      if (option.wallet.id === 'walletConnect' && directoryEnabled) return setRoute({ name: 'directory' })
      startWalletConnect(option.wallet.id === 'walletConnect' ? undefined : option)
    },
    [run, startWalletConnect, directoryEnabled],
  )

  /** A registry wallet: connect directly if its extension is installed, otherwise WalletConnect with its own deep link. */
  const pickFromDirectory = useCallback(
    (w: DirectoryWallet) => {
      const installed = w.rdns ? all.find((o) => o.installed && o.connector?.id === w.rdns) : undefined
      const links = { ios: w.ios, android: w.android, browserExtension: w.chrome, website: w.homepage }
      const option: WalletOption = {
        wallet: {
          id: w.id,
          name: w.name,
          icon: w.icon,
          rdns: w.rdns,
          walletConnect: { mobileUri: (wcUri) => directoryDeepLink(w, wcUri) ?? wcUri },
          downloadUrls: Object.values(links).some(Boolean) ? links : undefined,
        },
        connector: installed?.connector,
        installed: !!installed,
        recent: false,
        // On a phone, a wallet without its own app link would fall back to a bare `wc:` link and open
        // whichever wallet is the OS default — show its install / info page instead.
        action: installed ? 'connect' : isMobileDevice() && !directoryDeepLink(w, 'wc:') ? 'get' : 'walletConnect',
      }
      setFromDirectory(true)
      select(option)
    },
    [all, select],
  )

  const back = () => {
    attempt.current++
    if (fromDirectory && route.name !== 'directory') return setRoute({ name: 'directory' })
    setFromDirectory(false)
    setRoute({ name: 'list' })
  }

  const close = () => {
    attempt.current++
    clearTimeout(successTimer.current)
    panel.close()
  }

  let title: ReactNode = format(t.connectTo, { app: options.appInfo.name })
  let body: ReactNode
  switch (route.name) {
    case 'connecting':
      title = route.option.wallet.name
      body = (
        <ConnectingStep
          key={route.option.wallet.id}
          option={route.option}
          error={error}
          onRetry={() => select(route.option)}
          deepLink={uri ? route.option.wallet.walletConnect?.mobileUri?.(uri) : undefined}
        />
      )
      break
    case 'qr':
      title = t.scanTitle
      body = (
        <QrStep
          option={route.option}
          uri={uri}
          error={error}
          onRetry={() => startWalletConnect(route.option)}
          onGet={route.option?.wallet.downloadUrls ? () => setRoute({ name: 'get', option: route.option! }) : undefined}
        />
      )
      break
    case 'get':
      title = format(t.getWallet, { name: route.option.wallet.name })
      body = (
        <GetStep
          option={route.option}
          onScan={route.option.wallet.walletConnect && walletConnectConnector ? () => startWalletConnect(route.option) : undefined}
        />
      )
      break
    case 'onboarding':
      title = t.noWallet
      body = (
        <OnboardingStep
          options={all.filter((o) => o.wallet.downloadUrls && o.wallet.featured !== false && o.wallet.id !== 'walletConnect')}
          onPick={(option) => setRoute({ name: 'get', option })}
        />
      )
      break
    case 'directory':
      title = t.allWalletsTitle
      body = (
        <DirectoryView
          onPick={pickFromDirectory}
          onGenericQr={
            isMobileDevice()
              ? undefined
              : () => {
                  setFromDirectory(true)
                  startWalletConnect(undefined)
                }
          }
        />
      )
      break
    case 'signIn':
      title = t.verify
      body = <SignInStep onDone={() => panel.close()} onCancel={() => (disconnect(), close())} />
      break
    case 'success':
      title = t.connected
      body = <SuccessStep />
      break
    default:
      body = <WalletPicker all={all} groups={groups} onSelect={select} directory={directoryEnabled} />
  }

  const isList = route.name === 'list'
  return (
    <>
      <PanelHeader
        titleId={titleId}
        title={title}
        leading={isList ? <AppMark /> : undefined}
        onBack={!isList && route.name !== 'signIn' && route.name !== 'success' ? back : undefined}
        onClose={close}
      />
      <ScrollArea className="wy-body">{body}</ScrollArea>
      {isList && (
        <Footer
          onScan={walletConnectConnector && !isMobileDevice() ? () => startWalletConnect(undefined) : undefined}
          onOnboard={() => setRoute({ name: 'onboarding' })}
        />
      )}
    </>
  )
}

function AppMark() {
  const { options } = useWylletContext()
  const { icon, name } = options.appInfo
  return <span className="wy-app-mark">{icon ? <img src={icon} alt="" /> : name.trim().charAt(0).toUpperCase()}</span>
}

/* ------------------------------------------------------------------ Wallet picker */

function WalletPicker({
  all,
  groups,
  onSelect,
  directory,
}: {
  all: WalletOption[]
  groups: ReturnType<typeof useWalletOptions>['groups']
  onSelect(o: WalletOption): void
  /** The WalletConnect option opens "All wallets". */
  directory: boolean
}) {
  const { t, options } = useWylletContext()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const q = query.trim().toLowerCase()
  const searchable = options.appearance.walletSearch === true || (options.appearance.walletSearch === 'auto' && all.length >= 6)

  const { recent, detected, rest } = useMemo(() => {
    const match = (o: WalletOption) => !q || o.wallet.name.toLowerCase().includes(q)
    const installedGroup = groups.find((g) => g.id === 'installed')?.wallets ?? []
    const recentOption = q ? undefined : installedGroup.find((o) => o.recent)
    return {
      recent: recentOption,
      detected: installedGroup.filter((o) => o !== recentOption && match(o)),
      rest: groups.filter((g) => g.id !== 'installed').flatMap((g) => g.wallets).filter(match),
    }
  }, [groups, q])

  const flat = useMemo(() => [...(recent ? [recent] : []), ...detected, ...rest], [recent, detected, rest])
  useEffect(() => setActive(0), [q])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (flat.length ? (i + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length : 0))
    } else if (e.key === 'Enter' && flat[active]) {
      e.preventDefault()
      onSelect(flat[active]!)
    } else if (
      /^[1-9]$/.test(e.key) &&
      !query &&
      !e.metaKey && !e.ctrlKey && !e.altKey &&
      flat[Number(e.key) - 1] &&
      // If a wallet name starts with this digit (e.g. "1inch"), let the keystroke search instead.
      !all.some((o) => o.wallet.name.startsWith(e.key))
    ) {
      e.preventDefault()
      onSelect(flat[Number(e.key) - 1]!)
    }
  }

  // On phones a bare `wc:` link opens the OS default wallet (iOS has no chooser) — say so instead of "WalletConnect".
  const onPhone = isMobileDevice()
  const genericOnPhone = (option: WalletOption) => onPhone && !directory && option.wallet.id === 'walletConnect'
  const isDirectory = (option: WalletOption) => directory && option.wallet.id === 'walletConnect'

  const row = (option: WalletOption, index: number) => (
    <button
      key={option.wallet.id}
      type="button"
      className={cx('wy-row', index === active && 'wy-row-active', options.classNames.walletRow)}
      onClick={() => onSelect(option)}
      onMouseEnter={() => setActive(index)}
      style={{ ['--i' as string]: index }}
    >
      <WalletIcon wallet={option.wallet} size={34} />
      <span className="wy-row-main">
        <span className="wy-row-title">{isDirectory(option) ? t.allWalletsTitle : genericOnPhone(option) ? t.otherWalletApp : option.wallet.name}</span>
        {isDirectory(option) && <span className="wy-row-sub">{t.directorySub}</span>}
        {genericOnPhone(option) && <span className="wy-row-sub">{t.opensDefaultWallet}</span>}
        {option.installed && (
          <span className="wy-row-sub wy-live">
            <i /> {t.detected}
          </span>
        )}
      </span>
      {option.action === 'walletConnect' && !onPhone && !isDirectory(option) && <QrIcon size={15} className="wy-dim" />}
      {index < 9 && !onPhone ? <Kbd>{index + 1}</Kbd> : <ChevronRightIcon size={15} className="wy-dim" />}
    </button>
  )

  let index = recent ? 1 : 0
  return (
    <div className="wy-picker" onKeyDown={onKeyDown}>
      {recent && (
        <button
          type="button"
          className={cx('wy-continue', active === 0 && 'wy-row-active')}
          onClick={() => onSelect(recent)}
          onMouseEnter={() => setActive(0)}
        >
          <WalletIcon wallet={recent.wallet} size={44} />
          <span className="wy-row-main">
            <span className="wy-continue-kicker">{t.lastUsed}</span>
            <span className="wy-row-title">{format(t.continueWith, { name: recent.wallet.name })}</span>
          </span>
          <span className="wy-continue-arrow">
            <ArrowRightIcon size={16} />
          </span>
        </button>
      )}

      {searchable ? (
        <label className="wy-search">
          <SearchIcon size={15} />
          <input
            data-autofocus
            type="search"
            value={query}
            placeholder={t.searchWallets}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t.searchWallets}
            autoComplete="off"
            spellCheck={false}
          />
          {!onPhone && (
            <span className="wy-search-hint">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
            </span>
          )}
        </label>
      ) : (
        <span data-autofocus tabIndex={-1} className="wy-sr" />
      )}

      {flat.length === 0 && <p className="wy-empty">{format(t.noWalletsFound, { query })}</p>}

      {detected.length > 0 && (
        <section>
          <div className="wy-section-label">{t.detected}</div>
          <div className="wy-rows">{detected.map((o) => row(o, index++))}</div>
        </section>
      )}
      {rest.length > 0 && (
        <section>
          <div className="wy-section-label">{t.allWallets}</div>
          <div className="wy-rows">{rest.map((o) => row(o, index++))}</div>
        </section>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Footer */

function Footer({ onScan, onOnboard }: { onScan?(): void; onOnboard(): void }) {
  const { t, options } = useWylletContext()
  const { termsUrl, privacyUrl } = options.appInfo
  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {label}
    </a>
  )
  const notice =
    options.disclaimer ??
    (termsUrl && privacyUrl
      ? format(t.termsNotice, { terms: '\u0000', privacy: '\u0001' })
          .split(/(\u0000|\u0001)/)
          .map((part, i) =>
            part === '\u0000' ? <span key={i}>{link(termsUrl, t.terms)}</span> : part === '\u0001' ? <span key={i}>{link(privacyUrl, t.privacy)}</span> : part,
          )
      : null)

  return (
    <footer className="wy-foot">
      <div className="wy-foot-actions">
        {onScan && (
          <button type="button" className="wy-foot-btn" onClick={onScan}>
            <QrIcon size={16} />
            {t.scanWithPhone}
          </button>
        )}
        <button type="button" className="wy-foot-btn" onClick={onOnboard}>
          <HelpIcon size={16} />
          {t.noWallet}
        </button>
      </div>
      {notice && <div className="wy-disclaimer">{notice}</div>}
      <BrandBadge />
    </footer>
  )
}
