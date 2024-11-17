/*
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-17 22:46:40
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-18 02:49:03
 * @FilePath: \vueAgileFront\src\axios.js
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
 */
import axios from 'axios'

// 根据运行环境动态设置 baseURL
const isWebview = window.location.origin.startsWith('vscode-webview://')
const baseURL = isWebview ? 'http://localhost:8080' : '/api'

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许携带cookie
  timeout: 10000, // 请求超时时间
})

export default instance
