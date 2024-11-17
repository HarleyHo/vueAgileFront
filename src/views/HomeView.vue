<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-17 20:07:50
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-17 21:02:57
 * @FilePath: \vueAgileFront\src\views\HomeView.vue
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
-->
<template>
  <div id="home">
    <el-main>
      <el-row>
        <el-col :span="24">
          <h1>Welcome to HomeView</h1>
          <p>This is the home view of the application.</p>
        </el-col>
      </el-row>
    </el-main>
    <!-- Other content for HomeView -->
  </div>
</template>

<script>
import navHeader from '@/components/navHeader.vue'

export default {
  name: 'HomeView',
  components: {
    navHeader,
  },
}
</script>

<style scoped>
/* Add your styles here */
</style>
