<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import ToastContainer from './components/common/ToastContainer.vue';
</script>

<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
    <router-view />
    <ToastContainer/>
    </main>
  </div>
</template>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>