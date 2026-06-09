//JWT 认证体系，devBlog 实现了无状态、可扩展、前后端分离的用户认证，既保证了数据安全，又简化了代码逻辑。
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'devblog_jwt_secret_key_2026'

//定义JWT Payload类型

export interface JwtPayload {
  id: number
  username: string
  role:string
}

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
//JWT认证中间件
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try{
    //1.获取Authorization头
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
       res.status(401).json({ code: 401, message: '未提供有效的认证信息', data: null })
        return
    }
   
  //2.提取token 去掉Bearer前缀
  const token = authHeader.slice(7) //去掉'Bearer '前缀
  //3.校验token
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
  //4.将用户信息存储在req.user中，供后续处理使用
  req.user = decoded
  //5.继续处理请求
  next()
  }catch(error){
    res.status(401).json({ code: 401, message: '无效的认证信息', data: null }) 
    return
  }
  
}
//生成JWT token的工具函数 7天有效
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}