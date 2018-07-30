/* eslint-disable */
const Koa = require('koa');
const app = new Koa();
const mongoose = require('mongoose');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { guid } = require('../utils/string.js');
const { errorHandle } = require('../utils/common.js');
const gravatar = require('gravatar'); // 头像插件
const jwt = require('jsonwebtoken'); // Token插件
const keys = require('../config/keys.js'); // 配置文件


/**
 * 用户管理类集合（含 后台注册、后台登录、后台账号列表）
 * @author yoyo
 * @class UserController
 */
class UserController
{
  // 后台用户注册
  adminRegister(ctx) {
    const UserModel = mongoose.model('User');
    const params = {
      name: ctx.request.body.name,
      pwd: ctx.request.body.password,
      roles: ctx.request.body.roles,
      introduction: ctx.request.body.introduction,
      email: ctx.request.body.email,
      status: ctx.request.body.status,
      avatar:gravatar.url(ctx.request.body.email, {s: '200', r: 'pg', d: 'mm'})
    }
    const newUser = new UserModel(params);
      newUser.save()
        .then(
          ctx.body = {
            code:200,
            message:'注册成功'
          }
        )
        .catch((err)=> {
            errorHandle(ctx, err)
        })
  }

  // 用户登录
  async adminlogin(ctx) {
    const param = ctx.request.body;
    const UserModel = mongoose.model('User');
    await UserModel.findOne({name:param.username}, { pwd:1, id:1, name:1, token:1 }).exec()
      .then(async (user) => {
        if (!user) {
          ctx.body = {
            code: 500,
            message: '用户不存在'
          }
        }
      // 用bcrypt的比较方法来验证密码
      const pwdMatchFlag = bcrypt.compareSync(param.password, user.pwd);
      if (pwdMatchFlag) {
        //TODO:: 加密规则, 加密名字, 过期时间, (箭头函数)
        const token = jwt.sign({ id:user.id, name:user.name }, keys.jwtKey, {expiresIn: keys.tokenExpires})
        ctx.body = {
          code: 200,
          data: {
            // token: 'Bearer ' + token // Bearer是固定搭配
            token
          }
        }
      } else {
        ctx.body = {
          code:500,
          message:'账号或者密码错误'
        }
      }
    })
    .catch((err)=> {
      errorHandle(ctx, err)
    })

  }

  // 后台账号列表
  async adminAccountLists(ctx) {
    let newArr = []; // 过滤后数组
    let result = {}; // 返回前端结果
    const UserModel = mongoose.model('User');
    // 页码条件
    let {page, pre_page} = ctx.request.body
    const params = {
      page: (parseInt(page) - 1) || 0,
      pre_page: parseInt(pre_page) || 5,
    };
    // 使用分页查询方法查询出结果
    const users = await this._pageQuery(UserModel, params, {});
    // 处理数据
    for (let i = 0; i < users.dataList.length; i++) {
      newArr.push({
        roles: this._authorityForMat(users.dataList[i]['roles']),
        createTime: moment( users.dataList[i]['createTime']).format('YYYY-MM-DD HH:mm:ss'),
        lastLogin: moment( users.dataList[i]['lastLogin']).format('YYYY-MM-DD HH:mm:ss'),
        name:  users.dataList[i]['name'],
        introduction: users.dataList[i]['introduction'],
        password: users.dataList[i]['pwd'],
        email: users.dataList[i]['email'],
        avatar: users.dataList[i]['avatar']
      });
    }
    result = {
      code:200,
      message:'获取账号列表成功',
      data:newArr,
      pageContent: users.pageContent,
    }
    ctx.body = result;
  }

  // 用户退出
  async logout() {
    // await ……
  }

