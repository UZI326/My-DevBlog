//「开始阅读」按钮实现平滑滚动到文章列表  悬停动效（位移 + 阴影）提升交互体验
<template>
  <div class="hero-banner">
   <div class="hero-content">
     <h1 class="hero-title">🌟 DevBlog </h1>
     <p class="hero-subtitle">记录技术成长，分享开发心得</p>
     <div class="hero-buttons">
       <button class="btn primary" @click="scrollToArticleList">开始阅读</button>
       <button class="btn secondary">关于我</button>
     </div>
   </div>
  </div>
</template>

<script setup lang="ts">
  const scrollToArticleList = () =>{
     // 滚动到文章列表区域（HomePage中文章列表的id为article-list）
    const articleList = document.getElementById('article-list');
    if (articleList) {
      articleList.scrollIntoView({ behavior: 'smooth' });
    }
  }  
</script>
<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 0 20px;
}

.hero-content {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: 48px;
  margin: 0 0 20px;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 40px;
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary {
  background: white;
  color: #667eea;
  font-weight: 600;
}

.secondary {
  background: transparent;
  color: white;
  border: 1px solid white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  .hero-subtitle {
    font-size: 16px;
  }
  .hero-buttons {
    flex-direction: column;
    gap: 12px;
  }
  .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>