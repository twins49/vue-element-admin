const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ObjectId = Schema.Types.ObjectId

const bcrypt = require('bcrypt')

const SALT_WORK_FACTOR = 10 // 加密强度

// 定义Schema映射表字段类型
const userSchema = new Schema({
  UserId: { type: ObjectId }, // 主键
  name: { unique: true, type: String }, // 账号
  pwd: { type: String, default: '' }, // 密码
  createTime: { type: Date, default: Date.now() }, // 账号创建时间
  lastLogin: { type: Date, default: Date.now() }, // 最后登录时间
  token: { type: String, default: '' }, // token
  tokenTime: { type: Date, default: Date.now() }, // token 过期时间
  introduction: { type: String, default: '' }, // 账号介绍
  avatar: { type: String, default: '' }, // 头像
  roles: { type: Array, default: [] } // 账号权限
})

// 每次存储数据时都要执行（对密码加密)
/* eslint-disable */
userSchema.pre('save', function (next) {
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.pwd, salt, (err, hash) => {
      if (err) return next(err);
      this.pwd = hash;
      next();
    });
  });
});

// 自定义的mongoose方法
userSchema.methods = {
  //密码比对的方法
  comparePassword:(_password,password)=>{
      return new Promise((resolve,reject)=>{
          bcrypt.compare(_password,password,(err,isMatch)=>{
              if(!err) resolve(isMatch)
              else reject(err)
          })
      })
  }
}


// 发布模型
mongoose.model('User', userSchema, 'user');
