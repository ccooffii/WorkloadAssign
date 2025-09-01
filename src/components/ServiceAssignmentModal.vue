<template>
  <el-dialog
    :title="`Assign Staff to: ${task?.name || 'Service Task'}`"
    v-model="visible"
    width="60%"
  >
    <!-- 任务信息 -->
    <div v-if="task" class="task-info">
      <p><strong>Task:</strong> {{ task.name }}</p>
      <p><strong>Total Hours:</strong> {{ task.totalHours }}h</p>
      <p><strong>Remaining Hours:</strong> {{ remainingHours }}h</p>
      <div v-if="task.assignedTo" class="current-assignment">
        <p><strong>Current Assignment:</strong> {{ task.assignedTo }} ({{ task.assignedHours }}h)</p>
        <p class="reassign-hint">This will replace the current assignment</p>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="Search staff by name or job number..."
        prefix-icon="Search"
        clearable
        @input="filterStaff"
      />
    </div>

    <!-- 员工列表 -->
    <div class="staff-section">
      <h4>Available Staff</h4>
      <div class="staff-grid">
        <div
          v-for="member in filteredStaff"
          :key="member.id"
          class="staff-card"
          :class="{ 'selected': isStaffSelected(member.id) }"
          @click="toggleStaffSelection(member.id)"
        >
          <div class="staff-avatar">{{ getInitials(member.name) }}</div>
          <div class="staff-info">
            <p class="staff-name">{{ member.name }}</p>
            <p class="staff-job-number">#{{ member.jobNumber }}</p>
            <p class="staff-hours">
              T: {{ member.assignedTeachingHours }}h | R: {{ member.assignedResearchHours }}h | S: {{ member.assignedServiceHours }}h
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选择的员工 -->
    <div v-if="selectedStaff.length > 0" class="selected-section">
      <h4>Selected Staff</h4>
      <div class="selected-staff">
        <div
          v-for="assignment in selectedStaff"
          :key="assignment.staffId"
          class="assignment-item"
        >
          <div class="assignment-info">
            <span class="staff-name">{{ getStaffName(assignment.staffId) }}</span>
            <el-input-number
              v-model="assignment.hours"
              :min="1"
              :max="remainingHours + assignment.hours"
              size="small"
              placeholder="Hours"
              @change="updateTotalHours"
            />
            <span class="hours-label">hours</span>
          </div>
          <el-button
            type="danger"
            size="small"
            @click="removeStaff(assignment.staffId)"
          >
            Remove
          </el-button>
        </div>
      </div>
      
      <div class="total-hours">
        <p><strong>Total Assigned Hours:</strong> {{ totalAssignedHours }}h</p>
        <p v-if="totalAssignedHours > task.totalHours" class="error-text">
          Warning: Total assigned hours exceed task total hours!
        </p>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <el-button @click="close">Cancel</el-button>
      <el-button
        type="primary"
        @click="confirmAssignment"
        :disabled="selectedStaff.length === 0 || totalAssignedHours > task.totalHours"
      >
        Confirm Assignment
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Task {
  id: number
  name: string
  totalHours: number
  assignedTo?: string
  assignedHours?: number
}

interface Staff {
  id: number
  name: string
  jobNumber: string
  teachingInterests?: string[]
  assignedTeachingHours: number
  assignedResearchHours: number
  assignedServiceHours: number
}

interface StaffAssignment {
  staffId: number
  hours: number
}

const props = defineProps<{
  task: Task
  staff: Staff[]
}>()

const emit = defineEmits(['close', 'assign'])

const visible = ref(true)
const searchQuery = ref('')
const selectedStaff = ref<StaffAssignment[]>([])
const filteredStaff = ref<Staff[]>(props.staff)

  // Calculate remaining hours
const remainingHours = computed(() => {
  if (!props.task) return 0
  return props.task.totalHours - totalAssignedHours.value
})

  // Calculate total assigned hours
const totalAssignedHours = computed(() => {
  return selectedStaff.value.reduce((total, assignment) => total + assignment.hours, 0)
})

  // Trigger parent component event when dialog closes
watch(visible, (val) => {
  if (!val) emit('close')
})

