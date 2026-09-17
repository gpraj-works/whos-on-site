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
        // Let Vite handle chunking automatically
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '^/(api|health|ready|socket.io)': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
