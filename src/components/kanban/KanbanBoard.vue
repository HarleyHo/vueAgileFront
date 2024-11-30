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
    <!-- use draggable to drag the columns -->
    <draggable
      v-model="columns"
      :component-data="{ type: 'transition-group' }"
      item-key="title"
      class="kanban-columns"
      :group="{ name: 'columns' }"
    >
      <template #item="{ element: column, index: colIndex }">
        <KanbanColumn
          :key="colIndex"
          :title="column.title"
          v-model:tasks="column.tasks"
          :column-index="colIndex"
          @addTask="addTask"
          @deleteTask="deleteTask"
          @saveTask="updateTask"
          @update:tasks="handleTasksUpdate(colIndex, $event)"
        />
      </template>
    </draggable>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import KanbanColumn from './KanbanColumn.vue';
import draggable from 'vuedraggable';
import axios from "@/axios.js";
import { ElMessage } from 'element-plus';

export default {
  components: { KanbanColumn, draggable },
  setup() {
    const columns = ref([
      { title: 'To Do', tasks: [], status: '0' },
      { title: 'In Progress', tasks: [], status: '1' },
      { title: 'Done', tasks: [], status: '2' }
    ]);

    const selectedProjectId = localStorage.getItem('selectedProjectId');
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/project/${selectedProjectId}/task`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        // 从 response.data.data.tasks 中提取任务列表
        const tasks = response.data.data.tasks;

        columns.value.forEach(column => column.tasks = []);
        
        tasks.forEach(task => {
          const column = columns.value.find(col => col.status === task.taskStatus.toString());
          if (column) {
            column.tasks.push(transformTaskFromBackend(task));
          }
        });
      } catch (error) {
        console.error('获取任务失败:', error);
        ElMessage.error('获取任务列表失败');
      }
    };

    const transformTaskFromBackend = (backendTask) => ({
      id: backendTask.taskId,
      title: backendTask.taskTitle,
      taskDesc: backendTask.taskDesc || '',
      assignees: backendTask.taskUserId ? [{ id: backendTask.taskUserId }] : [],
      priority: backendTask.taskPriority,
      duetime: backendTask.taskPreEndTime,
      status: backendTask.taskStatus
    });

    const transformTaskToBackend = (frontendTask, status) => ({
      taskId: frontendTask.id,
      taskTitle: frontendTask.title,
      taskDesc: frontendTask.taskDesc || '',
      taskUserId: frontendTask.assignees?.[0]?.id || null,
      taskStatus: status,
      taskPriority: frontendTask.priority || 'default',
      taskPreEndTime: frontendTask.duetime,
      taskEndTime: status === '2' ? new Date().toLocaleString().replaceAll('/', '-') : null,
      taskProjectId: selectedProjectId
    });

    const handleTasksUpdate = async (columnIndex, newTasks) => {
      const status = columns.value[columnIndex].status;
      
      try {
        // 检查任务状态是否发生变化
        for (const task of newTasks) {
          if (task.status !== status) {
            // 更新任务状态
            task.status = status;
            await updateTask(task);
          }
        }
        
        // 更新列中的任务列表
        columns.value[columnIndex].tasks = newTasks;
      } catch (error) {
        console.error('更新任务状态失败:', error);
        ElMessage.error('更新任务状态失败');
        // 如果更新失败，刷新任务列表
        await fetchTasks();
      }
    };

    const addTask = async (columnIndex) => {
      try {
        const newTask = {
          taskTitle: '新任务',
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

        const createdTask = transformTaskFromBackend(response.data.data);
        columns.value[columnIndex].tasks.push(createdTask);
      } catch (error) {
        console.error('创建任务失败:', error);
        ElMessage.error('创建任务失败');
      }
    };

    const updateTask = async (task) => {
      try {
        const backendTask = transformTaskToBackend(task, task.status);
        console.log("updateTask", backendTask);
        await axios.put(`/task/${task.id}`, backendTask, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        
        ElMessage.success('更新任务成功');
        
        // 更新本地数据
        const columnIndex = columns.value.findIndex(col => col.status === task.status);
        if (columnIndex !== -1) {
          const taskIndex = columns.value[columnIndex].tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            columns.value[columnIndex].tasks[taskIndex] = { ...task };
          }
        }
      } catch (error) {
        console.error('更新任务失败:', error);
        ElMessage.error('更新任务失败');
        await fetchTasks();
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
        ElMessage.success('删除任务成功');
      } catch (error) {
        console.error('删除任务失败:', error);
        ElMessage.error('删除任务失败');
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
      handleTasksUpdate 
    };
  }
};
</script>

<style>
.kanban-board { display: flex; padding: 20px; height: 100vh; box-sizing: border-box; }
.kanban-columns { display: flex; flex-direction: row; gap: 15px; width: 100%; height: 100%; }
</style>
  