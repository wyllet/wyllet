/**
 * Dependency-free QR Code encoder (ISO/IEC 18004), byte mode only — all Wyllet ever encodes
 * is WalletConnect URIs and addresses. Algorithm follows Project Nayuki's reference
 * implementation (MIT); verified bit-for-bit against it in `test/qr.test.ts`.
 */

export type QrEcc = 'L' | 'M' | 'Q' | 'H'

export interface QrMatrix {
  /** Modules per side (21–177). */
  size: number
  /** `data[y][x]` — true = dark module. */
  data: boolean[][]
}

// Index by ECC ordinal (L, M, Q, H), then version (index 0 unused).
const ECC_CODEWORDS_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
]
const NUM_ERROR_CORRECTION_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
]
const ECC_ORDINAL: Record<QrEcc, number> = { L: 0, M: 1, Q: 2, H: 3 }
const ECC_FORMAT_BITS: Record<QrEcc, number> = { L: 1, M: 0, Q: 3, H: 2 }

const getBit = (x: number, i: number) => ((x >>> i) & 1) !== 0

function numRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (ver >= 7) result -= 36
  }
  return result
}

const numDataCodewords = (ver: number, ecc: QrEcc) =>
  Math.floor(numRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK[ECC_ORDINAL[ecc]]![ver]! * NUM_ERROR_CORRECTION_BLOCKS[ECC_ORDINAL[ecc]]![ver]!

// ---------------------------------------------------------------- Reed–Solomon over GF(2^8 / 0x11D)

function rsMultiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = rsMultiply(result[j]!, root)
      if (j + 1 < result.length) result[j]! ^= result[j + 1]!
    }
    root = rsMultiply(root, 0x02)
  }
  return result
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0)
  for (const b of data) {
    const factor = b ^ result.shift()!
    result.push(0)
    divisor.forEach((coef, i) => (result[i]! ^= rsMultiply(coef, factor)))
  }
  return result
}

// ---------------------------------------------------------------- matrix

class Matrix {
  readonly size: number
  readonly modules: boolean[][]
  readonly isFunction: boolean[][]

  constructor(readonly version: number, readonly ecc: QrEcc) {
    this.size = version * 4 + 17
    this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false))
    this.isFunction = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false))
  }

  private set(x: number, y: number, dark: boolean) {
    this.modules[y]![x] = dark
    this.isFunction[y]![x] = true
  }

  drawFunctionPatterns() {
    for (let i = 0; i < this.size; i++) {
      this.set(6, i, i % 2 === 0)
      this.set(i, 6, i % 2 === 0)
    }
    this.drawFinder(3, 3)
    this.drawFinder(this.size - 4, 3)
    this.drawFinder(3, this.size - 4)
    const pos = this.alignmentPositions()
    const n = pos.length
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const corner = (i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)
        if (!corner) this.drawAlignment(pos[i]!, pos[j]!)
      }
    this.drawFormatBits(0)
    this.drawVersion()
  }

  private drawFinder(x: number, y: number) {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        const xx = x + dx
        const yy = y + dy
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) this.set(xx, yy, dist !== 2 && dist !== 4)
      }
  }

  private drawAlignment(x: number, y: number) {
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) this.set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
  }

  private alignmentPositions(): number[] {
    if (this.version === 1) return []
    const numAlign = Math.floor(this.version / 7) + 2
    const step = this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2
    const result = [6]
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos)
    return result
  }

  drawFormatBits(mask: number) {
    const data = (ECC_FORMAT_BITS[this.ecc] << 3) | mask
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((data << 10) | rem) ^ 0x5412
    for (let i = 0; i <= 5; i++) this.set(8, i, getBit(bits, i))
    this.set(8, 7, getBit(bits, 6))
    this.set(8, 8, getBit(bits, 7))
    this.set(7, 8, getBit(bits, 8))
    for (let i = 9; i < 15; i++) this.set(14 - i, 8, getBit(bits, i))
    for (let i = 0; i < 8; i++) this.set(this.size - 1 - i, 8, getBit(bits, i))
    for (let i = 8; i < 15; i++) this.set(8, this.size - 15 + i, getBit(bits, i))
    this.set(8, this.size - 8, true)
  }

  private drawVersion() {
    if (this.version < 7) return
    let rem = this.version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (this.version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const a = this.size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      this.set(a, b, getBit(bits, i))
      this.set(b, a, getBit(bits, i))
    }
  }

  drawCodewords(data: number[]) {
    let i = 0
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5
      for (let vert = 0; vert < this.size; vert++)
        for (let j = 0; j < 2; j++) {
          const x = right - j
          const upward = ((right + 1) & 2) === 0
          const y = upward ? this.size - 1 - vert : vert
          if (!this.isFunction[y]![x] && i < data.length * 8) {
            this.modules[y]![x] = getBit(data[i >>> 3]!, 7 - (i & 7))
            i++
          }
        }
    }
  }

  applyMask(mask: number) {
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++) {
        if (this.isFunction[y]![x]) continue
        let invert: boolean
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break
          case 1: invert = y % 2 === 0; break
          case 2: invert = x % 3 === 0; break
          case 3: invert = (x + y) % 3 === 0; break
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
        }
        if (invert) this.modules[y]![x] = !this.modules[y]![x]
      }
  }

  penalty(): number {
    const N1 = 3, N2 = 3, N3 = 40, N4 = 10
    const size = this.size
    let result = 0
    const line = (get: (a: number, b: number) => boolean) => {
      for (let a = 0; a < size; a++) {
        let runColor = false
        let run = 0
        const history = [0, 0, 0, 0, 0, 0, 0]
        for (let b = 0; b < size; b++) {
          if (get(a, b) === runColor) {
            run++
            if (run === 5) result += N1
            else if (run > 5) result++
          } else {
            this.addHistory(run, history)
            if (!runColor) result += this.countPatterns(history) * N3
            runColor = get(a, b)
            run = 1
          }
        }
        if (runColor) {
          this.addHistory(run, history)
          run = 0
        }
        this.addHistory(run + size, history)
        result += this.countPatterns(history) * N3
      }
    }
    line((y, x) => this.modules[y]![x]!)
    line((x, y) => this.modules[y]![x]!)
    for (let y = 0; y < size - 1; y++)
      for (let x = 0; x < size - 1; x++) {
        const c = this.modules[y]![x]
        if (c === this.modules[y]![x + 1] && c === this.modules[y + 1]![x] && c === this.modules[y + 1]![x + 1]) result += N2
      }
    let dark = 0
    for (const row of this.modules) for (const c of row) if (c) dark++
    const total = size * size
    result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * N4
    return result
  }

  private addHistory(run: number, history: number[]) {
    if (history[0] === 0) run += this.size // light border before the first run
    history.pop()
    history.unshift(run)
  }

  private countPatterns(h: number[]): number {
    const n = h[1]!
    const core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n
    return (core && h[0]! >= n * 4 && h[6]! >= n ? 1 : 0) + (core && h[6]! >= n * 4 && h[0]! >= n ? 1 : 0)
  }
}

