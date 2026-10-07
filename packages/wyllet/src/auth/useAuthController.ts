import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'
import { useConnection, useSignMessage } from 'wagmi'
import type { AuthStatus, WylletAuthAdapter } from './types'

export type SignInStep = 'idle' | 'nonce' | 'signing' | 'verifying'

export interface AuthController {
  enabled: boolean
  status: AuthStatus
  /** Address the current session belongs to (when authenticated). */
  address?: Address
  /** True when `account` is the address of the active session. */
  isSignedIn(account: Address | undefined): boolean
  signIn(onStep?: (step: SignInStep) => void): Promise<void>
  signOut(): Promise<void>
}

const same = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase()

export function useAuthController(adapter: WylletAuthAdapter | undefined): AuthController {
  const { address, chainId, status: connectionStatus } = useConnection()
  const { mutateAsync: signMessage } = useSignMessage()
  const enabled = !!adapter
  // Keep the latest adapter without re-running effects: apps often pass `auth={{ ... }}` inline.
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter
  const [state, setState] = useState<{ status: AuthStatus; address?: Address }>(() => ({
    status: adapter ? 'loading' : 'unauthenticated',
  }))
  // Every state transition bumps this; async results from an older transition are discarded.
  const seq = useRef(0)

  // Restore a server session once when auth is enabled.
  useEffect(() => {
    const id = ++seq.current
    if (!enabled) return setState({ status: 'unauthenticated' })
    setState({ status: 'loading' })
    Promise.resolve(adapterRef.current?.getSession?.() ?? null)
      .then((session) => {
        if (id === seq.current) setState(session ? { status: 'authenticated', address: session.address } : { status: 'unauthenticated' })
      })
      .catch(() => id === seq.current && setState({ status: 'unauthenticated' }))
  }, [enabled])

  const signOut = useCallback(async () => {
    seq.current++
    setState({ status: 'unauthenticated' })
    try {
      await adapterRef.current?.signOut()
    } catch {
      // The local session is cleared regardless; a failing backend call must not surface as an unhandled rejection.
    }
  }, [])

  // End the session when the wallet disconnects or the user switches to another account.
  const previousConnection = useRef(connectionStatus)
  useEffect(() => {
    const was = previousConnection.current
    previousConnection.current = connectionStatus
    if (state.status !== 'authenticated') return
    const disconnected = was === 'connected' && connectionStatus === 'disconnected'
    const switched = connectionStatus === 'connected' && address && state.address && !same(address, state.address)
    if (disconnected || switched) void signOut()
  }, [address, connectionStatus, state, signOut])

  const signIn = useCallback(
    async (onStep?: (step: SignInStep) => void) => {
      const auth = adapterRef.current
      if (!auth) return
      if (!address || !chainId) throw new Error('Connect a wallet before signing in.')
      const id = ++seq.current
      try {
        onStep?.('nonce')
        const nonce = await auth.getNonce()
        const domain = window.location.host
        const uri = window.location.origin
        const message =
          auth.createMessage?.({ address, chainId, nonce, domain, uri }) ??
          createSiweMessage({ address, chainId, domain, nonce, uri, version: '1', statement: auth.statement, issuedAt: new Date() })
        onStep?.('signing')
        const signature = await signMessage({ message })
        onStep?.('verifying')
        const ok = await auth.verify({ message, signature, address, chainId })
        if (!ok) throw new Error('Signature verification failed.')
        // Superseded (e.g. signed out or account switched mid-flow): report it, don't pretend it worked.
        if (id !== seq.current) throw new Error('Sign-in was interrupted. Please try again.')
        setState({ status: 'authenticated', address })
      } finally {
        onStep?.('idle')
      }
    },
    [address, chainId, signMessage],
  )

  return useMemo(
    () => ({
      enabled,
      status: state.status,
      address: state.address,
      isSignedIn: (account: Address | undefined) => state.status === 'authenticated' && same(account, state.address),
      signIn,
      signOut,
    }),
    [enabled, state, signIn, signOut],
  )
}
