<template>
  <div class="app-container">
    <!-- Teaching -->
    <div class="column teaching">
      <h3 class="column-title">
        <span class="title-icon teaching-icon"></span>
        Teaching
      </h3>
      <div class="upload-section">
        <div class="button-group">
          <el-button type="success" size="small" @click="downloadCourseTemplate">
            Download Template
          </el-button>
          <el-button type="primary" size="small" @click="uploadCourses">
            Upload
          </el-button>
        </div>
        <p class="upload-hint">download template → fill in data → upload to import courses</p>
      </div>
      <teaching-list :courses="teachingCourses" @assign="assignTask" />
    </div>

    <!-- Research -->
    <div class="column research">
      <h3 class="column-title">
        <span class="title-icon research-icon"></span>
        Research
      </h3>
      <div class="upload-section">
        <el-button type="primary" size="small" @click="uploadResearch">
          Upload
        </el-button>
        <p class="upload-hint">upload Excel file to import research projects</p>
      </div>
      <research-list :tasks="researchTasks" @assign="assignTask" />
    </div>

    <!-- Service -->
    <div class="column service">
      <h3 class="column-title">
        <span class="title-icon service-icon"></span>
        Service
      </h3>
      <div class="upload-section">
        <el-button type="primary" size="small" @click="uploadService">
          Upload
        </el-button>
        <p class="upload-hint">upload Excel file to import service tasks</p>
      </div>
      <service-list :tasks="serviceTasks" @assign="assignTask" />
    </div>

    <!-- Staff -->
    <div class="column staff">
      <h3 class="column-title">Staff</h3>
      <div class="upload-section">
        <div class="button-group">
          <el-button type="success" size="small" @click="downloadStaffTemplate">
            Download Template
          </el-button>
          <el-button type="primary" size="small" @click="uploadStaff">
            Upload
          </el-button>
        </div>
        <p class="upload-hint">download template → fill in data → upload to import staff</p>
      </div>
      <staff-list :staff="staffList" @view-profile="showProfile" />
    </div>

    <!-- Profile Modal -->
    <profile-modal
      v-if="activeProfile"
      :staff="activeProfile"
      @close="activeProfile = null"
    />

    <!-- Assignment Modal -->
    <assignment-modal
      v-if="assignmentModal.visible"
      :course="assignmentModal.course"
      :staff="staffList"
      @assign="handleCourseAssignment"
      @close="closeAssignmentModal"
    />

    <!-- Service Assignment Modal -->
    <service-assignment-modal
      v-if="serviceAssignmentModal.visible"
      :task="serviceAssignmentModal.task"
      :staff="staffList"
      @assign="handleServiceAssignment"
      @close="closeServiceAssignmentModal"
    />

    <!-- Download button -->
    <div class="footer-btn">
      <el-button type="primary" @click="downloadResults">
        Download
      </el-button>
      <p class="download-hint">click to export the current assignment results as an Excel file</p>
    </div>

    <!-- Hidden file inputs -->
    <input
      ref="courseFileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      style="display: none"
      @change="handleCourseFileUpload"
    />
    <input
      ref="staffFileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      style="display: none"
      @change="handleStaffFileUpload"
    />
    <input
      ref="researchFileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      style="display: none"
      @change="handleResearchFileUpload"
    />
    <input
      ref="serviceFileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      style="display: none"
      @change="handleServiceFileUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TeachingList from './components/TeachingList.vue'
import ResearchList from './components/ResearchList.vue'
import ServiceList from './components/ServiceList.vue'
import StaffList from './components/StaffList.vue'
import ProfileModal from './components/ProfileModal.vue'
import AssignmentModal from './components/AssignmentModal.vue'
import ServiceAssignmentModal from './components/ServiceAssignmentModal.vue'

// ---------- Type Definitions ----------
interface Course {
  id: number
  name: string
  type: string
  totalHours: number
  assignedTo?: string
  assignedHours?: number
}
interface Task {
  id: number
  name: string
  totalHours: number
}
interface Staff {
  id: number
  name: string
  jobNumber: string
  // Teaching interests (list of course names the staff is interested in)
  teachingInterests?: string[]
  // Assigned workload hours
  assignedTeachingHours: number
  assignedResearchHours: number
  assignedServiceHours: number
}

