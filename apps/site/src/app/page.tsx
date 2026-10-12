import Image from 'next/image'
import Link from 'next/link'
import { Code } from '@/components/Code'
import { Hero } from '@/components/home/Hero'
import { AccountTile, ChainsTile, GateTile, QrTile, ToastTile } from '@/components/home/LiveTiles'
import { PresentationDemo } from '@/components/home/PresentationDemo'
import { Reveal } from '@/components/home/Reveal'
import styles from '@/components/home/sections.module.css'
import { JsonLd } from '@/components/JsonLd'
import { faq } from '@/lib/faq'
import { site, siteUrl } from '@/lib/site'

const configCode = `
import { getDefaultConfig, popularChains } from 'wyllet'

export const config = getDefaultConfig({
  appName: 'My dApp',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  chains: popularChains, // the first chain is the default
})`

const appCode = `
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { WylletButton, WylletProvider } from 'wyllet'
import { config } from './wagmi'

const queryClient = new QueryClient()

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WylletProvider shortcut="mod+k">
          <WylletButton />
        </WylletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}`

const chainsCode = `
const myChain = customChain({
  id: 424242,
  name: 'My Chain',
  rpcUrl: 'https://rpc.mychain.xyz',
})

getDefaultConfig({ appName: 'My dApp', chains: [myChain, ...popularChains] })`

