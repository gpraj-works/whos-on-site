import { test, expect } from '@playwright/test'

test.describe('WhosOnSite — Playwright E2E Dispatch Flow', () => {
  test('dispatcher board and live job flow', async ({ page }) => {
    // Navigate to local web app (or check system status)
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)

    // Verify main app title or login container exists
    await expect(page).toHaveTitle(/WhosOnSite/i)
  })
})
