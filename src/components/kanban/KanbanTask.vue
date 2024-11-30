<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-09 16:42:27
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-09 16:42:35
 * @FilePath: \vsAgileFront\src\webview\components\KanbanTask.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by yiguo, All Rights Reserved. 
-->
<template>
  <el-card :class="taskClass" shadow="hover" class="kanban-task">
    <!-- delete task button -->
    <el-button 
      type="danger"
      size="default"
      circle
      class="delete-button"
      @click="deleteTask"
      text
    >
      <el-icon><Close /></el-icon>
    </el-button>
    

    <template #header>
      <!-- title display -->
      <div class="card-header">
        <!-- edit mode -->
        <div v-if="isEditing" class="title-edit-mode">
          <el-input
            v-model="editingTitle"
            placeholder="Input Task Title"
            class="task-title-input"
            ref="titleInput"
          />
          <el-button
            type="danger"
            size="small"
            @click="clearTitle"
            text
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <!-- display mode -->
        <div v-else class="title-display-mode">
          <span class="task-title">{{ task.title }}</span>
        </div>
      </div>
    </template>
    

    <div class="card-body">
      <div class="description-container">
        <!-- 编辑模式 -->
        <div v-if="isEditing" class="description-edit-mode">
          <el-input
            type="textarea"
            v-model="taskDescription"
            :rows="3"
            resize="none"
            placeholder="请输入任务描述"
          />
          <el-button
            type="danger"
            size="small"
            @click="clearDescription"
            text
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        
        <!-- 显示模式 -->
        <div v-else class="description-display-mode">
          <div v-if="task.taskDesc" class="description-content">
            {{ task.taskDesc }}
          </div>
          <div v-else class="description-placeholder">
            点击编辑按钮添加描述
          </div>
        </div>
      </div>

      <!-- 总编辑按钮区域 -->
      <div class="edit-controls">
        <template v-if="isEditing">
          <el-button
            type="success"
            size="small"
            @click="saveAll"
          >
            保存
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="cancelEdit"
          >
            取消
          </el-button>
        </template>
        <template v-else>
          <el-button
            type="primary"
            size="small"
            @click="startEdit"
          >
            编辑
          </el-button>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="card-footer">
        <div class="footer-icons">
          <!-- priority dropdown -->
          <el-dropdown 
            v-model="task.priority"
            trigger="click"
            @command="handlepriorityChange"
            ref="priorityDropdown"
          >
            <el-icon :class="priorityIconClass"><Flag /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="">
                  <span class="priority-option">●</span> default
                </el-dropdown-item>
                <el-dropdown-item command="normal">
                  <span class="priority-option priority-option--normal">●</span> normal
                </el-dropdown-item>
                <el-dropdown-item command="warning">
                  <span class="priority-option priority-option--warning">●</span> warning
                </el-dropdown-item>
                <el-dropdown-item command="danger">
                  <span class="priority-option priority-option--danger">●</span> danger
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- assignee dropdown -->
          <el-dropdown
            trigger="click"
            @command="handleAssigneeChange"
            class="assignee-trigger"
          >
            <div class="assignee-trigger">
              <el-icon><User /></el-icon>
              <span class="assignee-name">
                {{ assigneeName || '未分配' }}
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="">
                  <div class="assignee-item">
                    <span>未分配</span>
                  </div>
                </el-dropdown-item>
                
                <el-dropdown-item 
                  v-for="user in availableUsers" 
                  :key="user.userId" 
                  :command="user.userId"
                >
                  <div class="assignee-item">
                    <span>{{ user.userNickname || user.userName }}</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>  

        <!-- due time picker -->
        <div class="date-picker">
          <el-date-picker
            v-model="task.duetime"
            type="datetime"
            placeholder="Set Due Time"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :shortcuts="dateShortcuts"
            @change="handleDuetimeChange"
          />
        </div>
      </div>
    </template>
  </el-card>
</template>

<script>
import { Close, Flag, Delete, Plus, Edit, CircleCheck, CircleClose, User, Check } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import axios from "@/axios.js";

