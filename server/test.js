
const moment = require('moment') // 时间插件
console.log(moment.duration(moment() - moment(`2018-06-24T14:14:07.936Z`)).as(`days`))
