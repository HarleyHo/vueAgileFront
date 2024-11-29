<template>
  <div class="project-management">
    <div v-if="selectedProjectId">
      <h2>Selected Project: {{ getSelectedProjectName() }}</h2>
    </div>
    <el-row :gutter="20">
      <el-col :span="8" v-for="project in projects" :key="project.projectId">
        <el-card
          shadow="hover"
          class="project-card"
          @click="selectProject(project.projectId)"
        >
          <div>
            <h3>{{ project.projectName }}</h3>
            <!-- <p><strong>PM ID:</strong> {{ project.projectPmId }}</p> -->
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
import axios from "@/axios.js";
import { ElMessage } from "element-plus";

export default {
  name: "ProjectManagement",
  data() {
    return {
      projects: [], // 存储项目数据
      selectedProjectId: "", // 选中的项目 ID
    };
  },
  methods: {
    // 获取项目数据
    async fetchProjects() {
      try {
        const response = await axios.get("/project", {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        if (response.data.state === 200) {
          this.projects = response.data.data.projects;

          // 默认选择第一个项目
          if (this.projects.length > 0) {
            this.selectedProjectId = this.projects[0].projectId;
            localStorage.setItem("selectedProjectId", this.selectedProjectId);
          }
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
    // 根据项目 ID 获取项目名称
    getSelectedProjectName() {
      const project = this.projects.find(
        (project) => project.projectId === this.selectedProjectId
      );
      return project ? project.projectName : "";
    },
    // 选择项目并更新状态
    selectProject(projectId) {
      this.selectedProjectId = projectId;
      localStorage.setItem("selectedProjectId", projectId);
      // this.$message({
      //   message: "Selected project with ID: " + projectId,
      //   type: "success",
      // });
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
