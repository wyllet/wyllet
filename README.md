<p align="center"><img src="https://raw.githubusercontent.com/wyllet/wyllet/main/.github/assets/logo.png" width="120" alt="Wyllet" /></p>

<h1 align="center">Wyllet</h1>

**The connect layer for serious dApps.** Open source and MIT-licensed, built on wagmi v3 + viem.

```bash
pnpm add wyllet wagmi viem @tanstack/react-query

# Only if you enable WalletConnect (QR + mobile wallets) via `walletConnectProjectId`:
pnpm add @walletconnect/ethereum-provider
```

**Zero third-party runtime dependencies.** Wyllet only uses the libraries your dApp already has (react, wagmi, viem, react-query), as peer dependencies. Even the QR code encoder is built in. WalletConnect is opt-in, so you choose and pin its version. A test in CI fails if anything else ever sneaks into the bundle.

**Network requests:** Wyllet makes none of its own, with one opt-in exception. When WalletConnect is enabled and a user opens **All wallets**, it loads the wallet list and logos from WalletConnect's registry (`explorer-api.walletconnect.com`), the same service your WalletConnect connections already use. Turn it off with `appearance: { walletDirectory: false }`.

Wyllet replaces the usual "connect modal + account dropdown" with a single system:

| | |
| --- | --- |
| **Wallet Island** | One morphing button: a call to action when disconnected; identity, network badge, balance and a live status dot when connected |
| **Panel presentations** | `drawer` (floating side panel, the default), `popover` (anchored to the button), or `modal`. Draggable bottom sheet on phones |
| **Keyboard-first connect** | `⌘K` to open, `↑ ↓ Enter`, number keys `1–9` to pick a wallet, one-tap **Continue with {last wallet}** |
| **Identity card (optional)** | `identityCard: true` swaps the compact account summary for a generative holographic card unique to every address, with 3D tilt |
| **Chains & tokens in code** | `popularChains` presets, `customChain()` for any EVM chain, your own token lists (`pinned`, `chainOrder`, `tokenSort`), built-in token and chain icons |
| **Activity timeline** | Transactions (live pending → confirmed), connects, network switches, sign-ins and your own entries |
| **Networks** | Inline chain grid with live gas price and a wrong-network state |
| **Receive** | A QR code for the user's own address |
| **Island toasts** | Themed, promise-aware notifications |
| **SIWE** | Plug in an adapter; the verify step is built into the connect flow |
| **`<ConnectGate>`** | Gate any UI on connected + supported network + signed in |
| **Themes** | Obsidian (signature mint), Porcelain, Aurora, Terminal. Every token is a CSS variable, plus per-element `classNames` |
| **Burner wallet** | An in-browser dev wallet for local testing and demos |

---

## Quick start

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { base, mainnet } from 'viem/chains'
import { WylletButton, WylletProvider, getDefaultConfig } from 'wyllet'

const config = getDefaultConfig({
  appName: 'My dApp',
  walletConnectProjectId: 'YOUR_PROJECT_ID', // free at https://cloud.reown.com
  chains: [mainnet, base],
})
const queryClient = new QueryClient()

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WylletProvider shortcut="mod+k">
          <WylletButton />
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

That's the whole integration. Styles are injected for you, so there's no CSS import.

> **Next.js App Router:** put the providers in a `'use client'` component. Wyllet ships with the directive.

---

## Presentation

```tsx
<WylletProvider
  appearance={{
    presentation: 'drawer',   // 'drawer' | 'popover' | 'modal'
    drawerSide: 'right',      // 'left' | 'right'
    mobileSheet: true,        // bottom sheet on phones
    identityCard: false,      // true → holographic card instead of the compact summary
    cardTilt: true,           // 3D tilt on the identity card
    accountTabs: ['tokens', 'activity', 'networks'],
    closeOnConnect: true,     // false → go straight to the account panel
    tokenSort: 'balance',     // 'balance' | 'list'
    walletSearch: 'auto',     // true | false | 'auto' (6+ wallets)
    walletDirectory: true,    // "All wallets" via the WalletConnect registry (needs a project id)
    toastPosition: 'top-center',
    branding: true,           // “Powered by Wyllet” footer badge
    disableAnimations: false, // prefers-reduced-motion is always respected
  }}
/>
```

