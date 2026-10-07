import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useWylletContext } from '../../core/context'
import { cx } from '../../utils'
import type { Wallet } from '../../wallets/types'
import { WylletMark } from '../WylletMark'
import { BackIcon, CloseIcon } from '../primitives/Icons'

export function PanelHeader({
  title,
  titleId,
  leading,
  onBack,
  onClose,
}: {
  title: ReactNode
  titleId?: string
  leading?: ReactNode
  onBack?(): void
  onClose?(): void
}) {
  const { t } = useWylletContext()
  return (
    <header className="wy-head">
      {onBack ? (
        <button type="button" className="wy-icon-btn" onClick={onBack} aria-label={t.back}>
          <BackIcon size={17} />
        </button>
      ) : (
        leading
      )}
      <h2 id={titleId} className="wy-head-title">
        {title}
      </h2>
      {onClose && (
        <button type="button" className="wy-icon-btn wy-head-close" onClick={onClose} aria-label={t.close}>
          <CloseIcon size={17} />
        </button>
      )}
    </header>
  )
}

export function PrimaryButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { options } = useWylletContext()
  return (
    <button type="button" className={cx('wy-btn wy-btn-primary', options.classNames.primaryButton, className)} {...rest}>
      {children}
    </button>
  )
}

export function WalletIcon({ wallet, size = 36 }: { wallet: Wallet; size?: number }) {
  return (
    <span className="wy-wallet-icon" style={{ width: size, height: size, background: wallet.iconBackground }}>
      <img src={wallet.icon} alt="" width={size} height={size} draggable={false} />
    </span>
  )
}

/** “Powered by Wyllet” — shown in panel footers unless `appearance.branding` is false. */
export function BrandBadge() {
  const { t, options } = useWylletContext()
  if (!options.appearance.branding) return null
  return (
    <div className="wy-brand">
      <span>{t.poweredBy}</span>
      <WylletMark size={15} className="wy-brand-mark" />
      <strong>Wyllet</strong>
    </div>
  )
}

export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="wy-kbd">{children}</kbd>
