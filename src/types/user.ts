//定义用户类型
//用户信息
export interface User{
  id:number
  username:string
  nickname?: string
  email?: string
  user_pic?: string|null
}

//登录请求
export interface LoginParams{
  username:string
  password:string
}
//注册请求
export interface RegisterParams{
  username: string
  password: string

}
//注册响应(可选扩展字段)
export interface RegisterResult{
  id: number
  username: string
}

//更新密码
export interface UpdatePasswordParams{
  old_pwd: string
  new_pwd: string
}

//更新用户信息
export interface UpdateUserParams{
  nickname?:string
  email?: string
}
