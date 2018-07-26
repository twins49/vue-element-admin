const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const key = require('./config/keys')
const jwtKoa = require('koa-jwt')
const cors = require('koa2-cors') // 解决跨域
const { connect, initSchemas } = require('./database/init.js')
const middleware = require('./middlewares/errorHandle');

(async() => {
  await connect()
  initSchemas()
})()
// 加载自定义的错误中间件
app.use(middleware.errorHandle)
// 加载bodyParser中间件
app.use(bodyParser()) // 加载顺序1
app.use(cors())
app
  .use(jwtKoa({ secret: key.jwtKey }).unless({
    path: [/^\/api\/v1\/admin-users\/login/] // 数组中的路径不需要通过jwt验证
  }))

// 引入子路由模块
const users = require('./routes/users') // 加载顺序3
// 挂载子路由
router.use('/api/v1/admin-users', users.routes())
// 加载路由中间件
app.use(router.routes(), router.allowedMethods())

// 开启服务器
app.listen(3000, () => {
  console.log('[demo] route-use-middleware is starting at port 3000')
})
