const { errorHandle } = require('./errorHandle')
const jwtKoa = require('koa-jwt')
const key = require('../config/keys')
const bodyParser = require('koa-bodyparser')
const router = require('koa-router')()
const cors = require('koa2-cors') // 解决跨域
const miLog = require('./mi-log/') // 日志

module.exports = (app) => {
  app.use(errorHandle) // 加载自定义的错误中间件
  app.use(miLog()) // 日志中间件，要放在路由之前
  // 加载bodyParser中间件
  app.use(bodyParser()) // 加载顺序1
  app.use(cors())
  app
    .use(jwtKoa({ secret: key.jwtKey }).unless({
      path: [/^\/api\/v1\/admin-users\/login/] // 数组中的路径不需要通过jwt验证
    }))
  // 挂载子路由
  router.use('/api/v1/admin-users', require('../routes/users').routes()) // 加载顺序3
  // 加载路由中间件
  app.use(router.routes(), router.allowedMethods())
}
