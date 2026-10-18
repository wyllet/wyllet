import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT ?? 4500)

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  webServer: { command: 'node server.mjs', url: `http://127.0.0.1:${port}/`, reuseExistingServer: !process.env.CI, env: { PORT: String(port) } },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /bench/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /bench/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /bench/ },
    // Phones get the bottom sheet instead of the drawer, popover or modal.
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testMatch: /(flows|csp)\.spec/ },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] }, testMatch: /(flows|csp)\.spec/ },
    // Only when asked for (`pnpm bench`), so `pnpm test` never spends time benchmarking.
    ...(process.env.BENCH ? [{ name: 'bench', use: { ...devices['Desktop Chrome'] }, testMatch: /bench\.spec/, retries: 0 }] : []),
  ],
})
