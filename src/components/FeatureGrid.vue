<template>
  <section class="feature-section">
    <div class="container">
      <h2 class="section-title">Why Choose FitTogether?</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-image">
            <img :src="discoverActivitiesImg" alt="Discover Activities" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Discover Activities</h3>
            <p class="feature-description">Find fitness events near you – from yoga and running clubs to weekend sports teams.</p>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-image">
            <img :src="fitnessFriendsImg" alt="Connect with People" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Connect with People</h3>
            <p class="feature-description">Meet new friends and enjoy exercising together in a supportive community.</p>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-image">
            <img :src="fitnessTrackingImg" alt="Track & Share Progress" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Track & Share Progress</h3>
            <p class="feature-description">See your stats on mobile or watch and celebrate your growth day by day.</p>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-image">
            <img :src="coachOrganizeImg" alt="Coach & Organize" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Coach & Organize</h3>
            <p class="feature-description">Coaches can create and manage events and help communities stay active.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import discoverActivitiesImg from '../assets/Image/discover-activities.jpg'
import fitnessFriendsImg from '../assets/Image/fitness-friends.jpg'
import fitnessTrackingImg from '../assets/Image/fitness-tracking.jpg'
import coachOrganizeImg from '../assets/Image/coach-organize.jpg'
</script>

<style scoped>
.feature-section {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-image {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.feature-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-image img {
  transform: scale(1.05);
}

.feature-content {
  padding: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: #6c757d;
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .feature-section {
    padding: 3rem 0;
  }
}

@media (max-width: 480px) {
  .feature-content {
    padding: 1.25rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}
</style>
