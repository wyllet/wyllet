import { highlight } from '@/lib/highlight'
import { CopyButton } from './CopyButton'
import styles from './code.module.css'

/** Highlighted code block (server component). */
export async function Code({ code, lang = 'tsx', title }: { code: string; lang?: 'tsx' | 'ts' | 'bash' | 'css' | 'json'; title?: string }) {
  const html = await highlight(code, lang)
  return (
    <figure className={styles.figure}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}
      <div className={styles.body}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <CopyButton text={code.trim()} className={styles.copy} />
      </div>
    </figure>
  )
}
