<template>
  <div id="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <Navbar />
    <main id="main-content" class="main-content" role="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { initAuth } from './auth/authService'

onMounted(() => {
  initAuth()
})
</script>

<style scoped>
.main-content {
  min-height: 100vh;
  padding: 0;
}
</style>
