<template>
  <div class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12">
        <div class="welcome-header mb-4">
          <h1 class="h3">Welcome back, {{ currentUser.name }}!</h1>
          <p class="text-muted">Track your fitness journey and discover new activities</p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">My Activities</h5>
            <p class="card-text">View and manage your registered activities</p>
            <div class="activity-count">
              <span class="h4 text-primary">{{ userActivities.length }}</span>
              <small class="text-muted">registered</small>
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
            <h5 class="card-title">Fitness Goals</h5>
            <p class="card-text">Track your progress</p>
            <div class="progress mb-2">
              <div class="progress-bar" role="progressbar" style="width: 65%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small class="text-muted">65% completed this month</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Recent Activities</h5>
          </div>
          <div class="card-body">
            <div v-if="recentActivities.length === 0" class="text-center text-muted py-4">
              No recent activities. Start exploring to find activities near you!
            </div>
            <div v-else class="row g-3">
              <div v-for="activity in recentActivities" :key="activity.id" class="col-md-6 col-lg-4">
                <div class="activity-card">
                  <h6 class="activity-title">{{ activity.title }}</h6>
                  <p class="activity-description">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <small class="text-muted">{{ activity.date }} | {{ activity.location }}</small>
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
                  Write a Review
                </RouterLink>
              </div>
              <div class="col-md-4">
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
import { ref, onMounted } from 'vue'
import { useAuth } from '../auth/authService'

const { currentUser } = useAuth()

const userActivities = ref([])
const userReviews = ref([])
const recentActivities = ref([
  {
    id: 1,
    title: "Morning Yoga Class",
    description: "Start your day with mindful movement",
    date: "Dec 15, 2024",
    location: "Central Park"
  },
  {
    id: 2,
    title: "Weekend Running Club",
    description: "Join our community for a 5K run",
    date: "Dec 16, 2024",
    location: "Riverside Track"
  },
  {
    id: 3,
    title: "Fitness Bootcamp",
    description: "High-intensity interval training session",
    date: "Dec 17, 2024",
    location: "Community Center"
  }
])

const loadUserData = () => {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  userReviews.value = reviews.filter(review => review.userId === currentUser.value?.id)

  const activities = JSON.parse(localStorage.getItem('userActivities') || '[]')
  userActivities.value = activities.filter(activity => activity.userId === currentUser.value?.id)
}

const refreshData = () => {
  loadUserData()
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.welcome-header {
  text-align: center;
  padding: 2rem 0;
}

.activity-count {
  text-align: center;
  margin-top: 1rem;
}

.activity-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #007bff;
}

.activity-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.activity-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.activity-meta {
  border-top: 1px solid #dee2e6;
  padding-top: 0.5rem;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
