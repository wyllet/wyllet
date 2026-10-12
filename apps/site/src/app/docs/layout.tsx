import { DocsSidebar } from '@/components/docs/DocsSidebar'
import { DocsSearch } from '@/components/docs/DocsSearch'
import { getSearchIndex } from '@/lib/search'
import styles from '@/components/docs/docs.module.css'

export default async function DocsLayout({ children }: LayoutProps<'/docs'>) {
  const index = await getSearchIndex()
  return (
    <div className={`container ${styles.shell}`}>
      <aside className={styles.sidebar} aria-label="Documentation">
        <DocsSearch index={index} />
        <DocsSidebar />
      </aside>
      <div className={styles.main}>{children}</div>
    </div>
  )
}
