import { test, expect, type Page } from '@playwright/test'

const DISPATCHER_EMAIL = 'dispatcher@acmehvac.com'
const PASSWORD = 'password123'

async function loginAsDispatcher(page: Page) {
  await page.goto('/login')

  await page.getByLabel('Email').fill(DISPATCHER_EMAIL)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()

  // Dispatcher lands on the dashboard after a successful login
  await expect(page).toHaveURL(/\/dashboard/)
}

test.describe('WhosOnSite — Dispatch Happy Path', () => {
  test('dispatcher sees the live board and opens a job share link for the customer', async ({
    page,
    context
  }) => {
    // Clipboard support is required to grab the customer share link
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await loginAsDispatcher(page)

    // Navigate to the dispatch board
    await page.getByRole('link', { name: /dispatch board/i }).click()
    await expect(page).toHaveURL(/\/dispatch/)

    // The dispatch board renders at least one seeded job
    await expect(page.getByText(/riverbend apartments/i).first()).toBeVisible()

    // Open the first job card to reveal the live job detail drawer
    await page.getByText(/riverbend apartments/i).first().click()
    await expect(page.getByRole('heading', { name: /job detail/i })).toBeVisible()

    // Copy the customer share link, then read it back from the clipboard
    await page.getByRole('button', { name: /copy share link/i }).click()
    await expect(page.getByRole('button', { name: /copied/i })).toBeVisible()

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText())
    expect(shareUrl).toMatch(/\/status\/[a-f0-9-]{36}/)

    // The customer can open the public status page without authenticating
    await page.goto(shareUrl)
    await expect(page).toHaveURL(/\/status\//)

    // The public page shows the customer-facing status timeline
    await expect(page.getByText(/service status/i)).toBeVisible()
    await expect(page.getByText(/riverbend apartments/i)).toBeVisible()
  })
})
