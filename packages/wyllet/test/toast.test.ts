import { describe, expect, it, vi } from 'vitest'
import { createToastStore } from '../src/toast/toastStore'

describe('toast store', () => {
  it('adds, updates in place and auto-dismisses', () => {
    vi.useFakeTimers()
    const { store, api } = createToastStore()
    const id = api.loading('Working')
    expect(store.get()).toHaveLength(1)
    api.update(id, { status: 'success', title: 'Done' })
    expect(store.get()[0]).toMatchObject({ id, status: 'success', title: 'Done' })
    vi.advanceTimersByTime(5000)
    vi.advanceTimersByTime(500)
    expect(store.get()).toHaveLength(0)
    vi.useRealTimers()
  })

  it('resolves promise toasts', async () => {
    const { store, api } = createToastStore()
    await api.promise(Promise.resolve(42), { loading: 'Loading', success: (v) => `Got ${v}`, error: 'Nope' })
    expect(store.get()[0]).toMatchObject({ status: 'success', title: 'Got 42' })
  })
})
