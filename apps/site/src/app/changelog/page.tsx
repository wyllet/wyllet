import type { Metadata } from 'next'
import Image from 'next/image'
import Changelog from '../../../../../CHANGELOG.md'
import blogStyles from '@/components/blog/blog.module.css'
import docStyles from '@/components/docs/docs.module.css'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Every Wyllet release, newest first, with the features and fixes in each version and links to the npm package.',
  alternates: { canonical: '/changelog' },
}

export default function ChangelogPage() {
  return (
    <div className={`container ${blogStyles.post}`}>
      <Image
        src="/illustrations/mascot-surprised.png"
        alt=""
        width={800}
        height={800}
        sizes="120px"
        priority
        className={blogStyles.changelogArt}
      />
      <div className={`${docStyles.prose} ${blogStyles.changelog}`}>
        <Changelog />
      </div>
      <p className={blogStyles.meta}>
        Releases are published to npm from GitHub Actions with provenance. Source:{' '}
        <a href={`${site.github}/blob/main/CHANGELOG.md`}>CHANGELOG.md</a>.
      </p>
    </div>
  )
}
