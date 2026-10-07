import type { Config } from 'wagmi'
import type { Wallet } from '../wallets/types'

export interface AppInfo {
  name: string
  description?: string
  url?: string
  /** Square icon URL (also sent to wallets). */
  icon?: string
  /** Link for the "Learn more" button in the connect modal. */
  learnMoreUrl?: string
  termsUrl?: string
  privacyUrl?: string
}

interface Registration {
  wallets: Wallet[]
  appInfo: AppInfo
  walletConnectProjectId?: string
}

// Lets `getDefaultConfig` hand wallet metadata to `<WylletProvider>` without extra props.
const registry = new WeakMap<Config, Registration>()

export const registerApp = (config: Config, registration: Registration) => registry.set(config, registration)
export const getRegistration = (config: Config): Registration | undefined => registry.get(config)
