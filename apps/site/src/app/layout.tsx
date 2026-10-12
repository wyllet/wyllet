import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from 'next/font/google'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { Nav } from '@/components/Nav'
import { Providers } from '@/components/Providers'
import { graph, organization, software, website } from '@/lib/schema'
import { site, siteUrl } from '@/lib/site'
import './globals.css'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' })
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.title, template: '%s | Wyllet' },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  authors: [{ name: 'Wyllet contributors', url: site.github }],
  creator: 'Wyllet',
  publisher: 'Wyllet',
  category: 'technology',
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/rss.xml', title: 'Wyllet blog' }], 'text/plain': [{ url: '/llms.txt', title: 'llms.txt' }] },
  },
  openGraph: { type: 'website', siteName: site.name, locale: 'en_US', url: '/', title: site.title, description: site.description },
  twitter: { card: 'summary_large_image', site: site.xHandle, creator: site.xHandle, title: site.title, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F8F6' },
    { media: '(prefers-color-scheme: dark)', color: '#06110F' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

// Applies a saved light/dark choice before first paint (no flash). Tiny, static, and allowed by the CSP.
const themeScript = `try{var t=localStorage.getItem('wyllet-site.theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${geist.variable} ${jetbrains.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
        <JsonLd data={graph(organization, website, software)} />
      </body>
    </html>
  )
}
