<template>
  <nav class="navbar" aria-label="Main navigation">
    <div class="nav-container">
      <div class="nav-left"></div>

      <div class="nav-center">
        <RouterLink to="/" class="brand-link">FitTogether</RouterLink>
      </div>

      <div class="nav-right">
        <button
          class="hamburger-btn"
          @click="toggleDrawer"
          aria-label="Open menu"
        >
                    ☰
        </button>
      </div>
    </div>

    <div
      v-if="isDrawerOpen"
      class="drawer-backdrop"
      @click="closeDrawer"
    ></div>

    <div class="drawer" :class="{ 'drawer-open': isDrawerOpen }">
      <div class="drawer-header">
        <button
          class="close-btn"
          @click="closeDrawer"
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <div class="drawer-content">
        <div v-if="isAuthenticated" class="user-info">
          <div class="welcome-text">Welcome, {{ currentUser.name }}</div>
          <div class="user-email">{{ currentUser.email }}</div>
          <div class="user-role">{{ currentUser.role === 'coach' ? 'Coach' : 'Member' }}</div>
          <div v-if="currentUser.emailVerified === false" class="email-verify-notice">
            <small>Email not verified</small>
          </div>
        </div>

        <div v-if="!isAuthenticated" class="section-title">Account</div>
        <RouterLink v-if="!isAuthenticated" to="/login" class="drawer-link" @click="closeDrawer">
          Login
        </RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/register" class="drawer-link" @click="closeDrawer">
          Register
        </RouterLink>

        <div v-if="isAuthenticated" class="section-title">Dashboard</div>
        <RouterLink v-if="isAuthenticated" to="/dashboard" class="drawer-link" @click="closeDrawer">
          {{ currentUser.role === 'coach' ? 'Coach Dashboard' : 'My Dashboard' }}
        </RouterLink>

        <div v-if="!isAuthenticated || currentUser.role === 'user'" class="section-title">Coach</div>
        <RouterLink v-if="!isAuthenticated || currentUser.role === 'user'" to="/coaches" class="drawer-link" @click="closeDrawer">
          Become a Coach
        </RouterLink>

        <div v-if="isAuthenticated" class="section-title">Reviews</div>
        <RouterLink v-if="isAuthenticated" to="/reviews" class="drawer-link" @click="closeDrawer">
          Reviews & Ratings
        </RouterLink>

        <div v-if="isAuthenticated" class="section-title">Email</div>
        <RouterLink v-if="isAuthenticated" to="/email" class="drawer-link" @click="closeDrawer">
          Send Email
        </RouterLink>

        <div class="section-title">Locations</div>
        <RouterLink to="/map" class="drawer-link" @click="closeDrawer">
          Find Gyms & Parks
        </RouterLink>

        <div v-if="isAuthenticated" class="section-title">Security Test</div>
        <RouterLink v-if="isAuthenticated" to="/xss-test" class="drawer-link" @click="closeDrawer">
          XSS Protection Demo
        </RouterLink>

        <div v-if="isAuthenticated" class="logout-section">
          <button class="logout-btn" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../auth/authService'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()

const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const handleLogout = async () => {
  try {
    await logout()
    closeDrawer()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    closeDrawer()
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  padding: 0;
  height: 60px;
}

.nav-container {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 60px;
}

.nav-center {
  justify-self: center;
}

.nav-right {
  justify-self: end;
  display: flex;
  justify-content: flex-end;
}

.brand-link {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #5a6268;
}

.hamburger-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.75rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: color 0.3s ease;
  margin-left: auto;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.hamburger-btn:hover {
  color: #3498db;
  background: rgba(255, 255, 255, 0.1);
}

.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1100;
  animation: fadeIn 0.3s ease;
}

.drawer {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  max-width: 85vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  z-index: 1200;
  transition: right 0.3s ease;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

.drawer-open {
  right: 0;
}

.drawer-header {
  padding: 1rem;
  text-align: right;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #dc3545;
}

.drawer-content {
  padding: 1.5rem;
}

.user-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: #fff;
}

.welcome-text {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-email {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.user-role {
  display: inline-block;
  background: rgba(52, 152, 219, 0.3);
  color: #3498db;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.email-verify-notice {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 4px;
  color: #ffc107;
}

.section-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.drawer-link {
  display: block;
  color: #fff;
  text-decoration: none;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.drawer-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.logout-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.5);
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  border-color: #dc3545;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
