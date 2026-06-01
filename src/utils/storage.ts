//TypeScript 封装的本地存储工具，专门用于安全、类型化地操作浏览器的 localStorage

//带类型校验和错误处理，避免 JSON 解析 / 序列化失败导致的报错：
export const storage = {
  // 读取本地存储，失败返回 null
  get<T> (key:string):T | null {
    try{
      const value = localStorage.getItem(key)  // 原生只能返回字符串或 null
      if(!value) return null      // 空值直接返回 null（安全处理）
      return JSON.parse(value) as T  // 关键：解析后断言为泛型 T
    }catch(error){
      console.error(`读取 localStorage 失败（key: ${key}）:`, error)
      return null  // 失败时返回 null 而非抛错
    }
  },
  //  写入本地存储，失败不抛错（仅控制台提示）
  set<T> (key:string,value:T):void {
    try{
      const stringifiedValue = JSON.stringify(value)  // 自动序列化
      localStorage.setItem(key,stringifiedValue)
    }catch(error){
      console.error(`写入 localStorage 失败（key: ${key}）:`, error)  // 静默失败：不 throw error，业务继续执行
    }
  },
  // 删除指定key
  remove(key:string):void {
    try{
      localStorage.removeItem(key)
    }catch(error){
       console.error(`删除 localStorage 失败（key: ${key}）:`, error);
      // 即使删除失败也不影响主流程（例如 key 不存在时原生不会报错，但某些浏览器扩展可能拦截）
    }
  },
  //清空所有的本地存储
  clear():void {
    try{
      localStorage.clear()
    }catch(error){
      console.error('清空 localStorage 失败:', error)
    }
  },
}