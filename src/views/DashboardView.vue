<template>
  <div class="container mt-5 pt-4">
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
                <div class="col-md-6">
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
                <div class="col-md-6">
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
              <span class="h4 text-primary">{{ userClasses.length }}</span>
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
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ currentUser.role === 'coach' ? 'My Classes' : 'Available Classes' }}</h5>
          </div>
          <div class="card-body">
            <div v-if="displayClasses.length === 0" class="text-center text-muted py-4">
              {{ currentUser.role === 'coach' ? 'No classes created yet. Click "Create New Class" to get started!' : 'No classes available at the moment.' }}
            </div>
            <div v-else class="row g-3">
              <div v-for="classItem in displayClasses" :key="classItem.id" class="col-md-6 col-lg-4">
                <div class="class-card">
                  <div class="class-header">
                    <h6 class="class-title">{{ classItem.name }}</h6>
                    <span class="badge bg-secondary">{{ classItem.category }}</span>
                  </div>
                  <div class="class-body">
                    <div class="class-meta">
                      <div class="meta-item">
                        <i class="icon">📅</i>
                        <span>{{ formatDate(classItem.dateTime) }}</span>
                      </div>
                      <div class="meta-item">
                        <i class="icon">⏰</i>
                        <span>{{ classItem.duration }}</span>
                      </div>
                      <div class="meta-item">
                        <i class="icon">👨‍🏫</i>
                        <span>{{ classItem.coachSpecialization || 'General' }} Coach</span>
                      </div>
                    </div>
                    <p class="class-description">{{ classItem.description || 'No description provided' }}</p>
                  </div>
                  <div class="class-footer">
                    <small class="text-muted">{{ currentUser.role === 'coach' ? 'Created' : 'By' }} {{ formatDate(classItem.createdAt) }}</small>
                    <div class="class-actions">
                      <button v-if="currentUser.role === 'coach'" class="btn btn-sm btn-outline-primary" @click="editClass(classItem)">Edit</button>
                      <button v-if="currentUser.role === 'coach'" class="btn btn-sm btn-outline-danger" @click="deleteClass(classItem.id)">Delete</button>
                      <button v-if="currentUser.role === 'user' && !isUserEnrolled(classItem.id)" class="btn btn-sm btn-primary" @click="joinClass(classItem.id)">Join</button>
                      <button v-if="currentUser.role === 'user' && isUserEnrolled(classItem.id)" class="btn btn-sm btn-success" disabled>Joined</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <RouterLink to="/reviews" class="btn btn-primary w-100">
                  {{ currentUser.role === 'coach' ? 'View Class Reviews' : 'Write Reviews' }}
                </RouterLink>
              </div>
              <div v-if="currentUser.role === 'user'" class="col-md-4">
                <RouterLink to="/coaches" class="btn btn-outline-primary w-100">
                  Become a Coach
                </RouterLink>
              </div>
              <div class="col-md-4">
                <button class="btn btn-outline-secondary w-100" @click="refreshData">
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../auth/authService'

const { currentUser } = useAuth()

const showCreateForm = ref(false)
const submitting = ref(false)
const activeClasses = ref([])
const userClasses = ref([])
const userReviews = ref([])
const userEnrollments = ref([])

const newClass = ref({
  name: '',
  category: '',
  dateTime: '',
  duration: '',
  description: ''
})

const coachSpecialization = computed(() => {
  const applications = JSON.parse(localStorage.getItem('coachApplications') || '[]')
  const coachApp = applications.find(app => app.userId === currentUser.value?.id)
  return coachApp?.specialization || 'General'
})

const totalStudents = computed(() => {
  return activeClasses.value.reduce((total, cls) => total + (cls.enrolledStudents || 0), 0)
})

