<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-10 20:19:16
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-17 20:39:17
 * @FilePath: \vueAgileFront\src\App.vue
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
-->
<template>
  <div :class="[isDarkMode ? 'dark' : 'light']">
    <el-header><navHeader /></el-header>
    <!-- 导航栏 -->

    <el-main>
      <router-view />
    </el-main>
    <!-- 渲染路由页面 -->
  </div>
</template>

<script>
import navHeader from '@/components/navHeader.vue'
export default {
  components: {
    navHeader,
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true', // 从 localStorage 获取初始模式
    }
  },
  provide() {
    return {
      isDarkMode: this.isDarkMode,
      toggleDarkMode: this.toggleDarkMode,
    }
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode) // 更新 localStorage

      // 更新 body 类名
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
    // 设置初始 body 类名
    if (this.isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.add('light')
    }
  },
}
</script>

<style>
/* 全局日间/夜间模式样式 */
body.light {
  background-color: #ffffff;
  color: #000;
}

body.dark {
  background-color: #121212;
  color: #fff;
}
</style>
