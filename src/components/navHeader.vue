<template>
  <div :class="['nav-header', isDarkMode ? 'dark' : 'light']">
    <div class="title">Management System</div>
    <div class="auth-section">
      <template v-if="isLoggedIn">
        <span>{{ userName }} ({{ userRole }})</span>
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
    </div>
  </div>
</template>

<script>
import { ElButton, ElSwitch } from 'element-plus'

export default {
  components: {
    ElButton,
    ElSwitch,
  },
  data() {
    return {
      isLoggedIn: false,
      userName: '',
      userRole: '',
      isDarkMode: false, // 初始设置为日间模式
    }
  },
  methods: {
    login() {
      // Implement login logic
      this.isLoggedIn = true
      this.userName = 'John Doe'
      this.userRole = 'Admin'
    },
    register() {
      // show register dialog
      this.$message('Register feature is not available yet. Please check back later.')
    },
    logout() {
      // Implement logout logic
      this.isLoggedIn = false
      this.userName = ''
      this.userRole = ''
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
