import { encode as referenceEncode } from 'uqr'
import { describe, expect, it } from 'vitest'
import { encodeQR, type QrEcc } from '../src/qr/encode'

// `uqr` (a port of Project Nayuki's reference encoder) is a dev-only dependency used to prove our
// zero-dependency encoder is bit-for-bit identical. Inputs contain lowercase so both use byte mode.
const wcUri = (n: number) =>
  `wc:${'a1b2c3d4e5f6'.repeat(5).slice(0, 64)}@2?relay-protocol=irn&symKey=${'f'.repeat(n)}&expiryTimestamp=1760000000&methods=wc_sessionPropose`

const inputs = [
  'a',
  'hello wyllet',
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  'ethereum:0xd8da6bf26964af9d7eed9e03e53415d37aa96045@8453',
  'ünïcødé ✨ 🦊',
  wcUri(64),
  wcUri(300),
  wcUri(900),
  'x'.repeat(1200),
]

describe('QR encoder', () => {
  for (const ecc of ['L', 'M', 'Q', 'H'] as QrEcc[]) {
    it(`matches the reference encoder at ECC ${ecc}`, () => {
      for (const text of inputs) {
        const ours = encodeQR(text, ecc)
        const ref = referenceEncode(text, { ecc, border: 0, boostEcc: false })
        expect(ours.size, `size for ${text.slice(0, 20)}`).toBe(ref.size)
        expect(ours.data, `modules for ${text.slice(0, 20)}`).toEqual(ref.data)
      }
    })
  }

  it('rejects data that cannot fit', () => {
    expect(() => encodeQR('x'.repeat(4000), 'H')).toThrow(RangeError)
  })
})
