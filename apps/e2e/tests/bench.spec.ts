import { appendFile, mkdir, writeFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { installWallet } from './wallet'

// Loading and interaction benchmark: `pnpm --filter e2e bench`.
// Chromium with the CPU slowed 4× (a mid-range phone), the production build served locally, the
// scripted wallet answering instantly, so the numbers are Wyllet's (plus wagmi's) own work.
// Timestamps are taken inside the page with performance.now(), not by the test runner.
const RUNS = Number(process.env.BENCH_RUNS ?? 15)
const CPU_SLOWDOWN = 4

async function installMarks(page: Page) {
  await page.addInitScript(() => {
    const marks: Record<string, number> = {}
    let clickedAt = 0
    document.addEventListener('click', () => (clickedAt = performance.now()), true)
    const check = () => {
      const island = document.querySelector('button.wy-island')
      if (!marks.ready && island && !island.hasAttribute('data-wy-pending')) marks.ready = performance.now()
      const dialog = document.querySelector('[role="dialog"]')
      const state = document.querySelector('[data-testid="state"]')?.textContent ?? ''
      if (dialog && !marks.connectOpen && clickedAt) marks.connectOpen = performance.now() - clickedAt
      if (state.startsWith('connected') && !marks.connected && marks.connectOpen) marks.connected = performance.now() - clickedAt
      if (dialog && marks.connected && marks.closed && !marks.accountOpen) marks.accountOpen = performance.now() - clickedAt
      if (!dialog && marks.connected && !marks.closed) marks.closed = performance.now()
    }
    new MutationObserver(check).observe(document, { subtree: true, childList: true, attributes: true, characterData: true })
    Object.assign(window, { __marks: marks })
  })
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2
}
const p75 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length * 0.75) - 1]!

test('loading and interaction timings', async ({ browser }) => {
  test.setTimeout(RUNS * 30_000)
  const samples: Record<string, number[]> = { ready: [], connectOpen: [], connected: [], accountOpen: [] }

  for (let i = 0; i < RUNS; i++) {
    const context = await browser.newContext()
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN })
    await installWallet(page)
    await installMarks(page)

    await page.goto('/?p=drawer')
    const island = page.locator('button.wy-island:not([data-wy-pending])')
    await island.click()
    await page.getByRole('button', { name: /E2E Wallet/ }).click()
    await expect(page.getByTestId('state')).toHaveText(/^connected/)
    await expect(page.getByRole('dialog')).toHaveCount(0) // closes on connect
    await island.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect.poll(() => page.evaluate(() => (window as unknown as { __marks: Record<string, number> }).__marks.accountOpen ?? 0)).toBeGreaterThan(0)

    const marks = await page.evaluate(() => (window as unknown as { __marks: Record<string, number> }).__marks)
    for (const key of Object.keys(samples)) samples[key]!.push(marks[key]!)
    await context.close()
  }

  const labels: Record<string, string> = {
    ready: 'Page load to button ready',
    connectOpen: 'Click to connect panel shown',
    connected: 'Click a wallet to connected (instant wallet)',
    accountOpen: 'Click to account panel shown',
  }
  const rows = Object.entries(samples).map(([key, xs]) => ({ metric: labels[key]!, median: Math.round(median(xs)), p75: Math.round(p75(xs)) }))
  const results = { runs: RUNS, cpuSlowdown: CPU_SLOWDOWN, browser: browser.version(), date: new Date().toISOString().slice(0, 10), results: rows }

  const table = ['| Metric | Median | p75 |', '| --- | --- | --- |', ...rows.map((r) => `| ${r.metric} | ${r.median} ms | ${r.p75} ms |`)].join('\n')
  console.log(`\nChromium ${results.browser}, CPU ${CPU_SLOWDOWN}× slower, ${RUNS} runs\n\n${table}\n`)
  await mkdir('bench-results', { recursive: true })
  await writeFile('bench-results/loading.json', `${JSON.stringify(results, null, 2)}\n`)
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Loading benchmark\n\nChromium ${results.browser}, CPU ${CPU_SLOWDOWN}× slower, ${RUNS} runs\n\n${table}\n`)
})
