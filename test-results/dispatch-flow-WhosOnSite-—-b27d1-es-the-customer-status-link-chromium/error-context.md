# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dispatch-flow.spec.ts >> WhosOnSite — Dispatch Happy Path >> dispatcher opens the live board and shares the customer status link
- Location: tests\e2e\dispatch-flow.spec.ts:18:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /copy share link/i })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]:
        - button [ref=e8] [cursor=pointer]
        - generic [ref=e14]:
          - heading "WhosOnSite" [level=4] [ref=e15]
          - paragraph [ref=e16]: Acme HVAC Services
      - generic [ref=e17]:
        - button "Refresh" [ref=e18] [cursor=pointer]
        - button [ref=e25] [cursor=pointer]
        - button [ref=e29] [cursor=pointer]
  - navigation [ref=e34]:
    - generic [ref=e35]:
      - link "Dashboard" [ref=e36] [cursor=pointer]:
        - /url: /dashboard
      - link "Jobs" [ref=e44] [cursor=pointer]:
        - /url: /jobs
      - link "TeamMembers" [ref=e50] [cursor=pointer]:
        - /url: /team
      - link "Customers" [ref=e58] [cursor=pointer]:
        - /url: /customers
      - link "Analytics" [ref=e65] [cursor=pointer]:
        - /url: /analytics
  - main [ref=e70]:
    - generic [ref=e73]:
      - generic [ref=e74]:
        - generic [ref=e75]:
          - heading "Jobs" [level=2] [ref=e76]
          - paragraph [ref=e77]: Manage job assignments, status, and tracking
        - button "New" [ref=e79] [cursor=pointer]
      - generic [ref=e85]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - textbox "Search customer, address, tech..." [ref=e95]
            - generic [ref=e99]:
              - button "All (5)" [ref=e100] [cursor=pointer]
              - button "Unassigned (3)" [ref=e103] [cursor=pointer]
              - button "Active (2)" [ref=e106] [cursor=pointer]
              - button "Done (0)" [ref=e109] [cursor=pointer]
          - generic [ref=e115]:
            - generic [ref=e117] [cursor=pointer]:
              - generic [ref=e118]:
                - generic [ref=e119]: En Route
                - button "Details" [ref=e122]
              - paragraph [ref=e125]: Carlos Martinez
              - paragraph [ref=e130]: 245 Peachtree St NW, Atlanta, GA 30303
              - generic [ref=e131]:
                - generic [ref=e132]: Unassigned
                - paragraph [ref=e134]: Sep 15, 2026 11:20 PM
            - generic [ref=e136] [cursor=pointer]:
              - generic [ref=e137]:
                - generic [ref=e138]: Unassigned
                - button "Details" [ref=e141]
              - paragraph [ref=e144]: Carlos Martinez
              - paragraph [ref=e149]: 245 Peachtree St NW, Atlanta, GA 30303
              - generic [ref=e150]:
                - generic [ref=e151]: Unassigned
                - paragraph [ref=e153]: Sep 15, 2026 11:20 PM
              - button "Assign TeamMember" [ref=e154]
            - generic [ref=e163] [cursor=pointer]:
              - generic [ref=e164]:
                - generic [ref=e165]: Unassigned
                - button "Details" [ref=e168]
              - paragraph [ref=e171]: Carlos Martinez
              - paragraph [ref=e176]: 245 Peachtree St NW, Atlanta, GA 30303
              - generic [ref=e177]:
                - generic [ref=e178]: Unassigned
                - paragraph [ref=e180]: Sep 15, 2026 11:20 PM
              - button "Assign TeamMember" [ref=e181]
            - generic [ref=e190] [cursor=pointer]:
              - generic [ref=e191]:
                - generic [ref=e192]: Unassigned
                - generic [ref=e194]:
                  - button [ref=e195]
                  - button "Details" [ref=e199]
              - paragraph [ref=e202]: Carlos Martinez
              - paragraph [ref=e207]: 245 Peachtree St NW, Atlanta, GA 30303
              - generic [ref=e208]:
                - generic [ref=e209]: Unassigned
                - paragraph [ref=e211]: Sep 15, 2026 11:20 PM
              - button "Assign TeamMember" [ref=e212]
            - generic [ref=e221] [cursor=pointer]:
              - generic [ref=e222]:
                - generic [ref=e223]: Assigned
                - generic [ref=e225]:
                  - button [ref=e226]
                  - button "Details" [ref=e230]
              - paragraph [ref=e233]: Riverbend Apartments
              - paragraph [ref=e238]: 880 Sidney Marcus Blvd NE, Atlanta, GA 30324
              - generic [ref=e239]:
                - generic [ref=e240]: John Atlanta Tech
                - paragraph [ref=e242]: Sep 15, 2026 11:20 PM
        - generic [ref=e244]:
          - button [ref=e245] [cursor=pointer]
          - generic [ref=e252]:
            - generic:
              - generic:
                - button "🔧" [ref=e253] [cursor=pointer]
                - button "🔧" [ref=e255] [cursor=pointer]
                - button [ref=e257] [cursor=pointer]
                - button [ref=e260] [cursor=pointer]
                - button [ref=e263] [cursor=pointer]
                - button [ref=e266] [cursor=pointer]
                - button [ref=e269] [cursor=pointer]
            - generic:
              - generic [ref=e272]:
                - button "Zoom in" [ref=e273] [cursor=pointer]: +
                - button "Zoom out" [ref=e274] [cursor=pointer]: −
              - generic [ref=e275]:
                - link "Leaflet" [ref=e276] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| ©"
                - link "OpenStreetMap" [ref=e281] [cursor=pointer]:
                  - /url: https://www.openstreetmap.org/copyright
                - text: contributors
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test'
  2  | 
  3  | const DISPATCHER_EMAIL = 'dispatcher@acmehvac.com'
  4  | const PASSWORD = 'password123'
  5  | 
  6  | async function loginAsDispatcher(page: Page) {
  7  |   await page.goto('/login')
  8  | 
  9  |   await page.getByLabel('Email').fill(DISPATCHER_EMAIL)
  10 |   await page.getByLabel('Password').fill(PASSWORD)
  11 |   await page.getByRole('button', { name: 'Sign In' }).click()
  12 | 
  13 |   // Dispatcher lands on the dashboard after a successful login
  14 |   await expect(page).toHaveURL(/\/dashboard/)
  15 | }
  16 | 
  17 | test.describe('WhosOnSite — Dispatch Happy Path', () => {
  18 |   test('dispatcher opens the live board and shares the customer status link', async ({
  19 |     page,
  20 |     context
  21 |   }) => {
  22 |     // Clipboard access is required to grab the customer share link
  23 |     await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  24 | 
  25 |     await loginAsDispatcher(page)
  26 | 
  27 |     // Navigate to the dispatch board via the exact sidebar "Jobs" link
  28 |     // (strict mode: avoid matching the row-level "View All Jobs" link too)
  29 |     await page.getByRole('link', { name: 'Jobs', exact: true }).click()
  30 |     await expect(page).toHaveURL(/\/jobs/)
  31 | 
  32 |     // The dispatch board renders at least one seeded job
  33 |     await expect(page.getByText(/riverbend apartments/i).first()).toBeVisible()
  34 | 
  35 |     // Open the job to reveal the share-link drawer
  36 |     await page.getByText(/riverbend apartments/i).first().click()
  37 | 
  38 |     // Copy the customer share link, then read it back from the clipboard
> 39 |     await page.getByRole('button', { name: /copy share link/i }).click()
     |                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  40 |     await expect(page.getByRole('button', { name: /copied/i })).toBeVisible()
  41 | 
  42 |     const shareUrl = await page.evaluate(() => navigator.clipboard.readText())
  43 |     expect(shareUrl).toMatch(/\/status\/[a-f0-9-]{36}/)
  44 | 
  45 |     // The customer can open the public status page without authenticating
  46 |     await page.goto(shareUrl)
  47 |     await expect(page).toHaveURL(/\/status\//)
  48 | 
  49 |     // The public page shows the customer-facing status without authentication:
  50 |     // seeded company name and customer name are always rendered by the page
  51 |     await expect(page.getByText(/acme hvac/i)).toBeVisible()
  52 |     await expect(page.getByText(/riverbend apartments/i)).toBeVisible()
  53 |   })
  54 | })
  55 | 
```