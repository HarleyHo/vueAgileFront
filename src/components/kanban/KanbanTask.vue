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
        <!-- edit mode -->
        <div v-if="isEditing" class="description-edit-mode">
          <el-input
            type="textarea"
            v-model="taskDescription"
            :rows="3"
            resize="none"
            placeholder="Input Task Description"
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
        
        <!-- display mode -->
        <div v-else class="description-display-mode">
          <div v-if="task.taskDesc" class="description-content">
            {{ task.taskDesc }}
          </div>
          <div v-else class="description-placeholder">
            Click Edit to Add Description
          </div>
        </div>
      </div>

      <!-- edit button -->
      <div class="edit-controls">
        <template v-if="isEditing">
          <el-button
            type="success"
            size="small"
            @click="saveAll"
          >
            Save
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="cancelEdit"
          >
            Cancel
          </el-button>
        </template>
        <template v-else>
          <el-button
            type="primary"
            size="small"
            @click="startEdit"
          >
            Edit
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
                {{ assigneeName || 'Not Assigned' }}
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="">
                  <div class="assignee-item">
                    <span>Not Assigned</span>
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
import { Close, Flag, Delete, Plus, User, Check } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import axios from "@/axios.js";

export default {
  components: {
    Close,
    Flag,
    Delete,
    Plus,
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
      userList: [],
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
        this.task.assignees = [];
      } else {
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
        console.error('Failed to obtain user list:', error);
        ElMessage.error('Failed to Obtain User List');
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
      this.$confirm('Are you sure you want to delete this task?', 'Attention', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', this.task.id);
      }).catch(() => {
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
.assignee-dropdown :deep(.el-dropdown-menu) { min-width: 160px; }
.assignee-dropdown :deep(.el-dropdown-menu__item.is-disabled) { background-color: #f5f7fa; padding: 5px 0; }

/* disabled */
.add-item-button.is-disabled { opacity: 0.6; cursor: not-allowed; }

/* Textbox container */
.text-area-container {
  width: 100%;
  margin: 10px 0;
}

/* Button container */
.text-area-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* Textbox */
.text-area-container :deep(.el-textarea__inner) {
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
}

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

.edit-controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* dropdown menu */
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
