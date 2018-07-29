const Koa = require('koa')
const app = new Koa()

const { connect, initSchemas } = require('./server/database/init.js')
const middleware = require('./server/middlewares');

(async() => { // 数据库链接，初始化mongodB
  await connect()
  initSchemas()
})()
middleware(app) // 中间件集合
// 开启服务器
app.listen(3000, () => {
  console.log('[demo] route-use-middleware is starting at port 3000')
})
