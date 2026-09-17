import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/app/**', 'src/vite-env.d.ts', 'src/pages/**', 'src/test/**']
    }
  },
  resolve: {
    alias: {
      '@whosonsite/shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  }
})
