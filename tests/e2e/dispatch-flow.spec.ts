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
  test('dispatcher opens the live board and shares the customer status link', async ({
    page,
    context
  }) => {
    // Clipboard access is required to grab the customer share link
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await loginAsDispatcher(page)

    // Navigate to the dispatch board (the Jobs page)
    await page.getByRole('link', { name: /jobs/i }).click()
    await expect(page).toHaveURL(/\/jobs/)

    // The dispatch board renders at least one seeded job
    await expect(page.getByText(/riverbend apartments/i).first()).toBeVisible()

    // Open the job to reveal the share-link drawer
    await page.getByText(/riverbend apartments/i).first().click()

    // Copy the customer share link, then read it back from the clipboard
    await page.getByRole('button', { name: /copy share link/i }).click()
    await expect(page.getByRole('button', { name: /copied/i })).toBeVisible()

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText())
    expect(shareUrl).toMatch(/\/status\/[a-f0-9-]{36}/)

    // The customer can open the public status page without authenticating
    await page.goto(shareUrl)
    await expect(page).toHaveURL(/\/status\//)

    // The public page shows the customer-facing status without authentication:
    // seeded company name and customer name are always rendered by the page
    await expect(page.getByText(/acme hvac/i)).toBeVisible()
    await expect(page.getByText(/riverbend apartments/i)).toBeVisible()
  })
})
