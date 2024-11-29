/*
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-17 22:46:40
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-29 10:14:56
 * @FilePath: \vueAgileFront\src\axios.js
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
 */
import axios from 'axios'

// 根据运行环境动态设置 baseURL
const isWebview = window.location.origin.startsWith('vscode-webview://')
const baseURL = isWebview ? 'http://localhost:8080' : '/api'
// 请求拦截器
axios.interceptors.request.use(
  config => {
    if (!config.url.startsWith('/auth/')) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = token
      } else {
        alert('请登录')
        return Promise.reject('请登录')
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
const instance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许携带cookie
  timeout: 10000, // 请求超时时间
})

export default instance
