import express from 'express'
import bcrypt  from 'bcrypt'
import db from '../db'
import { signToken } from '../middleware/auth'

const router = express.Router()

//统一方式返回响应
interface ApiResponse<T> {
  code: number
  message: string
  data: T|null
}

function sendResponse<T>(
  res: express.Response,
  code: number,
  message: string,
  data: T|null = null
): void {
  res.json({ code, message, data } as ApiResponse<T>)
}
//定义用户类型(解决类型推断问题)
interface User {
  id: number
  username: string
  password: string
  nickname?: string
  email?: string
  user_pic?: string
}

//1. 登录接口POST /api/login
router.post('/login',(req,res)=>{
  const { username, password } = req.body
  //非空校验
  if(!username || !password){
     return sendResponse(res,400,'用户名和密码不能为空')
  }
  //查询用户
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User|undefined
  if(!user){
    return sendResponse(res,400,'用户不存在')
  }
  //校验密码
  const isPwdValid = bcrypt.compareSync(password, user.password)
  if(!isPwdValid){
    return sendResponse(res,400,'密码错误')
  }
  //生成token
  const token = signToken({id: user.id, username: user.username})
  //返回token和用户信息 不含密码
  sendResponse(res,0,'登录成功',{
    token,
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    email: user.email,
    user_pic: user.user_pic
  })
}) 
//2. 注册接口POST /api/register
router.post('/register',(req,res)=>{
  const { username, password, email } = req.body
  //非空校验
  if(!username || !password){
      return sendResponse(res,400,'用户名和密码不能为空')
  }
  //长度校验
  if(username.length < 3 || password.length > 6){
    return sendResponse(res,400,'用户名至少3字符，密码至少6字符')
  }
  if(password.length<6||password.length>12){
    return sendResponse(res,400,'密码长度必须6-12字符')
  }
  //查询用户是否存在（查重）
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User|undefined
  if(existingUser){
    return sendResponse(res,400,'用户名已存在')
  }
  //密码加密
  const hashedPwd = bcrypt.hashSync(password,10)
  //插入用户
  const result = db.prepare(`INSERT INTO users (username,password,email,nickname)VALUES(?,?,?,?)`).run(username,hashedPwd,email||'',username)
  //返回结果
  sendResponse(res,0,'注册成功',{
    id:result.lastInsertRowid,
    username,
    user_pic:null,
  })
})

export default router
