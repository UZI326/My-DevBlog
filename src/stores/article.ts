import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getArticlesApi, getArticleDetailApi, getCategoriesApi } from '@/api/article'
import type { ArticleListItem, ArticleDetail, ArticleFilter, Category, FilterOption } from '@/types/article'

export const useArticleStore = defineStore('article',()=>{
  const articles = ref<ArticleListItem[]>([])   //([])这是传给 ref 的初始值
  const categories = ref<Category[]>([])
  const total = ref(0)
  const loading = ref(false)
  //当前筛选
  const currentFilter = ref<FilterOption>('all')
  const currentPage = ref(1)
  const pageSize = ref(2)
  //计算   派生数据，依赖`currentFilter`自动更新，无需手动赋值。
  const activeCategory = computed(()=>{
    // 返回当前选中的分类slug（all 则返回空）
    return currentFilter.value === 'all' ? '': currentFilter.value
  })
  //添加计算属性 计算总页数
  const totalPages = computed(()=>{
    return Math.ceil(total.value / pageSize.value)
  })
  // 获取文章列表（根据筛选条件） 方法实现
  async function fetchArticles(filterOverride?: Partial<ArticleFilter>){
    loading.value = true
    try{
      //组装筛选参数
      const params: ArticleFilter = {
        pagenum: currentPage.value,
        pagesize: pageSize.value,
        category_slug: activeCategory.value,
        ...filterOverride,
      }
      //调用API
      const res = await getArticlesApi(params)
      if(res.code === 200){
        articles.value = res.data.list
        total.value = res.data.total
      }
    }catch(error){
      console.log('获取位置列表失败',error)
    }finally{
      loading.value = false
    }
  }
  // 获取全部分类
  async function fetchCategories(){
    try{
      const res = await getCategoriesApi()
      if(res.code === 200){
        categories.value = res.data
      }
    }catch(error){
      console.log('获取文章分类列表失败:',error)
    }
  }
  //切换分类筛选
  function setFilter(slug:FilterOption){
    currentFilter.value = slug
    currentPage.value = 1  //切换分类重置页码
    fetchArticles()
  }
  //切换页码
  function setPage(page:number){
    if(page<1||page>totalPages.value) return 
    currentPage.value = page
    fetchArticles()
  } 
  return{
    articles, categories, total, loading,
    currentFilter, currentPage, pageSize,
    activeCategory, totalPages,
    fetchArticles, fetchCategories, setFilter, setPage,
  }
})