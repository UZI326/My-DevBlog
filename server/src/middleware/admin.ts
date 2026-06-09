import type { Request, Response, NextFunction } from 'express'

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ code: 401, message: '请先登录', data: null })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ code: 403, message: '无权限，仅管理员可操作', data: null })
    return
  }

  next()
}