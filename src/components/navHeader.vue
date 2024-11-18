<template>
  <div :class="['nav-header', isDarkMode ? 'dark' : 'light']">
    <div class="title">Management System</div>
    <div class="auth-section">
      <template v-if="isLoggedIn">
        <span>{{ userName }} ({{ userRole === 0 ? '普通用户' : '管理员' }})</span>
        <el-button type="danger" @click="logout">Logout</el-button>
      </template>
      <template v-else>
        <el-button type="primary" @click="login">Login</el-button>
        <el-button type="success" @click="register">Register</el-button>
      </template>
      
      <el-switch
        v-model="isDarkMode"
        @change="toggleDarkMode"
        active-text="Night"
        inactive-text="Day"
      ></el-switch>

      <!-- 注册框 -->
      <el-dialog
        v-model="registerDialogVisible"
        title="Register"
        width="600"
        align-center
        :class="isDarkMode ? 'dark' : 'light'"
      >
        <el-form :model="registerForm" label-width="100px">
          <el-form-item label="Username" prop="userName">
            <el-input v-model="registerForm.userName" placeholder="Enter your username"></el-input>
          </el-form-item>
          <el-form-item label="Nickname" prop="userNickname">
            <el-input
              v-model="registerForm.userNickname"
              placeholder="Enter your nickname"
            ></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="userEmail">
            <el-input v-model="registerForm.userEmail" placeholder="Enter your email"></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="userPwd">
            <el-input
              v-model="registerForm.userPwd"
              placeholder="Enter your password"
              show-password
            ></el-input>
          </el-form-item>
          <div class="form-register" style="text-align: right">
            <el-button @click="registerDialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="registerDialogVisible = false"> Submit </el-button>
          </div>
        </el-form>
      </el-dialog>

      <!-- 注册框结束 -->

      <!-- 登录框 -->
      <el-dialog
        title="Login"
        width="400"
        align-center
        :class="isDarkMode ? 'dark' : 'light'"
        v-model="loginDialogVisible"
      >
        <el-form :model="loginForm" label-width="100px" @submit.native.prevent="submitLogin">
          <el-form-item label="Username" prop="userName">
            <el-input v-model="loginForm.userName" placeholder="Enter your username"></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="userPwd">
            <el-input
              v-model="loginForm.userPwd"
              placeholder="Enter your password"
              show-password
            ></el-input>
          </el-form-item>
          <div class="form-login" style="text-align: right">
            <el-button type="primary" @click="submitLogin">Login</el-button>
          </div>
        </el-form>
      </el-dialog>

      <!-- 登录框结束 -->
    </div>
  </div>
</template>

<script>
import { ElButton, ElSwitch } from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import axios from '@/axios.js'

export default {
  components: {
    ElButton,
    ElSwitch,
  },
  data() {
    return {
      isLoggedIn: false,
      userRole: '',
      isDarkMode: false, // 初始设置为日间模式
      registerDialogVisible: false,
      // 注册表单
      registerForm: {
        userName: '',
        userNickname: '',
        userEmail: '',
        userPwd: '',
      },
      // 登录表单
      loginForm: {
        userName: '',
        userPwd: '',
      },
      loginDialogVisible: false,
    }
  },
  methods: {
    login() {
      // show login dialog
      this.loginDialogVisible = true
    },
    async submitLogin() {
      try {
        const response = await axios.post('/auth/login', this.loginForm)
        console.log(response.data)
        const res = response.data.data
        if (response.data.state === 200) {
          // 将获取的token存储到localStorage中
          localStorage.setItem('token', res.token)
          // 设置登录状态为true
          this.isLoggedIn = true
          // 设置用户角色
          this.userRole = res.user.userRole
          // 设置用户名
          this.userName = res.user.userName
          // 关闭登录框
          this.loginDialogVisible = false
        } else {
          this.$message.error(response.data.msg)
        }
      } catch (error) {
        console.error(error)
      }
    },
    register() {
      // show register dialog
      // this.$message('Register feature is not available yet. Please check back later.')
      this.registerDialogVisible = true
    },
    logout() {
      // Implement logout logic
      this.isLoggedIn = false
      this.userRole = ''
      this.userName = ''
      localStorage.removeItem('token')
      this.$message.success('You have logged out successfully!')
    },
    toggleDarkMode() {
      if (this.isDarkMode) {
        document.body.classList.add('dark')
        document.body.classList.remove('light')
      } else {
        document.body.classList.add('light')
        document.body.classList.remove('dark')
      }
    },
  },
  mounted() {
    // 默认设置页面样式
    document.body.classList.add('light')
  },
}
</script>

<style scoped>
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  z-index: 1000;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 日间模式样式 */
.light {
  background-color: #f5f5f5;
  color: #000;
}

/* 夜间模式样式 */
.dark {
  background-color: #333;
  color: #fff;
}
</style>

<style>
/* 全局日间/夜间模式设置 */
body.light {
  background-color: #ffffff;
  color: #000;
}

body.dark {
  background-color: #121212;
  color: #fff;
}
</style>
