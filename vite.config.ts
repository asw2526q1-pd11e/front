import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // IMPORTANT: L'ordre importa! Rutes més específiques primer
      
      // 1. Proxy per a accounts (més específic)
      '/api/accounts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // 2. Proxy per a comunitats (més específic)
      '/api/communities': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // 3. Proxy per a posts (genèric)
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/blog/api')
      }
    }
  }
})