import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@whosonsite/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  }
})
