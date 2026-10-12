# Changelog

## Unreleased

- **New: `<WylletEmbed>`** renders the real panel inline, inside your own layout (a connect card, an account sidebar, a live preview), with local navigation that never opens the drawer.
- **Fix:** `getDefaultConfig` no longer creates the WalletConnect connector during server rendering, which logged an `indexedDB is not defined` error in Next.js and other SSR frameworks.
- **Accessibility:** the tertiary text colour of every preset (hints, subtitles, labels) now meets WCAG AA contrast.
- **Touch devices:** keyboard hints (the `⌘K` badge on the button and the number keys next to wallets) are hidden on touch-only screens.

## 1.0.0

First stable release.

- **Wallet Island** button with headless `useWylletButton()`.
- **Panel presentations:** drawer, popover (anchored), modal, and a draggable bottom sheet on phones.
- **Connect flow:** EIP-6963 detection, WalletConnect QR and mobile deep links (optional peer), keyboard navigation (`⌘K`, arrows, 1–9), continue-with-last-wallet, onboarding and install screens.
- **All wallets:** a searchable directory of ~570 WalletConnect wallets with official logos and per-wallet app links (opens the exact wallet on phones). Only fetched when opened; disable with `appearance.walletDirectory: false`.
- **Account panel:** compact summary or optional holographic identity card; Tokens, Activity and Networks tabs; Receive QR; live gas.
- **Chains & tokens in code:** `popularChains`, `popularTestnets`, `customChain()`, `withDefaultTokens()`, `pinned`, `chainOrder`, `tokenSort`; optional user token import.
- **Activity timeline** with transaction tracking (`useWylletActivity`) and island toasts (`useWylletToast`).
- **Sign-In With Ethereum** adapter, `<ConnectGate>`.
- **Themes:** Obsidian, Porcelain, Aurora, Terminal; every token is a CSS variable; per-element `classNames`; full i18n.
- **Official artwork only:** wallet, network and token icons come from each project's own brand kit (sources in `packages/wyllet/assets/SOURCES.md`); anything without official artwork gets a neutral monogram.
- **Zero third-party runtime dependencies** (built-in QR encoder, verified bit-for-bit against the reference implementation; styled codes are scan-tested in CI).
- **Hardened for production:** hostile onchain data (ENS names, token symbols) can't crash rendering; persisted state is validated and versioned (`wyllet.v1.*`); Wyllet's own UI is isolated behind error boundaries so it can never take down the host app; SSR-safe.
