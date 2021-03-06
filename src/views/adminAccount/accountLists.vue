<template>
  <div class="app-container calendar-list-container">
    <!-- 搜索栏 -->
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter"
       style="width: 200px;" class="filter-item"
       placeholder="输入账号名" v-model="listQuery.name"
      >
      </el-input>
      <el-button class="filter-item" type="primary" v-waves
       icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;"
       @click="handleCreate" type="primary" icon="el-icon-edit">
       添加账号
      </el-button>
      <!-- 账号列表 -->
      <el-table :key='tableKey' :data="lists" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 1204px">
        <el-table-column align="center" label="账号名称" width="150">
          <template slot-scope="scope">
            {{scope.row.name}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="账号权限" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.authority === 'admin'">管理员</span>
            <span v-if="scope.row.authority === 'editor'">编辑员</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" width="200">
          <template slot-scope="scope">
            {{scope.row.createTime}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="最后登录时间" width="200">
          <template slot-scope="scope">
            {{scope.row.lastLogin}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="账号状态" width="200">
          <template slot-scope="scope">
             <el-button v-if='scope.row.status=== "禁止"' type="info">禁止</el-button>
             <el-button v-if='scope.row.status=== "可用"' type="primary">可用</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注" width="150">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.introduction" placement="left">
              <el-button>查看</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="200">
          <template slot-scope="scope">
            <el-button @click="handleUpdate(scope.row)" type="primary" size="small">编辑</el-button>
            <!-- <el-button type="danger" size="small" @click="deleteAccount(scope.row)" >删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加账号弹起来的对话框 -->
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :rules="rules" ref="dataForm" :model="addAccout" label-position="left" label-width="85px" style='width: 400px; margin-left:50px;'>
          <el-form-item label="账号名称:" prop="name">
            <el-input v-model="addAccout.name"></el-input>
          </el-form-item>
          <el-form-item label="账号密码:" prop="password">
            <el-input type='password' v-model="addAccout.password"></el-input>
          </el-form-item>
          <el-form-item label="账号权限" prop="authority">
            <el-select v-model="addAccout.authority"  placeholder="请选择账号权限">
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="编辑" value="editor"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop='status'>
            <el-select v-model="addAccout.status"  placeholder="请选择状态">
              <el-option label="可用" value="可用"></el-option>
              <el-option label="禁止" value="禁止"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="邮箱" prop='email'>
            <el-input type="email" v-model="addAccout.email"></el-input>
          </el-form-item>
          <el-form-item label="介绍">
            <el-input type="textarea" v-model="addAccout.introduction"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
          <el-button v-else type="primary" @click="updateData">确定</el-button>
        </div>
      </el-dialog>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="listQuery.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import waves from '@/directive/waves' // 水波纹指令
  import { register, getLists, updated, searchAccout, deleteAccount } from '@/api/adminUser'

  export default {
    name: 'accountLists',
    directives: {
      waves
    },
    data() {
      // 自定义检验方式
      const checkEmail = (rule, value, callback) => {
        const reg = new RegExp('^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$') // 正则表达式
        if (!value) {
          return callback(new Error('请填写邮箱'))
        }
        if (!reg.test(value)) { // 正则验证不通过，格式不对
          return callback(new Error('邮箱格式不正确'))
        }
        callback()
      }
      return {
        listQuery: {
          page: 1, // 当前页码
          pre_page: 20, // 每次拿20条
          total: 0 // 分页总数
        },
        tableKey: 0,
        listLoading: true,
        lists: [], // 账户列表
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        addAccout: {
          name: '',
          password: '',
          roles: '',
          authority: 'editor',
          email: '',
          status: ''
        },
        rules: {
          name: [{ required: true, message: '账号必须填写', trigger: 'change' }],
          password: [{ required: true, message: '密码必须填写', trigger: 'change' }],
          authority: [{ required: true, message: '请选择权限', trigger: 'change' }],
          status: [{ required: true, message: '请选择账号状态', trigger: 'change' }],
          email: [{ require: true, validator: checkEmail, trigger: 'change' }]
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 获取账号列表
      getList() {
        this.listLoading = true
        const params = {
          page: this.listQuery.page,
          pre_page: this.listQuery.pre_page
        }
        getLists(params)
          .then((res) => {
            this.lists = res.data
            this.listQuery.page = res.pageContent.page
            this.listQuery.total = res.pageContent.total
            this.listQuery.pre_page = res.pageContent.pre_page
            this.listLoading = false
          })
          .catch(() => {
            this.$message.error('获取账号列表失败')
          })
      },
      // 账号搜素
      handleFilter() {
        const params = {
          page: 1,
          pre_page: this.listQuery.pre_page,
          name: this.listQuery.name
        }
        searchAccout(params)
          .then((res) => {
            const { code, data } = res
            if (code === 200) {
              this.lists = data
            }
          })
          .catch((err) => {
            this.$message.error(err)
          })
      },
      // 添加账号
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        Object.keys(this.addAccout).forEach((key) => {
          this.addAccout[key] = ''
        })
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate() // 清除验证
        })
      },
      // 编辑功能
      handleUpdate(row) {
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        Object.assign(this.addAccout, row) // 导入要编辑的资料
        console.log(this.addAccout)
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate() // 清除验证
        })
      },
      // 添加账号功能处理
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.addAccout.roles = this.formatRoles(this.addAccout.authority)
            console.log('data', this.addAccout)
            // 注册账号信息
            register(this.addAccout)
              .then((res) => {
                this.$message({
                  showClose: true,
                  message: '注册成功',
                  type: 'success'
                })
                // 关闭对话框
                this.dialogFormVisible = false
                location.reload()
              })
              .catch(() => {
                this.$message.error('注册失败')
              })
          }
        })
      },
      // 编辑账号功能处理
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.addAccout.roles = this.formatRoles(this.addAccout.authority)
            // 更新账号信息
            updated(this.addAccout)
              .then((res) => {
                this.$message({
                  showClose: true,
                  message: '更新账号信息成功',
                  type: 'success'
                })
                // 关闭对话框
                this.dialogFormVisible = false
                location.reload()
              })
              .catch(() => {
                this.dialogFormVisible = false
                this.$message.error('更新失败')
                this.$nextTick(() => {
                  this.$refs['dataForm'].clearValidate() // 清除验证
                })
              })
          }
        })
      },
      // 账号删除
      deleteAccount(row) {
        deleteAccount({ name: row.name }).then((res) => {
          console.log(res)
        })
      },
      formatRoles(roles) {
        return [roles]
      }
    }
  }
</script>

<style scoped lang='scss'>

</style>
