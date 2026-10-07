import { burner, type BurnerOptions } from './burner'
import { metaMaskIcon, okxIcon, phantomIcon, rabbyIcon } from './brandIcons'
import { icons, monogramIcon } from './icons'
import type { Wallet, WalletPresetOptions } from './types'

const wc = (scheme: string) => (uri: string) => `${scheme}${encodeURIComponent(uri)}`

function preset(base: Wallet) {
  return (options: WalletPresetOptions = {}): Wallet => ({
    ...base,
    ...options.overrides,
    ...(options.connector && { createConnector: options.connector }),
  })
}

export const metaMaskWallet = preset({
  id: 'metaMask',
  name: 'MetaMask',
  icon: metaMaskIcon,
  iconBackground: '#FFFFFF',
  rdns: ['io.metamask', 'io.metamask.mobile'],
  walletConnect: { mobileUri: wc('https://metamask.app.link/wc?uri=') },
  downloadUrls: {
    browserExtension: 'https://metamask.io/download',
    ios: 'https://apps.apple.com/app/metamask/id1438144202',
    android: 'https://play.google.com/store/apps/details?id=io.metamask',
    website: 'https://metamask.io',
  },
  description: 'The most widely used Ethereum wallet, available as a browser extension and mobile app.',
})

/**
 * Not in `defaultWallets()` — no official icon is bundled. When installed, the extension's own icon is used;
 * otherwise pass the official artwork: `coinbaseWallet({ overrides: { icon: '/coinbase.svg' } })`.
 */
export const coinbaseWallet = preset({
  id: 'coinbase',
  name: 'Coinbase Wallet',
  icon: monogramIcon('Coinbase Wallet'),
  rdns: ['com.coinbase.wallet'],
  walletConnect: { mobileUri: wc('cbwallet://wc?uri=') },
  downloadUrls: {
    browserExtension: 'https://www.coinbase.com/wallet/downloads',
    ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455',
    android: 'https://play.google.com/store/apps/details?id=org.toshi',
    website: 'https://www.coinbase.com/wallet',
  },
  description: 'A self-custody wallet from Coinbase with a browser extension and mobile app.',
})

/** Not in `defaultWallets()` — no official icon is bundled. Pass one via `overrides: { icon }`. */
export const rainbowWallet = preset({
  id: 'rainbow',
  name: 'Rainbow',
  icon: monogramIcon('Rainbow'),
  rdns: ['me.rainbow'],
  walletConnect: { mobileUri: wc('rainbow://wc?uri=') },
  downloadUrls: {
    browserExtension: 'https://rainbow.me/extension',
    ios: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021',
    android: 'https://play.google.com/store/apps/details?id=me.rainbow',
    website: 'https://rainbow.me',
  },
  description: 'A fun, simple and secure Ethereum wallet for your NFTs and tokens.',
})

export const walletConnectWallet = preset({
  id: 'walletConnect',
  name: 'WalletConnect',
  icon: icons.scan,
  // Bare `wc:` URIs open the OS app picker on phones.
  walletConnect: { mobileUri: (uri) => uri },
  downloadUrls: { website: 'https://walletconnect.network' },
  description: 'Connect any of 500+ mobile wallets by scanning a QR code.',
})

/** Not in `defaultWallets()` — no official icon is bundled. Pass one via `overrides: { icon }`. */
export const trustWallet = preset({
  id: 'trust',
  name: 'Trust Wallet',
  icon: monogramIcon('Trust Wallet'),
  rdns: ['com.trustwallet.app'],
  walletConnect: { mobileUri: wc('https://link.trustwallet.com/wc?uri=') },
  downloadUrls: {
    browserExtension: 'https://trustwallet.com/browser-extension',
    ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
    android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
    website: 'https://trustwallet.com',
  },
  description: 'A multi-chain wallet trusted by millions.',
})

export const phantomWallet = preset({
  id: 'phantom',
  name: 'Phantom',
  icon: phantomIcon,
  rdns: ['app.phantom'],
  downloadUrls: {
    browserExtension: 'https://phantom.com/download',
    ios: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
    android: 'https://play.google.com/store/apps/details?id=app.phantom',
    website: 'https://phantom.com',
  },
  description: 'A friendly multi-chain wallet for Ethereum, Solana and more.',
})

export const rabbyWallet = preset({
  id: 'rabby',
  name: 'Rabby',
  icon: rabbyIcon,
  rdns: ['io.rabby'],
  downloadUrls: {
    browserExtension: 'https://rabby.io',
    website: 'https://rabby.io',
  },
  description: 'A security-focused browser wallet built for DeFi power users.',
})

export const okxWallet = preset({
  id: 'okx',
  name: 'OKX Wallet',
  icon: okxIcon,
  rdns: ['com.okex.wallet'],
  walletConnect: { mobileUri: wc('okex://main/wc?uri=') },
  downloadUrls: {
    browserExtension: 'https://www.okx.com/web3',
    ios: 'https://apps.apple.com/app/okx-buy-bitcoin-btc-crypto/id1327268470',
    android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
    website: 'https://www.okx.com/web3',
  },
})

/** Generic `window.ethereum` fallback. Only shown when no EIP-6963 wallet announced itself. */
export const browserWallet = preset({
  id: 'injected',
  name: 'Browser Wallet',
  icon: icons.browser,
  connectorId: 'injected',
  featured: false,
})

/**
 * An in-browser throwaway wallet for local development and demos.
 * The private key lives in localStorage — never hold real funds with it.
 */
export function burnerWallet(options: BurnerOptions & WalletPresetOptions = {}): Wallet {
  return {
    id: 'burner',
    name: 'Burner Wallet',
    icon: icons.burner,
    connectorId: 'burner',
    createConnector: options.connector ?? (() => burner(options)),
    description: 'A disposable in-browser wallet for testing. Do not store real funds.',
    ...options.overrides,
  }
}

/** Wallets with official artwork bundled. Any other installed (EIP-6963) wallet is still detected automatically. */
export const defaultWallets = (): Wallet[] => [metaMaskWallet(), phantomWallet(), rabbyWallet(), okxWallet(), walletConnectWallet()]
