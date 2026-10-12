import { NextResponse, type NextRequest } from 'next/server'

/**
 * Content negotiation for AI agents: a request for a doc or post that prefers `text/markdown`
 * gets the Markdown twin of the same URL. The matcher only fires when the Accept header mentions
 * text/markdown, so normal browser traffic never runs this.
 */
export function proxy(request: NextRequest) {
  const accept = request.headers.get('accept') ?? ''
  const md = accept.indexOf('text/markdown')
  const html = accept.indexOf('text/html')
  if (md === -1 || (html !== -1 && html < md)) return NextResponse.next()

  const { pathname } = request.nextUrl
  const match = /^\/(docs|blog)\/([a-z0-9-]+)\/?$/.exec(pathname)
  if (match) return NextResponse.rewrite(new URL(`/md/${match[1]}/${match[2]}`, request.url))
  if (pathname === '/' || pathname === '/docs') return NextResponse.rewrite(new URL('/llms.txt', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    { source: '/', has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }] },
    { source: '/docs', has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }] },
    { source: '/docs/:slug', has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }] },
    { source: '/blog/:slug', has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }] },
  ],
}
