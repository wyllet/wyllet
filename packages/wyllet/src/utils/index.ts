import type { Chain } from 'viem'

/** ENS-normalizes a name, or `undefined` if it contains disallowed characters (reverse records are user-controlled). */
export function safeNormalize(name: string | null | undefined, normalizeFn: (n: string) => string): string | undefined {
  if (!name) return undefined
  try {
    return normalizeFn(name)
  } catch {
    return undefined
  }
}

/** Escapes text for safe embedding inside SVG/XML markup. */
export const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** First user-visible character (never splits emoji / surrogate pairs), upper-cased, or `fallback`. */
export const firstGlyph = (s: string, fallback = '?') => (Array.from(s.trim())[0] ?? fallback).toUpperCase()

/** `data:` URI for SVG markup. Never throws (lone surrogates are replaced before encoding). */
export function svgDataUri(svg: string): string {
  try {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  } catch {
    return `data:image/svg+xml,${encodeURIComponent(svg.replace(/[\uD800-\uDFFF]/g, '\uFFFD'))}`
  }
}

/** Host of a URL for display, or the raw string if it isn't a valid absolute URL. */
export function displayHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

/** Joins truthy class names. */
export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

/** `0x1234…abcd` */
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
}

/** Human-friendly token amount: `1.2345`, `12.34`, `1.2K`, `3.4M`, `<0.0001`. */
export function formatAmount(value: bigint, decimals: number, maxSignificant = 4): string {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 77) decimals = 18
  const negative = value < 0n
  const abs = negative ? -value : value
  const base = 10n ** BigInt(decimals)
  const whole = abs / base
  const fraction = abs % base
  const asNumber = Number(whole) + Number(fraction) / Number(base)
  let out: string
  if (asNumber === 0) out = '0'
  else if (asNumber < 0.0001) out = '<0.0001'
  else if (asNumber >= 1_000_000_000) out = `${trim((asNumber / 1_000_000_000).toFixed(2))}B`
  else if (asNumber >= 1_000_000) out = `${trim((asNumber / 1_000_000).toFixed(2))}M`
  else if (asNumber >= 10_000) out = `${trim((asNumber / 1_000).toFixed(1))}K`
  else if (asNumber >= 1) out = trim(asNumber.toFixed(Math.max(0, maxSignificant - String(Math.floor(asNumber)).length)))
  else out = trim(asNumber.toPrecision(maxSignificant))
  return negative ? `-${out}` : out
}

const trim = (s: string) => (s.includes('.') ? s.replace(/\.?0+$/, '') : s)

export function explorerUrl(chain: Chain | undefined, path: `address/${string}` | `tx/${string}`): string | undefined {
  const base = chain?.blockExplorers?.default.url
  return base ? `${base.replace(/\/$/, '')}/${path}` : undefined
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)
}

export function isUserRejection(error: unknown): boolean {
  let e = error as { name?: string; code?: number; cause?: unknown; shortMessage?: string } | undefined
  for (let depth = 0; e && depth < 5; depth++) {
    if (e.code === 4001 || e.name === 'UserRejectedRequestError') return true
    if (/reject|denied|cancel/i.test(e.shortMessage ?? '')) return true
    e = e.cause as typeof e
  }
  return false
}

export function errorMessage(error: unknown): string {
  const e = error as { shortMessage?: string; message?: string } | undefined
  return e?.shortMessage ?? e?.message?.split('\n')[0] ?? 'Something went wrong'
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Versioned localStorage key — bump the version when a stored format changes. */
export const storageKey = (name: string) => `wyllet.v1.${name}`

/**
 * localStorage that never throws and never trusts what it reads: anything that isn't the
 * fallback's shape (array / object / primitive type) — or fails `sanitize` — yields the fallback.
 */
export const storage = {
  get<T>(key: string, fallback: T, sanitize?: (value: unknown) => T | undefined): T {
    try {
      const raw = globalThis.localStorage?.getItem(key)
      if (!raw) return fallback
      const value: unknown = JSON.parse(raw)
      const sameShape = Array.isArray(fallback)
        ? Array.isArray(value)
        : isPlainObject(fallback)
          ? isPlainObject(value)
          : typeof value === typeof fallback
      if (!sameShape) return fallback
      return sanitize ? (sanitize(value) ?? fallback) : (value as T)
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable */
    }
  },
}

const isMac = () => typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)

/** `mod+k` → ⌘K on macOS, Ctrl+K elsewhere. Supports mod, ctrl, meta, shift, alt. */
export function matchesShortcut(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim())
  const key = parts.pop()
  const want = (m: string) => parts.includes(m)
  const mac = isMac()
  const needCtrl = want('ctrl') || (want('mod') && !mac)
  const needMeta = want('meta') || (want('mod') && mac)
  if (e.ctrlKey !== needCtrl || e.metaKey !== needMeta || e.shiftKey !== want('shift') || e.altKey !== want('alt')) return false
  return e.key.toLowerCase() === key
}

/** Human label for a shortcut: `mod+k` → `⌘K` / `Ctrl K`. */
export function shortcutLabel(combo: string): string {
  const mac = isMac()
  return combo
    .split('+')
    .map((p) => {
      const k = p.trim().toLowerCase()
      if (k === 'mod') return mac ? '⌘' : 'Ctrl '
      if (k === 'shift') return mac ? '⇧' : 'Shift '
      if (k === 'alt') return mac ? '⌥' : 'Alt '
      if (k === 'ctrl') return mac ? '⌃' : 'Ctrl '
      if (k === 'meta') return '⌘'
      return k.toUpperCase()
    })
    .join('')
}

/** `just now`, `5m ago`, `3h ago`, or a short date. */
export function relativeTime(ts: number, t: { justNow: string; minutesAgo: string; hoursAgo: string }): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return t.justNow
  if (diff < 3_600_000) return t.minutesAgo.replace('{n}', String(Math.floor(diff / 60_000)))
  if (diff < 86_400_000) return t.hoursAgo.replace('{n}', String(Math.floor(diff / 3_600_000)))
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
