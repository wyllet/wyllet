import { useState } from 'react'
import { useConnection } from 'wagmi'
import type { SignInStep } from '../../auth/useAuthController'
import { useWylletContext } from '../../core/context'
import { useCopyToClipboard } from '../../hooks'
import type { WalletOption } from '../../hooks/useWalletOptions'
import { format } from '../../i18n/en'
import { cx, displayHost, errorMessage, isUserRejection, shortenAddress } from '../../utils'
import { Avatar } from '../Avatar'
import { AlertIcon, CheckIcon, CopyIcon, DownloadIcon, ExternalIcon, QrIcon, ShieldIcon, Spinner } from '../primitives/Icons'
import { QRCode } from '../primitives/QRCode'
import { PrimaryButton, WalletIcon } from './shared'

/* ------------------------------------------------------------------ Connecting */

export function ConnectingStep({ option, error, onRetry, deepLink }: { option: WalletOption; error: unknown; onRetry(): void; deepLink?: string }) {
  const { t } = useWylletContext()
  const rejected = !!error && isUserRejection(error)
  return (
    <div className="wy-step wy-enter">
      <div className={cx('wy-orbit', !!error && 'wy-orbit-error')}>
        <span className="wy-orbit-ring" aria-hidden />
        <span className="wy-orbit-ring wy-orbit-ring-2" aria-hidden />
        <WalletIcon wallet={option.wallet} size={68} />
        {!!error && (
          <span className="wy-orbit-badge">
            <AlertIcon size={14} />
          </span>
        )}
      </div>
      <div className="wy-step-label">{error ? (rejected ? t.requestRejected : t.connectionFailed) : format(t.requesting, { name: option.wallet.name })}</div>
      <p className="wy-step-body">{error ? (rejected ? t.requestRejectedDescription : errorMessage(error)) : t.confirmInWallet}</p>
      {!error && (
        <div className="wy-dots" aria-hidden>
          <i />
          <i />
          <i />
        </div>
      )}
      <div className="wy-step-actions">
        {!!error && <PrimaryButton onClick={onRetry}>{t.tryAgain}</PrimaryButton>}
        {!error && deepLink && (
          <a className="wy-btn wy-btn-secondary" href={deepLink}>
            {format(t.openWallet, { name: option.wallet.name })}
          </a>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ QR */

export function QrStep({ option, uri, error, onRetry, onGet }: { option?: WalletOption; uri?: string; error: unknown; onRetry(): void; onGet?(): void }) {
  const { t } = useWylletContext()
  const { copied, copy } = useCopyToClipboard()
  const specific = option && option.wallet.id !== 'walletConnect'
  return (
    <div className="wy-step wy-enter">
      <div className="wy-qr-frame">
        <div className="wy-qr-inner">
          {uri && !error ? (
            <QRCode value={uri} size={256} logo={option?.wallet.icon} logoBackground={option?.wallet.iconBackground} />
          ) : (
            <div className="wy-qr-skeleton" aria-busy={!error}>
              {error ? (
                <PrimaryButton onClick={onRetry}>{t.tryAgain}</PrimaryButton>
              ) : (
                <>
                  <Spinner size={20} />
                  <span>{t.generatingQr}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="wy-step-body">{specific ? format(t.scanWith, { name: option.wallet.name }) : t.scanAny}</p>
      <p className="wy-hint">{t.scanCameraHint}</p>
      <div className="wy-step-actions wy-inline">
        <button type="button" className="wy-btn wy-btn-secondary" disabled={!uri} onClick={() => uri && copy(uri)}>
          {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
          {copied ? t.copied : t.copyLink}
        </button>
        {specific && onGet && (
          <button type="button" className="wy-btn wy-btn-secondary" onClick={onGet}>
            <DownloadIcon size={15} />
            {format(t.getWalletShort, { name: option.wallet.name })}
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Get wallet */

export function GetStep({ option, onScan }: { option: WalletOption; onScan?(): void }) {
  const { t } = useWylletContext()
  const urls = option.wallet.downloadUrls ?? {}
  const mobile = urls.ios || urls.android
  const links = [
    urls.browserExtension && { href: urls.browserExtension, label: t.getExtension, hint: 'Chrome · Brave · Edge' },
    mobile && { href: pickStore(urls.ios, urls.android), label: t.getMobile, hint: 'iOS · Android' },
    !urls.browserExtension && !mobile && urls.website && { href: urls.website, label: option.wallet.name, hint: displayHost(urls.website) },
  ].filter(Boolean) as Array<{ href: string; label: string; hint: string }>

  return (
    <div className="wy-step wy-enter">
      <WalletIcon wallet={option.wallet} size={64} />
      <div className="wy-step-label">{format(t.getWallet, { name: option.wallet.name })}</div>
      <p className="wy-step-body">{option.wallet.description ?? format(t.getWalletDescription, { name: option.wallet.name })}</p>
      <div className="wy-link-cards">
        {links.map((link) => (
          <a key={link.href} className="wy-link-card" href={link.href} target="_blank" rel="noreferrer noopener">
            <DownloadIcon size={17} />
            <span>
              <strong>{link.label}</strong>
              <small>{link.hint}</small>
            </span>
          </a>
        ))}
      </div>
      {onScan && (
        <button type="button" className="wy-btn wy-btn-ghost" onClick={onScan}>
          <QrIcon size={15} />
          {t.scanInstead}
        </button>
      )}
      <p className="wy-hint">{t.refreshAfterInstall}</p>
    </div>
  )
}

function pickStore(ios?: string, android?: string) {
  if (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) return android ?? ios!
  return ios ?? android!
}

/* ------------------------------------------------------------------ Onboarding */

export function OnboardingStep({ options, onPick }: { options: WalletOption[]; onPick(option: WalletOption): void }) {
  const { t, options: config } = useWylletContext()
  const learnMoreUrl = config.appInfo.learnMoreUrl ?? 'https://ethereum.org/en/wallets/'
  return (
    <div className="wy-step wy-enter">
      <div className="wy-onboard-art" aria-hidden>
        {options.slice(0, 3).map((o, i) => (
          <span key={o.wallet.id} style={{ ['--i' as string]: i }}>
            <WalletIcon wallet={o.wallet} size={52} />
          </span>
        ))}
      </div>
      <div className="wy-step-label">{t.onboardingTitle}</div>
      <p className="wy-step-body">{t.onboardingBody}</p>
      <div className="wy-section-label wy-left">{t.recommended}</div>
      <div className="wy-rows">
        {options.slice(0, 3).map((o) => (
          <button key={o.wallet.id} type="button" className="wy-row" onClick={() => onPick(o)}>
            <WalletIcon wallet={o.wallet} size={32} />
            <span className="wy-row-main">
              <span className="wy-row-title">{o.wallet.name}</span>
              {o.wallet.description && <span className="wy-row-sub">{o.wallet.description}</span>}
            </span>
            <DownloadIcon size={15} className="wy-dim" />
          </button>
        ))}
      </div>
      <a className="wy-btn wy-btn-ghost" href={learnMoreUrl} target="_blank" rel="noreferrer noopener">
        {t.learnMore}
        <ExternalIcon size={14} />
      </a>
    </div>
  )
}

/* ------------------------------------------------------------------ Sign in */

export function SignInStep({ onDone, onCancel }: { onDone(): void; onCancel(): void }) {
  const { t, auth, options, activity } = useWylletContext()
  const { address, chainId } = useConnection()
  const [step, setStep] = useState<SignInStep>('idle')
  const [error, setError] = useState<unknown>(null)
  const busy = step !== 'idle'

  const run = async () => {
    setError(null)
    try {
      await auth.signIn(setStep)
      if (address) activity.log({ kind: 'signIn', status: 'success', account: address, chainId, title: t.activitySignedIn })
      onDone()
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div className="wy-step wy-enter">
      <div className="wy-sign-stack" aria-hidden>
        {address && <Avatar address={address} size={56} />}
        <span className="wy-sign-shield">{options.appInfo.icon ? <img src={options.appInfo.icon} alt="" /> : <ShieldIcon size={22} />}</span>
      </div>
      <div className="wy-step-label">{error ? t.signInFailed : t.signInTitle}</div>
      <p className="wy-step-body">{error ? (isUserRejection(error) ? t.requestRejectedDescription : errorMessage(error)) : t.signInBody}</p>
      {address && <code className="wy-address-chip">{shortenAddress(address, 6)}</code>}
      <div className="wy-step-actions">
        <PrimaryButton onClick={run} disabled={busy} data-autofocus>
          {busy && <Spinner size={15} />}
          {step === 'signing' ? t.signingMessage : step === 'verifying' ? t.verifying : t.signMessage}
        </PrimaryButton>
        <button type="button" className="wy-btn wy-btn-ghost" onClick={onCancel} disabled={busy}>
          {t.cancel}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Success */

export function SuccessStep() {
  const { t } = useWylletContext()
  const { address } = useConnection()
  return (
    <div className="wy-step wy-enter">
      <div className="wy-success">
        <span className="wy-success-ripple" />
        <span className="wy-success-ripple wy-success-ripple-2" />
        <span className="wy-success-core">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path className="wy-success-check" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      </div>
      <div className="wy-step-label">{t.connected}</div>
      {address && <p className="wy-step-body">{format(t.connectedAs, { name: shortenAddress(address) })}</p>}
    </div>
  )
}
