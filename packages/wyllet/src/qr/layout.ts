import { encodeQR } from './encode'

/**
 * Visual geometry for Wyllet's styled QR codes, in module units.
 * Tuned for scannability, not just looks: full-size modules with softly rounded corners and a
 * 2-module quiet zone scan reliably at 240px on 1× screens. (Round dots looked nicer but failed
 * ~30% of addresses at that size.) Guarded by `test/qr-scan.test.ts`, which rasterizes this
 * exact geometry and decodes it.
 */
export const MODULE_RADIUS = 0.3
export const QUIET_ZONE = 2
/** Smallest size (CSS px) Wyllet renders a QR at; the scan test runs at this size on a 1× raster. */
export const MIN_QR_PX = 240
/** Share of the code covered by the center logo (ECC level Q restores up to ~25% loss). */
export const LOGO_RATIO = 0.24

export interface QrLayout {
  /** Modules per side. */
  size: number
  /** Dark data modules: [x, y] of each module's top-left corner. */
  modules: Array<[number, number]>
  /** Top-left corners of the three 7×7 finder patterns. */
  finders: Array<[number, number]>
  /** Center logo square (in modules), if any. */
  logo?: { start: number; size: number }
}

export function qrLayout(value: string, withLogo: boolean): QrLayout {
  const { data, size } = encodeQR(value, 'Q')
  const finders: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]
  const inFinder = (x: number, y: number) => finders.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)
  const logoSize = withLogo ? Math.floor(size * LOGO_RATIO) | 1 : 0
  const logoStart = (size - logoSize) / 2
  // Clear one extra module around the logo so it doesn't touch the modules.
  const inLogo = (x: number, y: number) =>
    logoSize > 0 && x >= logoStart - 1 && x < logoStart + logoSize + 1 && y >= logoStart - 1 && y < logoStart + logoSize + 1
  const modules: Array<[number, number]> = []
  data.forEach((row, y) => row.forEach((dark, x) => dark && !inFinder(x, y) && !inLogo(x, y) && modules.push([x, y])))
  return { size, modules, finders, logo: logoSize ? { start: logoStart, size: logoSize } : undefined }
}
