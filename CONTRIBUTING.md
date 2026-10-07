# Contributing to Wyllet

1. `pnpm install`
2. `pnpm dev` starts the playground; it imports `packages/wyllet/src` directly, so edits hot-reload.
3. Before opening a PR run `pnpm typecheck && pnpm test && pnpm build`.

## Guidelines

- **Every visual value is a theme token.** Don't hardcode colors or radii in `styles/css.ts`; add a token in `theme/types.ts` and both presets instead.
- **Every user-facing string lives in `i18n/en.ts`.**
- Class names are public API (people style them), so keep the `wy-` prefix and don't rename existing ones casually.
- New wallets go in `wallets/presets.ts` with an `rdns`, `downloadUrls` and, if supported, a WalletConnect `mobileUri`.
## Dependency policy (supply-chain safety)

Wyllet has **zero third-party runtime dependencies**, and it should stay that way.

- Runtime code may only import its peers: `react`, `react-dom`, `wagmi`, `viem`, `@tanstack/react-query`, plus the optional `@walletconnect/ethereum-provider`. `test/policy.test.ts` checks `package.json` and scans the built bundle, so a new runtime import fails CI.
- Need something small? Write it, like `src/qr/encode.ts` (QR encoder, checked against the reference implementation in `test/qr.test.ts`).
- No runtime network requests of Wyllet's own, except the opt-in WalletConnect wallet directory (`src/directory/`), which is fetched only when a user opens "All wallets".
- Dev-only tools such as `uqr` and `jsqr` (used only to verify our QR code) belong in `devDependencies`, never `dependencies`.
- Releases should be published from CI with `npm publish --provenance`, with 2FA on the npm account and a committed lockfile installed with `--frozen-lockfile`.
