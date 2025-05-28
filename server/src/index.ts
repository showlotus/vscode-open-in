import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { dataRouter } from './routes/data'
import { loginRouter } from './routes/login'

const app = express()
const port = 3000

// 中间件配置
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true) // 允许所有域名访问
  },
  credentials: true, // 允许携带 cookie
}))

// 路由配置
app.use('/api', loginRouter)
app.use('/api', dataRouter)

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})
