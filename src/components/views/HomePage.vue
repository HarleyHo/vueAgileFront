<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-18 14:02:32
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-18 14:50:35
 * @FilePath: \vueAgileFront\src\components\views\HomePage.vue
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
-->
<template>
  <div class="container">
    <el-aside width="200px">
      <el-menu :default-active="activeName" class="el-menu-vertical-demo" @select="handleSelect">
        <el-menu-item index="About">
          <el-icon>
            <document />
          </el-icon>
          <span>About</span>
        </el-menu-item>
        <el-menu-item index="Project">
          <el-icon>
            <setting />
          </el-icon>
          <span>Project</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <component :is="activeComponent" />
    </el-main>
  </div>
</template>

<script>
import AboutPage from './AboutPage.vue'
import ProjectPage from './ProjectPage.vue'

export default {
  components: {
    AboutPage,
    ProjectPage,
  },
  data() {
    return {
      activeName: 'About',
    }
  },
  computed: {
    activeComponent() {
      return this.activeName === 'About' ? 'AboutPage' : 'ProjectPage'
    },
  },
  methods: {
    handleSelect(key) {
      this.activeName = key
    },
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
