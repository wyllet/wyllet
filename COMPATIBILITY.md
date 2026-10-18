# Compatibility

What Wyllet is tested against, how, and when. Two kinds of evidence are kept apart:

- **Automated:** runs in CI on every push and pull request (`.github/workflows/ci.yml`), in real browser engines driven by Playwright, against the built package.
- **Verified on a device:** a person connected a real wallet on a real device, following the checklist below, and recorded the date and versions here. A row is only marked verified with those details.

Last updated for Wyllet 1.2.0.

## Browsers (automated)

Every flow runs in each panel presentation (drawer, popover, modal; the bottom sheet on phone profiles) with a scripted EIP-1193 wallet that announces itself through EIP-6963. The test page is served with a strict Content Security Policy (no `'unsafe-inline'`), so every flow is also a CSP check. Source: [`apps/e2e`](apps/e2e).

| Flow | Chrome | Firefox | Safari (WebKit) | Android Chrome (emulated) | iPhone Safari (emulated) |
| --- | --- | --- | --- | --- | --- |
| Connect, gated content unlocks | ✅ | ✅ | ✅ | ✅ | ✅ |
| User rejects the connection, then retries | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reconnects silently after a reload | ✅ | ✅ | ✅ | ✅ | ✅ |
| Account changed in the wallet | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chain changed in the wallet, including an unsupported chain | ✅ | ✅ | ✅ | ✅ | ✅ |
| Network switch from the panel | ✅ | ✅ | ✅ | ✅ | ✅ |
| User declines a network switch (no error shown, state unchanged) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wallet fails a network switch (error explained) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Disconnect from the panel | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wallet disconnects the site | ✅ | ✅ | ✅ | ✅ | ✅ |
| Strict CSP, styles as files (`style-src 'self'`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Strict CSP, injected styles with a nonce | ✅ | ✅ | ✅ | ✅ | ✅ |

"Emulated" means Playwright's device profiles (viewport, touch, user agent) in the matching engine, not physical phones.

## Wallets

| Wallet | Desktop detection (EIP-6963) | Listed once, connects | Identity matches WalletConnect registry | Phone app link | Verified on a device |
| --- | --- | --- | --- | --- | --- |
| MetaMask | ✅ automated | ✅ automated | ✅ `io.metamask` | ✅ matches registry (`https://metamask.app.link`) | Not yet |
| Coinbase Wallet | ✅ automated | ✅ automated | ✅ `com.coinbase.wallet` | ⚠️ `cbwallet://wc` isn't listed in the registry; needs a device check | Not yet |
| Rainbow | ✅ automated | ✅ automated | ✅ `me.rainbow` | ✅ matches registry (`rainbow://`) | Not yet |
| Trust Wallet | ✅ automated | ✅ automated | ✅ `com.trustwallet.app` | ✅ matches registry (`https://link.trustwallet.com`) | Not yet |
| Phantom | ✅ automated | ✅ automated | ✅ `app.phantom` | None (the registry lists no WalletConnect link) | Not yet |
| Rabby | ✅ automated | ✅ automated | ✅ `io.rabby` | None (Wyllet treats Rabby as a desktop extension) | Not yet |
| OKX Wallet | ✅ automated | ✅ automated | ✅ `com.okex.wallet` | ✅ matches registry (`okex://main`) | Not yet |
| Any other EIP-6963 wallet | ✅ automated (generic test wallet) | ✅ automated | n/a | Through **All wallets** and the WalletConnect QR | n/a |

Registry links were compared against the WalletConnect Explorer API on 18 October 2026.

## Verifying a wallet on a device

Use the playground (`pnpm dev`, or the hosted playground on wyllet.dev) with a WalletConnect project ID set. For each wallet and platform, check every step and note anything unexpected:

1. The wallet appears in the connect panel (marked **Detected** for an installed extension).
2. Connecting opens the wallet; approving connects. Rejecting shows **Request declined** with **Try again**.
3. On a phone: tapping the wallet opens its app directly; scanning the QR from a desktop also connects.
4. The account panel shows the right address, balance and network.
5. Switching networks from **Networks** works; declining in the wallet leaves the dApp on its network.
6. Changing the account or network inside the wallet updates the dApp.
7. Reloading the page reconnects without a prompt.
8. **Disconnect** in the panel, and disconnecting the site from inside the wallet, both return the dApp to **Connect**.
9. If the dApp uses Sign-In With Ethereum: signing works, and declining leaves the user signed out.

Then fill in the device column, for example: `✅ 2026-10-20, MetaMask 13.4 on iOS 19.1 (all 9 steps)`. Note any failure, with the step number, in an issue.
