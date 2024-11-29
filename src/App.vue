<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-18 13:07:49
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-29 10:43:35
 * @FilePath: \vueAgileFront\src\App.vue
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
-->
<template>
  <div :class="[isDarkMode ? 'dark' : 'light']">
    <div class="common-layout">
      <el-container>
        <el-header><navHeader /></el-header>
        <el-container>
          <el-aside width="200px">
            <el-menu :default-active="activeName" @select="handleSelect">
              <el-menu-item index="Project">
                <el-icon>
                  <setting />
                </el-icon>
                <span>Project</span>
              </el-menu-item>
              <el-menu-item index="Kanban">
                <el-icon><Edit /></el-icon>
                <span>Kanban</span>
              </el-menu-item>
              <el-menu-item index="Admin">
                <el-icon><HomeFilled /></el-icon>
                <span>Admin</span>
              </el-menu-item>
            </el-menu>
          </el-aside>
          <el-main>
            <component :is="activeComponent" />
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script>
import navHeader from '@/components/navHeader.vue'
import AdminPage from '@/components/views/AdminPage.vue'
import ProjectPage from '@/components/views/ProjectPage.vue'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue';

export default {
  components: {
    navHeader,
    AdminPage,
    ProjectPage,
    KanbanBoard,
  },
  data() {
    return {
      isDarkMode: localStorage.getItem('darkMode') === 'true', // 从 localStorage 获取初始模式
      activeName: 'Project',
      userRole: localStorage.getItem('userRole') || '',
    }
  },
  provide() {
    return {
      isDarkMode: this.isDarkMode,
      toggleDarkMode: this.toggleDarkMode,
    }
  },
  computed: {
    activeComponent() {
      switch (this.activeName) {
        case 'Admin':
          return 'AdminPage';
        case 'Project':
          return 'ProjectPage';
        case 'Kanban':
          return 'KanbanBoard';
        default:
          return 'AdminPage';
      }
    },
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
    handleSelect(key) {
      this.activeName = key
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

/* 夜间模式和日间模式下针对 el-menu 的样式 */
body.light .el-menu {
  background-color: #ffffff;
  color: #000;
}

body.dark .el-menu {
  background-color: #1e1e1e;
  color: #ffffff;
}

/* 菜单项的选中样式 */
body.light .el-menu-item.is-active {
  background-color: #f0f0f0;
}

body.dark .el-menu-item.is-active {
  background-color: #333333;
}

</style>
