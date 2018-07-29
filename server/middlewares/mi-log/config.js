/**
 * 日志中间件,默认公用参数对象
 */
module.exports = {
  baseInfo: {
    appLogLevel: 'debug', // 指定记录的日志级别
    dir: 'logs',		// 指定日志存放的目录名
    env: 'dev', // 指定当前环境，当为开发环境时，在控制台也输出，方便调试
    projectName: 'DVAShop' // 项目名，记录在日志中的项目信息
  }
}
