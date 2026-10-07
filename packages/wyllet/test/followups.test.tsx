import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WylletButton } from '../src'

vi.mock('wagmi/actions', () => ({
  waitForTransactionReceipt: vi.fn(async () => {
    const error = new Error('Timed out while waiting for transaction')
    error.name = 'WaitForTransactionReceiptTimeoutError'
    throw error
  }),
}))

describe('follow-up hardening', () => {
  it('a transaction that is not mined in time stays pending (never "failed")', async () => {
    const { createActivityTracker } = await import('../src/activity/activity')
    const toast = Object.assign(vi.fn((_options: { status?: string }) => 'id'), { dismiss: vi.fn() })
    const tracker = createActivityTracker({
      getConfig: () => ({ chains: [] }) as never,
      toast: toast as never,
      getMessages: () => ({ txPending: 'Pending', txConfirmed: 'Confirmed', txFailed: 'Failed', viewTransaction: 'View' }) as never,
    })
    tracker.addTransaction({ hash: `0x${'ab'.repeat(32)}`, chainId: 1, account: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
    await new Promise((r) => setTimeout(r, 20))
    expect(tracker.store.get()[0]?.status).toBe('pending')
    expect(toast.dismiss).toHaveBeenCalled()
    expect(toast.mock.calls.some(([o]) => o.status === 'error')).toBe(false)
  })

  it('a missing <WylletProvider> fails loudly instead of rendering an invisible button', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<WylletButton />)).toThrow(/WylletProvider/)
    error.mockRestore()
  })
})
