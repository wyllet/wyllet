/** Shown on the home page and emitted as FAQPage JSON-LD. Answers are plain text (no markup). */
export const faq: Array<{ q: string; a: string }> = [
  {
    q: 'What is Wyllet?',
    a: 'Wyllet is an open-source wallet connector for React dApps. It adds a connect button, an account panel with tokens, activity and networks, toasts, Sign-In With Ethereum and a connection gate on top of wagmi and viem.',
  },
  {
    q: 'Is Wyllet free?',
    a: 'Yes. Wyllet is MIT licensed and free for commercial use. WalletConnect project IDs are also free from Reown Cloud.',
  },
  {
    q: 'Does Wyllet add dependencies to my app?',
    a: 'No third-party runtime dependencies. Wyllet uses only the libraries a wagmi dApp already has (react, wagmi, viem and @tanstack/react-query) as peer dependencies. WalletConnect support is an optional peer you install and pin yourself.',
  },
  {
    q: 'Which wallets are supported?',
    a: 'MetaMask, Phantom, Rabby, OKX and WalletConnect out of the box, any browser wallet that announces itself through EIP-6963, and about 570 mobile wallets through the WalletConnect directory. You can also add your own wallets.',
  },
  {
    q: 'Does it work with Next.js?',
    a: 'Yes. Wyllet ships with the use client directive and is SSR-safe. Put the providers in a client component and use them from your App Router layout.',
  },
  {
    q: 'Can I use my own button or design?',
    a: 'Yes. Pick a theme preset, change any design token through CSS variables, add your own class names per element, or build a fully custom trigger with the useWylletButton hook.',
  },
  {
    q: 'Can I add my own chain or token?',
    a: 'Yes. Define any EVM chain with customChain() and pass your own token list. Networks and tokens are set in code, so every user sees the same curated list in the order you choose.',
  },
  {
    q: 'Does Wyllet collect analytics or call its own servers?',
    a: 'No. Wyllet has no analytics and no servers. The only request it makes on its own is loading the WalletConnect wallet directory, and only when a user opens All wallets. You can turn that off. Balances, ENS names and gas prices are read through your own wagmi transports.',
  },
]
