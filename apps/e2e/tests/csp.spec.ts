import { expect, test, type Page } from '@playwright/test'
import { ACCOUNT_1, installWallet, trackCspViolations } from './wallet'

// The test server sends a strict policy with no 'unsafe-inline' (see server.mjs):
//   index.html  style-src 'self'               Wyllet's styles and theme load as files
//   nonce.html  style-src 'self' 'nonce-…'     Wyllet injects them with the page's nonce
//   inline.html same policy, but no nonce      the control: must be blocked

async function walkThrough(page: Page) {
  await page.locator('button.wy-island').click()
  const connectPanel = page.getByRole('dialog', { name: 'Connect to Wyllet E2E' })
  await expect(connectPanel).toBeVisible()
  await page.getByRole('button', { name: /E2E Wallet/ }).click()
  await expect(page.getByTestId('state')).toHaveText(`connected|${ACCOUNT_1}|1`)
  await page.locator('button.wy-island').click()
  const account = page.getByRole('dialog')
  await expect(account).toBeVisible()
  for (const tab of ['Activity', 'Networks', 'Tokens']) await page.getByRole('tab', { name: tab }).click()
  return account
}

/** Proof that the styles really applied: the panel is laid out and painted by Wyllet's CSS and theme. */
async function expectStyled(page: Page) {
  const panel = page.locator('.wy-surface').first()
  const look = await panel.evaluate((el) => {
    const s = getComputedStyle(el)
    return { position: s.position, background: s.backgroundColor, radius: parseFloat(s.borderTopLeftRadius), themed: s.getPropertyValue('--wy-colors-background').trim() }
  })
  expect(look.position).toMatch(/fixed|absolute/)
  expect(look.background).not.toBe('rgba(0, 0, 0, 0)')
  expect(look.radius).toBeGreaterThan(0)
  expect(look.themed).not.toBe('')
  // Bundlers' CSS minifiers (Lightning CSS in Vite and Next.js) once dropped this from styles.css:
  // the overlay must blur exactly as the theme says (the dark preset blurs; see test.use below).
  const overlay = await page.locator('.wy-overlay').first().evaluate((el) => {
    const s = getComputedStyle(el) as CSSStyleDeclaration & { webkitBackdropFilter?: string }
    return { applied: s.backdropFilter || s.webkitBackdropFilter || 'none', token: s.getPropertyValue('--wy-effects-overlay-blur').trim() }
  })
  expect(overlay.token).not.toBe('none')
  expect(overlay.applied).toBe(overlay.token)
}

test.use({ colorScheme: 'dark' })

for (const page of ['index', 'nonce'] as const) {
  test(`${page}.html: works under a strict CSP with no violations`, async ({ page: p }) => {
    const violations = await trackCspViolations(p)
    await installWallet(p)
    await p.goto(`/${page}.html?p=modal`) // the modal is the presentation that blurs the page behind it
    await walkThrough(p)
    await expectStyled(p)
    expect(await violations()).toEqual([])
  })
}

test('inline.html (control): default injection without a nonce is blocked', async ({ page }) => {
  const violations = await trackCspViolations(page)
  await installWallet(page)
  await page.goto('/inline.html')
  await expect(page.locator('button.wy-island')).toBeVisible()
  await expect.poll(async () => (await violations()).some((v) => v.startsWith('style-src'))).toBe(true)
})
