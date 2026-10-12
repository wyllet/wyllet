import Image from 'next/image'
import Link from 'next/link'
import styles from './chrome.module.css'

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="Wyllet home">
      <Image src="/logo.png" alt="" width={34} height={34} priority className={styles.logoMark} />
      <span className={styles.wordmark}>wyllet</span>
    </Link>
  )
}
