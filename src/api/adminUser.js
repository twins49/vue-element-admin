import request from '@/utils/request'

/**
 *  注册账号
 * @param {*} params
 */
export function register(params) {
  return request({
    url: '/admin-users/register',
    method: 'post',
    data: params
  })
}

// 获取账号列表
export function getLists(params) {
  return request({
    url: '/admin-users/accountLists',
    method: 'post',
    data: params
  })
}

// 更新资料
export function updated(params) {
  return request({
    url: '/admin-users/accountUpdated',
    method: 'post',
    data: params
  })
}

export function searchAccout(params) {
  return request({
    url: '/admin-users/searchAccout',
    method: 'get',
    params
  })
}