`popover` anchors to whatever element opened it. Pass the element when you open the panel yourself, e.g. `open(e.currentTarget)`. Without an anchor, the popover falls back to a modal.

---

## Theming

```tsx
import { auroraTheme, obsidianTheme, porcelainTheme, terminalTheme } from 'wyllet'

<WylletProvider theme={obsidianTheme({ accentColor: '#C6F432', radius: 'round' })} />

// Light/dark pair following the OS (this is the default)
<WylletProvider theme={{ light: porcelainTheme(), dark: obsidianTheme() }} colorMode="auto" />
```

Preset knobs: `accentColor`, `accentColorForeground`, `accentSecondary` (used in gradients), `radius` (`sharp | soft | round | pill`), `fontFamily`, `overlayBlur` (`none | subtle | heavy`) and `overrides` (a deep-partial theme).

Every token is a CSS variable, such as `--wy-colors-accent` or `--wy-radii-panel`. You can also add classes per element:

```tsx
<WylletProvider classNames={{ panel: 'ring-1 ring-white/10', island: 'font-mono', walletRow: 'hover:translate-x-1' }} />
```

Slots: `overlay`, `panel`, `island`, `walletRow`, `primaryButton`, `identityCard`, `toast`.

---

## The Island button

```tsx
<WylletButton size="lg" display="compact" label="Enter app" />
// display: 'full' (avatar + name + balance) | 'compact' | 'avatar'
```

### Headless

```tsx
const { mounted, account, chain, open } = useWylletButton()

<button onClick={(e) => open(e.currentTarget)}>
  {account ? account.displayName : 'Connect'}
</button>
```

---

## Hooks & tools

```tsx
// Control the panel
const { open, close, openConnect, openAccount, openTab, view, isConnected } = useWyllet()
openTab('activity')

// Activity timeline + transaction tracking
const { activity, addTransaction, log, clearActivity } = useWylletActivity()
const hash = await writeContractAsync({ ... })
addTransaction({ hash, description: 'Mint 1 NFT' }) // live toast + timeline entry, resumes after reload
log({ title: 'Staked 10 ETH', status: 'success' })   // your own entries

// Toasts
const toast = useWylletToast()
toast.success('Saved')
await toast.promise(bridge(), { loading: 'Bridging…', success: 'Bridged!', error: 'Bridge failed' })

// SIWE status
const { status, signIn, signOut } = useWylletAuth()
```

### Gating

```tsx
<ConnectGate>
  <Dashboard /> {/* rendered only when connected, on a supported chain, and signed in */}
</ConnectGate>

<ConnectGate requireAuth={false} fallback={(reason) => <MyPrompt reason={reason} />}>…</ConnectGate>
```

### Sign-In With Ethereum

```tsx
const auth: WylletAuthAdapter = {
  getNonce: () => fetch('/api/nonce').then((r) => r.text()),
  verify: ({ message, signature }) =>
    fetch('/api/verify', { method: 'POST', body: JSON.stringify({ message, signature }) }).then((r) => r.ok),
  signOut: () => fetch('/api/logout', { method: 'POST' }).then(() => {}),
  getSession: () => fetch('/api/me').then((r) => (r.ok ? r.json() : null)), // optional: restore on load
}

<WylletProvider auth={auth} />
```

Messages are EIP-4361, built with `viem/siwe`; pass `createMessage` to customize them. Switching accounts or disconnecting signs the user out.

---

## Chains & tokens

Networks and tokens are defined in code by the dApp, so every user sees the same curated set, in the order you choose.

### Chains: popular, viem, or your own

