import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mantine')) {
              return 'vendor-mantine'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (
              id.includes('react-dom') ||
              id.includes('react-router-dom') ||
              id.includes('react/')
            ) {
              return 'vendor-react'
            }
            if (id.includes('@tanstack') || id.includes('@reduxjs')) {
              return 'vendor-state'
            }
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '^/(api|health|ready)': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})