const averageRating = computed(() => {
  const reviews = JSON.parse(localStorage.getItem('classReviews') || '[]')
  const coachReviews = reviews.filter(review => {
    const reviewClass = activeClasses.value.find(cls => cls.id === review.classId)
    return reviewClass && reviewClass.coachId === currentUser.value?.id
  })
  if (coachReviews.length === 0) return 0
  const total = coachReviews.reduce((sum, review) => sum + review.rating, 0)
  return total / coachReviews.length
})

const thisMonthClasses = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return activeClasses.value.filter(cls => {
    const classDate = new Date(cls.dateTime)
    return classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear
  }).length
})

const availableClasses = computed(() => {
  const allClasses = JSON.parse(localStorage.getItem('classes') || '[]')
  return allClasses.filter(cls => cls.coachId !== currentUser.value?.id)
})

const displayClasses = computed(() => {
  return currentUser.value?.role === 'coach' ? activeClasses.value : availableClasses.value
})

const isUserEnrolled = (classId) => {
  return userEnrollments.value.some(enrollment => enrollment.classId === classId)
}

const loadData = () => {
  if (currentUser.value?.role === 'coach') {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]')
    activeClasses.value = classes.filter(cls => cls.coachId === currentUser.value?.id)
  } else {
    const enrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]')
    userEnrollments.value = enrollments.filter(enrollment => enrollment.userId === currentUser.value?.id)

    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]')
    userClasses.value = allClasses.filter(cls =>
      userEnrollments.value.some(enrollment => enrollment.classId === cls.id)
    )
  }

  const reviews = JSON.parse(localStorage.getItem('classReviews') || '[]')
  userReviews.value = reviews.filter(review => review.userId === currentUser.value?.id)
}

const createClass = async () => {
  submitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 600))

    const classData = {
      id: Date.now().toString(),
      coachId: currentUser.value.id,
      coachName: currentUser.value.name,
      coachSpecialization: coachSpecialization.value,
      name: newClass.value.name,
      category: newClass.value.category,
      dateTime: newClass.value.dateTime,
      duration: newClass.value.duration,
      description: newClass.value.description,
      enrolledStudents: 0,
      createdAt: new Date().toISOString()
    }

    const classes = JSON.parse(localStorage.getItem('classes') || '[]')
    classes.push(classData)
    localStorage.setItem('classes', JSON.stringify(classes))

    activeClasses.value.push(classData)

    newClass.value = {
      name: '',
      category: '',
      dateTime: '',
      duration: '',
      description: ''
    }
    showCreateForm.value = false

  } catch (error) {
    console.error('Error creating class:', error)
  } finally {
    submitting.value = false
  }
}

const joinClass = (classId) => {
  const enrollment = {
    id: Date.now().toString(),
    userId: currentUser.value.id,
    classId: classId,
    enrolledAt: new Date().toISOString()
  }

  const enrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]')
  enrollments.push(enrollment)
  localStorage.setItem('userEnrollments', JSON.stringify(enrollments))

  const classes = JSON.parse(localStorage.getItem('classes') || '[]')
  const classIndex = classes.findIndex(cls => cls.id === classId)
  if (classIndex !== -1) {
    classes[classIndex].enrolledStudents = (classes[classIndex].enrolledStudents || 0) + 1
    localStorage.setItem('classes', JSON.stringify(classes))
  }

  loadData()
}

const editClass = (classItem) => {
  console.log('Edit class:', classItem)
}

const deleteClass = (classId) => {
  if (confirm('Are you sure you want to delete this class?')) {
    activeClasses.value = activeClasses.value.filter(cls => cls.id !== classId)

    const classes = JSON.parse(localStorage.getItem('classes') || '[]')
    const updatedClasses = classes.filter(cls => cls.id !== classId)
    localStorage.setItem('classes', JSON.stringify(updatedClasses))
  }
}

const refreshData = () => {
  loadData()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

.class-card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.class-title {
  margin: 0;
  color: #495057;
  flex-grow: 1;
}

.class-body {
  flex-grow: 1;
}

.class-meta {
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.icon {
  margin-right: 0.5rem;
  width: 1.2rem;
}

.class-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.class-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.class-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
