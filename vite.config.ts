import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 配置 @ 指向 src 目录（TS/路径别名必备）
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 开发服务器配置（本地开发使用 3000 端口 + 代理）
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },

  // 生产构建配置（打包规则）
  build: {
    outDir: 'dist',        // 打包产物输出到根目录 dist 文件夹
    assetsDir: 'assets',   // 静态资源(js/css/图片)放入 dist/assets
    emptyOutDir: true      // 每次打包前清空旧 dist 目录，避免残留文件
  }
})