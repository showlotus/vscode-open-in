import type { Request, Response } from 'express'
import { Router } from 'express'
import { authMiddleware, delayMiddleware } from '../middlewares'

const router = Router()

// 应用延时中间件到所有路由
router.use(delayMiddleware)

// 获取数据接口
router.get('/data', authMiddleware, (req: Request, res: Response) => {
  res.json({
    code: 200,
    success: true,
    message: '获取成功',
    data: 'https://www.github.com/showlotus/vscode-open-in',
  })
})

export { router as dataRouter }
