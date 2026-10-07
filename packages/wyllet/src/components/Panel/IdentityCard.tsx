import { useRef, type PointerEvent } from 'react'
import { useWylletContext } from '../../core/context'
import { cx, shortenAddress } from '../../utils'
import { Avatar } from '../Avatar'
import { ChainIcon } from '../ChainIcon'

function hues(address: string) {
  const hex = address.toLowerCase().replace(/^0x/, '').padEnd(12, '0')
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
  const h1 = Math.round((n(0) / 255) * 360)
  return [h1, (h1 + 50 + Math.round((n(2) / 255) * 80)) % 360, (h1 + 180 + Math.round((n(4) / 255) * 60)) % 360] as const
}

export interface IdentityCardProps {
  address: string
  ensName?: string | null
  balance?: string
  symbol?: string
  chainId?: number
  chainName?: string
}

/** Optional generative card unique to every address (`appearance.identityCard`). Tilts toward the pointer. */
export function IdentityCard({ address, ensName, balance, symbol, chainId, chainName }: IdentityCardProps) {
  const { options } = useWylletContext()
  const ref = useRef<HTMLDivElement>(null)
  const [h1, h2, h3] = hues(address)
  const tilt = options.appearance.cardTilt && !options.appearance.disableAnimations

  const onMove = (e: PointerEvent) => {
    const el = ref.current
    if (!el || !tilt || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }
  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="wy-card-stage">
      <div
        ref={ref}
        className={cx('wy-card', options.classNames.identityCard)}
        style={{ ['--h1' as string]: h1, ['--h2' as string]: h2, ['--h3' as string]: h3 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <span className="wy-card-pattern" aria-hidden />
        <span className="wy-card-sheen" aria-hidden />
        <div className="wy-card-top">
          <Avatar address={address} size={34} className="wy-card-avatar" />
          {chainId !== undefined && (
            <span className="wy-card-chain">
              <ChainIcon chainId={chainId} size={14} />
              {chainName}
            </span>
          )}
        </div>
        <div className="wy-card-bottom">
          <div className="wy-card-balance">
            {balance ?? '—'} <small>{symbol}</small>
          </div>
          <div className="wy-card-id">
            {ensName && <div className="wy-card-name">{ensName}</div>}
            <div className="wy-card-address">{shortenAddress(address, 4)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
