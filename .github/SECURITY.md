# Security policy

## Supported versions

Security fixes ship in the latest release of `wyllet` on npm. Upgrade to the newest version before reporting.

## Reporting a vulnerability

Please do not open a public issue for security problems. Report them privately:

- [Open a GitHub security advisory](https://github.com/wyllet/wyllet/security/advisories/new) (preferred)
- Email [support@wyllet.dev](mailto:support@wyllet.dev)

Include the version, steps to reproduce and the impact you expect.

## Scope

Wyllet never holds keys: every transaction and signature request goes to the user's wallet for approval. The one exception is `burnerWallet()`, a development wallet that keeps its key in `localStorage` and must not ship to production. See [Security](https://wyllet.dev/docs/security) for how the library handles sessions, SIWE and wallet data.
