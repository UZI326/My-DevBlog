// 专门管理 markdown 相关的解析配置(全局只执行一次)
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { getFullImageUrl } from './url'

export function setupMarked(){
  marked.use(
    markedHighlight({
      highlight: (code: string, lang?: string) => {
        try {
          const realLang = lang ?? ''
          if (realLang && hljs.getLanguage(realLang)) {
            return hljs.highlight(code, { language: realLang }).value
          }
          return hljs.highlightAuto(code).value
        } catch {
          return code
        }
      }
   })
  )

  // 修复 markdown 图片路径：将相对路径 /uploads/xxx.jpg 拼接为完整 URL
  marked.use({
    walkTokens(token) {
      if (token.type === 'image') {
        token.href = getFullImageUrl(token.href)
      }
    }
  })
}