import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { WylletButton, WylletMark } from 'wyllet'
import { InstallCommand } from './InstallCommand'
import styles from './home.module.css'

/**
 * Official wallet marks (the same artwork Wyllet bundles), bursting out of the mascot's open lid.
 * The whole entrance is CSS (see home.module.css), so it plays on first paint without waiting for JavaScript.
 * Offsets are designed on a 520px stage and scaled with container units.
 */
const wallets = [
  { name: 'MetaMask', src: '/brand/wallets/metamask.svg', bg: '#FFFFFF', x: -150, y: -170, r: -14 },
  { name: 'Phantom', src: '/brand/wallets/phantom.svg', bg: '#AB9FF2', x: -40, y: -235, r: 6 },
  { name: 'Rabby', src: '/brand/wallets/rabby-symbol-white.svg', bg: '#8697FF', x: 80, y: -205, r: 14 },
  { name: 'OKX Wallet', src: '/brand/wallets/okx.png', bg: '#000000', x: 175, y: -110, r: -8 },
]
const cq = (px: number) => `${((px / 520) * 100).toFixed(2)}cqw`
const burst = (x: number, y: number, r: number, i: number) =>
  ({ '--x': cq(x), '--y': cq(y), '--r': `${r}deg`, '--d': `${550 + i * 90}ms` }) as CSSProperties

export function Hero() {
  return (
    <section className={`container ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <p className={styles.heroKicker} style={{ '--d': '0ms' } as CSSProperties}>
          <WylletMark size={18} /> Wyllet 1.0 is out. Open source, MIT.
        </p>
        <h1 id="hero-title" className={styles.heroTitle} style={{ '--d': '60ms' } as CSSProperties}>
          <span>One button.</span> <span>Every wallet.</span> <span>Your design.</span>
        </h1>
        <p className={styles.heroLede} style={{ '--d': '150ms' } as CSSProperties}>
          Wyllet is a wallet connector for React dApps on wagmi and viem. It gives you the connect button, the account panel, token
          balances, an activity timeline, toasts and Sign-In With Ethereum, themed to match your app. It has no runtime dependencies of its own.
        </p>
        <div className={styles.heroActions} style={{ '--d': '240ms' } as CSSProperties}>
          <WylletButton size="lg" label="Try it: connect a wallet" />
          <Link href="/docs/quick-start" className="btn btn-ghost">
            Read the quick start
          </Link>
        </div>
        <div className={styles.heroInstall} style={{ '--d': '330ms' } as CSSProperties}>
          <InstallCommand />
          <p className={styles.heroHint}>
            No wallet installed? Pick <b>Demo wallet</b> in the panel. It lives in your browser and holds no funds.
          </p>
        </div>
      </div>

      <div className={styles.stage} aria-hidden>
        <div className={styles.stageGlow} />
        <div className={styles.mascotWrap}>
          <div className={styles.mascotFloat}>
            <Image src="/logo.png" alt="" width={360} height={360} priority fetchPriority="high" sizes="(max-width: 900px) 300px, 400px" className={styles.mascot} />
          </div>
        </div>
        {wallets.map((w, i) => (
          <span key={w.name} className={styles.walletTile} style={{ background: w.bg, ...burst(w.x, w.y, w.r, i) }}>
            <Image src={w.src} alt="" width={44} height={44} unoptimized />
          </span>
        ))}
        <span className={styles.moreTile} style={burst(200, -10, 0, 4)}>
          +570
        </span>
      </div>
    </section>
  )
}
