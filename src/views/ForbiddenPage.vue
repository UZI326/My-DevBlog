<script setup lang="ts">
</script>

<template>
  <div class="forbidden-page">
    <h1>403 - 无权访问</h1>
    <p>你没有权限访问此页面</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
.forbidden-page {
  padding: 2rem;
  text-align: center;
}
</style>
