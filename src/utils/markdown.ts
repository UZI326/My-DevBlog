//专门管理 markdown 相关的解析配置(全局只执行一次)
import { marked } from 'marked'
import {markedHighlight} from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // 引入高亮样式

//配置marked 解析器 高亮
export function setupMarked(){
  marked.use(
    markedHighlight({
      // 这里使用 highlight.js 的自动检测功能
      highlight: (code:string,lang?:string)=>{
        const realLang = lang??''
        if(realLang && hljs.getLanguage(realLang)){
            return hljs.highlight(code,{language:realLang}).value
      }
       return hljs.highlightAuto(code).value
     }
   })
  )
}