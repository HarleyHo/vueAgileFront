<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-18 14:14:52
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-29 10:09:47
 * @FilePath: \vueAgileFront\src\components\views\ProjectPage.vue
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
-->
<template>
  <div class="project-management">
    <el-row :gutter="20">
      <el-col :span="8" v-for="project in projects" :key="project.projectId">
        <el-card
          shadow="hover"
          class="project-card"
          @click="goToDetail(project.projectId)"
        >
          <div>
            <h3>{{ project.projectName }}</h3>
            <p><strong>PM ID:</strong> {{ project.projectPmId }}</p>
            <p><strong>Description:</strong> {{ project.projectDesc }}</p>
            <p><strong>Start:</strong> {{ project.projectStartTime }}</p>
            <p><strong>End:</strong> {{ project.projectEndTime }}</p>
            <p>
              <strong>Status:</strong>
              <el-tag :type="getStatusType(project.projectStatus)">
                {{ getStatusText(project.projectStatus) }}
              </el-tag>
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "ProjectManagement",
  data() {
    return {
      projects: [], // 存储项目数据
    };
  },
  methods: {
    // 获取项目数据
    async fetchProjects() {
      try {
        const response = await axios.get("/api/project");
        if (response.data.state === 200) {
          this.projects = response.data.data.projects;
        } else {
          ElMessage.error("Failed to fetch projects");
        }
      } catch (error) {
        ElMessage.error("Error fetching projects: " + error.message);
      }
    },
    // 根据项目状态返回标签文本
    getStatusText(status) {
      return status === 1 ? "Active" : "Inactive";
    },
    // 根据项目状态返回标签类型
    getStatusType(status) {
      return status === 1 ? "success" : "warning";
    },
    // 跳转到详情页
    goToDetail(projectId) {
      this.$router.push({ name: "ProjectDetail", params: { id: projectId } });
    },
  },
  mounted() {
    this.fetchProjects();
  },
};
</script>

<style scoped>
.project-management {
  padding: 20px;
}
.project-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.project-card:hover {
  transform: scale(1.05);
}
</style>
