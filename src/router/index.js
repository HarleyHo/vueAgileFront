/*
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-10 20:19:16
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-17 19:48:53
 * @FilePath: \vueAgileFront\src\router\index.js
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/AboutView.vue'),
    },
  ],
})

export default router
