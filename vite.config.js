import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-xlsx': ['xlsx'],
          'vendor-pdfjs': ['pdfjs-dist'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: increase limit since we know we have large chunks
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
