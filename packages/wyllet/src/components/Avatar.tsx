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

/** Deterministic gradient for an address — same wallet, same colors, everywhere. */
export function addressGradient(address: string): string {
  const hex = address.toLowerCase().replace(/^0x/, '').padEnd(12, '0')
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
  const h1 = Math.round((n(0) / 255) * 360)
  const h2 = (h1 + 40 + Math.round((n(2) / 255) * 120)) % 360
  const h3 = (h2 + 60 + Math.round((n(4) / 255) * 90)) % 360
  const angle = Math.round((n(6) / 255) * 360)
  return `radial-gradient(circle at 28% 24%, hsl(${h3} 95% 75% / .9), transparent 55%), linear-gradient(${angle}deg, hsl(${h1} 85% 58%), hsl(${h2} 85% 52%))`
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
  const background = useMemo(() => addressGradient(address), [address])

  const Custom = options.avatar
  if (Custom) return <Custom address={address} ensImage={ensImage} size={size} />

  return (
    <span className={className ? `wy-avatar ${className}` : 'wy-avatar'} style={{ width: size, height: size, background }} aria-hidden>
      {ensImage && !broken && <img src={ensImage} alt="" onError={() => setBroken(true)} />}
    </span>
  )
}
