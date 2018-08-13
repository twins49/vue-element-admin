import request from '@/utils/request'
/**
 *  批量添加商品
 */
export function batchAddGoods() {
  return request({
    url: '/goods/batchAddGoods',
    method: 'get'
  })
}

/**
 * 批量添加商品一级分类
 */
export function batchAddCategory() {
  return request({
    url: '/goods/batchAddCategory',
    method: 'get'
  })
}

/**
 * 批量添加商品二级分类
 */
export function batchAddCategorySub() {
  return request({
    url: '/goods/batchAddCategorySub',
    method: 'get'
  })
}
