import { memo, useMemo } from 'react'
import { MODULE_RADIUS, QUIET_ZONE, qrLayout } from '../../qr/layout'

export interface QRCodeProps {
  value: string
  size?: number
  logo?: string
  logoBackground?: string
}

/** Soft-cornered QR code with an optional logo in the middle. Geometry (and why) lives in `qr/layout.ts`. */
export const QRCode = memo(function QRCode({ value, size = 256, logo, logoBackground }: QRCodeProps) {
  const layout = useMemo(() => qrLayout(value, !!logo), [value, logo])
  const n = layout.size
  const view = n + QUIET_ZONE * 2

  return (
    <svg className="wy-qr-svg" viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${view} ${view}`} width={size} height={size} role="img" aria-label="QR code">
      <g fill="currentColor">
        {layout.modules.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} rx={MODULE_RADIUS} />
        ))}
      </g>
      {layout.finders.map(([x, y]) => (
        <g key={`f-${x}-${y}`}>
          <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={2} fill="none" stroke="currentColor" strokeWidth={1} />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={1} fill="currentColor" />
        </g>
      ))}
      {logo && layout.logo && (
        <g>
          <rect
            x={layout.logo.start}
            y={layout.logo.start}
            width={layout.logo.size}
            height={layout.logo.size}
            rx={layout.logo.size * 0.26}
            fill={logoBackground ?? 'transparent'}
          />
          <image href={logo} x={layout.logo.start} y={layout.logo.start} width={layout.logo.size} height={layout.logo.size} />
        </g>
      )}
    </svg>
  )
})
