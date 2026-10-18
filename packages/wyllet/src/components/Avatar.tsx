import { useMemo, useState } from 'react'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { normalize } from 'viem/ens'
import { mainnet } from 'viem/chains'
import { useWylletContext } from '../core/context'
import { safeNormalize } from '../utils'

export interface AvatarProps {
  address: string
  size?: number
  className?: string
}

/** Hues and angle derived from an address: same wallet, same colors, everywhere. */
function gradientParts(address: string) {
  const hex = address.toLowerCase().replace(/^0x/, '').padEnd(12, '0')
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
  const h1 = Math.round((n(0) / 255) * 360)
  const h2 = (h1 + 40 + Math.round((n(2) / 255) * 120)) % 360
  const h3 = (h2 + 60 + Math.round((n(4) / 255) * 90)) % 360
  const angle = Math.round((n(6) / 255) * 360)
  return { h1, h2, h3, angle }
}

/** Deterministic gradient for an address, as a CSS `background` value. */
export function addressGradient(address: string): string {
  const { h1, h2, h3, angle } = gradientParts(address)
  return `radial-gradient(circle at 28% 24%, hsl(${h3} 95% 75% / .9), transparent 55%), linear-gradient(${angle}deg, hsl(${h1} 85% 58%), hsl(${h2} 85% 52%))`
}

/**
 * The same gradient drawn in SVG, so the avatar needs no inline `style` (strict CSP, server rendering).
 * CSS angles start at "to top" and turn clockwise; the radial highlight fades out at 55% of the distance to
 * the farthest corner, like `circle at 28% 24%`.
 */
function GradientSvg({ address, size }: { address: string; size: number }) {
  // Named after the address, not useId(): ids repeat across React roots, and the same address always
  // defines the same gradient, so a repeated id is harmless.
  const id = `wy-av-${address.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  const { h1, h2, h3, angle } = gradientParts(address)
  const rad = (angle * Math.PI) / 180
  const dx = Math.sin(rad) / 2
  const dy = Math.cos(rad) / 2
  return (
    <svg width={size} height={size} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}l`} x1={0.5 - dx} y1={0.5 + dy} x2={0.5 + dx} y2={0.5 - dy}>
          <stop offset="0" stopColor={`hsl(${h1}, 85%, 58%)`} />
          <stop offset="1" stopColor={`hsl(${h2}, 85%, 52%)`} />
        </linearGradient>
        <radialGradient id={`${id}r`} cx="0.28" cy="0.24" r="1.047" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={`hsl(${h3}, 95%, 75%)`} stopOpacity="0.9" />
          <stop offset="0.55" stopColor={`hsl(${h3}, 95%, 75%)`} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1" height="1" fill={`url(#${id}l)`} />
      <rect width="1" height="1" fill={`url(#${id}r)`} />
    </svg>
  )
}

/** Address avatar: ENS avatar when available, otherwise a generated gradient. */
export function Avatar({ address, size = 24, className }: AvatarProps) {
  const { options } = useWylletContext()
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: { enabled: options.ens },
  })
  // Reverse records are user-controlled; names with disallowed characters make `normalize` throw.
  const normalizedName = useMemo(() => safeNormalize(ensName, normalize), [ensName])
  const { data: ensImage } = useEnsAvatar({
    name: normalizedName,
    chainId: mainnet.id,
    query: { enabled: options.ens && !!normalizedName },
  })
  const [broken, setBroken] = useState(false)

  const Custom = options.avatar
  if (Custom) return <Custom address={address} ensImage={ensImage} size={size} />

  return (
    <span className={className ? `wy-avatar ${className}` : 'wy-avatar'} aria-hidden>
      <GradientSvg address={address} size={size} />
      {ensImage && !broken && <img src={ensImage} alt="" width={size} height={size} onError={() => setBroken(true)} />}
    </span>
  )
}
