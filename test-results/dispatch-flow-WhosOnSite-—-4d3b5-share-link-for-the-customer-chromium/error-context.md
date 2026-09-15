# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dispatch-flow.spec.ts >> WhosOnSite — Dispatch Happy Path >> dispatcher sees the live board and opens a job share link for the customer
- Location: tests\e2e\dispatch-flow.spec.ts:18:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /dispatch board/i })

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
        - /url: /dispatch
      - link "Technicians" [ref=e52] [cursor=pointer]:
        - /url: /technicians
      - link "Customers" [ref=e60] [cursor=pointer]:
        - /url: /customers
      - link "Analytics" [ref=e67] [cursor=pointer]:
        - /url: /analytics
  - main [ref=e72]:
    - generic [ref=e75]:
      - generic [ref=e77]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - paragraph [ref=e81]: Active Jobs
            - button [ref=e82] [cursor=pointer]
          - heading "5" [level=2] [ref=e90]
          - paragraph [ref=e91]: 1 en route, 0 on site, 3 unassigned
        - generic [ref=e93]:
          - generic [ref=e94]:
            - paragraph [ref=e95]: Technicians Online
            - button [ref=e96] [cursor=pointer]
          - heading "2 / 2" [level=2] [ref=e104]
          - paragraph [ref=e105]: 2 available, 0 busy
        - generic [ref=e107]:
          - generic [ref=e108]:
            - paragraph [ref=e109]: Completed Jobs
            - button [ref=e110] [cursor=pointer]
          - heading "0" [level=2] [ref=e116]
          - paragraph [ref=e117]: 5 total jobs recorded
        - generic [ref=e119]:
          - generic [ref=e120]:
            - paragraph [ref=e121]: Total Technicians
            - button [ref=e122] [cursor=pointer]
          - heading "2" [level=2] [ref=e128]
          - paragraph [ref=e129]: 2 currently online in field
      - generic [ref=e131]:
        - generic [ref=e133]:
          - generic [ref=e134]:
            - generic [ref=e135]:
              - heading "Jobs" [level=4] [ref=e136]
              - paragraph [ref=e137]: Active jobs and field operations tracking
            - link "View All Jobs" [ref=e138] [cursor=pointer]:
              - /url: /jobs
          - table [ref=e141]:
            - rowgroup [ref=e142]:
              - row [ref=e143]:
                - columnheader "Job ID" [ref=e144]
                - columnheader "Customer & Address" [ref=e145]
                - columnheader "Status" [ref=e146]
            - rowgroup [ref=e147]:
              - row [ref=e148]:
                - cell [ref=e149]:
                  - paragraph [ref=e150]: 5d817292...
                - cell [ref=e151]:
                  - paragraph [ref=e152]: Carlos Martinez
                  - paragraph [ref=e157]: 245 Peachtree St NW, Atlanta, GA 30303
                - cell "En Route" [ref=e158]
              - row [ref=e161]:
                - cell [ref=e162]:
                  - paragraph [ref=e163]: c680449b...
                - cell [ref=e164]:
                  - paragraph [ref=e165]: Carlos Martinez
                  - paragraph [ref=e170]: 245 Peachtree St NW, Atlanta, GA 30303
                - cell "Unassigned" [ref=e171]
              - row [ref=e174]:
                - cell [ref=e175]:
                  - paragraph [ref=e176]: 809f8e2d...
                - cell [ref=e177]:
                  - paragraph [ref=e178]: Carlos Martinez
                  - paragraph [ref=e183]: 245 Peachtree St NW, Atlanta, GA 30303
                - cell "Unassigned" [ref=e184]
              - row [ref=e187]:
                - cell [ref=e188]:
                  - paragraph [ref=e189]: 5325263b...
                - cell [ref=e190]:
                  - paragraph [ref=e191]: Carlos Martinez
                  - paragraph [ref=e196]: 245 Peachtree St NW, Atlanta, GA 30303
                - cell "Unassigned" [ref=e197]
              - row [ref=e200]:
                - cell [ref=e201]:
                  - paragraph [ref=e202]: 2cf05ec9...
                - cell [ref=e203]:
                  - paragraph [ref=e204]: Riverbend Apartments
                  - paragraph [ref=e209]: 880 Sidney Marcus Blvd NE, Atlanta, GA 30324
                - cell "Assigned" [ref=e210]
        - generic [ref=e214]:
          - generic [ref=e215]:
            - generic [ref=e216]:
              - heading "Dispatch Completion" [level=5] [ref=e217]
              - paragraph [ref=e218]: 0 / 5 Jobs
            - paragraph [ref=e225]: 0%
            - paragraph [ref=e226]: Live metrics for company operations
          - generic [ref=e227]:
            - generic [ref=e228]:
              - heading "Field Technicians" [level=5] [ref=e229]
              - link "View All" [ref=e230] [cursor=pointer]:
                - /url: /technicians
            - generic [ref=e233]:
              - generic [ref=e235]:
                - generic [ref=e236]:
                  - generic [ref=e237]: J
                  - generic [ref=e239]:
                    - paragraph [ref=e240]: John Atlanta Tech
                    - paragraph [ref=e241]: 404-555-0101
                - generic [ref=e242]: available
              - generic [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]: S
                  - generic [ref=e249]:
                    - paragraph [ref=e250]: Sarah Decatur Tech
                    - paragraph [ref=e251]: 404-555-0102
                - generic [ref=e252]: available
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
  18 |   test('dispatcher sees the live board and opens a job share link for the customer', async ({
  19 |     page,
  20 |     context
  21 |   }) => {
  22 |     // Clipboard support is required to grab the customer share link
  23 |     await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  24 | 
  25 |     await loginAsDispatcher(page)
  26 | 
  27 |     // Navigate to the dispatch board
> 28 |     await page.getByRole('link', { name: /dispatch board/i }).click()
     |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  29 |     await expect(page).toHaveURL(/\/dispatch/)
  30 | 
  31 |     // The dispatch board renders at least one seeded job
  32 |     await expect(page.getByText(/riverbend apartments/i).first()).toBeVisible()
  33 | 
  34 |     // Open the first job card to reveal the live job detail drawer
  35 |     await page.getByText(/riverbend apartments/i).first().click()
  36 |     await expect(page.getByRole('heading', { name: /job detail/i })).toBeVisible()
  37 | 
  38 |     // Copy the customer share link, then read it back from the clipboard
  39 |     await page.getByRole('button', { name: /copy share link/i }).click()
  40 |     await expect(page.getByRole('button', { name: /copied/i })).toBeVisible()
  41 | 
  42 |     const shareUrl = await page.evaluate(() => navigator.clipboard.readText())
  43 |     expect(shareUrl).toMatch(/\/status\/[a-f0-9-]{36}/)
  44 | 
  45 |     // The customer can open the public status page without authenticating
  46 |     await page.goto(shareUrl)
  47 |     await expect(page).toHaveURL(/\/status\//)
  48 | 
  49 |     // The public page shows the customer-facing status timeline
  50 |     await expect(page.getByText(/service status/i)).toBeVisible()
  51 |     await expect(page.getByText(/riverbend apartments/i)).toBeVisible()
  52 |   })
  53 | })
  54 | 
```