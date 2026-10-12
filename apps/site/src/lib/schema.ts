import { absolute, site, siteUrl } from './site'

export const organization = {
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: site.name,
  url: siteUrl,
  logo: absolute('/icon.png'),
  email: site.email,
  sameAs: [site.github, site.npm, site.x],
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: site.email, url: absolute('/docs/faq'), availableLanguage: ['en'] }],
}

export const website = {
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: site.name,
  url: siteUrl,
  description: site.description,
  publisher: { '@id': `${siteUrl}/#organization` },
  inLanguage: 'en',
}

export const software = {
  '@type': ['SoftwareSourceCode', 'SoftwareApplication'],
  '@id': `${siteUrl}/#software`,
  name: 'Wyllet',
  description: site.summary,
  url: siteUrl,
  codeRepository: site.github,
  programmingLanguage: ['TypeScript', 'React'],
  runtimePlatform: 'Web browser',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  softwareVersion: site.version,
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@id': `${siteUrl}/#organization` },
  keywords: site.keywords.join(', '),
  downloadUrl: site.npm,
  installUrl: absolute('/docs/installation'),
}

export function breadcrumbs(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absolute(item.path) })),
  }
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes })
