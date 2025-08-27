<template>
  <div class="home-page">
    <div class="video-hero">
      <video
        :src="videoSrc"
        autoplay
        muted
        loop
        playsinline
        class="background-video"
      ></video>

      <div class="video-overlay"></div>

      <div class="hero-content">
        <h1 class="hero-title">Welcome To FitTogether</h1>
        <p class="hero-subtitle">Join local activities, meet new friends, and stay fit together.</p>
      </div>
    </div>

    <FeatureGrid />
  </div>
</template>

<script setup>
import videoFile from '../assets/Vedio/8480551-hd_1920_1080_25fps.mp4'
import FeatureGrid from '../components/FeatureGrid.vue'

const videoSrc = videoFile
</script>

<style scoped>
.home-page {
  width: 100%;
}

.video-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 0 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
