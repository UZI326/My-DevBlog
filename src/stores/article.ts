import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getArticlesApi, getArticleDetailApi, getCategoriesApi } from '@/api/article'
import type { ArticleListItem, ArticleDetail, ArticleFilter, Category } from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  // === 状态 ===
  const articles = ref<ArticleListItem[]>([])
  const articleDetail = ref<ArticleDetail | null>(null)
  const categories = ref<Category[]>([])
  const total = ref(0)
  const loading = ref(false)

  // UI 交互状态
  const currentFilter = ref<string>('all')
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(6)

  // === 计算属性 ===
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  /**
   * ✅ 修复点1：设置页码 (修正方法名为 setPage)
   */
  const setPage = async (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    await fetchArticles() // 重新请求数据
  }

  /**
   * ✅ 修复点2：新增 setFilter 方法
   */
  const setFilter = async (slug: string) => {
    if (currentFilter.value === slug) return // 如果点击当前已选中的分类，不重复请求
    currentFilter.value = slug
    currentPage.value = 1 // 切换分类时，必须重置回第一页
    await fetchArticles()
  }

  /**
   * 获取文章列表
   * @param params 外部传入的额外筛选参数（可选）
   */
  const fetchArticles = async (params?: Partial<ArticleFilter>) => {
    loading.value = true
    try {
      // ✅ 修复点3：构建新的请求对象，而不是修改原 params，避免 TS 报错
      const requestParams: any = {
        pagenum: currentPage.value,
        pagesize: pageSize.value,
        ...params // 合并外部传入的参数
      }

      // 处理分类筛选逻辑
      if (currentFilter.value !== 'all') {
        requestParams.category_slug = currentFilter.value
      }

      const data = await getArticlesApi(requestParams)

      articles.value = data.items || []
      total.value = data.total || 0

    } catch (error: any) {
      console.error(error)
      alert(error.message || '获取文章列表失败')
    } finally {
      loading.value = false
    }
  }

  // ... 其他函数 (fetchArticleDetail, fetchCategories) 保持不变 ...
  const fetchArticleDetail = async (id: number) => { /*...*/ }
  const fetchCategories = async () => { /*...*/ }


  return {
    articles,
    articleDetail,
    categories,
    total,
    loading,
    currentFilter,
    currentPage,
    pageSize,
    totalPages,
    // ✅ 确保导出的方法名与模板一致
    setPage,
    setFilter,
    fetchArticles,
    fetchArticleDetail,
    fetchCategories
  }
})