<template>
  <el-dialog
    :title="staff.name + ' Profile'"
    v-model="visible"
    width="40%"
  >
    <!-- 基本信息 -->
    <div class="info-block">
      <p><strong>Job Number:</strong> {{ staff.jobNumber }}</p>
    </div>

    <!-- 教学兴趣信息 -->
    <div v-if="staff.teachingInterests && staff.teachingInterests.length > 0" class="interests-info">
      <h4>Teaching Interests</h4>
      <div class="interests-tags">
        <el-tag
          v-for="interest in staff.teachingInterests"
          :key="interest"
          type="info"
          class="interest-tag"
        >
          {{ interest }}
        </el-tag>
      </div>
    </div>

    <!-- 已分配工时信息 -->
    <!-- <div class="assigned-info">
      <h4>Assigned Hours</h4>
      <p><strong>Teaching Hours:</strong> {{ staff.assignedTeachingHours }}h</p>
      <p><strong>Research Hours:</strong> {{ staff.assignedResearchHours }}h</p>
      <p><strong>Service Hours:</strong> {{ staff.assignedServiceHours }}h</p>
      <p><strong>Total Assigned Hours:</strong> {{ totalAssignedHours }}h</p>
    </div> -->

    <!-- 工作量进度条 -->
    <div class="progress-block">
      <p><strong>Workload Distribution</strong></p>
      <el-progress
        :percentage="calcPercentage(staff.assignedTeachingHours)"
        color="#f56c6c"
        :stroke-width="18"
        :text-inside="true"
        style="margin-bottom: 12px;"
      >
        <template #default="{ percentage }">
          Teaching {{ percentage }}% ({{ staff.assignedTeachingHours }}h)
        </template>
      </el-progress>

      <el-progress
        :percentage="calcPercentage(staff.assignedResearchHours)"
        color="#409eff"
        :stroke-width="18"
        :text-inside="true"
        style="margin-bottom: 12px;"
      >
        <template #default="{ percentage }">
          Research {{ percentage }}% ({{ staff.assignedResearchHours }}h)
        </template>
      </el-progress>

      <el-progress
        :percentage="calcPercentage(staff.assignedServiceHours)"
        color="#e6a23c"
        :stroke-width="18"
        :text-inside="true"
      >
        <template #default="{ percentage }">
          Service {{ percentage }}% ({{ staff.assignedServiceHours }}h)
        </template>
      </el-progress>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <el-button @click="close">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Staff {
  id: number
  name: string
  jobNumber: string
  teachingInterests?: string[]
  assignedTeachingHours: number
  assignedResearchHours: number
  assignedServiceHours: number
}

const props = defineProps<{ staff: Staff }>()
const emit = defineEmits(['close'])
const visible = ref(true)

  // Calculate total assigned hours
const totalAssignedHours = computed(() => {
  return props.staff.assignedTeachingHours + props.staff.assignedResearchHours + props.staff.assignedServiceHours
})

  // Trigger parent component event when dialog closes
watch(visible, (val) => {
  if (!val) emit('close')
})

  // Calculate percentage of each task relative to total workload
function calcPercentage(hours: number): number {
  if (totalAssignedHours.value === 0) return 0
  return Math.round((hours / totalAssignedHours.value) * 100)
}

function close() {
  visible.value = false
}
</script>

<style scoped>
.info-block {
  margin-bottom: 16px;
}

.interests-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 4px;
}

.interests-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.interest-tag {
  font-size: 12px;
}
.assigned-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 4px;
}
.assigned-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}
.assigned-info p {
  margin: 4px 0;
}
.progress-block {
  margin-top: 20px;
}
</style>
