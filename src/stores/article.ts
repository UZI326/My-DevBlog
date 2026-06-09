import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getArticlesApi, getArticleDetailApi, getCategoriesApi } from '@/api/article'
import type { ArticleListItem, ArticleDetail, ArticleFilter, Category } from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref<ArticleListItem[]>([])
  const articleDetail = ref<ArticleDetail | null>(null)
  const categories = ref<Category[]>([])
  const total = ref(0)
  const loading = ref(false)
   // === ✅ 新增：UI 交互所需的状态 ===
  const currentFilter = ref<string>('all')
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(6)
   // === ✅ 新增：计算属性 (自动计算总页数) ===
  const totalPages = computed(()=>Math.ceil(total.value/pageSize.value))

  /**
   * 获取文章列表
   * @param params 筛选参数
   */
  const fetchArticles = async (params?: ArticleFilter) => {
    loading.value = true
    try {
      const requestParams: ArticleFilter = {
        pagenum: params?.pagenum ?? currentPage.value,
        pagesize: params?.pagesize ?? pageSize.value,
        ...params,
      }
      if (currentFilter.value !== 'all') {
        requestParams.category_slug = currentFilter.value
      }
      const data = await getArticlesApi(requestParams)
      articles.value = data.items || []
      total.value = data.total || 0
  
    } catch (error: any) {
      alert(error.message || '获取文章列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  const fetchArticleDetail = async (id: number) => {
    loading.value = true
    try {
      const data = await getArticleDetailApi(id)
      articleDetail.value = data
    } catch (error: any) {
      alert(error.message || '获取文章详情失败')
      articleDetail.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取分类列表
   */
  const fetchCategories = async () => {
    try {
      const data = await getCategoriesApi()
      categories.value = data
    } catch (error: any) {
      alert(error.message || '获取分类列表失败')
    }
  }

  const setFilter = async (filter: string) => {
    currentFilter.value = filter
    currentPage.value = 1
    await fetchArticles({ pagenum: 1, pagesize: pageSize.value })
  }

  const setPage = async (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    await fetchArticles({ pagenum: page, pagesize: pageSize.value })
  }

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
    setFilter,
    setPage,
    fetchArticles,
    fetchArticleDetail,
    fetchCategories
  }
})