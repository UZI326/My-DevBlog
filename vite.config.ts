import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target:'http://localhost:3001',
        changeOrigin: true  // 开启跨域
        // rewrite: (path) => path.replace(/^\/api/, '') // 如需去掉/api前缀则打开（后端无/api时用）
      }
    }
  }
})
