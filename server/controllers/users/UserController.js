/* eslint-disable */
const Koa = require('koa');
const app = new Koa();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { guid } = require('../../utils/string.js');
const moment = require('moment'); // 时间插件
const gravatar = require('gravatar'); // 头像插件
const jwt = require('jsonwebtoken'); // Token插件
const keys = require('../../config/keys.js'); // 配置文件

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
          ctx.body = {
            code:500,
            message:err
          }
      })
  }

  // 用户登录
  async adminlogin(ctx) {
    const param = ctx.request.body;
    const UserModel = mongoose.model('User');
    await UserModel.findOne({name:param.username}, { pwd:1, id:1, name:1 }).exec()
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
        // const token = guid();
        // if (!user.token) { // 制造token
        //   UserModel.update({name:param.username}, {token: token, tokenTime: Date.now()}).exec().then(
        //      ctx.body = {
        //       code:200,
        //       message:'登录成功',
        //       data: {
        //         token,
        //       }
        //     }
        //   ).catch((err)=> {
        //     console.log(err)
        //   })
        // } else { // 验证token是否过期
        //   if (this._isTokenTimeOut(user.tokenTime)) { // 过期
        //     UserModel.update({name:param.username}, {token: token, tokenTime: Date.now()}).exec().then(
        //       ctx.body = {
        //        code:200,
        //        message:'登录成功',
        //        data: {
        //          token,
        //        }
        //      }
        //     ).catch((err)=> {
        //       console.log(err)
        //     })
        //   } else { // 没过期
        //     console.log('没过期',  user.token)
        //     ctx.body = {
        //       code:200,
        //       message:'登录成功',
        //       data: {
        //         token: user.token,
        //       }
        //     }
        //   }
        // }
        //TODO:: 加密规则, 加密名字, 过期时间, 箭头函数
        const token = jwt.sign({ id:user.id, name:user.name }, keys.jwtKey, {expiresIn: keys.tokenExpires})
        ctx.body = {
          code: 200,
          token
        }
      } else {
        ctx.body = {
          code:500,
          message:'账号或者密码错误'
        }
      }
    })
    .catch((err)=> {
      ctx.body = {
        code:500,
        message:'账号或者密码错误'
      }
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
    await UserModel.findOne({token: params.token}, { roles:1, name:1, avatar:1, introduction:1, tokenTime: 1 })
            .exec().then(async (result) => {
              // TODO:: 判断token过期没
              if (this._isTokenTimeOut(result.tokenTime)) {
                ctx.body = {
                  code: 204,
                  message: 'token过期,请重新登录',
                }
              } else {
                ctx.body = {
                  code: 200,
                  message: '获取信息成功',
                  data: {
                    roles: result.roles,
                    name: result.name,
                    avatar: result.avatar,
                  }
                }
              }
            })
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
      num = err;
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
      console.log(err);
    })
    return result;
  }

  /**
   * 判断token是否过期
   * @param {String} Time 需要对比的时间戳
   * @return {Boolean} 是否过期
   */
    _isTokenTimeOut(Time) {
      console.log(moment.duration(moment() - moment(Time)).as(`days`));
      return moment.duration(moment() - moment(Time)).as(`days`) >= 7;
  }
}
module.exports = new UserController();
