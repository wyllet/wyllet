import { escapeXml, firstGlyph } from '../utils'

// Wyllet's own generic icons (no third-party brand marks). Official wallet logos live in
// brandIcons.ts; installed wallets always use the icon they announce via EIP-6963.

const svg = (body: string, bg: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs>${bg.startsWith('<') ? bg : ''}</defs><rect width="96" height="96" rx="22" fill="${bg.startsWith('<') ? 'url(#g)' : bg}"/>${body}</svg>`,
  )}`

const gradient = (from: string, to: string) =>
  `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`

/** Neutral placeholder for wallets without official artwork bundled: a letter on a slate tile (no brand colors). */
export function monogramIcon(name: string): string {
  return svg(
    `<text x="48" y="61" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="40" font-weight="700" fill="#fff">${escapeXml(firstGlyph(name))}</text>`,
    gradient('#6B6B80', '#3F3F4E'),
  )
}

export const icons = {
  /** Generic "scan with your phone" mark used for the WalletConnect option (not the WalletConnect logo). */
  scan: svg(
    '<path d="M26 38v-6a6 6 0 0 1 6-6h6M58 26h6a6 6 0 0 1 6 6v6M70 58v6a6 6 0 0 1-6 6h-6M38 70h-6a6 6 0 0 1-6-6v-6" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<rect x="38" y="36" width="20" height="24" rx="4" fill="none" stroke="#fff" stroke-width="5"/>',
    gradient('#5B6B8C', '#33405C'),
  ),
  browser: svg(
    '<rect x="20" y="28" width="56" height="42" rx="9" fill="none" stroke="#fff" stroke-width="6"/>' +
      '<path d="M20 40h56" stroke="#fff" stroke-width="6"/><circle cx="64" cy="55" r="4.5" fill="#fff"/>',
    gradient('#8A8AA3', '#55556B'),
  ),
  burner: svg(
    '<path d="M48 16c4 13 19 19 19 38 0 13-8 24-19 24s-19-10-19-21c0-11 6-15 10-22 2 8 6 10 9 10-2-10-2-20 0-29z" fill="#fff"/>',
    gradient('#FF8A3D', '#E5304B'),
  ),
}
