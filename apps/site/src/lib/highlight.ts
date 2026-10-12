import { cacheLife } from 'next/cache'
import { codeToHtml } from 'shiki'

/** Server-side syntax highlighting with the same dual theme the MDX pipeline uses. Cached per input. */
export async function highlight(code: string, lang: 'tsx' | 'ts' | 'bash' | 'css' | 'json' = 'tsx') {
  'use cache'
  cacheLife('max') // content only changes on deploy
  return codeToHtml(code.trim(), { lang, themes: { light: 'github-light-default', dark: 'github-dark-default' }, defaultColor: false })
}
