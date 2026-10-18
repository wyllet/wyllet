import { expect, test, type Page } from '@playwright/test'
import { ACCOUNT_1, ACCOUNT_2, installWallet, wallet } from './wallet'

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`
const state = (page: Page) => page.getByTestId('state')
/** The Wallet Island button (the gate has its own Connect button). */
const island = (page: Page) => page.locator('button.wy-island')

async function connect(page: Page) {
  await island(page).click()
  await expect(page.getByRole('dialog', { name: 'Connect to Wyllet E2E' })).toBeVisible()
  await page.getByRole('button', { name: /E2E Wallet/ }).click()
  await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|1`)
}

async function openAccount(page: Page) {
  await island(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

for (const presentation of ['drawer', 'popover', 'modal'] as const) {
  test.describe(`${presentation} panel`, () => {
    test.beforeEach(async ({ page }) => {
      await installWallet(page)
      await page.goto(`/?p=${presentation}`)
    })

    test('connects and unlocks gated content', async ({ page }) => {
      await expect(page.getByTestId('gated')).toBeHidden()
      await connect(page)
      await expect(island(page)).toHaveAccessibleName(short(ACCOUNT_1))
      await expect(page.getByTestId('gated')).toBeVisible()
    })

    test('recovers when the user rejects the connection', async ({ page }) => {
      await wallet.decide(page, 'connect', 'reject')
      await island(page).click()
      await page.getByRole('button', { name: /E2E Wallet/ }).click()
      await expect(page.getByText('Request declined')).toBeVisible()
      await expect(state(page)).toHaveText(/^disconnected\|/)

      await wallet.decide(page, 'connect', 'approve')
      await page.getByRole('button', { name: 'Try again' }).click()
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|1`)
    })

    test('reconnects silently after a reload', async ({ page }) => {
      await connect(page)
      await page.reload()
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|1`)
      await expect(island(page)).toHaveAccessibleName(short(ACCOUNT_1))
      await expect(page.getByRole('dialog')).toHaveCount(0)
    })

    test('follows an account change made in the wallet', async ({ page }) => {
      await connect(page)
      await wallet.setAccounts(page, [ACCOUNT_2])
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_2}|1`)
      await expect(island(page)).toHaveAccessibleName(short(ACCOUNT_2))
    })

    test('follows chain changes made in the wallet, including unsupported ones', async ({ page }) => {
      await connect(page)
      await wallet.setChain(page, 8453)
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|8453`)
      await expect(page.getByTestId('gated')).toBeVisible()

      await wallet.setChain(page, 137) // Polygon isn't in this app's chains
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|137`)
      await expect(page.getByText('Wrong network').first()).toBeVisible()
      await expect(page.getByTestId('gated')).toBeHidden()
    })

    test('switches networks from the panel', async ({ page }) => {
      await connect(page)
      await openAccount(page)
      await page.getByRole('tab', { name: 'Networks' }).click()
      await page.getByRole('button', { name: /Base/ }).click()
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|8453`)
    })

    test('stays put, without an error, when the user declines a network switch', async ({ page }) => {
      await connect(page)
      await wallet.decide(page, 'switch', 'reject')
      await openAccount(page)
      await page.getByRole('tab', { name: 'Networks' }).click()
      await page.getByRole('button', { name: /Base/ }).click()
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|1`)
      await expect(page.getByText(/couldn.t switch networks/)).toHaveCount(0)
      // Still usable: approving the next attempt switches.
      await wallet.decide(page, 'switch', 'approve')
      await page.getByRole('button', { name: /Base/ }).click()
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|8453`)
    })

    test('explains a network switch the wallet failed to make', async ({ page }) => {
      await connect(page)
      await wallet.decide(page, 'switch', 'fail')
      await openAccount(page)
      await page.getByRole('tab', { name: 'Networks' }).click()
      await page.getByRole('button', { name: /Base/ }).click()
      await expect(page.getByText(/couldn.t switch networks/)).toBeVisible()
      await expect(state(page)).toHaveText(`connected|${ACCOUNT_1}|1`)
    })

    test('disconnects from the panel', async ({ page }) => {
      await connect(page)
      await openAccount(page)
      await page.getByRole('button', { name: 'Disconnect' }).click()
      await expect(state(page)).toHaveText(/^disconnected\|/)
      await expect(island(page)).toHaveText(/Connect/)
    })

    test('notices when the wallet disconnects the site', async ({ page }) => {
      await connect(page)
      await wallet.disconnect(page)
      await expect(state(page)).toHaveText(/^disconnected\|/)
      await expect(island(page)).toHaveText(/Connect/)
      await expect(page.getByTestId('gated')).toBeHidden()
    })
  })
}
