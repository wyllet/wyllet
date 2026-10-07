/**
 * Every user-facing string. Pass a partial object to `<WylletProvider messages={...}>`
 * to rename anything or translate the whole UI. `{name}`-style placeholders are interpolated.
 */
export const en = {
  // Island button
  connect: 'Connect',
  connecting: 'Connecting',
  verify: 'Verify',
  wrongNetwork: 'Wrong network',
  close: 'Close',
  back: 'Back',

  // Connect panel
  connectTo: 'Connect to {app}',
  continueWith: 'Continue with {name}',
  lastUsed: 'Last used',
  detected: 'Detected',
  allWallets: 'All wallets',
  searchWallets: 'Search wallets…',
  noWalletsFound: 'Nothing matches “{query}”',
  scanWithPhone: 'Scan with phone',
  otherWalletApp: 'Other wallet app',
  opensDefaultWallet: 'Opens your default wallet app',
  allWalletsTitle: 'All wallets',
  directorySub: 'Hundreds of wallets via WalletConnect',
  directorySearch: 'Search {count} wallets…',
  directoryEmpty: 'No wallets match “{query}”',
  directoryError: 'Couldn’t load the wallet list.',
  retry: 'Retry',
  showMore: 'Show more',
  useGenericQr: 'Use a generic QR code',
  noWallet: 'I don’t have a wallet',
  keyboardHint: 'navigate',
  termsNotice: 'By connecting you accept the {terms} and {privacy}.',
  terms: 'Terms',
  privacy: 'Privacy Policy',
  poweredBy: 'Powered by',

  // Connecting
  requesting: 'Waiting for {name}',
  confirmInWallet: 'Approve the connection request in your wallet to continue.',
  requestRejected: 'Request declined',
  requestRejectedDescription: 'No worries — you can try again whenever you’re ready.',
  connectionFailed: 'Couldn’t connect',
  tryAgain: 'Try again',
  openWallet: 'Open {name}',
  connected: 'Connected',
  connectedAs: 'You’re in as {name}',

  // QR
  scanTitle: 'Scan to connect',
  scanWith: 'Open {name} on your phone and tap its scan button.',
  scanAny: 'Open your wallet app on your phone and tap its scan button.',
  scanCameraHint: 'Scanning with your phone’s camera opens your default wallet app.',
  copyLink: 'Copy link',
  copied: 'Copied',
  generatingQr: 'Preparing secure link…',
  getWalletShort: 'Get {name}',

  // Get wallet / onboarding
  getWallet: 'Get {name}',
  getWalletDescription: '{name} isn’t installed yet. Install it, then come back to connect.',
  getExtension: 'Browser extension',
  getMobile: 'Mobile app',
  scanInstead: 'Use QR code instead',
  refreshAfterInstall: 'Installed it? Refresh this page.',
  onboardingTitle: 'Start with a wallet',
  onboardingBody: 'A wallet is your login and your vault for the onchain world. Pick one to get started — it takes a minute.',
  recommended: 'Recommended',
  learnMore: 'Learn more about wallets',

  // Sign in (SIWE)
  signInTitle: 'Prove it’s you',
  signInBody: 'Sign a message to verify you own this wallet. It’s free and doesn’t send a transaction.',
  signMessage: 'Sign to verify',
  signingMessage: 'Check your wallet…',
  verifying: 'Verifying…',
  signInFailed: 'Verification failed',
  cancel: 'Not now',

  // Account panel
  copyAddress: 'Copy',
  receive: 'Receive',
  explorer: 'Explorer',
  disconnect: 'Disconnect',
  tabTokens: 'Tokens',
  tabActivity: 'Activity',
  tabNetworks: 'Networks',
  noTokens: 'No token balances on {network}.',
  noActivity: 'Your activity will show up here.',
  clearActivity: 'Clear',
  receiveTitle: 'Receive',
  receiveNote: 'Only send assets on {network} to this address.',
  gas: 'Gas',
  testnet: 'Testnet',
  switching: 'Approve in wallet',
  switchFailed: 'Your wallet couldn’t switch networks. Try switching inside the wallet.',
  wrongNetworkDescription: 'This app doesn’t support your current network. Pick one below.',
  today: 'Today',
  yesterday: 'Yesterday',
  justNow: 'just now',
  minutesAgo: '{n}m ago',
  hoursAgo: '{n}h ago',

  // Custom tokens
  importToken: 'Import token',
  tokenAddress: 'Token contract address',
  lookingUpToken: 'Looking up token on {network}…',
  notAToken: 'No ERC-20 token found at this address on {network}.',
  invalidAddress: 'That doesn’t look like a contract address.',
  tokenExists: '{symbol} is already in your list.',
  importAction: 'Import {symbol}',
  tokenImported: 'Imported {symbol}',
  removeToken: 'Remove token',
  addToWallet: 'Add to wallet',
  custom: 'Custom',

  // Activity entries
  activityConnected: 'Connected {name}',
  activityDisconnected: 'Disconnected',
  activitySwitched: 'Switched to {name}',
  activitySignedIn: 'Signed in',
  txPending: 'Transaction pending',
  txConfirmed: 'Transaction confirmed',
  txFailed: 'Transaction failed',
  viewTransaction: 'View',

  // Gate
  gateTitle: 'Connect to continue',
  gateBody: 'This area needs a connected wallet.',
}

export type Messages = typeof en

export function format(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
