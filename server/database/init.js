const mongoose = require('mongoose');

const db = 'mongodb://localhost/shop';

const glob = require('glob');

const { resolve } = require('path');

// 导出所有的 schema 结构表
exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema/', '**/*.js')).forEach(require);
};

//
exports.connect = () => {
  let maxConnectTime = 0;
  // 连接数据库
  mongoose.connect(db); // 连接数据库

  return new Promise((resolve, reject) => {
    // 数据库断开连接
    mongoose.connection.on('disconnected', () => {
      console.log('***数据库断开连接*****');
      if (maxConnectTime < 3) {
        maxConnectTime += 1;
        mongoose.connect(db); // 重连数据库
      } else {
        reject();
        throw new Error('数据库出现问题，程序无法进行，请人为修理... ');
      }
    });

    // 数据库连接出错(重连次数不超过3)
    mongoose.connection.on('error', (err) => {
      console.log('***数据库连接出错*****');
      if (maxConnectTime < 3) {
        maxConnectTime += 1;
        mongoose.connect(db); // 重连数据库
      } else {
        reject(err);
        throw new Error('数据库出现问题，程序无法进行，请人为修理... ');
      }
    });

    // 数据库连接成功时(只一次)
    mongoose.connection.once('open', () => {
      console.log('Mongodb connect successfully');
      resolve(); // 记得一定要有这个
    });
  });
};
