// Serves the built test app with a strict Content Security Policy: no 'unsafe-inline' anywhere.
// index.html allows styles from files only; nonce.html and inline.html also allow the page's nonce.
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('./dist/', import.meta.url))
const port = Number(process.env.PORT ?? 4500)
const nonce = 'wyllet-e2e-nonce'

const policy = (styleSrc) =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src ${styleSrc}`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ')

const csp = {
  '/index.html': policy("'self'"),
  '/nonce.html': policy(`'self' 'nonce-${nonce}'`),
  '/inline.html': policy(`'self' 'nonce-${nonce}'`),
}

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' }

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (path === '/') path = '/index.html'
  const file = normalize(join(root, path))
  if (!file.startsWith(root)) return res.writeHead(403).end()
  try {
    const body = await readFile(file)
    const headers = { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }
    if (csp[path]) headers['Content-Security-Policy'] = csp[path]
    res.writeHead(200, headers).end(body)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, '127.0.0.1', () => console.log(`e2e app on http://127.0.0.1:${port}`))
