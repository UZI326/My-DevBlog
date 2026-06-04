//src/types/api.ts
//1.后端统一响应格式   API 相关类型补全（含注册参数 / 响应）
export interface ApiResponse<T = any>{
  code: number  // 0=成功，其他=失败（如401未登录）
  message: string // 错误提示语（如"密码错误"）
  data:T  // 关键！这里T是"占位符"，代表具体业务数据
}
//2.分页请求参数
export interface PaginationParams{
  pagenum: number  // 当前页码（第几页）
  pagesize: number   // 每页条数
}
//3.分页响应数据
export interface PaginatedData<T=any> {
  total: number   // 总条数（用于分页组件显示"共100条"）
  items : T[]   // 当前页的数据列表（T是文章/用户等具体类型）
  pagenum: number   // 当前页码
  pagesize: number   // 每页条数
}
//4.登录请求参数 （提交的表单数据）
export interface LoginParams{
  username:string
  password:string
}
//5. 登录响应数据
export interface LoginResult{
  token:string  // JWT 令牌
  id:number    // 用户ID
  username:string      // 用户名
  user_pic: string|null   // 头像URL，可能为空
}
//6. 注册请求参数
export interface RegisterParams{
  username:string  // 3-10位字符
  password:string   // 6-12位字符
  repassword:string  // 确认密码
  email?: string     // 可选邮箱
} 
//7. 注册响应数据
export interface RegisterResult{
  id:number
  username: string
  user_pic:null  //初始无头像
}
