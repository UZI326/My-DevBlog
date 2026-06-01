<script setup lang="ts">
const message: string = 'DevBlog 启动成功 🚀'
const tsStatus: string = 'TypeScript Strict Mode: ON ✅'
const stack: string = 'Vue3 + TS + Vite + Pinia + Vue Router'
</script>

<template>
  <div style="text-align: center; margin-top: 200px; font-family: system-ui;">
    <h1 style="font-size: 48px; color: #409eff;">{{ message }}</h1>
    <p style="font-size: 20px; color: #67c23a; margin: 20px 0;">{{ tsStatus }}</p>
    <p style="font-size: 18px; color: #909399;">技术栈：{{ stack }}</p>
  </div>
</template>