// ---------- Mock Data ----------
const teachingCourses = ref<Course[]>([
  { id: 1, name: 'Course 1', type: 'Workshop', totalHours: 30 },
  { id: 2, name: 'Course 2', type: 'Lecture', totalHours: 30 },
  { id: 3, name: 'Course 3', type: 'Tutorial', totalHours: 30 }
])
const researchTasks = ref<Task[]>([
  { id: 101, name: 'Research Project A', totalHours: 50 },
  { id: 102, name: 'Research Project B', totalHours: 40 }
])
const serviceTasks = ref<Task[]>([
  { id: 201, name: 'Outreach', totalHours: 20 },
  { id: 202, name: 'Committee Work', totalHours: 15 }
])
const staffList = ref<Staff[]>([
  {
    id: 1,
    name: 'Wei Zhang',
    jobNumber: '12345',
    teachingInterests: ['Mathematics', 'Statistics', 'Data Science'],
    assignedTeachingHours: 0,
    assignedResearchHours: 0,
    assignedServiceHours: 0
  },
  {
    id: 2,
    name: 'Anna Lee',
    jobNumber: '67890',
    teachingInterests: ['Computer Science', 'Programming', 'Software Engineering'],
    assignedTeachingHours: 0,
    assignedResearchHours: 0,
    assignedServiceHours: 0
  }
])

// ---------- Functions ----------
const activeProfile = ref<Staff | null>(null)
const courseFileInput = ref<HTMLInputElement>()
const staffFileInput = ref<HTMLInputElement>()
const researchFileInput = ref<HTMLInputElement>()
const serviceFileInput = ref<HTMLInputElement>()

// Assignment modal state
const assignmentModal = ref<{
  visible: boolean
  course: Course | null
}>({
  visible: false,
  course: null
})

// Service task assignment modal state
const serviceAssignmentModal = ref<{
  visible: boolean
  task: Task | null
}>({
  visible: false,
  task: null
})

function assignTask(task: Course | Task) {
  // Check if this is a course assignment
  if ('type' in task) {
    // This is a course assignment
    assignmentModal.value = {
      visible: true,
      course: task
    }
  } else {
    // This is other task assignment (research, service)
    // Check if the task is in the service tasks list
    const serviceTask = serviceTasks.value.find(t => t.id === task.id)
    if (serviceTask) {
      // This is a service task assignment
      serviceAssignmentModal.value = {
        visible: true,
        task: serviceTask
      }
    } else {
      // This is a research task assignment (show prompt for now)
      alert(`Assign clicked: ${task.name}`)
    }
  }
}

function showProfile(staff: Staff) {
  activeProfile.value = staff
}

function downloadResults() {
  // Generate CSV content for four worksheets
  const teachingData = generateTeachingData()
  const researchData = generateResearchData()
  const serviceData = generateServiceData()
  const staffData = generateStaffData()
  
  // Create text file containing all data
  const fileContent = `=== TEACHING ASSIGNMENTS ===\n${teachingData}\n\n=== RESEARCH ASSIGNMENTS ===\n${researchData}\n\n=== SERVICE ASSIGNMENTS ===\n${serviceData}\n\n=== STAFF ASSIGNMENTS ===\n${staffData}`
  
  // Create and download file
  const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'workload_assignments.csv')
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  alert('Assignment results exported successfully!')
}

// Generate teaching assignment data
function generateTeachingData() {
  const headers = ['Course ID', 'Course Name', 'Course Type', 'Total Hours', 'Assigned Teachers', 'Assigned Hours', 'Remaining Hours']
  const rows = [headers.join(',')]
  
  teachingCourses.value.forEach(course => {
    const assignedTeachers = course.assignedTo || 'Unassigned'
    const assignedHours = course.assignedHours || 0
    const remainingHours = course.totalHours - assignedHours
    
    const row = [
      course.id,
      course.name,
      course.type,
      course.totalHours,
      assignedTeachers,
      assignedHours,
      remainingHours
    ].join(',')
    
    rows.push(row)
  })
  
  return rows.join('\n')
}

// Generate research assignment data
function generateResearchData() {
  const headers = ['Task ID', 'Task Name', 'Total Hours', 'Assigned Staff', 'Assigned Hours', 'Remaining Hours']
  const rows = [headers.join(',')]
  
  researchTasks.value.forEach(task => {
    const assignedStaff = task.assignedTo || 'Unassigned'
    const assignedHours = task.assignedHours || 0
    const remainingHours = task.totalHours - assignedHours
    
    const row = [
      task.id,
      task.name,
      task.totalHours,
      assignedStaff,
      assignedHours,
      remainingHours
    ].join(',')
    
    rows.push(row)
  })
  
  return rows.join('\n')
}

