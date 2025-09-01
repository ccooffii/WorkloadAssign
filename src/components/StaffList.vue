<template>
  <div>
    <el-card v-for="s in staff" :key="s.id" class="staff-card">
      <div class="staff-header">
        <div class="avatar">{{ getInitials(s.name) }}</div>
        <div class="staff-info">
          <p class="staff-name"><strong>{{ s.name }}</strong></p>
          <p class="staff-job-number">#{{ s.jobNumber }}</p>
        </div>
      </div>
      
      <!-- <div class="hours-info">
        <p><strong>teaching hours:</strong> {{ s.assignedTeachingHours }}h</p>
        <p><strong>service hours:</strong> {{ s.assignedServiceHours }}h</p>
        <p><strong>research hours:</strong> {{ s.assignedResearchHours }}h</p>
      </div> -->
      
      <div class="hours-tags">
        <span class="hour-tag teaching">{{ s.assignedTeachingHours }}h</span>
        <span class="hour-tag research">{{ s.assignedResearchHours }}h</span>
        <span class="hour-tag service">{{ s.assignedServiceHours }}h</span>
      </div>
      
      <!-- 教学兴趣显示 -->
      <div v-if="s.teachingInterests && s.teachingInterests.length > 0" class="teaching-interests">
        <p class="interests-label">Teaching Interests:</p>
        <div class="interest-tags">
          <el-tag
            v-for="interest in s.teachingInterests"
            :key="interest"
            size="small"
            type="info"
            class="interest-tag"
          >
            {{ interest }}
          </el-tag>
        </div>
      </div>
      
      <el-button type="primary" size="small" @click="$emit('view-profile', s)" class="profile-btn">
        Profile
      </el-button>
      <p class="button-hint">click to view this instructor's full profile including experience and interests</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Staff {
  id: number
  name: string
  jobNumber: string
  teachingInterests?: string[]
  assignedTeachingHours: number
  assignedResearchHours: number
  assignedServiceHours: number
}

defineProps<{ staff: Staff[] }>()

  // Get initials from name for avatar
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.staff-card {
  margin-bottom: 10px;
}

.staff-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.staff-info {
  flex: 1;
}

.staff-name {
  margin: 0;
  font-size: 14px;
}

.staff-job-number {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #666;
}

.hours-info {
  margin-bottom: 12px;
}

.hours-info p {
  margin: 4px 0;
  font-size: 12px;
}

.hours-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.hour-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: white;
}

.hour-tag.teaching {
  background-color: #f56c6c;
}

.hour-tag.research {
  background-color: #409eff;
}

.hour-tag.service {
  background-color: #e6a23c;
}

.teaching-interests {
  margin: 12px 0;
}

.interests-label {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: #909399;
  font-weight: bold;
}

.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.interest-tag {
  font-size: 10px;
  padding: 2px 6px;
}

.profile-btn {
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
