import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWylletContext } from '../core/context'
import { useStore } from '../core/createStore'
import { cx } from '../utils'
import { AlertIcon, CloseIcon, ExternalIcon, InfoIcon, Spinner, SuccessIcon } from './primitives/Icons'

const statusIcon = {
  info: <InfoIcon size={18} />,
  success: <SuccessIcon size={18} />,
  error: <AlertIcon size={18} />,
  loading: <Spinner size={18} />,
}

export function Toaster() {
  const { scope, toasts, options, t } = useWylletContext()
  const list = useStore(toasts.store)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || list.length === 0) return null

  const position = options.appearance.toastPosition
  const top = position.startsWith('top')

  return createPortal(
    <div data-wyllet={scope} className={cx('wy-toaster', `wy-toaster-${position}`, options.appearance.disableAnimations && 'wy-no-motion')}>
      <ol>
        {(top ? [...list].reverse() : list).map((toast) => (
          <li
            key={toast.id}
            className={cx('wy-toast', `wy-toast-${toast.status}`, options.classNames.toast)}
            data-state={toast.dismissed ? 'closed' : 'open'}
            role={toast.status === 'error' ? 'alert' : 'status'}
          >
            <span className="wy-toast-icon">{statusIcon[toast.status]}</span>
            <div className="wy-toast-content">
              <div className="wy-toast-title">{toast.title}</div>
              {toast.description && <div className="wy-toast-desc">{toast.description}</div>}
            </div>
            {toast.action &&
              (toast.action.href ? (
                <a className="wy-toast-action" href={toast.action.href} target="_blank" rel="noreferrer noopener" onClick={toast.action.onClick}>
                  {toast.action.label}
                  <ExternalIcon size={12} />
                </a>
              ) : (
                <button type="button" className="wy-toast-action" onClick={toast.action.onClick}>
                  {toast.action.label}
                </button>
              ))}
            <button type="button" className="wy-toast-close" onClick={() => toasts.remove(toast.id)} aria-label={t.close}>
              <CloseIcon size={14} />
            </button>
          </li>
        ))}
      </ol>
    </div>,
    document.body,
  )
}
