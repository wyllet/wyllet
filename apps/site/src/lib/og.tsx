import { cacheLife } from 'next/cache'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { siteUrl } from './site'

export const ogSize = { width: 1200, height: 630 }

const assets = path.join(process.cwd(), 'src', 'assets')

async function loadAssets() {
  'use cache'
  cacheLife('max') // content only changes on deploy
  const [display, body, mascot] = await Promise.all([
    readFile(path.join(assets, 'fonts', 'BricolageGrotesque-ExtraBold.ttf')),
    readFile(path.join(assets, 'fonts', 'Geist-Medium.ttf')),
    readFile(path.join(assets, 'mascot.png')),
  ])
  // Plain Uint8Arrays (not Buffers) survive the 'use cache' serialization; satori wants ArrayBuffers.
  return { display: new Uint8Array(display), body: new Uint8Array(body), mascot: `data:image/png;base64,${mascot.toString('base64')}` }
}

/** Shared social card: ink background, mint glow, mascot, big Bricolage title. */
export async function ogImage({ title, kicker, subtitle }: { title: string; kicker: string; subtitle?: string }) {
  const { display, body, mascot } = await loadAssets()
  const size = title.length > 48 ? 64 : title.length > 28 ? 78 : 96
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'radial-gradient(circle at 88% 18%, rgba(72,236,210,0.35), rgba(6,17,15,0) 46%), #06110F',
          color: '#F1F8F6',
          fontFamily: 'Geist',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'Bricolage', fontSize: 40, letterSpacing: '-0.04em' }}>wyllet</div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#06110F',
              background: '#48ECD2',
              borderRadius: 999,
              padding: '6px 16px',
            }}
          >
            {kicker}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 860 }}>
          <div style={{ fontFamily: 'Bricolage', fontSize: size, lineHeight: 1, letterSpacing: '-0.05em' }}>{title}</div>
          {subtitle && <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.35, color: '#B9D2CD' }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: '#8DAFA8' }}>{new URL(siteUrl).host} · open source · MIT</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascot} alt="" width={260} height={260} style={{ position: 'absolute', right: 64, bottom: 56, transform: 'rotate(-8deg)' }} />
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Bricolage', data: display.slice().buffer, weight: 800, style: 'normal' },
        { name: 'Geist', data: body.slice().buffer, weight: 500, style: 'normal' },
      ],
    },
  )
}

async function loadCover(file: string) {
  'use cache'
  cacheLife('max')
  const data = await readFile(path.join(process.cwd(), 'public', file))
  return `data:image/jpeg;base64,${data.toString('base64')}`
}

/** Blog card: the post's cover art, with the title set in the empty left side the covers are composed around. */
export async function ogCoverImage({ title, cover, kicker }: { title: string; cover: string; kicker: string }) {
  const [{ display, body }, src] = await Promise.all([loadAssets(), loadCover(cover)])
  const size = title.length > 56 ? 50 : title.length > 34 ? 58 : 68
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#06110F', fontFamily: 'Geist' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={1200} height={630} style={{ position: 'absolute', inset: 0, objectFit: 'cover' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(6,17,15,0.92) 0%, rgba(6,17,15,0.75) 40%, rgba(6,17,15,0) 62%)',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px', width: 620, color: '#F1F8F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: 'Bricolage', fontSize: 34, letterSpacing: '-0.04em' }}>wyllet</div>
            <div style={{ display: 'flex', fontSize: 20, color: '#06110F', background: '#48ECD2', borderRadius: 999, padding: '5px 14px' }}>{kicker}</div>
          </div>
          <div style={{ fontFamily: 'Bricolage', fontSize: size, lineHeight: 1.02, letterSpacing: '-0.045em' }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 20, color: '#8DAFA8' }}>{new URL(siteUrl).host}/blog</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Bricolage', data: display.slice().buffer, weight: 800, style: 'normal' },
        { name: 'Geist', data: body.slice().buffer, weight: 500, style: 'normal' },
      ],
    },
  )
}
