import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 }
  },
  webServer: [
    {
      command: 'pnpm --filter @whosonsite/web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120000
    },
    {
      command: 'pnpm --filter @whosonsite/api dev',
      url: 'http://localhost:4000/health',
      timeout: 120000,
      reuseExistingServer: true
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
