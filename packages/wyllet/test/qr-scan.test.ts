// @vitest-environment node
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { MIN_QR_PX, MODULE_RADIUS, QUIET_ZONE, qrLayout, type QrLayout } from '../src/qr/layout'

/**
 * Rasterizes the exact geometry <QRCode> draws (soft-cornered modules, rounded finder rings, logo cut-out)
 * with 3×3 supersampled anti-aliasing at the smallest size Wyllet renders, on a 1× screen, then scans it.
 * Guards against styling tweaks that look nice but stop phones from reading the code.
 */
function rasterize(layout: QrLayout, px: number): Uint8ClampedArray {
  const view = layout.size + QUIET_ZONE * 2
  const scale = px / view
  const modules = new Set(layout.modules.map(([x, y]) => `${x},${y}`))
  const inRoundRect = (u: number, v: number, x: number, y: number, w: number, h: number, r: number) => {
    if (u < x || v < y || u > x + w || v > y + h) return false
    const cx = Math.min(Math.max(u, x + r), x + w - r)
    const cy = Math.min(Math.max(v, y + r), y + h - r)
    return (u - cx) ** 2 + (v - cy) ** 2 <= r * r
  }
  const dark = (u: number, v: number) => {
    const mx = Math.floor(u)
    const my = Math.floor(v)
    if (modules.has(`${mx},${my}`) && inRoundRect(u, v, mx, my, 1, 1, MODULE_RADIUS)) return true
    for (const [x, y] of layout.finders) {
      const ring = inRoundRect(u, v, x, y, 7, 7, 2.5) && !inRoundRect(u, v, x + 1, y + 1, 5, 5, 1.5)
      if (ring || inRoundRect(u, v, x + 2, y + 2, 3, 3, 1)) return true
    }
    return false
  }
  const out = new Uint8ClampedArray(px * px * 4)
  const S = 3
  for (let y = 0; y < px; y++)
    for (let x = 0; x < px; x++) {
      let hits = 0
      for (let sy = 0; sy < S; sy++)
        for (let sx = 0; sx < S; sx++) if (dark((x + (sx + 0.5) / S) / scale - QUIET_ZONE, (y + (sy + 0.5) / S) / scale - QUIET_ZONE)) hits++
      // Theme colors: qrForeground #0C0C10 on qrBackground #F4F4F6.
      const t = hits / (S * S)
      const i = (y * px + x) * 4
      out[i] = 244 - t * (244 - 12)
      out[i + 1] = 244 - t * (244 - 12)
      out[i + 2] = 246 - t * (246 - 16)
      out[i + 3] = 255
    }
  return out
}

const hex = (seed: number, bytes: number) => {
  let s = ''
  let v = seed
  for (let i = 0; i < bytes; i++) {
    v = (v * 1103515245 + 12345) >>> 0
    s += (v >>> 16 & 0xff).toString(16).padStart(2, '0')
  }
  return s
}
const addresses = Array.from({ length: 30 }, (_, i) => `0x${[...hex(i + 1, 20)].map((c, j) => (j % 3 ? c : c.toUpperCase())).join('')}`)
const wcUris = Array.from({ length: 10 }, (_, i) => `wc:${hex(i + 100, 32)}@2?relay-protocol=irn&symKey=${hex(i + 200, 32)}&expiryTimestamp=1760000000`)

describe('styled QR scannability', () => {
  for (const withLogo of [false, true]) {
    it(`scans every address and WalletConnect URI at ${MIN_QR_PX}px${withLogo ? ' with a logo' : ''}`, () => {
      const failures = [...addresses, ...wcUris].filter((text) => {
        const pixels = rasterize(qrLayout(text, withLogo), MIN_QR_PX)
        return jsQR(pixels, MIN_QR_PX, MIN_QR_PX)?.data !== text
      })
      expect(failures).toEqual([])
    })
  }
})
