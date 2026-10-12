/** The features page, grouped by the job each feature does. Every item links to its docs. */
export const featureGroups: Array<{ title: string; intro: string; art: string; items: Array<{ title: string; body: string; href: string }> }> = [
  {
    title: 'Connect',
    art: '/illustrations/spot-presentations.png',
    intro: 'Getting a wallet connected, on any device, with as few steps as possible.',
    items: [
      { title: 'The Island button', body: 'One control that is a call to action when disconnected and shows identity, network, balance and status once connected. Three sizes, three display modes.', href: '/docs/wyllet-button' },
      { title: 'Four presentations', body: 'Open the panel as a side drawer, an anchored popover or a modal. On phones it becomes a bottom sheet you can drag.', href: '/docs/presentations' },
      { title: 'Installed wallets, found automatically', body: 'Any browser wallet that announces itself through EIP-6963 shows up under Detected with its own icon, even if you never listed it.', href: '/docs/wallets' },
      { title: 'All wallets', body: 'With a WalletConnect project ID, a searchable directory of about 570 wallets with official logos. On phones, each one opens its own app.', href: '/docs/all-wallets' },
      { title: 'Keyboard first', body: 'Turn on the ⌘K shortcut to open the panel from anywhere. Arrow keys and Enter move through wallets, number keys pick one, and the last wallet used is one tap away.', href: '/docs/wallets' },
      { title: 'Install and onboarding screens', body: 'Wallets that are not installed get a page with official download links for the browser, iOS and Android.', href: '/docs/wallets' },
    ],
  },
  {
    title: 'After connect',
    art: '/illustrations/mascot-happy.png',
    intro: 'The parts most dApps rebuild by hand once a wallet is linked.',
    items: [
      { title: 'Account panel', body: 'A compact account summary or an optional generative identity card, with copy, explorer, receive and disconnect.', href: '/docs/account-panel' },
      { title: 'Tokens', body: 'Balances for the token list you define, sorted by holdings or in your order, with pinned tokens and an Add to wallet button.', href: '/docs/tokens' },
      { title: 'Activity timeline', body: 'Connects, network switches, sign-ins and the transactions you track, with live pending to confirmed status that survives a reload.', href: '/docs/activity' },
      { title: 'Networks', body: 'A chain grid with live gas price and a clear wrong-network state. Wallets that do not know your chain are asked to add it.', href: '/docs/chains' },
      { title: 'Toasts', body: 'Themed notifications with success, error, loading and promise helpers. Tracked transactions get them automatically.', href: '/docs/toasts' },
      { title: 'Receive', body: 'A QR code of the connected address, drawn by Wyllet’s own encoder and scan-tested in CI.', href: '/docs/account-panel' },
    ],
  },
  {
    title: 'Control',
    art: '/illustrations/spot-chains-tokens.png',
    intro: 'Decide who sees what, and keep the list of chains and tokens in your code.',
    items: [
      { title: 'Sign-In With Ethereum', body: 'Plug in an auth adapter and a verify step becomes part of the connect flow. Switching accounts or disconnecting signs the user out.', href: '/docs/siwe' },
      { title: 'ConnectGate', body: 'Render content only for users who are connected, on a supported network, and signed in.', href: '/docs/connect-gate' },
      { title: 'Chains in code', body: 'popularChains presets, anything from viem/chains, and customChain() for your own L2 or appchain. Arrange the Networks tab with chainOrder.', href: '/docs/chains' },
      { title: 'Tokens in code', body: 'Your token list, shown to every user in your order. Combine it with the built-in blue chips using withDefaultTokens().', href: '/docs/tokens' },
    ],
  },
  {
    title: 'Make it yours',
    art: '/illustrations/mascot-cool.png',
    intro: 'Wyllet should look like part of your app, not a widget dropped on top of it.',
    items: [
      { title: 'Four themes', body: 'Obsidian, Porcelain, Aurora and Terminal, each with accent, radius, font and backdrop knobs, and light and dark pairs.', href: '/docs/theming' },
      { title: 'Every token is a CSS variable', body: 'Colors, radii, fonts, shadows and effects are all --wy-* variables you can override.', href: '/docs/theming' },
      { title: 'Your own class names', body: 'Attach classes, including Tailwind utilities, to the overlay, panel, button, wallet rows, primary button, identity card and toasts.', href: '/docs/class-names' },
      { title: 'Headless mode', body: 'useWylletButton() gives you the state and actions. Draw any trigger you like and Wyllet handles the rest.', href: '/docs/hooks' },
      { title: 'Translations', body: 'Every string can be renamed or translated through the messages prop.', href: '/docs/i18n' },
    ],
  },
  {
    title: 'Trust',
    art: '/illustrations/spot-security.png',
    intro: 'A wallet connector sits next to your users’ funds, so it should be easy to audit.',
    items: [
      { title: 'Zero runtime dependencies', body: 'Only react, wagmi, viem and React Query as peers. A CI test fails if anything else is imported.', href: '/docs/security' },
      { title: 'npm provenance', body: 'Every release is built and published by GitHub Actions through npm Trusted Publishing, with a signed provenance attestation.', href: '/docs/security' },
      { title: 'No analytics', body: 'Wyllet has no servers and collects nothing. The only request it makes on its own is the optional wallet directory.', href: '/docs/security' },
      { title: 'Built to fail safely', body: 'Wyllet’s UI runs behind error boundaries, stored state is validated on read, and hostile onchain strings cannot break rendering.', href: '/docs/security' },
    ],
  },
]
