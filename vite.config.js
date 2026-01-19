import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9005', // Proxy to hosting emulator
        changeOrigin: true,
      },
      '/mops-api': {
        target: 'https://mops.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mops-api/, '/mops/api'),
      },
      '/mopsov': {
        target: 'https://mopsov.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mopsov/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
