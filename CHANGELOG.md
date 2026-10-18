# Changelog

## Unreleased (1.2.0): Reliability

- **Strict CSP:** new `nonce` prop adds your CSP nonce to the styles Wyllet injects. New `injectTheme={false}` plus prebuilt `wyllet/themes/*.css` files (and `themeStylesheet()` for custom themes) let a site run with `style-src 'self'` and no inline styles at all. Server-rendered markup no longer uses inline `style` attributes, which strict policies block: the button and gate hide until mounted through an attribute, and avatars are drawn in SVG.
- **Fix:** the blur behind the modal and on badges disappeared when `wyllet/styles.css` went through Lightning CSS (Vite 8, Next.js with Turbopack), because the prefixed `-webkit-backdrop-filter` came after the standard property. The order is fixed, and a browser test now checks the blur survives a production build.
- **Browser tests in CI:** Playwright runs connect, rejection and retry, silent reconnect, account and chain changes (including unsupported chains), network switching (approved, declined and failed) and both kinds of disconnect, in every presentation, in Chrome, Firefox, Safari and phone profiles, under a strict CSP.
- **Compatibility matrix:** [COMPATIBILITY.md](https://github.com/wyllet/wyllet/blob/main/COMPATIBILITY.md) lists what is tested for each browser and wallet, automated and on real devices. Every built-in wallet's EIP-6963 identity is tested for detection and connection, and its phone link is checked against the WalletConnect registry.
- **Benchmarks:** [BENCHMARKS.md](https://github.com/wyllet/wyllet/blob/main/BENCHMARKS.md) publishes reproducible bundle sizes (pinned esbuild, fixed compression settings) and loading timings. CI fails if the bundle grows past its budget.

## 1.1.0

- **New: `<WylletEmbed>`** renders the real panel inline, inside your own layout (a connect card, an account sidebar, a live preview), with local navigation that never opens the drawer.
- **Fix:** `getDefaultConfig` no longer creates the WalletConnect connector during server rendering, which logged an `indexedDB is not defined` error in Next.js and other SSR frameworks.
- **Accessibility:** the tertiary text colour of every preset (hints, subtitles, labels) now meets WCAG AA contrast.
- **Touch devices:** keyboard hints (the `⌘K` badge on the button and the number keys next to wallets) are hidden on touch-only screens.
- **Package:** `CHANGELOG.md` now ships in the npm package.

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
