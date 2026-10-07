import type { Address } from 'viem'

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated'

/**
 * Plug in Sign-In With Ethereum (or any signature-based auth).
 * Wyllet handles the UI: after connecting, users are asked to sign before the modal closes.
 */
export interface WylletAuthAdapter {
  /** Fetch a fresh nonce from your backend. */
  getNonce(): Promise<string>
  /**
   * Build the message to sign. Defaults to an EIP-4361 (SIWE) message built with `viem/siwe`.
   */
  createMessage?(args: { address: Address; chainId: number; nonce: string; domain: string; uri: string }): string
  /** Verify the signature on your backend and start a session. Return `true` on success. */
  verify(args: { message: string; signature: `0x${string}`; address: Address; chainId: number }): Promise<boolean>
  /** End the session. Called when the user disconnects or switches accounts. */
  signOut(): Promise<void>
  /** Restore an existing session on page load. Return the signed-in address or null. */
  getSession?(): Promise<{ address: Address } | null>
  /** Human-readable statement inserted in the default SIWE message. */
  statement?: string
}
