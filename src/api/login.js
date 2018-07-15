import request from '@/utils/request'

/**
 * 后台登录
 * @param {String} username  账号
 * @param {String} password  密码
 */
export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/admin-users/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/admin-users/getUserInfo',
    method: 'post',
    params: { token }
  })
}

