<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
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
