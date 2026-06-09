// 专门管理 markdown 相关的解析配置(全局只执行一次)
import { marked } from 'marked'                // 核心：MD转HTML解析器
import { markedHighlight } from 'marked-highlight' // 官方高亮插件（桥接marked+hljs）
import hljs from 'highlight.js'                // 语法高亮核心库
import 'highlight.js/styles/github.css'        // 高亮主题CSS（决定代码颜色）

// 导出初始化函数，项目启动时执行一次
export function setupMarked(){
  // 给 marked 全局注册高亮插件（一生只注册一次）
  marked.use(
    markedHighlight({
      // 核心回调：marked解析到```代码块时，自动触发这个函数
      highlight: (code:string, lang?:string)=>{
        // 1. 空值兜底：lang为undefined/null时，赋值为空字符串
        const realLang = lang ?? ''
        
        // 2. 判断：hljs是否支持该编程语言
        if(realLang && hljs.getLanguage(realLang)){
          // 3. 支持 → 按指定语言精准高亮
          return hljs.highlight(code,{language:realLang}).value
        }
        
        // 4. 不支持/无语言 → 自动识别语法高亮
        return hljs.highlightAuto(code).value
     }
   })
  )
}