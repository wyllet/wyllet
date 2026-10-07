import { defaultSettings, fonts, networkOrders, type StudioSettings } from './studio'

const presetFn: Record<string, string> = {
  obsidian: 'obsidianTheme',
  porcelain: 'porcelainTheme',
  aurora: 'auroraTheme',
  terminal: 'terminalTheme',
}

/** Turns the current customizer state into copy-pasteable integration code. */
export function generateCode(s: StudioSettings): string {
  const d = defaultSettings
  const opts: string[] = []
  if (s.accent) opts.push(`accentColor: '${s.accent}'`)
  if (s.radius !== d.radius) opts.push(`radius: '${s.radius}'`)
  if (s.font !== 'default') opts.push(`fontFamily: "${fonts[s.font]}"`)
  if (s.overlayBlur !== d.overlayBlur) opts.push(`overlayBlur: '${s.overlayBlur}'`)
  const o = opts.length ? `{ ${opts.join(', ')} }` : ''

  const themeExpr = s.preset === 'auto' ? `{ light: porcelainTheme(${o}), dark: obsidianTheme(${o}) }` : `${presetFn[s.preset]}(${o})`
  const imports = s.preset === 'auto' ? ['porcelainTheme', 'obsidianTheme'] : [presetFn[s.preset]!]

  const appearance: string[] = []
  if (s.presentation !== d.presentation) appearance.push(`presentation: '${s.presentation}'`)
  if (s.drawerSide !== d.drawerSide) appearance.push(`drawerSide: '${s.drawerSide}'`)
  if (s.identityCard) appearance.push('identityCard: true')
  if (s.identityCard && !s.cardTilt) appearance.push('cardTilt: false')
  if (!s.closeOnConnect) appearance.push('closeOnConnect: false')
  if (s.tokenSort !== d.tokenSort) appearance.push(`tokenSort: '${s.tokenSort}'`)
  if (s.toastPosition !== d.toastPosition) appearance.push(`toastPosition: '${s.toastPosition}'`)
  if (!s.branding) appearance.push('branding: false')
  if (s.disableAnimations) appearance.push('disableAnimations: true')

  const providerProps = [`theme={${themeExpr}}`, 'tokens={tokens}']
  if (s.networkOrder !== 'config') providerProps.push(`chainOrder={[${networkOrders[s.networkOrder].join(', ')}]}`)
  if (appearance.length) providerProps.push(`appearance={{ ${appearance.join(', ')} }}`)
  if (s.shortcut) providerProps.push('shortcut="mod+k"')
  if (s.tokenImport) providerProps.push('allowTokenImport')
  if (s.siwe) providerProps.push('auth={siweAdapter}')
  if (s.locale === 'es') providerProps.push("messages={{ connect: 'Conectar', /* … */ }}")

  const buttonProps: string[] = []
  if (s.buttonSize !== 'md') buttonProps.push(`size="${s.buttonSize}"`)
  if (s.display !== 'full') buttonProps.push(`display="${s.display}"`)

  return `import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WylletProvider, WylletButton, customChain, getDefaultConfig, popularChains, withDefaultTokens, ${imports.join(', ')} } from 'wyllet'

// Any chain: popular presets, viem/chains, or your own.
const myChain = customChain({ id: 7777777, name: 'Zora', rpcUrl: 'https://rpc.zora.energy', icon: '/zora.svg' })

const config = getDefaultConfig({
  appName: 'My dApp',
  walletConnectProjectId: 'YOUR_PROJECT_ID',
  chains: [...popularChains, myChain], // first = default chain
})

// Your tokens, shown to every user. List order = priority; pinned stays on top.
const tokens = withDefaultTokens([
  { chainId: 8453, address: '0x4ed4…efed', symbol: 'DEGEN', decimals: 18, pinned: true },
])
const queryClient = new QueryClient()

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WylletProvider
          ${providerProps.join('\n          ')}
        >
          <WylletButton${buttonProps.length ? ' ' + buttonProps.join(' ') : ''} />
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}`
}
