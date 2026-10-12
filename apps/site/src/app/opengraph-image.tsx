import { ogImage, ogSize } from '@/lib/og'
import { site } from '@/lib/site'

export const alt = site.title
export const size = ogSize
export const contentType = 'image/png'

export default function Image() {
  return ogImage({ title: site.tagline, kicker: 'v1.0', subtitle: 'The open-source wallet connector for React dApps. Built on wagmi and viem.' })
}
