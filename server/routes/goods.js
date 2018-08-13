const router = require('koa-router')()
const GoodsController = require('../controllers/GoodsController.js')

// 批量添加商品
router.get('/batchAddGoods', async(ctx) => {
  await GoodsController.batchAddGoods(ctx)
})

// 批量添加商品一级分类
router.get('/batchAddCategory', async(ctx) => {
  await GoodsController.batchAddCategory(ctx)
})

// 批量添加商品二级分类
router.get('/batchAddCategorySub', async(ctx) => {
  await GoodsController.batchAddCategorySub(ctx)
})

module.exports = router
