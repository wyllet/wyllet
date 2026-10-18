import { expect, test } from '@playwright/test'
import { ACCOUNT_1, installWallet } from './wallet'

// Each built-in wallet, announced through EIP-6963 with its real identity (rdns), must be matched to its
// preset: listed once, marked Detected, and connectable. This is the automated part of COMPATIBILITY.md;
// real extensions and phones are checked by hand.
const presets = [
  { name: 'MetaMask', rdns: 'io.metamask' },
  { name: 'Coinbase Wallet', rdns: 'com.coinbase.wallet' },
  { name: 'Rainbow', rdns: 'me.rainbow' },
  { name: 'Trust Wallet', rdns: 'com.trustwallet.app' },
  { name: 'Phantom', rdns: 'app.phantom' },
  { name: 'Rabby', rdns: 'io.rabby' },
  { name: 'OKX Wallet', rdns: 'com.okex.wallet' },
]

for (const { name, rdns } of presets) {
  test(`${name} (${rdns}) is detected, listed once and connects`, async ({ page }) => {
    await installWallet(page, { name, rdns })
    await page.goto('/?wallets=all')
    await page.locator('button.wy-island').click()
    await expect(page.getByRole('dialog', { name: 'Connect to Wyllet E2E' })).toBeVisible()

    const row = page.locator('button.wy-row', { hasText: name })
    await expect(row).toHaveCount(1)
    await expect(row).toContainText('Detected')

    await row.click()
    await expect(page.getByTestId('state')).toHaveText(`connected|${ACCOUNT_1}|1`)
  })
}
