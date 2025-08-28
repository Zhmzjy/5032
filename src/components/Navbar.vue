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
        <div class="section-title">Account</div>
        <RouterLink to="/login" class="drawer-link" @click="closeDrawer">
          Login
        </RouterLink>
        <RouterLink to="/register" class="drawer-link" @click="closeDrawer">
          Register
        </RouterLink>
        <div class="section-title">Coach</div>
        <RouterLink to="/coaches" class="drawer-link" @click="closeDrawer">
          Become a Coach
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  padding: 0;
}

.nav-container {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
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
  color: #3498db;
}

.hamburger-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: color 0.3s ease;
  margin-left: auto;
}

.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  animation: fadeIn 0.3s ease;
}

.drawer {
  position: fixed;
  top: 0;
  right: -260px;
  width: 260px;
  max-width: 80vw;
  height: 100vh;
  background: linear-gradient(180deg, #333333);
  z-index: 201;
  transition: right 0.3s ease;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.4);
}

.drawer-open {
  right: 0;
}

.drawer-header {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.3s ease;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #fff;
}

.drawer-content {
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 0.75rem 1rem 0.5rem;
  margin-top: 0.5rem;
}

.section-title:first-child {
  margin-top: 0;
}

.drawer-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  padding: 8px 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0.5rem;
}

.drawer-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.drawer-link.router-link-active {
  background: #0b66ff;
  color: #fff;
}

.drawer-link-bordered {
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 0.5rem;
}

.drawer-link-bordered:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.link-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .drawer {
    width: 240px;
    right: -240px;
  }

  .brand-link {
    font-size: 1.25rem;
  }

  .hamburger-btn {
    font-size: 1.25rem;
  }
}
</style>
