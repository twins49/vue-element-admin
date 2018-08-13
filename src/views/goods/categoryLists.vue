<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter"
       style="width: 200px;" class="filter-item"
       placeholder="输入账号名" v-model="categoryLists.categoryName"
      >
      </el-input>
      <el-button class="filter-item" type="primary" v-waves
       icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;"
       @click="handleCreate" type="primary" icon="el-icon-edit">
       添加商品一级分类
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;"
       @click="handleCreateSub" type="primary" icon="el-icon-edit">
       添加商品二级分类
      </el-button>
    </div>
  </div>
</template>

<script>
  import waves from '@/directive/waves' // 水波纹指令
  import { batchAddCategory, batchAddCategorySub } from '@/api/goods'

  export default {
    name: 'categoryLists',
    directives: {
      waves
    },
    data() {
      return {
        categoryLists: {
          categoryName: ''
        }
      }
    },
    methods: {
      handleCreate() {
        batchAddCategory().then((res) => {
          this.$message('添加成功')
        })
      },
      handleCreateSub() {
        batchAddCategorySub().then((res) => {
          this.$message('添加成功')
        })
      },
      handleFilter() {
        alert('搜索')
      }
    }
  }
</script>

<style scoped>

</style>