```tsx
import { sepolia } from 'viem/chains'
import { customChain, getDefaultConfig, popularChains, popularTestnets } from 'wyllet'

// Any EVM chain in one call: your L2, an appchain, a devnet.
const myChain = customChain({
  id: 424242,
  name: 'My Chain',
  rpcUrl: 'https://rpc.mychain.xyz',
  explorerUrl: 'https://scan.mychain.xyz',
  nativeCurrency: { name: 'My Token', symbol: 'MYT', decimals: 18 },
  icon: '/mychain.svg',       // or `color: '#FF5500'` for a generated monogram
  nativeIcon: '/myt.svg',     // native currency icon in the Tokens tab
})

getDefaultConfig({
  appName: 'My dApp',
  chains: [myChain, ...popularChains, sepolia], // order = priority; the first chain is the default
})
```

- `popularChains`: Ethereum, Base, OP, Arbitrum, Polygon, BNB, Avalanche, zkSync, Linea, Scroll (all with built-in icons)
- `popularTestnets`: Sepolia, Base Sepolia, OP Sepolia, Arbitrum Sepolia, Polygon Amoy
- Wallets that don't know your chain get an "add network" prompt automatically on first switch.

**Arrange the Networks tab** separately from the default chain:

```tsx
<WylletProvider chainOrder={[8453, 424242]} />  // Base, then My Chain, then the rest in config order
```

### Tokens: yours, for everyone

```tsx
import { withDefaultTokens } from 'wyllet'

const tokens = withDefaultTokens([
  { chainId: 8453, address: '0x…', symbol: 'MYTKN', decimals: 18, icon: '/mytkn.svg', pinned: true },
  { chainId: 424242, address: '0x…', symbol: 'USDC', decimals: 6 },
])

<WylletProvider tokens={tokens} />
```

| | |
| --- | --- |
| `tokens="default"` | Blue chips on Ethereum, Base, OP, Arbitrum and Polygon (the default) |
| `tokens={[...]}` | Only your tokens: a flat list with `chainId` on each entry, or a `{ [chainId]: Token[] }` map |
| `withDefaultTokens([...])` | Your tokens first, then the blue chips, with duplicates removed |
| `tokens={false}` | Native balance only |

**Priority:** list order is the display order, and `pinned: true` keeps a token at the top. `appearance.tokenSort` decides the rest:
`'balance'` (default) puts pinned tokens first, then held tokens, then the rest, each group in your list order. `'list'` keeps exactly your order.

**Optional:** `allowTokenImport` lets each user add extra ERC-20s by pasting a contract address. Wyllet reads the name, symbol and decimals onchain, saves them per browser, and users can remove them later. Every listed ERC-20 also gets an "Add to wallet" button.

```tsx
const { tokens, importToken, removeToken } = useWylletTokens() // current chain, merged & ordered
const { chains } = useWylletChains()                            // ordered by chainOrder

<TokenIcon symbol="USDC" chainId={8453} size={28} />
<ChainIcon chainId={424242} />
```

---

## Wallets

```tsx
import { burnerWallet, metaMaskWallet, phantomWallet, walletConnectWallet } from 'wyllet'

getDefaultConfig({ ..., wallets: [metaMaskWallet(), phantomWallet(), walletConnectWallet(), burnerWallet()] })
```

`defaultWallets()` = MetaMask, Phantom, Rabby, OKX and WalletConnect, each with its **official icon** from the wallet's own brand kit.
Any other installed browser wallet is detected automatically (EIP-6963) and shown with the icon it announces itself.

Also available, without bundled artwork (they show a neutral placeholder unless installed). Pass the official icon yourself:

```tsx
coinbaseWallet({ overrides: { icon: '/brand/coinbase-wallet.svg' } }) // also rainbowWallet(), trustWallet()
```

Dev only: `burnerWallet()` (in-browser key in localStorage, warns if used on a deployed site).

How a wallet connects when picked:

1. If its extension is installed (EIP-6963 `rdns` match), Wyllet connects directly.
2. If it has a dedicated connector, Wyllet connects directly.
3. If it supports WalletConnect, Wyllet shows a QR code on desktop or a deep link on mobile.
4. Otherwise, Wyllet shows a "Get {wallet}" screen with install links.

Installed wallets you didn't list still appear under **Detected**.

### All wallets (WalletConnect directory)

