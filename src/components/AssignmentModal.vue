<template>
  <el-dialog
    :title="`Assign Teachers to: ${course?.name || 'Course'}`"
    v-model="visible"
    width="60%"
  >
    <!-- 课程信息 -->
    <div v-if="course" class="course-info">
      <p><strong>Course:</strong> {{ course.name }}</p>
      <p><strong>Type:</strong> {{ course.type }}</p>
      <p><strong>Total Hours:</strong> {{ course.totalHours }}h</p>
      <p><strong>Remaining Hours:</strong> {{ remainingHours }}h</p>
      <div v-if="course.assignedTo" class="current-assignment">
        <p><strong>Current Assignment:</strong> {{ course.assignedTo }} ({{ course.assignedHours }}h)</p>
        <p class="reassign-hint">This will replace the current assignment</p>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-row">
        <el-input
          v-model="searchQuery"
          placeholder="Search teachers by name or job number..."
          prefix-icon="Search"
          clearable
          @input="filterTeachers"
          style="flex: 1; margin-right: 12px;"
        />
        <el-select
          v-model="selectedCourseFilter"
          placeholder="Filter by course interest"
          clearable
          style="width: 200px;"
          @change="filterTeachers"
        >
          <el-option
            v-for="course in availableCourses"
            :key="course"
            :label="course"
            :value="course"
          />
        </el-select>
      </div>
    </div>

    <!-- 老师列表 -->
    <div class="teachers-section">
      <h4>Available Teachers</h4>
      <div class="teachers-grid">
        <div
          v-for="teacher in filteredTeachers"
          :key="teacher.id"
          class="teacher-card"
          :class="{ 'selected': isTeacherSelected(teacher.id) }"
          @click="toggleTeacherSelection(teacher.id)"
        >
          <div class="teacher-avatar">{{ getInitials(teacher.name) }}</div>
                     <div class="teacher-info">
             <p class="teacher-name">{{ teacher.name }}</p>
             <p class="teacher-job-number">#{{ teacher.jobNumber }}</p>
             <p class="teacher-hours">
               T: {{ teacher.assignedTeachingHours }}h | R: {{ teacher.assignedResearchHours }}h | S: {{ teacher.assignedServiceHours }}h
             </p>
             <div v-if="teacher.teachingInterests && teacher.teachingInterests.length > 0" class="teaching-interests">
               <p class="interests-label">Teaching Interests:</p>
               <div class="interest-tags">
                 <el-tag
                   v-for="interest in teacher.teachingInterests"
                   :key="interest"
                   size="small"
                   type="info"
                   class="interest-tag"
                 >
                   {{ interest }}
                 </el-tag>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- 已选择的老师 -->
    <div v-if="selectedTeachers.length > 0" class="selected-section">
      <h4>Selected Teachers</h4>
      <div class="selected-teachers">
        <div
          v-for="assignment in selectedTeachers"
          :key="assignment.teacherId"
          class="assignment-item"
        >
          <div class="assignment-info">
            <span class="teacher-name">{{ getTeacherName(assignment.teacherId) }}</span>
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
            @click="removeTeacher(assignment.teacherId)"
          >
            Remove
          </el-button>
        </div>
      </div>
      
      <div class="total-hours">
        <p><strong>Total Assigned Hours:</strong> {{ totalAssignedHours }}h</p>
        <p v-if="totalAssignedHours > course.totalHours" class="error-text">
          Warning: Total assigned hours exceed course total hours!
        </p>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <el-button @click="close">Cancel</el-button>
      <el-button
        type="primary"
        @click="confirmAssignment"
        :disabled="selectedTeachers.length === 0 || totalAssignedHours > course.totalHours"
      >
        Confirm Assignment
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Course {
  id: number
  name: string
  type: string
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

interface TeacherAssignment {
  teacherId: number
  hours: number
}

const props = defineProps<{
  course: Course
  staff: Staff[]
}>()

const emit = defineEmits(['close', 'assign'])

const visible = ref(true)
const searchQuery = ref('')
const selectedCourseFilter = ref('')
const selectedTeachers = ref<TeacherAssignment[]>([])
const filteredTeachers = ref<Staff[]>(props.staff)

  // Calculate remaining hours
const remainingHours = computed(() => {
  if (!props.course) return 0
  return props.course.totalHours - totalAssignedHours.value
})

  // Calculate total assigned hours
const totalAssignedHours = computed(() => {
  return selectedTeachers.value.reduce((total, assignment) => total + assignment.hours, 0)
})

  // Trigger parent component event when dialog closes
watch(visible, (val) => {
  if (!val) emit('close')
})

// Initialize current assignment information
function initializeCurrentAssignment() {
  if (props.course?.assignedTo) {
    // Parse current assignment information, format like: "John Smith 10h, Jane Doe 5h"
    const assignmentParts = props.course.assignedTo.split(', ')
    selectedTeachers.value = []
    
    assignmentParts.forEach(part => {
      // Match format: "Name Numberh"
      const match = part.match(/^(.+?)\s+(\d+)h$/)
      if (match) {
        const teacherName = match[1].trim()
        const hours = parseInt(match[2])
        
        // Find corresponding staff ID by name
        const teacher = props.staff.find(s => s.name === teacherName)
        if (teacher) {
          selectedTeachers.value.push({
            teacherId: teacher.id,
            hours: hours
          })
        }
      }
    })
  }
}

  // Listen for course changes and reinitialize
watch(() => props.course, () => {
  if (props.course) {
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

  // Get all available course names (extracted from teaching interests)
const availableCourses = computed(() => {
  const courses = new Set<string>()
  props.staff.forEach(teacher => {
    if (teacher.teachingInterests) {
      teacher.teachingInterests.forEach(course => courses.add(course))
    }
  })
  return Array.from(courses).sort()
})

  // Filter teachers
function filterTeachers() {
  let filtered = props.staff
  
  // Search by name or job number
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(teacher => 
      teacher.name.toLowerCase().includes(query) ||
      teacher.jobNumber.toLowerCase().includes(query)
    )
  }
  
  // Filter by teaching interests
  if (selectedCourseFilter.value) {
    filtered = filtered.filter(teacher => 
      teacher.teachingInterests && 
      teacher.teachingInterests.includes(selectedCourseFilter.value)
    )
  }
  
  filteredTeachers.value = filtered
}

  // Check if teacher is already selected
function isTeacherSelected(teacherId: number): boolean {
  return selectedTeachers.value.some(assignment => assignment.teacherId === teacherId)
}

  // Toggle teacher selection status
function toggleTeacherSelection(teacherId: number) {
  const existingIndex = selectedTeachers.value.findIndex(
    assignment => assignment.teacherId === teacherId
  )
  
  if (existingIndex >= 0) {
    selectedTeachers.value.splice(existingIndex, 1)
  } else {
    selectedTeachers.value.push({
      teacherId,
      hours: 1
    })
  }
}

  // Get teacher name
function getTeacherName(teacherId: number): string {
  const teacher = props.staff.find(t => t.id === teacherId)
  return teacher ? teacher.name : 'Unknown'
}

  // Remove teacher
function removeTeacher(teacherId: number) {
  const index = selectedTeachers.value.findIndex(
    assignment => assignment.teacherId === teacherId
  )
  if (index >= 0) {
    selectedTeachers.value.splice(index, 1)
  }
}

  // Update total hours
function updateTotalHours() {
      // This method will be called automatically when input-number changes
    // Automatically updated through computed property totalAssignedHours
}

  // Confirm assignment
function confirmAssignment() {
  if (!props.course) return
  
  if (selectedTeachers.value.length === 0) {
    alert('Please select at least one teacher.')
    return
  }
  
  if (totalAssignedHours.value > props.course.totalHours) {
    alert('Total assigned hours cannot exceed course total hours.')
    return
  }
  
      // Build assignment result
  const assignments = selectedTeachers.value.map(assignment => ({
    teacherId: assignment.teacherId,
    teacherName: getTeacherName(assignment.teacherId),
    hours: assignment.hours
  }))
  
  emit('assign', {
    courseId: props.course.id,
    assignments
  })
  
  visible.value = false
}

function close() {
  visible.value = false
}
</script>

<style scoped>
.course-info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.course-info p {
  margin: 4px 0;
}

.search-section {
  margin-bottom: 16px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teachers-section h4,
.selected-section h4 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.teacher-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.teacher-card:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.teacher-card.selected {
  border-color: #409eff;
  background-color: #e6f7ff;
}

.teacher-avatar {
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
  flex-shrink: 0;
}

.teacher-info {
  flex: 1;
  min-width: 0;
}

.teacher-name {
  margin: 0;
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.teacher-job-number {
  margin: 2px 0;
  font-size: 12px;
  color: #909399;
}

.teacher-hours {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #606266;
}

.teaching-interests {
  margin-top: 8px;
}

.interests-label {
  margin: 0 0 4px 0;
  font-size: 11px;
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

.selected-teachers {
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

.assignment-info .teacher-name {
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
  background: #f0f9ff;
  border-radius: 4px;
}

.total-hours p {
  margin: 4px 0;
}

.error-text {
  color: #f56c6c;
  font-weight: bold;
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
</style>
