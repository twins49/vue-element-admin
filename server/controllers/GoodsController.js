/* eslint-disable */
const Koa = require('koa');
const app = new Koa();
const mongoose = require('mongoose');
const fs = require('fs')
const { errorHandle } = require('../utils/common.js');

class GoodsController
{
  // 批量添加商品
  async batchAddGoods(ctx) {
    fs.readFile('./server/dataJson/newGoods.json','utf8',(err,data)=>{
      if (err) console.log(err)
      data=JSON.parse(data)
      const GoodsModel = mongoose.model('Goods')
      data.map((value,index)=>{
          let newGoods = new GoodsModel(value)
          newGoods.save().then(()=>{
            console.log('添加成功')
          }).catch(error=>{
            errorHandle(ctx, error)
          })
      })
      ctx.body = {
        code: 200
      }
    })
  }

  // 批量添加商品一级分类
  async batchAddCategory(ctx) {
    fs.readFile('./server/dataJson/category.json','utf8',(err,data)=>{
      if (err){
        console.log(err);
        return;
      }
      data=JSON.parse(data)
      let saveCount=0
      const Category = mongoose.model('Category')
      data.RECORDS.map((value,index)=>{
          console.log(value)
          let newCategory = new Category(value)
          newCategory.save().then(()=>{
              saveCount++
              console.log('成功'+saveCount)
          }).catch(error=>{
               console.log('失败：'+error)
          })
      })
    })

    ctx.body= {
      code: 200
    }
  }

  // 批量导入商品二级分类
  async batchAddCategorySub(ctx) {
    fs.readFile('./server/dataJson/category_sub.json','utf8',(err,data)=>{
      if (err){
        console.log(err);
        return;
      }
      data = JSON.parse(data)
      let saveCount = 0
      const CategorySub = mongoose.model('CategorySub')
      data.RECORDS.map((value,index)=>{
          console.log(value)
          let newCategorySub = new CategorySub(value)
          newCategorySub.save().then(()=>{
              saveCount++
              console.log('成功插入'+saveCount)
          }).catch(error=>{
              console.log('插入失败:'+error)
          })
      })
    })

    ctx.body= '开始导入数据库'
  }
}

module.exports = new GoodsController();
