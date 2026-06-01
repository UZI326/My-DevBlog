<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面走丢了 😕</p>
    <button @click="$router.push('/')">返回首页</button>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
h1 {
  font-size: 80px;
  color: var(--color-primary);
  margin: 0;
}
p {
  font-size: 20px;
  color: var(--color-text-secondary);
}
button {
  padding: 8px 16px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>