// Generate service assignment data
function generateServiceData() {
  const headers = ['Task ID', 'Task Name', 'Total Hours', 'Assigned Staff', 'Assigned Hours', 'Remaining Hours']
  const rows = [headers.join(',')]
  
  serviceTasks.value.forEach(task => {
    const assignedStaff = task.assignedTo || 'Unassigned'
    const assignedHours = task.assignedHours || 0
    const remainingHours = task.totalHours - assignedHours
    
    const row = [
      task.id,
      task.name,
      task.totalHours,
      assignedStaff,
      assignedHours,
      remainingHours
    ].join(',')
    
    rows.push(row)
  })
  
  return rows.join('\n')
}

// Generate staff assignment data
function generateStaffData() {
  const headers = ['Staff ID', 'Name', 'Job Number', 'Teaching Interests', 'Assigned Teaching Hours', 'Assigned Research Hours', 'Assigned Service Hours', 'Total Assigned Hours', 'Teaching Assignments', 'Service Assignments']
  const rows = [headers.join(',')]
  
  staffList.value.forEach(staff => {
    // Get teaching assignments for this staff member
    const teachingAssignments = teachingCourses.value
      .filter(course => course.assignedTo && course.assignedTo.includes(staff.name))
      .map(course => `${course.name} (${course.assignedTo.match(new RegExp(`${staff.name}\\s+(\\d+)h`))?.[1] || 0}h)`)
      .join('; ')
    
    // Get service assignments for this staff member
    const serviceAssignments = serviceTasks.value
      .filter(task => task.assignedTo && task.assignedTo.includes(staff.name))
      .map(task => `${task.name} (${task.assignedTo.match(new RegExp(`${staff.name}\\s+(\\d+)h`))?.[1] || 0}h)`)
      .join('; ')
    
    const totalAssignedHours = staff.assignedTeachingHours + staff.assignedResearchHours + staff.assignedServiceHours
    const teachingInterests = staff.teachingInterests ? staff.teachingInterests.join('; ') : ''
    
    const row = [
      staff.id,
      staff.name,
      staff.jobNumber,
      `"${teachingInterests}"`,
      staff.assignedTeachingHours,
      staff.assignedResearchHours,
      staff.assignedServiceHours,
      totalAssignedHours,
      `"${teachingAssignments}"`,
      `"${serviceAssignments}"`
    ].join(',')
    
    rows.push(row)
  })
  
  return rows.join('\n')
}

// Handle course assignment confirmation
function handleCourseAssignment(assignmentData: {
  courseId: number
  assignments: Array<{
    teacherId: number
    teacherName: string
    hours: number
  }>
}) {
  const course = teachingCourses.value.find(c => c.id === assignmentData.courseId)
  if (course) {
      // If this is a reassignment, first subtract the previous hours
  if (course.assignedTo) {
    // Parse previous assignment information and subtract hours
      const assignmentParts = course.assignedTo.split(', ')
      assignmentParts.forEach(part => {
        const match = part.match(/^(.+?)\s+(\d+)h$/)
        if (match) {
          const teacherName = match[1].trim()
          const hours = parseInt(match[2])
          
          const staff = staffList.value.find(s => s.name === teacherName)
          if (staff) {
            staff.assignedTeachingHours -= hours
          }
        }
      })
    }
    
    // Update course assignment information
    const assignmentText = assignmentData.assignments
      .map(a => `${a.teacherName} ${a.hours}h`)
      .join(', ')
    
    course.assignedTo = assignmentText
    course.assignedHours = assignmentData.assignments.reduce((total, a) => total + a.hours, 0)
    
    // Update staff hours
    assignmentData.assignments.forEach(assignment => {
      const staff = staffList.value.find(s => s.id === assignment.teacherId)
      if (staff) {
        staff.assignedTeachingHours += assignment.hours
      }
    })
    
    const action = course.assignedTo ? 'reassigned' : 'assigned'
    alert(`Successfully ${action} ${assignmentData.assignments.length} teacher(s) to ${course.name}`)
  }
  
  // Close modal
  assignmentModal.value.visible = false
  assignmentModal.value.course = null
}

// Close assignment modal
function closeAssignmentModal() {
  assignmentModal.value.visible = false
  assignmentModal.value.course = null
}

