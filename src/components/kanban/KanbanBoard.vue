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
          @addTask="addTask(colIndex)"
          @deleteTask="deleteTask(colIndex, $event)"
          @saveTask="saveTask"
          @openLink="openLink"
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
import axios from 'axios';

export default {
  components: { KanbanColumn, draggable },
  setup() {
    const columns = ref([
      { title: 'To Do', tasks: [], status: 'ready' },
      { title: 'In Progress', tasks: [], status: 'in-process' },
      { title: 'Done', tasks: [], status: 'done' }
    ]);

    // 获取所有任务并分类到对应列
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/task');
        const tasks = response.data;
        
        // 清空所有列的任务
        columns.value.forEach(column => column.tasks = []);
        
        // 将任务分配到对应的列
        tasks.forEach(task => {
          const column = columns.value.find(col => col.status === task.status);
          if (column) {
            column.tasks.push(transformTaskFromBackend(task));
          }
        });
      } catch (error) {
        console.error('获取任务失败:', error);
        ElMessage.error('获取任务列表失败');
      }
    };

    // 后端数据转前端数据格式
    const transformTaskFromBackend = (backendTask) => ({
      id: backendTask.id,
      title: backendTask.name,
      listItems: backendTask.description ? parseDescription(backendTask.description) : [],
      assignees: backendTask.charge_user_id ? [{ id: backendTask.charge_user_id }] : [],
      priority: backendTask.priority,
      duetime: backendTask.pre_end_date,
      status: backendTask.status
    });

    // 前端数据转后端数据格式
    const transformTaskToBackend = (frontendTask, status) => ({
      id: frontendTask.id,
      name: frontendTask.title,
      description: frontendTask.listItems.map(item => item.text).join('\n'),
      charge_user_id: frontendTask.assignees?.[0]?.id || null,
      status: status,
      priority: frontendTask.priority || '',
      pre_end_date: frontendTask.duetime,
      project_id: 37 // 这里需要根据实际项目ID修改
    });

    // 解析描述为列表项
    const parseDescription = (description) => {
      return description.split('\n').filter(text => text.trim()).map(text => ({
        text: text.trim(),
        isEditing: false
      }));
    };

    const handleTasksUpdate = async (columnIndex, newTasks) => {
      columns.value[columnIndex].tasks = newTasks;
      
      // 如果任务更换了列，需要更新状态
      const status = columns.value[columnIndex].status;
      for (const task of newTasks) {
        if (task.status !== status) {
          task.status = status;
          await updateTask(task);
        }
      }
    };

    const addTask = async (columnIndex) => {
      try {
        const newTask = {
          name: `New Task`,
          status: columns.value[columnIndex].status,
        };
        
        const response = await axios.post('/task', newTask);
        const createdTask = transformTaskFromBackend(response.data);
        createdTask.isNew = true;
        
        columns.value[columnIndex].tasks.push(createdTask);
      } catch (error) {
        console.error('创建任务失败:', error);
        ElMessage.error('创建任务失败');
      }
    };

    const updateTask = async (task) => {
      try {
        const backendTask = transformTaskToBackend(task, task.status);
        await axios.put(`/task/${task.id}`, backendTask);
      } catch (error) {
        console.error('更新任务失败:', error);
        ElMessage.error('更新任务失败');
      }
    };

    const deleteTask = async (columnIndex, taskIndex) => {
      const task = columns.value[columnIndex].tasks[taskIndex];
      try {
        await axios.delete(`/task/${task.id}`);
        columns.value[columnIndex].tasks.splice(taskIndex, 1);
      } catch (error) {
        console.error('删除任务失败:', error);
        ElMessage.error('删除任务失败');
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
  