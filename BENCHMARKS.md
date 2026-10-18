# Benchmarks

Reproducible measurements of what Wyllet adds to an app. Numbers below are for Wyllet 1.2.0; CI re-measures on every push.

## Bundle size

What your app ships for each import, after your bundler minifies and tree-shakes it. Wyllet's peers (React, wagmi, viem, TanStack Query) are excluded: a wagmi dApp already has them.

| Measurement | Uncompressed | gzip | brotli |
| --- | --- | --- | --- |
| dist/index.js | 270.2 KB | 80.2 KB | 65.7 KB |
| dist/styles.css | 44.4 KB | 8.7 KB | 7.6 KB |
| dist/themes/default.css | 2.7 KB | 0.8 KB | 0.7 KB |
| Typical setup (WylletProvider, WylletButton, getDefaultConfig) | 187.8 KB | 66.5 KB | 55.9 KB |
| Everything (export * from wyllet) | 195.5 KB | 69.6 KB | 58.3 KB |
| Helpers only (getDefaultConfig, popularChains, customChain) | 77.1 KB | 33.3 KB | 28.3 KB |

**Method:** `pnpm --filter wyllet build && pnpm --filter wyllet bench`. esbuild 0.28.2 (pinned exactly in `packages/wyllet/package.json`) with minify and tree-shaking, peers external, ES2020; gzip level 9; brotli quality 11. The same commit always gives the same bytes. Results are in [`packages/wyllet/bench/bundle.json`](packages/wyllet/bench/bundle.json).

**Budget:** CI fails if a gzip size exceeds [`bench/budget.json`](packages/wyllet/bench/budget.json), about 5% above the 1.2.0 sizes, so growth is always a deliberate, reviewed change.

## Loading and interaction

The production build of the test app in [`apps/e2e`](apps/e2e), served locally, in Chromium with the CPU slowed 4× (roughly a mid-range phone). The scripted wallet answers instantly, so the timings are Wyllet's and wagmi's own work. Timestamps are taken inside the page with `performance.now()`.

| Metric | Median | p75 |
| --- | --- | --- |
| Page load to button ready | 164 ms | 172 ms |
| Click to connect panel shown | 48 ms | 50 ms |
| Click to connected (instant wallet) | 20 ms | 20 ms |
| Click to account panel shown | 19 ms | 20 ms |

15 runs, Chromium 156.0.8078.4, measured 2026-10-18 on an Apple M3 Pro. Absolute times depend on the machine; compare runs on the same hardware.

**Method:** `pnpm bench` (bundle sizes, then the loading benchmark), or `pnpm --filter e2e bench` for the loading part alone. Set `BENCH_RUNS` to change the number of runs. In CI, the e2e job prints the table in its summary and uploads `bench-results/loading.json`.

- **Page load to button ready:** navigation start until the Wallet Island button is mounted and clickable.
- **Click to connect panel shown:** clicking **Connect** until the connect panel is in the page.
- **Click a wallet to connected:** clicking a wallet until wagmi reports the account as connected.
- **Click to account panel shown:** clicking the connected button until the account panel is in the page.
