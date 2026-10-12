import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container" style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', padding: '96px 0 40px' }}>
      <Image src="/illustrations/mascot-rude.png" alt="" width={800} height={800} sizes="180px" style={{ width: 180, height: 180 }} priority />
      <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, letterSpacing: '-0.05em', marginTop: 24 }}>Nothing in this wallet</h1>
      <p style={{ color: 'var(--fg-2)', fontSize: 18, maxWidth: '46ch' }}>This page doesn&apos;t exist or has moved. Try the docs, or search them with the / key.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <Link href="/" className="btn btn-primary">
          Go home
        </Link>
        <Link href="/docs" className="btn btn-ghost">
          Open the docs
        </Link>
      </div>
    </div>
  )
}
