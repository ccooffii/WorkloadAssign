<template>
  <div>
    <el-card v-for="t in tasks" :key="t.id" class="task-card">
      <div class="task-header">
        <p class="task-name"><strong>{{ t.name }}</strong></p>
        <p class="task-hours">{{ t.totalHours }}h</p>
      </div>
      
      <!-- 分配状态显示 -->
      <div v-if="t.assignedTo" class="assignment-info">
        <p class="assigned-text">{{ t.assignedTo }} {{ t.assignedHours }}h</p>
      </div>
      
      <el-button 
        type="primary" 
        size="small" 
        @click="$emit('assign', t)" 
        class="assign-btn"
      >
        {{ t.assignedTo ? 'Reassign' : 'Assign' }}
      </el-button>
      <p class="button-hint">click to assign researchers and allocate research hours</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Task {
  id: number
  name: string
  totalHours: number
  assignedTo?: string
  assignedHours?: number
}

defineProps<{ tasks: Task[] }>()
</script>

<style scoped>
.task-card {
  margin-bottom: 10px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-name {
  margin: 0;
  font-size: 14px;
}

.task-hours {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.assignment-info {
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.assigned-text {
  margin: 0;
  font-size: 12px;
  color: #409eff;
  font-weight: bold;
}

.assign-btn {
  width: 100%;
  margin-bottom: 8px;
}

.button-hint {
  margin: 0;
  font-size: 11px;
  color: #666;
  line-height: 1.2;
}
</style>
