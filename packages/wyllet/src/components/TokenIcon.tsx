import { useState } from 'react'
import { tokenIconUri } from '../tokens/tokens'
import { cx } from '../utils'
import { ChainIcon } from './ChainIcon'

export interface TokenIconProps {
  symbol: string
  /** Custom icon URL; falls back to built-in marks, then a monogram. */
  src?: string
  /** Draws a small chain badge in the corner. */
  chainId?: number
  size?: number
  className?: string
}

/** Token logo with optional chain badge. Built-in marks for ETH, USDC, USDT, DAI, WBTC, OP, ARB, POL and more. */
export function TokenIcon({ symbol, src, chainId, size = 32, className }: TokenIconProps) {
  const [broken, setBroken] = useState(false)
  return (
    <span className={cx('wy-token-icon', className)} style={{ width: size, height: size }}>
      <img src={src && !broken ? src : tokenIconUri(symbol)} alt={symbol} width={size} height={size} onError={() => setBroken(true)} draggable={false} />
      {chainId !== undefined && (
        <span className="wy-token-chain">
          <ChainIcon chainId={chainId} size={Math.round(size * 0.42)} />
        </span>
      )}
    </span>
  )
}
