import type { NextFunction, Request, Response } from 'express'

// 延时中间件
export async function delayMiddleware(req: Request, res: Response, next: NextFunction) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  next()
}

// 验证登录状态的中间件
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return res.status(401).json({
      code: 401,
      success: false,
      message: '登录失效，请重新登录！',
    })
  }

  next()
}
