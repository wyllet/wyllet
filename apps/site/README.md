# wyllet.dev

The Wyllet website: landing page, docs, playground, blog and changelog. Next.js 16 (App Router, Cache Components, Turbopack), MDX content, and the real `wyllet` package from this workspace.

```bash
pnpm install
pnpm dev:site      # http://localhost:4321
pnpm build:site
```

Environment (`apps/site/.env.local`, see `.env.example`):

| Variable | |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and JSON-LD. Defaults to `https://wyllet.dev` |
| `NEXT_PUBLIC_WC_PROJECT_ID` | WalletConnect project ID (QR codes, mobile wallets, All wallets). Add the site's domain to the project's allowlist |

Content lives in `src/content/docs/*.mdx` and `src/content/blog/*.mdx`; navigation and metadata come from `src/lib/docs.ts` and `src/lib/blog.ts`. `/changelog` renders the repository's `CHANGELOG.md`.

For search engines and AI agents the site serves `/sitemap.xml`, `/robots.txt` (AI crawlers allowed), `/llms.txt`, `/llms-full.txt`, a Markdown copy of every page at `<url>.md`, `/rss.xml`, JSON-LD on every page, and `/.well-known/security.txt`.

## Deploying to Netlify

`apps/site/netlify.toml` holds the build settings, redirects and headers. Netlify detects Next.js and deploys it with its OpenNext adapter.

1. **Add new site → Import from Git** and pick this repository.
2. **Base directory:** leave empty (repo root). **Package directory:** `apps/site`. Netlify reads the rest from `netlify.toml`: it builds the `wyllet` package, then the site, and publishes `apps/site/.next`.
3. **Environment variables:** add `NEXT_PUBLIC_WC_PROJECT_ID`. `NEXT_PUBLIC_SITE_URL` is already set to `https://wyllet.dev` in `netlify.toml`.
4. **Domain management:** set `wyllet.dev` as the primary domain, then add `www.wyllet.dev`, `wyllet.io`, `www.wyllet.io`, `wyllet.xyz`, `www.wyllet.xyz`, `wyllet.org` and `www.wyllet.org` as domain aliases. Point each domain's DNS at Netlify (Netlify DNS, or the A/CNAME records Netlify shows). Netlify issues HTTPS certificates for all of them.
5. In the WalletConnect (Reown) dashboard, add `wyllet.dev` to the project's allowed domains.

Every alias redirects permanently to `https://wyllet.dev`, keeping the path and query (in `netlify.toml` at the edge, and again in `next.config.ts` for any other host). Deploy previews and branch deploys send `X-Robots-Tag: noindex` and a disallow-all `robots.txt`, so only production is indexed.

Short links: `/github`, `/npm`, `/x`, `/issues`, `/releases`, `/install`, `/start`, `/security`, `/ai`, plus feed aliases (`/feed`, `/feed.xml`, `/atom.xml`) and `/llm.txt`.