With a `walletConnectProjectId`, the WalletConnect option becomes **All wallets**: a searchable grid of ~570 wallets from the WalletConnect registry, with each wallet's official logo and its own app link.

- **Desktop:** picking a wallet shows a QR code branded with its logo, to scan from inside that wallet's app.
- **Phone:** picking a wallet opens that exact app. A bare WalletConnect link would only open the phone's default wallet.
- **Installed:** if the wallet's browser extension is installed, it connects directly.

Using your own `createConfig`? Pass `walletConnectProjectId` to `<WylletProvider>` as well.

```tsx
// Custom wallet
const acme: Wallet = {
  id: 'acme',
  name: 'Acme',
  icon: 'https://acme.xyz/icon.png',
  rdns: 'xyz.acme',
  walletConnect: { mobileUri: (uri) => `acme://wc?uri=${encodeURIComponent(uri)}` },
  downloadUrls: { browserExtension: 'https://acme.xyz/download' },
}

// Swap how a preset connects
import { coinbaseWallet as coinbaseSdk } from 'wagmi/connectors'
coinbaseWallet({ connector: () => coinbaseSdk({ appName: 'My dApp' }) })
```

Using your own `createConfig`? Pass `wallets` and `appInfo` to `<WylletProvider>`, and include `walletConnect({ showQrModal: false, … })` for QR support.

---

## Translations

```tsx
<WylletProvider messages={{ connect: 'Conectar', connectTo: 'Conectar a {app}' }} />
```

Every key is in the exported `en` object.

---

## Provider props

| Prop | |
| --- | --- |
| `theme` / `colorMode` | A theme or `{ light, dark }` pair; `'auto' \| 'light' \| 'dark'` |
| `appearance` | Presentation and behavior (see above) |
| `shortcut` | e.g. `'mod+k'`, toggles the panel |
| `tokens` | `'default' \| false \| TokenList \| TokenEntry[]`, shown to everyone |
| `chainOrder` | Chain ids shown first in the Networks tab |
| `allowTokenImport` | Let users import their own tokens (default `false`) |
| `auth` | SIWE adapter |
| `wallets`, `appInfo` | Override what `getDefaultConfig` registered |
| `messages`, `classNames`, `chainIcons`, `avatar`, `disclaimer` | Copy and visuals |
| `ens` | Resolve ENS names and avatars (default `true`; needs mainnet) |
| `injectStyles` | `false` to load `wyllet/styles.css` yourself (strict CSP) |
| `onConnect` / `onDisconnect` | Lifecycle callbacks |

---

## Development

```bash
pnpm install
pnpm dev        # playground at http://localhost:5173 (hot-reloads library source)
pnpm test       # vitest
pnpm build      # packages/wyllet → dist (ESM + CJS + types + styles.css)
pnpm typecheck
```

Set `VITE_WC_PROJECT_ID` in `apps/playground/.env.local` to enable QR and mobile wallets. The burner wallet works with no setup.

```
packages/wyllet/src
├── activity/      activity timeline + transaction watcher
├── auth/          SIWE adapter types + controller
├── chains/        brand marks, popularChains, customChain()
├── components/    WylletButton, ConnectGate, TokenIcon, ChainIcon, Avatar, Toaster
│   └── Panel/     Surface (drawer/popover/modal/sheet), ConnectView, AccountView, IdentityCard, tabs
├── config/        getDefaultConfig + wallet/app registry
├── core/          WylletProvider, context, tiny external store
├── hooks/         public hooks + wallet resolution
├── i18n/          default strings
├── styles/        base stylesheet (driven entirely by CSS variables)
├── theme/         presets, createTheme, CSS variable generation
├── toast/         toast store
├── tokens/        default lists, withDefaultTokens, user-imported tokens, icons
├── utils/         formatting, shortcuts, storage
└── wallets/       wallet presets, icons, burner connector
```

## License

MIT

Wallet, chain and token names and logos are trademarks of their respective owners and are used only to identify supported wallets, networks and tokens. Bundled artwork comes from each project's official brand kit; see [`packages/wyllet/assets/SOURCES.md`](packages/wyllet/assets/SOURCES.md).
