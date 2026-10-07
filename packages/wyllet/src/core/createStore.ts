import { useSyncExternalStore } from 'react'

export interface Store<T> {
  get(): T
  set(updater: T | ((prev: T) => T)): void
  subscribe(listener: () => void): () => void
}

/** Tiny external store; lets imperative APIs (toasts, tx tracking) drive React state. */
export function createStore<T>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set(updater) {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(state) : updater
      if (Object.is(next, state)) return
      state = next
      listeners.forEach((l) => l())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
