import {
  createWalletClient,
  fromHex,
  getAddress,
  http,
  numberToHex,
  SwitchChainError,
  type Address,
  type Chain,
  type EIP1193RequestFn,
  type Hex,
  type TransactionRequest,
  type Transport,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { ChainNotConfiguredError, createConnector } from 'wagmi'
import { storageKey } from '../utils'

export interface BurnerOptions {
  /** localStorage key that holds the private key. */
  storageKey?: string
}

type BurnerProvider = { request: EIP1193RequestFn }

const read = (key: string) => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null
  } catch {
    return null
  }
}
const write = (key: string, value: string | null) => {
  try {
    if (value === null) globalThis.localStorage?.removeItem(key)
    else globalThis.localStorage?.setItem(key, value)
  } catch {
    /* storage unavailable (private mode / SSR) */
  }
}

const toBigInt = (v: unknown) => (v === undefined || v === null ? undefined : BigInt(v as string))

let warned = false
/** The key sits unencrypted in localStorage: shout once if someone ships the burner to a real site. */
function warnIfDeployed() {
  if (warned || typeof location === 'undefined') return
  const local = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$|\.(local|localhost|test)$/.test(location.hostname)
  if (local) return
  warned = true
  console.warn('[wyllet] burnerWallet() is for local development: its private key is stored unencrypted in localStorage. Remove it from production builds.')
}

/** A wagmi connector backed by a private key kept in localStorage. Development only. */
export function burner(options: BurnerOptions = {}) {
  const keyStorage = options.storageKey ?? storageKey('burner.key')
  const connectedStorage = `${keyStorage}.connected`
  const chainStorage = `${keyStorage}.chain`
  let chainId: number | undefined = Number(read(chainStorage)) || undefined
  const setChain = (id: number) => {
    chainId = id
    write(chainStorage, String(id))
  }
  let provider: BurnerProvider | undefined

  // One-time migration from the pre-v1 key name, so existing dev burners keep their address (and testnet funds).
  if (!options.storageKey && !read(keyStorage)) {
    const legacy = read('wyllet.burner.key')
    if (legacy) write(keyStorage, legacy)
  }

  const getAccount = () => {
    let pk = read(keyStorage) as Hex | null
    if (!pk) {
      pk = generatePrivateKey()
      write(keyStorage, pk)
    }
    return privateKeyToAccount(pk)
  }

  return createConnector<BurnerProvider>((config) => {
    const chainById = (id: number): Chain => {
      const chain = config.chains.find((c) => c.id === id)
      if (!chain) throw new ChainNotConfiguredError()
      return chain
    }
    // A remembered chain may have been removed from the config since; fall back to the default chain.
    const currentChain = () => config.chains.find((c) => c.id === chainId) ?? config.chains[0]
    const walletClient = () =>
      createWalletClient({
        account: getAccount(),
        chain: currentChain(),
        transport: (config.transports?.[currentChain().id] as Transport | undefined) ?? http(),
      })

    return {
      id: 'burner',
      name: 'Burner Wallet',
      type: 'burner',

      async connect({ chainId: requested, withCapabilities } = {}) {
        warnIfDeployed()
        const next = requested ?? (chainId && config.chains.some((c) => c.id === chainId) ? chainId : config.chains[0].id)
        setChain(next)
        write(connectedStorage, '1')
        const address = getAccount().address
        return {
          accounts: (withCapabilities ? [{ address, capabilities: {} }] : [address]) as never,
          chainId: next,
        }
      },
      async disconnect() {
        write(connectedStorage, null)
      },
      async getAccounts() {
        return [getAccount().address]
      },
      async getChainId() {
        return currentChain().id
      },
      async isAuthorized() {
        return read(connectedStorage) === '1'
      },
      async switchChain({ chainId: id }) {
        const chain = config.chains.find((c) => c.id === id)
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())
        setChain(id)
        config.emitter.emit('change', { chainId: id })
        return chain
      },
      onAccountsChanged(accounts) {
        if (accounts.length === 0) this.onDisconnect()
        else config.emitter.emit('change', { accounts: accounts.map((a) => getAddress(a)) })
      },
      onChainChanged(chain) {
        config.emitter.emit('change', { chainId: Number(chain) })
      },
      onDisconnect() {
        write(connectedStorage, null)
        config.emitter.emit('disconnect')
      },
      async getProvider() {
        if (provider) return provider
        const request = (async ({ method, params }: { method: string; params?: unknown }) => {
          const p = (params ?? []) as unknown[]
          const account = getAccount()
          switch (method) {
            case 'eth_accounts':
            case 'eth_requestAccounts':
              return [account.address]
            case 'eth_chainId':
              return numberToHex(currentChain().id)
            case 'personal_sign':
              return account.signMessage({ message: { raw: p[0] as Hex } })
            case 'eth_signTypedData_v4': {
              const typed = typeof p[1] === 'string' ? JSON.parse(p[1]) : p[1]
              return account.signTypedData(typed)
            }
            case 'wallet_switchEthereumChain': {
              const id = fromHex((p[0] as { chainId: Hex }).chainId, 'number')
              chainById(id)
              setChain(id)
              config.emitter.emit('change', { chainId: id })
              return null
            }
            case 'eth_sendTransaction': {
              const tx = p[0] as Record<string, unknown>
              const fees =
                tx.maxFeePerGas !== undefined || tx.maxPriorityFeePerGas !== undefined
                  ? { maxFeePerGas: toBigInt(tx.maxFeePerGas), maxPriorityFeePerGas: toBigInt(tx.maxPriorityFeePerGas) }
                  : tx.gasPrice !== undefined
                    ? { gasPrice: toBigInt(tx.gasPrice) }
                    : {}
              return walletClient().sendTransaction({
                to: tx.to as Address | undefined,
                data: tx.data as Hex | undefined,
                value: toBigInt(tx.value),
                gas: toBigInt(tx.gas),
                nonce: tx.nonce === undefined ? undefined : Number(tx.nonce),
                ...fees,
              } as TransactionRequest as never)
            }
            default: {
              // Everything else (balances, calls, receipts...) goes to the chain's RPC.
              return walletClient().request({ method, params } as never)
            }
          }
        }) as EIP1193RequestFn
        provider = { request }
        return provider
      },
    }
  })
}
