// Reproducible bundle-size benchmark. Run after `pnpm build`: `pnpm bench` (add `--update` to rewrite
// bundle.json). Fails when a measurement exceeds bench/budget.json.
//
// Every number comes from pinned tools with fixed settings: esbuild (exact version in package.json),
// minify + tree-shaking, peers (react, wagmi, viem, react-query) external; gzip level 9; brotli quality 11.
import { readFile, writeFile } from 'node:fs/promises'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import { build, version as esbuildVersion } from 'esbuild'

const here = new URL('./', import.meta.url)
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const peers = Object.keys(pkg.peerDependencies)

const sizes = (bytes) => ({
  raw: bytes.length,
  gzip: gzipSync(bytes, { level: 9 }).length,
  brotli: brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
})

/** What an app pays for a given import, after its own bundler minifies and tree-shakes. */
async function importCost(code) {
  const result = await build({
    stdin: { contents: code, resolveDir: new URL('..', import.meta.url).pathname, loader: 'js' },
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    external: [...peers, 'react/jsx-runtime'],
    write: false,
    logLevel: 'silent',
    alias: { wyllet: './dist/index.js' },
  })
  return sizes(Buffer.from(result.outputFiles[0].contents))
}

const results = {
  version: pkg.version,
  tools: { esbuild: esbuildVersion, node: process.versions.node.split('.')[0], gzip: 'level 9', brotli: 'quality 11' },
  files: {
    'dist/index.js': sizes(await readFile(new URL('../dist/index.js', import.meta.url))),
    'dist/styles.css': sizes(await readFile(new URL('../dist/styles.css', import.meta.url))),
    'dist/themes/default.css': sizes(await readFile(new URL('../dist/themes/default.css', import.meta.url))),
  },
  imports: {
    'Typical setup (WylletProvider, WylletButton, getDefaultConfig)': await importCost(
      "export { WylletProvider, WylletButton, getDefaultConfig } from 'wyllet'",
    ),
    'Everything (export * from wyllet)': await importCost("export * from 'wyllet'"),
    'Helpers only (getDefaultConfig, popularChains, customChain)': await importCost(
      "export { getDefaultConfig, popularChains, customChain } from 'wyllet'",
    ),
  },
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
console.log(`wyllet ${results.version} (esbuild ${results.tools.esbuild}, node ${results.tools.node})\n`)
console.log('| Measurement | Uncompressed | gzip | brotli |\n| --- | --- | --- | --- |')
for (const [name, s] of [...Object.entries(results.files), ...Object.entries(results.imports)]) console.log(`| ${name} | ${kb(s.raw)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`)

const budget = JSON.parse(await readFile(new URL('budget.json', here), 'utf8'))
const over = []
for (const [name, limit] of Object.entries(budget.gzip)) {
  const s = results.files[name] ?? results.imports[name]
  if (!s) over.push(`${name}: not measured`)
  else if (s.gzip > limit) over.push(`${name}: ${kb(s.gzip)} gzip > budget ${kb(limit)}`)
}
if (process.argv.includes('--update')) await writeFile(new URL('bundle.json', here), `${JSON.stringify(results, null, 2)}\n`)
if (over.length) {
  console.error(`\nOver budget:\n- ${over.join('\n- ')}`)
  process.exit(1)
}
console.log('\nWithin budget.')
