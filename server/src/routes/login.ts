import type { Request, Response } from 'express'
import process from 'node:process'
import { Router } from 'express'
import { delayMiddleware } from '../middlewares'

const router = Router()

// 应用延时中间件到所有路由
router.use(delayMiddleware)

// 模拟用户数据
const mockUser = {
  username: 'admin',
  password: '123456',
}

// 登录接口
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body

  // 验证用户名和密码
  if (username === mockUser.username && password === mockUser.password) {
    // 设置 cookie
    res.cookie('sessionId', 'mock-session-id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || false,
      maxAge: 24 * 60 * 60 * 1000, // 24 小时
    })

    res.json({
      code: 200,
      success: true,
      message: '登录成功',
      data: {
        username: mockUser.username,
      },
    })
  }
  else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误',
      success: false,
    })
  }
})

// 获取用户信息接口
router.get('/userInfo', (req: Request, res: Response) => {
  // 检查用户是否已登录
  const sessionId = req.cookies.sessionId
  if (!sessionId) {
    return res.status(401).json({
      code: 401,
      message: '用户未登录',
      success: false,
    })
  }

  // 返回用户信息
  res.json({
    code: 200,
    success: true,
    message: '获取成功',
    data: {
      username: mockUser.username,
      // 这里可以添加更多用户信息
    },
  })
})

export { router as loginRouter }
