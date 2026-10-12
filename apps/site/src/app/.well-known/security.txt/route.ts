import { absolute, site } from '@/lib/site'

/** RFC 9116. Reports go to GitHub's private vulnerability reporting. */
export function GET() {
  const body = [
    `Contact: mailto:${site.email}`,
    `Contact: ${site.securityAdvisory}`,
    'Expires: 2027-10-01T00:00:00.000Z',
    'Preferred-Languages: en',
    `Canonical: ${absolute('/.well-known/security.txt')}`,
    `Policy: ${absolute('/docs/security')}`,
    '',
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