export default {
  components: {
    Close,
    Flag,
    Delete,
    Plus,
    Edit,
    CircleCheck,
    CircleClose,
    User,
    Check
  },
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data() {
    // date shortcuts
    return {
      dateShortcuts: [
        {
          text: 'Today',
          value: new Date()
        },
        {
          text: 'Tomorrow',
          value: () => {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            return date
          }
        },
        {
          text: 'One Week Later',
          value: () => {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
            return date
          }
        }
      ],
      // available users table
      availableUsers: [],
      isEditing: false,
      editingTitle: '',
      taskDescription: '',
      originalTitle: '',
      originalDescription: '',
      userList: [], // 存储原始用户数据
    }
  },
  async created() {
    await this.fetchUsers()
  },
  computed: {
    // task class choice
    taskClass() {
      return {
        'kanban-task': true,
        'kanban-task--normal': this.task.priority === 'normal',
        'kanban-task--warning': this.task.priority === 'warning',
        'kanban-task--danger': this.task.priority === 'danger'
      }
    },
    // priority class choice
    priorityIconClass() {
      return {
        'priority-icon': true,
        'priority-icon--normal': this.task.priority === 'normal',
        'priority-icon--warning': this.task.priority === 'warning',
        'priority-icon--danger': this.task.priority === 'danger'
      }
    },
    // content format check
    formattedContent() {
      return this.task.content.replace(
        /\[(.*?)\]/g,
        '<a href="#" data-link="$1">$1</a>'
      );
    },
    // assigned users
    assignedUsers() {
      if (!this.task.assignees?.length) return [];
      // 从 availableUsers 中获取完整的用户信息
      const assignedUser = this.availableUsers.find(u => u.id === this.task.assignees[0].id);
      return assignedUser ? [assignedUser] : [];
    },
    // unassigned users
    unassignedUsers() {
      if (!this.task.assignees) return this.availableUsers
      return this.availableUsers.filter(user => 
        !this.task.assignees.some(assigned => assigned.id === user.id)
      )
    },
    // description change detector
    isDescriptionChanged() {
      return this.taskDescription !== this.originalDescription
    },
    // 修改计算属性
    availableUsers() {
      return this.userList.filter(user => user.userRole === 0);
    },
    
    assigneeName() {
      if (!this.task.assignees?.[0]?.id) return null;
      const assignedUser = this.userList.find(
        user => user.userId === this.task.assignees[0].id
      );
      return assignedUser ? (assignedUser.userNickname || assignedUser.userName) : null;
    }
  },
  methods: {
    handlepriorityChange(type) {
      this.task.priority = type;
      this.emitSaveTask();
    },
    handleLinkClick() {
      this.$refs.datePicker.focus()
    },
    handleDuetimeChange() {
      this.emitSaveTask();
    },
    // normalize the date format
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    handleAssigneeChange(userId) {
      if (!userId) {
        // 选择未分配
        this.task.assignees = [];
      } else {
        // 选择特定用户
        this.task.assignees = [{ id: userId }];
      }
      this.emitSaveTask();
    },
    startEdit() {
      this.isEditing = true;
      this.editingTitle = this.task.title;
      this.taskDescription = this.task.taskDesc || '';
      this.originalTitle = this.task.title;
      this.originalDescription = this.task.taskDesc || '';
    },
    saveAll() {
      if (this.editingTitle.trim()) {
        this.task.title = this.editingTitle.trim();
        this.task.taskDesc = this.taskDescription;
        this.isEditing = false;
        this.emitSaveTask();
      }
    },
    cancelEdit() {
      this.editingTitle = this.originalTitle;
      this.taskDescription = this.originalDescription;
      this.isEditing = false;
    },
    clearTitle() {
      this.editingTitle = '';
    },
    clearDescription() {
      this.taskDescription = '';
    },
    async fetchUsers() {
      try {
        const response = await axios.get('/user/getAllUsers', {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        if (response.data.data) {
          this.userList = response.data.data;
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
        ElMessage.error('获取用户列表失败');
      }
    },
    emitSaveTask() {
      const updatedTask = {
        ...this.task,
        title: this.task.title,
        taskDesc: this.task.taskDesc,
        priority: this.task.priority,
        duetime: this.task.duetime,
        assignees: this.task.assignees,
        status: this.task.status
      };
      this.$emit('save', updatedTask);
    },
    deleteTask() {
      this.$confirm('确认删除该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', this.task.id);
      }).catch(() => {
        // 取消删除操作
      });
    }
  },
  mounted() {
    if (this.task.isNew) {
      this.startEdit();
    }
  },
  beforeDestroy() {
    this.removeClickOutsideListener()
  }
};
</script>

<style scoped>
/* card base style */
.kanban-task { margin: 10px 0; padding: 15px; border-radius: 8px; position: relative; }
.kanban-task :deep(.el-card__header) { padding: 2px 10px; }
.kanban-task--danger { border-left: 8px solid #F56C6C; }
.kanban-task--warning { border-left: 8px solid #E6A23C; }
.kanban-task--normal { border-left: 8px solid #67C23A; }

/* card header, content, footer */
.card-header { display: flex; justify-content: space-between; align-items: center;}
.card-content { display: flex; flex-direction: column; gap: 15px; padding: 10px 0; }
.card-footer { display: flex; justify-content: space-between; flex-direction: column; gap: 8px; align-items: center; }

/* task title input */
.task-title { font-size: 16px; color: var(--el-text-color-primary); flex: 1; margin-right: 10px; }
.task-title-input { width: 100%; }
.task-title-input :deep(.el-input__wrapper) { box-shadow: none !important; border-radius: 0; border: none; padding-left: 0; background-color: transparent;}
.task-title-input :deep(.el-input__wrapper):hover,
.task-title-input :deep(.el-input__wrapper.is-focus) { border: none; box-shadow: none; }
.title-display-mode { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 5px 0; }
.title-edit-mode { position: relative; width: 100%; }
.title-edit-mode .el-button { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); }

/* delete task button */
.delete-button { position: absolute; top: 8px; right: 8px; z-index: 1; transition: all 0.3s; }
.delete-button :deep(.el-icon) { font-size: 16px; color: #909399; }
.delete-button:hover :deep(.el-icon) { transform: scale(1.1); color: #ff4d4f; }

/* priority icon */ 
.priority-icon { cursor: pointer; font-size: 16px; color: #909399; transition: color 0.3s;}
.priority-icon:hover { transform: scale(1.1); color: #409EFF;}
.priority-icon--normal { color: #67C23A; }
.priority-icon--warning { color: #E6A23C; }
.priority-icon--danger { color: #F56C6C; }

/* priority option */
.priority-option { display: inline-block; margin-right: 5px; color: #909399; }
.priority-option--normal { color: #67C23A; }
.priority-option--warning { color: #E6A23C; }
.priority-option--danger { color: #F56C6C; }

/* footer icons row */
.footer-icons { display: flex; align-items: center; gap: 16px; }

/* assignee styles */
.assignee-trigger { display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s ease; }
.assignee-trigger:hover { transform: scale(1.1); }
.assignee-trigger:hover .el-icon,
.assignee-trigger:hover .assignee-name,
.assignee-trigger:hover .assignee-count { color: #409EFF; }
.assignee-trigger .el-icon { font-size: 16px; color: #606266; transition: all 0.3s ease; }
.assignee-name { font-size: 14px; color: #606266; transition: color 0.3s ease; }
.assignee-count { font-size: 12px; color: #909399; transition: color 0.3s ease; }
.assignee-role { font-size: 12px; color: #909399; position: relative; padding-left: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* assignee dropdown menu */
.assignee-group-title { font-size: 12px; color: #909399; padding: 0 12px; }
.assignee-dropdown :deep(.el-dropdown-menu) { min-width: 160px; }
.assignee-dropdown :deep(.el-dropdown-menu__item.is-disabled) { background-color: #f5f7fa; padding: 5px 0; }

/* disabled */
.add-item-button.is-disabled { opacity: 0.6; cursor: not-allowed; }

/* 文本框容器样式 */
.text-area-container {
  width: 100%;
  margin: 10px 0;
}

/* 按钮容器样式 */
.text-area-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* 文本框样式 */
.text-area-container :deep(.el-textarea__inner) {
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
}

/* 按钮悬停效果 */
.text-area-buttons .el-button:hover {
  transform: scale(1.1);
}

.description-container {
  width: 100%;
  margin: 10px 0;
}

.description-edit-mode {
  position: relative;
}

.description-edit-mode .el-button {
  position: absolute;
  right: 8px;
  top: 8px;
}

.description-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.description-display-mode {
  padding: 8px;
  min-height: 60px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.description-display-mode:hover {
  border-color: var(--el-color-primary);
}

.description-content {
  white-space: pre-wrap;
  word-break: break-all;
}

.description-placeholder {
  color: var(--el-text-color-placeholder);
}

.description-display-mode .el-button {
  position: absolute;
  right: 8px;
  top: 8px;
  display: none;
}

.description-display-mode:hover .el-button {
  display: inline-flex;
}

/* 添加新的样式 */
.edit-controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* 移除不需要的样式 */
.assignee-role,
.assignee-count,
.assignee-group-title { 
  display: none; 
}

/* 简化下拉菜单样式 */
.assignee-dropdown :deep(.el-dropdown-menu) { 
  min-width: 160px; 
}

.assignee-item {
  display: flex;
  align-items: center;
  padding: 5px 12px;
  cursor: pointer;
}

.assignee-item:hover {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: var(--el-dropdown-menuItem-hover-color);
}
</style>
