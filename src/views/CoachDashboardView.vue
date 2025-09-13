<template>
  <div class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12">
        <div class="welcome-header mb-4">
          <h1 class="h3">Coach Dashboard</h1>
          <p class="text-muted">Manage your activities and connect with your community</p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-6 col-lg-3">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">Active Classes</h5>
            <div class="stat-number text-primary">{{ activeClasses.length }}</div>
            <small class="text-muted">this month</small>
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
            <h5 class="card-title">Reviews</h5>
            <div class="stat-number text-info">{{ coachReviews.length }}</div>
            <small class="text-muted">total reviews</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">My Classes</h5>
            <button class="btn btn-primary btn-sm" @click="createNewClass">
              Create New Class
            </button>
          </div>
          <div class="card-body">
            <div v-if="activeClasses.length === 0" class="text-center text-muted py-4">
              No classes scheduled. Create your first class to get started!
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Date & Time</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="classItem in activeClasses" :key="classItem.id">
                    <td>{{ classItem.name }}</td>
                    <td>{{ classItem.datetime }}</td>
                    <td>{{ classItem.students }}</td>
                    <td>
                      <span class="badge" :class="getStatusClass(classItem.status)">
                        {{ classItem.status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-2" @click="editClass(classItem)">
                        Edit
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="cancelClass(classItem)">
                        Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Recent Reviews</h5>
          </div>
          <div class="card-body">
            <div v-if="coachReviews.length === 0" class="text-center text-muted py-3">
              No reviews yet
            </div>
            <div v-else>
              <div v-for="review in recentReviews" :key="review.id" class="review-item mb-3">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ review.userName }}</h6>
                    <div class="rating-stars mb-1">
                      <span v-for="i in 5" :key="i" class="star small" :class="{ filled: i <= review.rating }">★</span>
                    </div>
                    <p class="mb-0 text-muted small">{{ review.comment }}</p>
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
              <div class="col-md-3">
                <button class="btn btn-primary w-100" @click="createNewClass">
                  Create New Class
                </button>
              </div>
              <div class="col-md-3">
                <RouterLink to="/reviews" class="btn btn-outline-primary w-100">
                  View All Reviews
                </RouterLink>
              </div>
              <div class="col-md-3">
                <button class="btn btn-outline-secondary w-100" @click="exportSchedule">
                  Export Schedule
                </button>
              </div>
              <div class="col-md-3">
                <button class="btn btn-outline-info w-100" @click="refreshData">
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

const activeClasses = ref([
  {
    id: 1,
    name: "Morning Yoga",
    datetime: "Dec 15, 2024 - 8:00 AM",
    students: 12,
    status: "Active"
  },
  {
    id: 2,
    name: "HIIT Training",
    datetime: "Dec 16, 2024 - 6:00 PM",
    students: 8,
    status: "Active"
  },
  {
    id: 3,
    name: "Weekend Pilates",
    datetime: "Dec 17, 2024 - 10:00 AM",
    students: 15,
    status: "Full"
  }
])

const coachReviews = ref([
  {
    id: 1,
    userName: "Sarah Johnson",
    rating: 5,
    comment: "Amazing coach! Very motivating and knowledgeable.",
    date: "Dec 10, 2024"
  },
  {
    id: 2,
    userName: "Mike Chen",
    rating: 4,
    comment: "Great workouts, would recommend to anyone.",
    date: "Dec 8, 2024"
  },
  {
    id: 3,
    userName: "Emma Wilson",
    rating: 5,
    comment: "Best yoga instructor I've had. Very patient and helpful.",
    date: "Dec 5, 2024"
  }
])

const totalStudents = computed(() => {
  return activeClasses.value.reduce((total, classItem) => total + classItem.students, 0)
})

const averageRating = computed(() => {
  if (coachReviews.value.length === 0) return 0
  const sum = coachReviews.value.reduce((total, review) => total + review.rating, 0)
  return sum / coachReviews.value.length
})

const recentReviews = computed(() => {
  return coachReviews.value.slice(0, 3)
})

const getStatusClass = (status) => {
  switch (status) {
    case 'Active': return 'bg-success'
    case 'Full': return 'bg-warning'
    case 'Cancelled': return 'bg-danger'
    default: return 'bg-secondary'
  }
}

const createNewClass = () => {
  alert('Create new class functionality would be implemented here')
}

const editClass = (classItem) => {
  alert(`Edit class: ${classItem.name}`)
}

const cancelClass = (classItem) => {
  if (confirm(`Are you sure you want to cancel ${classItem.name}?`)) {
    classItem.status = 'Cancelled'
  }
}

const exportSchedule = () => {
  alert('Export schedule functionality would be implemented here')
}

const refreshData = () => {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  coachReviews.value = reviews.filter(review => review.coachId === currentUser.value?.id)
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.welcome-header {
  text-align: center;
  padding: 2rem 0;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  display: block;
  margin: 0.5rem 0;
}

.rating-stars {
  margin-top: 0.25rem;
}

.star {
  color: #ddd;
  font-size: 1rem;
}

.star.filled {
  color: #ffc107;
}

.star.small {
  font-size: 0.8rem;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75rem;
}
</style>
