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
          <div class="user-role">{{ currentUser.role === 'coach' ? 'Coach' : 'Member' }}</div>
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

        <div v-if="isAuthenticated && currentUser.role === 'coach'" class="section-title">Coach Tools</div>
        <RouterLink v-if="isAuthenticated && currentUser.role === 'coach'" to="/coach" class="drawer-link" @click="closeDrawer">
          Advanced Coach Panel
        </RouterLink>

        <div v-if="!isAuthenticated || currentUser.role === 'user'" class="section-title">Coach</div>
        <RouterLink v-if="!isAuthenticated || currentUser.role === 'user'" to="/coaches" class="drawer-link" @click="closeDrawer">
          Become a Coach
        </RouterLink>

        <div v-if="isAuthenticated" class="section-title">Reviews</div>
        <RouterLink v-if="isAuthenticated" to="/reviews" class="drawer-link" @click="closeDrawer">
          Reviews & Ratings
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

const handleLogout = () => {
  logout()
  closeDrawer()
  router.push('/')
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
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.drawer-content {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-info {
  padding: 0 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.welcome-text {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
}

.section-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 1rem 1.5rem 0.5rem;
  margin-top: 1rem;
}

.section-title:first-child {
  margin-top: 0;
}

.drawer-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 3px solid transparent;
  min-height: 48px;
}

.drawer-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-left-color: rgba(255, 255, 255, 0.4);
}

.drawer-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-left-color: rgba(255, 255, 255, 0.6);
}

.logout-section {
  margin-top: auto;
  padding: 0 1.5rem 1.5rem;
  text-align: center;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.logout-btn:hover {
  background: #c0392b;
}

@media (max-width: 576px) {
  .nav-container {
    padding: 0 0.75rem;
  }

  .brand-link {
    font-size: 1.25rem;
  }

  .hamburger-btn {
    padding: 0.5rem;
    font-size: 1.25rem;
    min-width: 40px;
    min-height: 40px;
  }

  .drawer {
    width: 280px;
    max-width: 90vw;
  }

  .drawer-content {
    padding: 1rem 0;
  }

  .section-title {
    padding: 0.75rem 1rem 0.25rem;
    font-size: 11px;
  }

  .drawer-link {
    font-size: 15px;
    padding: 0.75rem 1rem;
    min-height: 44px;
  }
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
