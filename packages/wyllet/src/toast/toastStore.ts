import type { ReactNode } from 'react'
import { createStore } from '../core/createStore'

export type ToastStatus = 'info' | 'success' | 'error' | 'loading'
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToastOptions {
  title: ReactNode
  description?: ReactNode
  status?: ToastStatus
  /** Milliseconds before auto-dismiss. `Infinity` keeps it open. Loading toasts never auto-dismiss. */
  duration?: number
  action?: { label: ReactNode; href?: string; onClick?: () => void }
  /** Pass an id to update an existing toast in place. */
  id?: string
}

export interface Toast extends ToastOptions {
  id: string
  status: ToastStatus
  createdAt: number
  dismissed?: boolean
}

export interface ToastApi {
  (options: ToastOptions): string
  success(title: ReactNode, options?: Omit<ToastOptions, 'title' | 'status'>): string
  error(title: ReactNode, options?: Omit<ToastOptions, 'title' | 'status'>): string
  loading(title: ReactNode, options?: Omit<ToastOptions, 'title' | 'status'>): string
  update(id: string, options: Partial<ToastOptions>): void
  dismiss(id?: string): void
  /** Shows a loading toast that resolves into success / error with the promise. */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: ReactNode; success: ReactNode | ((value: T) => ReactNode); error: ReactNode | ((e: unknown) => ReactNode) },
  ): Promise<T>
}

let counter = 0
const EXIT_MS = 220

export function createToastStore() {
  const store = createStore<Toast[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  const remove = (id: string) => {
    store.set((list) => list.map((t) => (t.id === id ? { ...t, dismissed: true } : t)))
    // Only drop it if it is still dismissed — the same id may have been re-shown during the exit animation.
    setTimeout(() => store.set((list) => list.filter((t) => !(t.id === id && t.dismissed))), EXIT_MS)
  }

  const schedule = (toast: Toast) => {
    clearTimeout(timers.get(toast.id))
    const duration = toast.duration ?? (toast.status === 'error' ? 7000 : 4500)
    if (toast.status === 'loading' || !Number.isFinite(duration)) return
    timers.set(toast.id, setTimeout(() => remove(toast.id), duration))
  }

  const upsert = (options: ToastOptions): string => {
    const id = options.id ?? `wy-toast-${++counter}`
    let next: Toast | undefined
    store.set((list) => {
      const existing = list.find((t) => t.id === id)
      next = existing
        ? { ...existing, ...options, id, status: options.status ?? existing.status, dismissed: false }
        : { ...options, id, status: options.status ?? 'info', createdAt: Date.now() }
      return existing ? list.map((t) => (t.id === id ? next! : t)) : [...list, next!].slice(-6)
    })
    if (next) schedule(next)
    return id
  }

  const api: ToastApi = Object.assign((options: ToastOptions) => upsert(options), {
    success: (title: ReactNode, options?: Omit<ToastOptions, 'title' | 'status'>) =>
      upsert({ ...options, title, status: 'success' }),
    error: (title: ReactNode, options?: Omit<ToastOptions, 'title' | 'status'>) =>
      upsert({ ...options, title, status: 'error' }),
    loading: (title: ReactNode, options?: Omit<ToastOptions, 'title' | 'status'>) =>
      upsert({ ...options, title, status: 'loading' }),
    update(id: string, options: Partial<ToastOptions>) {
      const existing = store.get().find((t) => t.id === id)
      if (existing) upsert({ ...existing, ...options, id })
    },
    dismiss(id?: string) {
      if (id) remove(id)
      else store.get().forEach((t) => remove(t.id))
    },
    async promise<T>(promise: Promise<T>, messages: Parameters<ToastApi['promise']>[1]): Promise<T> {
      const id = upsert({ title: messages.loading, status: 'loading' })
      const resolve = (m: unknown, arg: unknown) => (typeof m === 'function' ? m(arg) : m) as ReactNode
      try {
        const value = await promise
        upsert({ id, title: resolve(messages.success, value), status: 'success' })
        return value
      } catch (error) {
        upsert({ id, title: resolve(messages.error, error), status: 'error' })
        throw error
      }
    },
  })

  return { store, api, remove }
}

export type ToastController = ReturnType<typeof createToastStore>
