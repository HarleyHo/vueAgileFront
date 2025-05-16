<!--
 * @Author: zyg0121 zhouyiguo2012@qq.com
 * @Date: 2024-11-09 16:40:41
 * @LastEditors: zyg0121 zhouyiguo2012@qq.com
 * @LastEditTime: 2024-11-10 20:14:13
 * @FilePath: \vsAgileFront\src\webview\components\KanbanBoard.vue
 * @Description:
 *
 * Copyright (c) 2024 by yiguo, All Rights Reserved.
-->
<template>
  <div class="kanban-board">
    <div class="kanban-columns">
      <KanbanColumn
        v-for="(column, colIndex) in columns"
        :key="column.title"
        :title="column.title"
        v-model:tasks="column.tasks"
        :column-index="colIndex"
        @addTask="addTask"
        @deleteTask="deleteTask"
        @saveTask="updateTask"
        @update:tasks="handleTasksStatus(colIndex, $event)"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import KanbanColumn from './KanbanColumn.vue';
import axios from "@/axios.js";
import { ElMessage } from 'element-plus';

export default {
  components: { KanbanColumn },
  setup() {
    const columns = ref([
      { title: 'To Do', tasks: [], status: '0' },
      { title: 'In Progress', tasks: [], status: '1' },
      { title: 'Done', tasks: [], status: '2' }
    ]);

    const selectedProjectId = localStorage.getItem('selectedProjectId');
    // Obtain task list from backend and fetch to frontend
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/project/${selectedProjectId}/task`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        const tasks = response.data.data.tasks;

        columns.value.forEach(column => column.tasks = []);
        
        tasks.forEach(task => {
          const column = columns.value.find(col => col.status === task.taskStatus.toString());
          if (column) {
            column.tasks.push(transformTaskFromBackend(task));
          }
        });
      } catch (error) {
        console.error('Failed to obtain task:', error);
        ElMessage.error('Failed to Obtain Task List');
      }
    };

    const transformTaskFromBackend = (backendTask) => ({
      id: backendTask.taskId,
      title: backendTask.taskTitle,
      taskDesc: backendTask.taskDesc || '',
      assignees: backendTask.taskUserId ? [{ id: backendTask.taskUserId }] : [],
      priority: backendTask.taskPriority || 'default',
      duetime: backendTask.taskPreEndTime,
      status: backendTask.taskStatus.toString()
    });

    const transformTaskToBackend = (frontendTask) => ({
      taskId: frontendTask.id,
      taskTitle: frontendTask.title,
      taskDesc: frontendTask.taskDesc || '',
      taskUserId: frontendTask.assignees?.[0]?.id || null,
      taskStatus: frontendTask.status,
      taskPriority: frontendTask.priority || 'default',
      taskPreEndTime: frontendTask.duetime,
      taskEndTime: frontendTask.status === '2' ? new Date().toLocaleString().replaceAll('/', '-') : null,
      taskProjectId: selectedProjectId
    });

    // Update task status
    const handleTasksStatus = async (columnIndex, newTasks) => {
      const status = columns.value[columnIndex].status;
      
      try {
        // Check if the task status has changed
        for (const task of newTasks) {
          if (task.status !== status) {
            // Update task status
            const updatedTask = { ...task, status };
            await updateTask(updatedTask);
          }
        }
        
        // Update the task list in the column
        columns.value[columnIndex].tasks = newTasks;
      } catch (error) {
        console.error('Failed to update task status:', error);
        ElMessage.error('Failed to Update Task Status');
        // If the update fails, refresh the task list
        await fetchTasks();
      }
    };

    const addTask = async (columnIndex) => {
      try {
        const newTask = {
          taskTitle: 'New Task ',
          taskDesc: '',
          taskStatus: columns.value[columnIndex].status,
          taskStartTime: new Date().toLocaleString().replaceAll('/', '-'),
          taskPreEndTime: null,
          taskEndTime: null,
          taskPriority: 'default',
          taskUserId: null,
          taskProjectId: selectedProjectId
        };
        
        const response = await axios.post('/task', newTask, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        // After creating the task, fetch the task list from the backend
        await fetchTasks();
        ElMessage.success('Create Task Successfully');
      } catch (error) {
        console.error('Failed to create task:', error);
        ElMessage.error('Failed to Create Task');
      }
    };

    const updateTask = async (task) => {
      try {
        console.log("updateTask", task);
        const backendTask = transformTaskToBackend(task);
        
        await axios.put(`/task/${task.id}`, backendTask, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        
        ElMessage.success('Update Task Successfully');
        
        // Update local data
        const columnIndex = columns.value.findIndex(col => col.status === task.status);
        if (columnIndex !== -1) {
          const taskIndex = columns.value[columnIndex].tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            columns.value[columnIndex].tasks[taskIndex] = { ...task };
          }
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        ElMessage.error('Failed to Update Task');
        await fetchTasks();  // Refresh the task list
      }
    };

    const deleteTask = async (columnIndex, taskIndex) => {
      const task = columns.value[columnIndex].tasks[taskIndex];
      try {
        await axios.delete(`/task/${task.id}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
          params: { taskId: task.id }
        });
        
        columns.value[columnIndex].tasks.splice(taskIndex, 1);
        ElMessage.success('Delete Task Successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
        ElMessage.error('Failed to Delete Task');
        await fetchTasks();
      }
    };

    onMounted(() => {
      fetchTasks();
    });

    return { 
      columns, 
      addTask, 
      deleteTask, 
      updateTask, 
      handleTasksStatus 
    };
  }
};
</script>

<style>
.kanban-board { display: flex; padding: 20px; height: 100vh; box-sizing: border-box; }
.kanban-columns { display: flex; flex-direction: row; gap: 15px; width: 100%; height: 100%; }
</style>
  