// Handle service task assignment confirmation
function handleServiceAssignment(assignmentData: {
  taskId: number
  assignments: Array<{
    staffId: number
    staffName: string
    hours: number
  }>
}) {
  const task = serviceTasks.value.find(t => t.id === assignmentData.taskId)
  if (task) {
    // If this is a reassignment, first subtract the previous hours
    if (task.assignedTo) {
      // Parse previous assignment information and subtract hours
      const assignmentParts = task.assignedTo.split(', ')
      assignmentParts.forEach(part => {
        const match = part.match(/^(.+?)\s+(\d+)h$/)
        if (match) {
          const staffName = match[1].trim()
          const hours = parseInt(match[2])
          
          const staff = staffList.value.find(s => s.name === staffName)
          if (staff) {
            staff.assignedServiceHours -= hours
          }
        }
      })
    }
    
    // Update service task assignment information
    const assignmentText = assignmentData.assignments
      .map(a => `${a.staffName} ${a.hours}h`)
      .join(', ')
    
    task.assignedTo = assignmentText
    task.assignedHours = assignmentData.assignments.reduce((total, a) => total + a.hours, 0)
    
    // Update staff hours
    assignmentData.assignments.forEach(assignment => {
      const staff = staffList.value.find(s => s.id === assignment.staffId)
      if (staff) {
        staff.assignedServiceHours += assignment.hours
      }
    })
    
    const action = task.assignedTo ? 'reassigned' : 'assigned'
    alert(`Successfully ${action} ${assignmentData.assignments.length} staff member(s) to ${task.name}`)
  }
  
  // Close modal
  serviceAssignmentModal.value.visible = false
  serviceAssignmentModal.value.task = null
}

// Close service task assignment modal
function closeServiceAssignmentModal() {
  serviceAssignmentModal.value.visible = false
  serviceAssignmentModal.value.task = null
}

// Upload functions
function uploadCourses() {
  courseFileInput.value?.click()
}

function uploadStaff() {
  staffFileInput.value?.click()
}

function uploadResearch() {
  researchFileInput.value?.click()
}

function uploadService() {
  serviceFileInput.value?.click()
}

// Smart CSV parsing function that correctly handles commas within quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add the last field
  result.push(current.trim())
  
  return result
}

// Download template functions
function downloadStaffTemplate() {
  // Create CSV template content
  const csvContent = `Name,Job Number,Teaching Interests
Wei Zhang,12345,"Mathematics,Statistics,Data Science"
Anna Lee,67890,"Computer Science,Programming,Software Engineering"
John Smith,11111,"Physics,Chemistry"
Jane Doe,22222,"Biology,Medicine"
Mike Johnson,33333,"Economics,Business"
`
  
  // Create Blob object
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'staff_template.csv')
  link.style.visibility = 'hidden'
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up URL object
  URL.revokeObjectURL(url)
  
  alert('Staff template downloaded! Please fill in the data and upload the file.')
}

// Download course template function
function downloadCourseTemplate() {
  // Create CSV template content
  const csvContent = `ID,Name,Type,Total Hours
1,Course 1,Workshop,30
2,Course 2,Lecture,30
3,Course 3,Tutorial,30
4,Advanced Mathematics,Lecture,45
5,Programming Workshop,Workshop,20
6,Research Methods,Tutorial,25
`
  
  // Create Blob object
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'course_template.csv')
  link.style.visibility = 'hidden'
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up URL object
  URL.revokeObjectURL(url)
  
  alert('Course template downloaded! Please fill in the data and upload the file.')
}

function handleCourseFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      try {
        // Parse CSV content
        const lines = content.split('\n').filter(line => line.trim())
        const headers = parseCSVLine(lines[0])
        
        // Validate CSV format
        const expectedHeaders = ['ID', 'Name', 'Type', 'Total Hours']
        const isValidFormat = expectedHeaders.every(header => headers.includes(header))
        
        if (!isValidFormat) {
          alert('Invalid CSV format. Please use the downloaded template.')
          return
        }
        
        // Parse data rows
        const newCourses: Course[] = []
        const existingCourseNames = new Set(teachingCourses.value.map(course => course.name))
        const duplicateCourseNames: string[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          if (values.length >= 4) {
            const courseName = values[1]
            
            // Check if course name already exists
            if (existingCourseNames.has(courseName)) {
              duplicateCourseNames.push(courseName)
              continue // Skip duplicate course names
            }
            
            const course: Course = {
              id: parseInt(values[0]) || Date.now() + i, // Use provided ID or generate new ID
              name: courseName,
              type: values[2],
              totalHours: parseInt(values[3]) || 0
            }
            newCourses.push(course)
            existingCourseNames.add(courseName) // Add to existing course names set
          }
        }
        
        if (newCourses.length > 0) {
          teachingCourses.value.push(...newCourses)
          let message = `Successfully imported ${newCourses.length} courses from CSV file.`
          
          if (duplicateCourseNames.length > 0) {
            message += `\nSkipped ${duplicateCourseNames.length} duplicate course names: ${duplicateCourseNames.join(', ')}`
          }
          
          alert(message)
        } else if (duplicateCourseNames.length > 0) {
          alert(`No new courses imported. All course names already exist: ${duplicateCourseNames.join(', ')}`)
        } else {
          alert('No valid course data found in the CSV file.')
        }
        
      } catch (error) {
        alert('Error parsing CSV file. Please check the format and try again.')
        console.error('CSV parsing error:', error)
      }
    }
    
    reader.readAsText(file)
  }
  // Clear input value to allow uploading the same file again
  target.value = ''
}

function handleStaffFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      try {
        // Parse CSV content
        const lines = content.split('\n').filter(line => line.trim())
        const headers = parseCSVLine(lines[0])
        
        // Validate CSV format
        const expectedHeaders = ['Name', 'Job Number', 'Teaching Interests']
        const isValidFormat = expectedHeaders.every(header => headers.includes(header))
        
        if (!isValidFormat) {
          alert('Invalid CSV format. Please use the downloaded template.')
          return
        }
        
        // Parse data rows
        const newStaff: Staff[] = []
        const existingJobNumbers = new Set(staffList.value.map(staff => staff.jobNumber))
        const duplicateJobNumbers: string[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          if (values.length >= 3) {
            const jobNumber = values[1]
            
            // Check if job number already exists
            if (existingJobNumbers.has(jobNumber)) {
              duplicateJobNumbers.push(jobNumber)
              continue // Skip duplicate job numbers
            }
            
            // Parse teaching interests field (remove quotes and split)
            let teachingInterests: string[] = []
            const interestsStr = values[2].replace(/^"|"$/g, '') // Remove leading and trailing quotes
            if (interestsStr && interestsStr !== '') {
              teachingInterests = interestsStr.split(',').map(interest => interest.trim())
            }
            
            const staff: Staff = {
              id: Date.now() + i, // Generate unique ID
              name: values[0],
              jobNumber: jobNumber,
              teachingInterests: teachingInterests.length > 0 ? teachingInterests : undefined,
              assignedTeachingHours: 0, // Automatically set to 0
              assignedResearchHours: 0, // Automatically set to 0
              assignedServiceHours: 0   // Automatically set to 0
            }
            newStaff.push(staff)
            existingJobNumbers.add(jobNumber) // Add to existing job numbers set
          }
        }
        
        if (newStaff.length > 0) {
          staffList.value.push(...newStaff)
          let message = `Successfully imported ${newStaff.length} staff members from CSV file.`
          
          if (duplicateJobNumbers.length > 0) {
            message += `\nSkipped ${duplicateJobNumbers.length} duplicate job numbers: ${duplicateJobNumbers.join(', ')}`
          }
          
          alert(message)
        } else if (duplicateJobNumbers.length > 0) {
          alert(`No new staff imported. All job numbers already exist: ${duplicateJobNumbers.join(', ')}`)
        } else {
          alert('No valid staff data found in the CSV file.')
        }
        
      } catch (error) {
        alert('Error parsing CSV file. Please check the format and try again.')
        console.error('CSV parsing error:', error)
      }
    }
    
    reader.readAsText(file)
  }
  // Clear input value to allow uploading the same file again
  target.value = ''
}

function handleResearchFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    alert(`Research file uploaded: ${file.name}`)
    // Simulated parsed data
    const newResearchTasks: Task[] = [
      { id: 103, name: 'New Research Project C', totalHours: 60 },
      { id: 104, name: 'New Research Project D', totalHours: 55 }
    ]
    researchTasks.value.push(...newResearchTasks)
  }
  target.value = ''
}

function handleServiceFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    alert(`Service file uploaded: ${file.name}`)
    // Simulated parsed data
    const newServiceTasks: Task[] = [
      { id: 203, name: 'New Outreach Task', totalHours: 30 },
      { id: 204, name: 'New Committee Work Task', totalHours: 25 }
    ]
    serviceTasks.value.push(...newServiceTasks)
  }
  target.value = ''
}
</script>

<style scoped>
.app-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  height: 100vh;
  box-sizing: border-box;
}
.column {
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  overflow-y: auto;
}
.column-title {
  margin: 8px 0;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.teaching-icon {
  background-color: #f56c6c;
}
.research-icon {
  background-color: #409eff;
}
.service-icon {
  background-color: #e6a23c;
}
.upload-section {
  margin-bottom: 12px;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 4px;
}
.upload-hint {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}
.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.footer-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  text-align: center;
}
.download-hint {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.2;
  max-width: 200px;
}
</style>
