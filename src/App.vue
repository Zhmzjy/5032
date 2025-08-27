<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <RouterLink to="/" class="nav-logo">FitTogether</RouterLink>
        <ul class="nav-menu">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link">HomePage</RouterLink>
          </li>
        </ul>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  background: transparent;
  padding: 1rem 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.nav-logo {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: color 0.3s ease;
}

.nav-logo:hover {
  color: #3498db;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
  transition: all 0.3s ease;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 1);
}

.main-content {
  min-height: 100vh;
  padding: 0;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    gap: 1rem;
  }
}
</style>