// Initialize current assignment information
function initializeCurrentAssignment() {
  if (props.task?.assignedTo) {
    // Parse current assignment information, format like: "John Smith 10h, Jane Doe 5h"
    const assignmentParts = props.task.assignedTo.split(', ')
    selectedStaff.value = []
    
    assignmentParts.forEach(part => {
      // Match format: "Name Numberh"
      const match = part.match(/^(.+?)\s+(\d+)h$/)
      if (match) {
        const staffName = match[1].trim()
        const hours = parseInt(match[2])
        
        // Find corresponding staff ID by name
        const staff = props.staff.find(s => s.name === staffName)
        if (staff) {
          selectedStaff.value.push({
            staffId: staff.id,
            hours: hours
          })
        }
      }
    })
  }
}

// Listen for task changes and reinitialize
watch(() => props.task, () => {
  if (props.task) {
    initializeCurrentAssignment()
  }
}, { immediate: true })

  // Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
}

  // Filter staff
function filterStaff() {
  if (!searchQuery.value.trim()) {
    filteredStaff.value = props.staff
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredStaff.value = props.staff.filter(member => 
    member.name.toLowerCase().includes(query) ||
    member.jobNumber.toLowerCase().includes(query)
  )
}

  // Check if staff is already selected
function isStaffSelected(staffId: number): boolean {
  return selectedStaff.value.some(assignment => assignment.staffId === staffId)
}

  // Toggle staff selection status
function toggleStaffSelection(staffId: number) {
  const existingIndex = selectedStaff.value.findIndex(
    assignment => assignment.staffId === staffId
  )
  
  if (existingIndex >= 0) {
    selectedStaff.value.splice(existingIndex, 1)
  } else {
    selectedStaff.value.push({
      staffId,
      hours: 1
    })
  }
}

  // Get staff name
function getStaffName(staffId: number): string {
  const member = props.staff.find(s => s.id === staffId)
  return member ? member.name : 'Unknown'
}

  // Remove staff
function removeStaff(staffId: number) {
  const index = selectedStaff.value.findIndex(
    assignment => assignment.staffId === staffId
  )
  if (index >= 0) {
    selectedStaff.value.splice(index, 1)
  }
}

  // Update total hours
function updateTotalHours() {
      // This method will be called automatically when input-number changes
    // Automatically updated through computed property totalAssignedHours
}

  // Confirm assignment
function confirmAssignment() {
  if (!props.task) return
  
  if (selectedStaff.value.length === 0) {
    alert('Please select at least one staff member.')
    return
  }
  
  if (totalAssignedHours.value > props.task.totalHours) {
    alert('Total assigned hours cannot exceed task total hours.')
    return
  }
  
      // Build assignment result
  const assignments = selectedStaff.value.map(assignment => ({
    staffId: assignment.staffId,
    staffName: getStaffName(assignment.staffId),
    hours: assignment.hours
  }))
  
  emit('assign', {
    taskId: props.task.id,
    assignments
  })
  
  visible.value = false
}

function close() {
  visible.value = false
}
</script>

<style scoped>
.task-info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.task-info p {
  margin: 4px 0;
}

.search-section {
  margin-bottom: 16px;
}

.staff-section h4,
.selected-section h4 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.staff-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.staff-card:hover {
  border-color: #e6a23c;
  background-color: #fff7e6;
}

.staff-card.selected {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.staff-info {
  flex: 1;
  min-width: 0;
}

.staff-name {
  margin: 0;
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.staff-job-number {
  margin: 2px 0;
  font-size: 12px;
  color: #909399;
}

.staff-hours {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #606266;
}

.current-assignment {
  margin-top: 8px;
  padding: 8px;
  background: #fff2e8;
  border-radius: 4px;
  border-left: 3px solid #ff9500;
}

.current-assignment p {
  margin: 4px 0;
}

.reassign-hint {
  font-size: 12px;
  color: #ff9500;
  font-style: italic;
}

.selected-staff {
  max-height: 200px;
  overflow-y: auto;
}

.assignment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.assignment-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignment-info .staff-name {
  font-weight: bold;
  min-width: 120px;
}

.hours-label {
  font-size: 12px;
  color: #606266;
}

.total-hours {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff7e6;
  border-radius: 4px;
}

.total-hours p {
  margin: 4px 0;
}

.error-text {
  color: #f56c6c;
  font-weight: bold;
}
</style>