function addEccAndInterleave(data: number[], ver: number, ecc: QrEcc): number[] {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ECC_ORDINAL[ecc]]![ver]!
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ECC_ORDINAL[ecc]]![ver]!
  const rawCodewords = Math.floor(numRawDataModules(ver) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)
  const divisor = rsDivisor(blockEccLen)
  const blocks: number[][] = []
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1))
    k += dat.length
    const eccBytes = rsRemainder(dat, divisor)
    if (i < numShortBlocks) dat.push(0)
    blocks.push(dat.concat(eccBytes))
  }
  const result: number[] = []
  for (let i = 0; i < blocks[0]!.length; i++)
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]!)
    })
  return result
}

/** Encode text (UTF-8, byte mode) into a QR matrix with automatic version and mask selection. */
export function encodeQR(text: string, ecc: QrEcc = 'M'): QrMatrix {
  const bytes = Array.from(new TextEncoder().encode(text))
  // Byte mode: 4-bit mode indicator + 8/16-bit length + 8 bits per byte.
  const bitsFor = (ver: number) => 4 + (ver < 10 ? 8 : 16) + bytes.length * 8
  let version = 1
  while (bitsFor(version) > numDataCodewords(version, ecc) * 8) {
    if (++version > 40) throw new RangeError('Data too long for a QR code')
  }

  const bits: number[] = []
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1)
  }
  push(0b0100, 4)
  push(bytes.length, version < 10 ? 8 : 16)
  for (const b of bytes) push(b, 8)
  const capacity = numDataCodewords(version, ecc) * 8
  push(0, Math.min(4, capacity - bits.length))
  push(0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8)

  const codewords = new Array<number>(bits.length / 8).fill(0)
  bits.forEach((b, i) => (codewords[i >>> 3]! |= b << (7 - (i & 7))))

  const m = new Matrix(version, ecc)
  m.drawFunctionPatterns()
  m.drawCodewords(addEccAndInterleave(codewords, version, ecc))

  // Pick the mask with the lowest penalty.
  let best = 0
  let minPenalty = Infinity
  for (let mask = 0; mask < 8; mask++) {
    m.applyMask(mask)
    m.drawFormatBits(mask)
    const p = m.penalty()
    if (p < minPenalty) {
      best = mask
      minPenalty = p
    }
    m.applyMask(mask) // XOR again to undo
  }
  m.applyMask(best)
  m.drawFormatBits(best)
  return { size: m.size, data: m.modules }
}
