<template>
  <div>
    <el-card v-for="c in courses" :key="c.id" class="task-card">
      <div class="course-header">
        <p class="course-name"><strong>{{ c.name }}</strong></p>
        <p class="course-hours">{{ c.totalHours }}h ({{ c.assignedHours || 0 }}h assigned)</p>
      </div>
      <p class="course-type">{{ c.type }}</p>
      
      <!-- 分配状态显示 -->
      <div v-if="c.assignedTo" class="assignment-info">
        <p class="assigned-text">{{ c.assignedTo }} {{ c.assignedHours }}h</p>
      </div>
      
      <el-button 
        type="primary" 
        size="small" 
        @click="$emit('assign', c)" 
        class="assign-btn"
      >
        {{ c.assignedTo ? 'Reassign' : 'Assign' }}
      </el-button>
      <p class="button-hint">click to assign instructors and allocate teaching hours</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Course {
  id: number
  name: string
  type: string
  totalHours: number
  assignedTo?: string
  assignedHours?: number
}

defineProps<{ courses: Course[] }>()
</script>

<style scoped>
.task-card {
  margin-bottom: 10px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-name {
  margin: 0;
  font-size: 14px;
}

.course-hours {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.course-type {
  margin: 4px 0 8px 0;
  font-size: 12px;
  color: #409eff;
  text-transform: capitalize;
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
