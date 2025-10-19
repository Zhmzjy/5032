<template>
  <div v-if="currentUser" class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12">
        <div class="welcome-header mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3">Welcome back, {{ currentUser.name }}!</h1>
            <p class="text-muted mb-0">
              {{ currentUser.role === 'coach' ? 'Manage your classes and connect with your community' : 'Track your fitness journey and discover new activities' }}
            </p>
            <span v-if="currentUser.role === 'coach'" class="badge bg-primary">{{ coachSpecialization }} Coach</span>
          </div>
          <button v-if="currentUser.role === 'coach'" class="btn btn-primary" @click="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Cancel' : 'Create New Class' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="currentUser.role === 'coach' && showCreateForm" class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Create New Class</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="createClass">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="className" class="form-label">Class Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="className"
                      v-model="newClass.name"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="category" class="form-label">Category</label>
                    <select
                      class="form-select"
                      id="category"
                      v-model="newClass.category"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Yoga">Yoga</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Dance">Dance</option>
                      <option value="Pilates">Pilates</option>
                      <option value="Personal Training">Personal Training</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="classDate" class="form-label">Class Date & Time</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      id="classDate"
                      v-model="newClass.dateTime"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="duration" class="form-label">Duration</label>
                    <select
                      class="form-select"
                      id="duration"
                      v-model="newClass.duration"
                      required
                    >
                      <option value="">Select duration</option>
                      <option value="1h">1 hour</option>
                      <option value="1.5h">1.5 hours</option>
                      <option value="2h">2 hours</option>
                      <option value="3h">3 hours</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="maxCapacity" class="form-label">Max Capacity</label>
                    <input
                      type="number"
                      class="form-control"
                      id="maxCapacity"
                      v-model.number="newClass.maxCapacity"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea
                  class="form-control"
                  id="description"
                  rows="3"
                  v-model="newClass.description"
                  placeholder="Brief description of the class"
                ></textarea>
              </div>

              <button type="submit" class="btn btn-success me-2" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Creating...' : 'Create Class' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentUser.role === 'coach'" class="row g-4 mb-4">
      <div class="col-md-6 col-lg-3">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">Active Classes</h5>
            <div class="stat-number text-primary">{{ activeClasses.length }}</div>
            <small class="text-muted">total classes</small>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">Total Students</h5>
            <div class="stat-number text-success">{{ totalStudents }}</div>
            <small class="text-muted">enrolled</small>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">Average Rating</h5>
            <div class="stat-number text-warning">{{ averageRating.toFixed(1) }}</div>
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(averageRating) }">★</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">This Month</h5>
            <div class="stat-number text-info">{{ thisMonthClasses }}</div>
            <small class="text-muted">classes scheduled</small>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="row g-4 mb-4">
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">My Classes</h5>
            <p class="card-text">Classes you have joined</p>
            <div class="activity-count">
              <span class="h4 text-primary">{{ userEnrollments.length }}</span>
              <small class="text-muted">enrolled</small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">My Reviews</h5>
            <p class="card-text">Reviews you have submitted</p>
            <div class="activity-count">
              <span class="h4 text-success">{{ userReviews.length }}</span>
              <small class="text-muted">reviews</small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Available Classes</h5>
            <p class="card-text">Classes you can join</p>
            <div class="activity-count">
              <span class="h4 text-info">{{ availableClasses.length }}</span>
              <small class="text-muted">available</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ currentUser.role === 'coach' ? 'My Classes Management' : 'Available Classes' }}</h5>
            <span class="badge bg-secondary">{{ totalClasses }} total</span>
          </div>

          <div class="card-body border-bottom">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text">🔍</span>
                  <input
                    type="text"
                    class="form-control"
                    :placeholder="currentUser.role === 'coach' ? 'Search by name...' : 'Search by name or coach...'"
                    v-model="searchQuery"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="categoryFilter">
                  <option value="all">All Categories</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Dance">Dance</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Personal Training">Personal Training</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="statusFilter">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="full">Full</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div class="col-md-2">
                <select class="form-select" v-model="pageSize">
                  <option :value="10">10 per page</option>
                  <option :value="20">20 per page</option>
                  <option :value="50">50 per page</option>
                </select>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0">
              <thead class="table-light">
                <tr>
                  <th @click="handleSort('name')" class="sortable">
                    Class Name
                    <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="handleSort('category')" class="sortable">
                    Category
                    <span v-if="sortBy === 'category'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th v-if="currentUser.role === 'user'">Coach</th>
                  <th @click="handleSort('dateTime')" class="sortable">
                    Date & Time
                    <span v-if="sortBy === 'dateTime'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th>Duration</th>
                  <th @click="handleSort('enrolledStudents')" class="sortable text-center">
                    Enrolled
                    <span v-if="sortBy === 'enrolledStudents'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td :colspan="currentUser.role === 'coach' ? 7 : 8" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading classes...
                  </td>
                </tr>
                <tr v-else-if="paginatedClasses.length === 0">
                  <td :colspan="currentUser.role === 'coach' ? 7 : 8" class="text-center py-4 text-muted">
                    <div class="mb-2">📭</div>
                    {{ searchQuery ? 'No classes found matching your search.' : 'No classes available.' }}
                  </td>
                </tr>
                <tr v-else v-for="classItem in paginatedClasses" :key="classItem.id">
                  <td>
                    <div class="text-truncate" style="max-width: 200px;" :title="classItem.name">
                      <strong>{{ classItem.name }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ classItem.category }}</span>
                  </td>
                  <td v-if="currentUser.role === 'user'">
                    <small>{{ classItem.coachName || 'Unknown' }}</small>
                  </td>
                  <td class="text-nowrap">
                    <small>{{ formatDateTime(classItem.dateTime) }}</small>
                  </td>
                  <td>
                    <small>{{ classItem.duration }}</small>
                  </td>
                  <td class="text-center">
                    <span :class="getEnrollmentClass(classItem)">
                      {{ classItem.enrolledStudents || 0 }}/{{ classItem.maxCapacity || 20 }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge" :class="getStatusBadgeClass(classItem)">
                      {{ getClassStatusText(classItem) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group btn-group-sm">
                      <button
                        v-if="currentUser.role === 'coach'"
                        class="btn btn-outline-primary"
                        @click="viewEnrollments(classItem)"
                        :title="'View ' + (classItem.enrolledStudents || 0) + ' students'"
                      >
                        👥
                      </button>
                      <button
                        v-if="currentUser.role === 'coach'"
                        class="btn btn-outline-secondary"
                        @click="editClass(classItem)"
                      >
                        Edit
                      </button>
                      <button
                        v-if="currentUser.role === 'coach'"
                        class="btn btn-outline-danger"
                        @click="deleteClass(classItem.id)"
                      >
                        Delete
                      </button>
                      <button
                        v-if="currentUser.role === 'user' && !isUserEnrolled(classItem.id)"
                        class="btn btn-primary"
                        @click="joinClass(classItem)"
                        :disabled="getClassStatusText(classItem) !== 'Active'"
                      >
                        Join
                      </button>
                      <button
                        v-if="currentUser.role === 'user' && isUserEnrolled(classItem.id)"
                        class="btn btn-success"
                        @click="unenrollClass(classItem.id)"
                      >
                        ✓ Enrolled
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredClasses.length }} classes
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                    Previous
                  </button>
                </li>
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedClassEnrollments" class="modal fade show d-block" tabindex="-1" @click.self="closeEnrollmentsModal">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Enrolled Students - {{ selectedClassName }}</h5>
            <button type="button" class="btn-close" @click="closeEnrollmentsModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedClassEnrollments.length === 0" class="text-center text-muted py-4">
              No students enrolled yet
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Enrolled Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="enrollment in selectedClassEnrollments" :key="enrollment.id">
                    <td>{{ enrollment.userName }}</td>
                    <td>{{ formatDate(enrollment.enrolledAt) }}</td>
                    <td>
                      <span class="badge bg-success">{{ enrollment.status || 'active' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEnrollmentsModal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedClassEnrollments" class="modal-backdrop fade show"></div>
  </div>
  <div v-else class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your dashboard...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../auth/authService'
import {
  createClass as createClassFirestore,
  getClassesByCoach,
  getAllClasses,
  deleteClass as deleteClassFirestore,
  enrollInClass,
  unenrollFromClass,
  getUserEnrollments,
  getClassEnrollments,
  isUserEnrolled as checkEnrollment,
  getClassStatus
} from '../services/classService'
import { getCoachApplicationByUserId } from '../services/coachService'
import { getReviewsByCoach, getReviewsByUser } from '../services/reviewService'

const { currentUser } = useAuth()

const showCreateForm = ref(false)
const submitting = ref(false)
const loading = ref(false)
const activeClasses = ref([])
const allClassesList = ref([])
const userReviews = ref([])
const userEnrollments = ref([])
const coachApplication = ref(null)

const searchQuery = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('dateTime')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(10)

const selectedClassEnrollments = ref(null)
const selectedClassName = ref('')

const newClass = ref({
  name: '',
  category: '',
  dateTime: '',
  duration: '',
  maxCapacity: 20,
  description: ''
})

const coachSpecialization = computed(() => {
  return coachApplication.value?.specialization || 'General'
})

const totalStudents = computed(() => {
  return activeClasses.value.reduce((total, cls) => total + (cls.enrolledStudents || 0), 0)
})

const averageRating = computed(() => {
  const coachReviews = userReviews.value
  if (coachReviews.length === 0) return 0
  const total = coachReviews.reduce((sum, review) => sum + review.rating, 0)
  return total / coachReviews.length
})

const thisMonthClasses = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return activeClasses.value.filter(cls => {
    if (!cls.dateTime) return false
    const classDate = cls.dateTime?.toDate ? cls.dateTime.toDate() : new Date(cls.dateTime)
    return classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear
  }).length
})

const availableClasses = computed(() => {
  return allClassesList.value.filter(cls => cls.coachId !== currentUser.value?.id)
})

const displayClasses = computed(() => {
  return currentUser.value?.role === 'coach' ? activeClasses.value : allClassesList.value
})

const filteredClasses = computed(() => {
  let classes = [...displayClasses.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    classes = classes.filter(cls =>
      cls.name?.toLowerCase().includes(query) ||
      cls.coachName?.toLowerCase().includes(query) ||
      cls.description?.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value !== 'all') {
    classes = classes.filter(cls => cls.category === categoryFilter.value)
  }

  if (statusFilter.value !== 'all') {
    classes = classes.filter(cls => getClassStatusText(cls).toLowerCase() === statusFilter.value)
  }

  classes.sort((a, b) => {
    let aVal, bVal

    if (sortBy.value === 'dateTime') {
      aVal = a.dateTime?.toDate ? a.dateTime.toDate() : new Date(a.dateTime || 0)
      bVal = b.dateTime?.toDate ? b.dateTime.toDate() : new Date(b.dateTime || 0)
    } else if (sortBy.value === 'enrolledStudents') {
      aVal = a.enrolledStudents || 0
      bVal = b.enrolledStudents || 0
    } else {
      aVal = (a[sortBy.value] || '').toString().toLowerCase()
      bVal = (b[sortBy.value] || '').toString().toLowerCase()
    }

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return classes
})

const totalClasses = computed(() => filteredClasses.value.length)
const totalPages = computed(() => Math.ceil(filteredClasses.value.length / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredClasses.value.length))

const paginatedClasses = computed(() => {
  return filteredClasses.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const isUserEnrolled = (classId) => {
  return userEnrollments.value.some(enrollment => enrollment.classId === classId)
}

const getClassStatusText = (classItem) => {
  const status = getClassStatus(classItem)
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusBadgeClass = (classItem) => {
  const status = getClassStatus(classItem)
  return {
    'bg-success': status === 'active',
    'bg-danger': status === 'full',
    'bg-secondary': status === 'completed',
    'bg-warning': status === 'cancelled'
  }
}

const getEnrollmentClass = (classItem) => {
  const enrolled = classItem.enrolledStudents || 0
  const capacity = classItem.maxCapacity || 20
  const percentage = (enrolled / capacity) * 100

  if (percentage >= 100) return 'badge bg-danger'
  if (percentage >= 80) return 'badge bg-warning'
  return 'badge bg-success'
}

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const loadData = async () => {
  loading.value = true
  try {
    if (currentUser.value?.role === 'coach') {
      activeClasses.value = await getClassesByCoach(currentUser.value.id)
      userReviews.value = await getReviewsByCoach(currentUser.value.id)
      coachApplication.value = await getCoachApplicationByUserId(currentUser.value.id)
    } else {
      allClassesList.value = await getAllClasses()
      userEnrollments.value = await getUserEnrollments(currentUser.value.id)
      userReviews.value = await getReviewsByUser(currentUser.value.id)
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const createClass = async () => {
  submitting.value = true

  try {
    const classData = {
      coachId: currentUser.value.id,
      coachName: currentUser.value.name,
      coachSpecialization: coachSpecialization.value,
      name: newClass.value.name,
      category: newClass.value.category,
      dateTime: newClass.value.dateTime,
      duration: newClass.value.duration,
      maxCapacity: newClass.value.maxCapacity,
      description: newClass.value.description
    }

    await createClassFirestore(classData)
    await loadData()

    newClass.value = {
      name: '',
      category: '',
      dateTime: '',
      duration: '',
      maxCapacity: 20,
      description: ''
    }
    showCreateForm.value = false
    alert('Class created successfully!')
  } catch (error) {
    console.error('Error creating class:', error)
    alert('Failed to create class. Please try again.')
  } finally {
    submitting.value = false
  }
}

const joinClass = async (classItem) => {
  try {
    const status = getClassStatus(classItem)
    if (status !== 'active') {
      alert('This class is not available for enrollment')
      return
    }

    await enrollInClass(currentUser.value.id, classItem.id, currentUser.value.name)
    await loadData()
    alert('Successfully enrolled in class!')
  } catch (error) {
    console.error('Error joining class:', error)
    alert(error.message || 'Failed to join class. Please try again.')
  }
}

const unenrollClass = async (classId) => {
  if (confirm('Are you sure you want to unenroll from this class?')) {
    try {
      await unenrollFromClass(currentUser.value.id, classId)
      await loadData()
      alert('Successfully unenrolled from class')
    } catch (error) {
      console.error('Error unenrolling:', error)
      alert('Failed to unenroll. Please try again.')
    }
  }
}

const viewEnrollments = async (classItem) => {
  try {
    selectedClassName.value = classItem.name
    selectedClassEnrollments.value = await getClassEnrollments(classItem.id)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    alert('Failed to load enrollment data')
  }
}

const closeEnrollmentsModal = () => {
  selectedClassEnrollments.value = null
  selectedClassName.value = ''
}

const editClass = (classItem) => {
  console.log('Edit class:', classItem)
  alert('Edit functionality coming soon!')
}

const deleteClass = async (classId) => {
  if (confirm('Are you sure you want to delete this class? This will also remove all enrollments.')) {
    try {
      await deleteClassFirestore(classId)
      await loadData()
      alert('Class deleted successfully')
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class. Please try again.')
    }
  }
}

const formatDateTime = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.welcome-header {
  text-align: left;
}

.activity-count {
  text-align: center;
  margin-top: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  display: block;
  margin: 0.5rem 0;
}

.rating-stars {
  margin-top: 0.5rem;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffc107;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
