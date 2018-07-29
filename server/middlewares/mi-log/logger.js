const log4js = require('log4js')
const { baseInfo } = require('./config')
// 将日志的不同级别提取为数组， 方便后面做处理
const methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'mark']
const { appLogLevel, dir } = baseInfo

module.exports = () => {
  const contextLogger = {}
  const appenders = {}

  appenders.cheese = {
    type: 'dateFile',
    filename: `${dir}/task`,
    pattern: '-yyyy-MM-dd.log',
    alwaysIncludePattern: true
  }

  // 环境变量为dev local development 认为是开发环境
  // if (env === 'dev' || env === 'local' || env === 'development') {
  //   appenders.out = {
  //     type: 'console' // 输出到控制台
  //   }
  // }

  log4js.configure({
    appenders,
    categories: { default: { appenders: ['cheese'], level: appLogLevel }}
  })
  const logger = log4js.getLogger('cheese')

  return async(ctx, next) => {
    // 循环methods将所有方法挂载到ctx 上
    methods.forEach((method, i) => {
      contextLogger[method] = (message) => {
        logger[method](message)
      }
    })
    ctx.log = contextLogger
    await next()
  }
}
