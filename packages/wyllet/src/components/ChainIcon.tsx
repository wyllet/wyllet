import { useChains } from 'wagmi'
import { chainIconDataUri } from '../chains/chainMeta'
import { chainExtras } from '../chains/custom'
import { useWylletContext } from '../core/context'

export interface ChainIconProps {
  chainId: number
  size?: number
  className?: string
}

/** Chain logo: `chainIcons` prop → `customChain({ icon })` → built-in brand mark → colored monogram. */
export function ChainIcon({ chainId, size = 20, className }: ChainIconProps) {
  const { options } = useWylletContext()
  const chain = useChains().find((c) => c.id === chainId)
  const extras = chainExtras(chain)
  const src = options.chainIcons[chainId] ?? extras?.icon ?? chainIconDataUri(chainId, chain?.name ?? String(chainId), extras?.color)
  return (
    <img
      className={className ? `wy-chain-icon ${className}` : 'wy-chain-icon'}
      src={src}
      width={size}
      height={size}
      alt={chain?.name ?? ''}
      draggable={false}
    />
  )
}