export default function Home() {
  return (
    <>
      <Hero />

      <section className={`container ${styles.section}`} aria-labelledby="presentations-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="presentations-title">Open it your way</h2>
          <p>
            Choose how the panel enters the screen and which theme it wears. This is the real component: every change here applies to the
            panel on this page.
          </p>
        </Reveal>
        <PresentationDemo />
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="tour-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="tour-title">Everything after connect</h2>
          <p>Most connectors stop once a wallet is linked. Wyllet also ships the parts every dApp ends up building next.</p>
        </Reveal>
        <div className={styles.tour}>
          <article className={styles.tile} data-area="account">
            <h3>Account panel</h3>
            <p>
              Balances for your token list, a timeline of what happened, and a network grid with live gas. Open any tab from your own UI.
            </p>
            <AccountTile />
          </article>
          <article className={styles.tile} data-area="toasts">
            <h3>Toasts</h3>
            <p>Promise-aware notifications in your theme. Transactions you track get one automatically.</p>
            <ToastTile />
          </article>
          <article className={styles.tile} data-area="qr">
            <h3>A QR code that scans</h3>
            <p>
              Wyllet draws its own QR codes, with no QR library. CI renders them at the smallest size Wyllet uses and checks that they
              decode.
            </p>
            <QrTile value={siteUrl} />
          </article>
          <article className={styles.tile} data-area="chains">
            <h3>Your chains and tokens, in your order</h3>
            <p>
              Mix popular chains with your own. Pin your token above the blue chips. Users see the same list on every device, because it
              lives in your code.
            </p>
            <ChainsTile />
            <Code code={chainsCode} lang="tsx" />
          </article>
          <article className={styles.tile} data-area="gate">
            <h3>Gate any page</h3>
            <p>
              <code>ConnectGate</code> shows its children only when the user is connected, on a supported network, and signed in if you use
              SIWE.
            </p>
            <GateTile />
          </article>
          <article className={styles.tile} data-area="keys">
            <h3>Keyboard first</h3>
            <p>
              Turn on <code>shortcut=&quot;mod+k&quot;</code> and <kbd>⌘</kbd> <kbd>K</kbd> opens the panel. Arrow keys and <kbd>Enter</kbd>{' '}
              move through wallets, number keys <kbd>1</kbd> to <kbd>9</kbd> pick one, and the last wallet you used is one tap away.
            </p>
            <Image src="/illustrations/spot-keyboard.png" alt="" width={800} height={800} sizes="200px" className={styles.tileArt} />
          </article>
          <article className={styles.tile} data-area="wallets">
            <h3>570 wallets that open the right app</h3>
            <p>
              With a WalletConnect project ID, the WalletConnect option becomes a searchable directory with each wallet&apos;s official
              logo. On a phone, picking a wallet opens that exact app instead of whichever wallet the phone defaults to.
            </p>
            <Link href="/blog/all-wallets-on-mobile" className={styles.textLink}>
              Why the default WalletConnect link opens the wrong wallet
            </Link>
          </article>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="steps-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="steps-title">Live in three steps</h2>
          <p>
            No CSS import and no extra setup. Wyllet injects its styles, finds installed wallets, and reads everything else from your wagmi
            config.
          </p>
        </Reveal>
        <ol className={styles.steps}>
          <li>
            <div>
              <h3>Install</h3>
              <p>Wyllet and the peers your dApp probably has already.</p>
            </div>
            <Code code="pnpm add wyllet wagmi viem @tanstack/react-query" lang="bash" />
          </li>
          <li>
            <div>
              <h3>Create a config</h3>
              <p>Chains, wallets, WalletConnect and app details in one call.</p>
            </div>
            <Code code={configCode} lang="ts" title="wagmi.ts" />
          </li>
          <li>
            <div>
              <h3>Add the button</h3>
              <p>Wrap your app and drop in the button. That&apos;s the whole integration.</p>
            </div>
            <Code code={appCode} lang="tsx" title="App.tsx" />
          </li>
        </ol>
        <div className={styles.center}>
          <Link href="/docs/quick-start" className="btn btn-primary">
            Read the quick start
          </Link>
          <Link href="/docs/nextjs" className="btn btn-ghost">
            Using Next.js
          </Link>
        </div>
      </section>

      <section className={`container ${styles.section} ${styles.security}`} aria-labelledby="security-title">
        <div>
          <Image src="/illustrations/spot-security.png" alt="" width={800} height={800} sizes="140px" className={styles.sectionArt} />
          <Reveal className={styles.sectionHead} align="left">
            <h2 id="security-title">Nothing new in your lockfile</h2>
            <p>
              A wallet connector runs next to your users&apos; funds, so Wyllet keeps its supply chain as small as it can be: zero
              third-party runtime dependencies.
            </p>
          </Reveal>
          <ul className={styles.facts}>
            <li>
              <strong>Peers only.</strong> React, wagmi, viem and React Query, which your dApp already has. WalletConnect is optional and
              you pin its version.
            </li>
            <li>
              <strong>Enforced in CI.</strong> A test scans the built package and fails if anything else is imported.
            </li>
            <li>
              <strong>Published with provenance.</strong> Releases are built and published by GitHub Actions through npm Trusted Publishing.
              No npm token is stored anywhere.
            </li>
            <li>
              <strong>Isolated.</strong> Wyllet&apos;s UI runs behind error boundaries, so a bug in it can&apos;t take down your app.
            </li>
          </ul>
          <Link href="/docs/security" className={styles.textLink}>
            Read the security notes
          </Link>
        </div>
        <div
          className={styles.terminal}
          role="img"
          aria-label="Terminal: npm view wyllet dependencies prints nothing, the peer dependencies are viem, react, wagmi, react-dom, React Query and the optional WalletConnect provider, and the package has an SLSA provenance attestation"
        >
          <div className={styles.terminalBar} aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <pre aria-hidden>
            <code>
              <span className={styles.prompt}>$</span> npm view wyllet dependencies{'\n'}
              <span className={styles.dim}>{'# prints nothing: there are none\n\n'}</span>
              <span className={styles.prompt}>$</span> npm view wyllet peerDependencies{'\n'}
              {`{
  viem: '^2.15.0',
  react: '>=18',
  wagmi: '^3.0.0',
  'react-dom': '>=18',
  '@tanstack/react-query': '>=5.0.0',
  '@walletconnect/ethereum-provider': '^2.21.1'
}`}
              {'\n\n'}
              <span className={styles.prompt}>$</span> npm view wyllet dist.attestations.provenance{'\n'}
              <span className={styles.ok}>{`{ predicateType: 'https://slsa.dev/provenance/v1' }`}</span>
            </code>
          </pre>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="faq-title">
        <Reveal className={styles.sectionHead}>
          <h2 id="faq-title">Questions</h2>
          <p>
            More in the <Link href="/docs/faq">FAQ</Link>.
          </p>
        </Reveal>
        <div className={styles.faq}>
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={`container ${styles.cta}`} aria-labelledby="cta-title">
        <Image src="/illustrations/mascot-happy.png" alt="" width={800} height={800} sizes="160px" className={styles.ctaMascot} />
        <h2 id="cta-title">Give your dApp a better connect button</h2>
        <p>Free, open source and ready for production.</p>
        <div className={styles.center}>
          <Link href="/docs/installation" className="btn btn-primary">
            Install Wyllet
          </Link>
          <Link href="/playground" className="btn btn-ghost">
            Open the playground
          </Link>
          <a href={site.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
            Star on GitHub
          </a>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
    </>
  )
}