  // 获取用户信息，权限、头像、账号名
  async adminGetUserInfo(ctx) {
    const UserModel = mongoose.model('User');
    const params = ctx.query; // get
    const token = ctx.header.authorization  // 获取jwt
    let payload = await this.tokenVerify(token, keys.jwtKey);
    if (payload.id) {
        await UserModel.findOne({ _id: payload.id }, { roles:1, name:1, avatar:1, introduction:1})
        .exec().then(async (result) => {
            ctx.body = {
              code: 200,
              message: '获取信息成功',
              data: {
                roles: result.roles,
                name: result.name,
                avatar: result.avatar,
              }
            }
        })
        .catch((err) => {
          errorHandle(ctx, err)
        })
    } else {
      ctx.body = {
        message: 'token 错误',
        code: 50008
      }
    }
  }

  // 更新用户资料
  async accountUpdated(ctx) {
    const param = ctx.request.body; // 拿到前端post过来的
    const UserModel = mongoose.model('User');
    UserModel.update({name:param.name},
      {password: param.password, roles: param.roles, introduction: param.introduction}
    ).exec()
      .then(
        ctx.body = {
        code:200,
        message:'更新成功',
      }
    )
    .catch((err) => {
      ctx.body = err;
    })
  }

  // 删除用户
  async deluser() {
    // await ……
  }

  // 重置密码
  async resetpwd() {
    // await ……
  }

  // 查询账号
  async searchAccout(ctx) {
    const params = ctx.query; // get
    const UserModel = mongoose.model('User');
    const reg = new RegExp(params.name, 'i') //不区分大小写
    const newArr = [];
    const pageSet = {
      page: (parseInt(params.page) - 1) || 0,
      pre_page: parseInt(params.pre_page) || 5,
    };
    // 使用分页查询方法查询出结果
    const users = await this._pageQuery(UserModel, pageSet, {'name': {$regex : reg}});
      // 处理数据
      for (let i = 0; i < users.dataList.length; i++) {
        newArr.push({
          roles: this._authorityForMat(users.dataList[i]['roles']),
          createTime: moment( users.dataList[i]['createTime']).format('YYYY-MM-DD HH:mm:ss'),
          lastLogin: moment( users.dataList[i]['lastLogin']).format('YYYY-MM-DD HH:mm:ss'),
          name:  users.dataList[i]['name'],
          introduction: users.dataList[i]['introduction'],
          password: users.dataList[i]['pwd'],
          email: users.dataList[i]['email'],
          avatar: users.dataList[i]['avatar']
        });
      }
      ctx.body = {
        code: 200,
        message: '查询成功',
        data:newArr
      }
  }

  _authorityForMat(authority) {
    switch (authority[0]) {
      case 'admin':
        return '超级管理员';
        break;
      case 'editor':
        return '编辑';
        break;
    }
  }

  async _pageQuery(model, pageSet, queryParams={}) {
    let num = 0;
    let result = {};
    // 获取总记录数
    await model.count(queryParams).exec().then((count)=> {
      num = count;
    })
    .catch((err)=> {
      console.log(err);
    });

    // 查询记录
    await model.find(queryParams).sort({'_id': -1}).skip(pageSet.page * pageSet.pre_page).limit(pageSet.pre_page)
    .exec().then((respone) => {
      result = {
        pageContent:{
          page: pageSet.page +1,
          pre_page: pageSet.pre_page,
          total: num,
        },
        dataList: respone
      }
    })
    .catch((err)=> {
      errorHandle(ctx, err)
    })
    return result;
  }

  /**
   *  解密jwt Token
   * @param {String} Token 需要对比的时间戳
   * @param {String} key  jwt需要解密的token名字
   * @return {Object} 解密后的token
   * { id: '5b2fa706cc0af413cce2d8de',
      name: 'twins49',
      iat: 1532584489,
      exp: 1532588089 }
   */
  async tokenVerify(token, jwtKey) {
    const verify = require('util').promisify(jwt.verify) // 解密工具
    if (token && jwtKey) {
      const payload = await verify(token.split(' ')[1], keys.jwtKey)
      const nowDate = Math.floor(new Date() / 1000)
      return  payload.exp - nowDate > 0 ? payload : false
    }
    return  false;
  }
}
module.exports = new UserController();
