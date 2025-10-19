<template>
  <div class="map-container">
    <div class="map-sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <button class="collapse-btn" @click="toggleSidebar">
        {{ isSidebarCollapsed ? '→' : '←' }}
      </button>

      <div v-if="!isSidebarCollapsed" class="sidebar-content">
        <div class="search-section">
          <h5 class="section-title">Find Locations</h5>

          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search gyms, parks, fitness centers..."
              @keyup.enter="searchLocations"
            />
            <button class="btn btn-primary mt-2 w-100" @click="searchLocations" :disabled="searching">
              <span v-if="searching" class="spinner-border spinner-border-sm me-1"></span>
              {{ searching ? 'Searching...' : 'Search' }}
            </button>
          </div>

          <div class="filter-options mt-3">
            <label class="form-label">Search Scope:</label>
            <select v-model="searchScope" class="form-select form-select-sm">
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
              <option value="50">Within 50 km</option>
              <option value="all">All Melbourne</option>
            </select>
          </div>

          <div class="current-location mt-3">
            <button class="btn btn-outline-secondary btn-sm w-100" @click="getUserLocation">
              Use My Location
            </button>
          </div>
        </div>

        <div v-if="searchResults.length > 0" class="results-section mt-4">
          <h6 class="section-subtitle">Search Results ({{ searchResults.length }})</h6>
          <div class="results-list">
            <div
              v-for="(result, index) in searchResults"
              :key="index"
              class="result-item"
              :class="{ active: selectedLocation?.id === result.id }"
              @click="selectLocation(result)"
            >
              <div class="result-header">
                <strong>{{ result.name }}</strong>
                <span v-if="result.distance" class="badge bg-secondary">{{ result.distance }}</span>
              </div>
              <div class="result-address">{{ result.address }}</div>
              <button
                v-if="selectedLocation?.id === result.id"
                class="btn btn-success btn-sm mt-2 w-100"
                @click.stop="getDirections"
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>

        <div v-if="routeInfo" class="route-section mt-4">
          <h6 class="section-subtitle">Route Information</h6>
          <div class="route-card">
            <div class="route-header">
              <strong>{{ routeInfo.mode }}</strong>
              <button class="btn-close btn-sm" @click="clearRoute"></button>
            </div>
            <div class="route-details">
              <div class="detail-item">
                <span class="detail-label">Distance:</span>
                <span class="detail-value">{{ routeInfo.distance }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">{{ routeInfo.duration }}</span>
              </div>
            </div>
            <div class="transport-modes mt-3">
              <button
                v-for="mode in transportModes"
                :key="mode.value"
                class="mode-btn"
                :class="{ active: selectedTransportMode === mode.value }"
                @click="changeTransportMode(mode.value)"
                :title="mode.label"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </div>
    </div>

    <div class="map-main">
      <div id="map" class="map-canvas"></div>

      <div class="map-controls">
        <button class="control-btn" @click="resetView" title="Reset View">
          Reset View
        </button>
      </div>

      <div v-if="loading" class="map-loading">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Loading map...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAuth } from '../auth/authService'
import { searchLocations as searchLocationsAPI, searchPlaces as searchPlacesAPI, getDirections as getDirectionsAPI } from '../services/mapService'

const { currentUser } = useAuth()

mapboxgl.accessToken = 'pk.eyJ1IjoianVueWl6MjE3IiwiYSI6ImNtZ3g2dnZjaDE4cGoybm5hazQ3NjZ5ZnkifQ.6ShGks59lMhqh4kCO5i9XQ'

const mapInstance = ref(null)
const markers = ref([])
const routeLayer = ref(null)

const isSidebarCollapsed = ref(false)
const loading = ref(true)
const searching = ref(false)
const error = ref('')

const searchQuery = ref('')
const searchScope = ref('5')
const searchResults = ref([])
const selectedLocation = ref(null)
const userLocation = ref(null)

const routeInfo = ref(null)
const selectedTransportMode = ref('walking')

const transportModes = [
  { value: 'walking', label: 'Walking', icon: 'Walk' },
  { value: 'cycling', label: 'Cycling', icon: 'Bike' },
  { value: 'driving', label: 'Driving', icon: 'Drive' }
]

const defaultCenter = { lat: -37.8136, lng: 144.9631 }
const defaultZoom = 13

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const initMap = () => {
  loading.value = true
  try {
    const mapDiv = document.getElementById('map')

    mapInstance.value = new mapboxgl.Map({
      container: mapDiv,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: defaultZoom,
      attributionControl: false
    })

    mapInstance.value.addControl(new mapboxgl.NavigationControl(), 'top-left')

    loading.value = false
    getUserLocation()
  } catch (err) {
    console.error('Error initializing map:', err)
    error.value = 'Failed to initialize map.'
    loading.value = false
  }
}

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        if (mapInstance.value) {
          mapInstance.value.setCenter([userLocation.value.lng, userLocation.value.lat])

          new mapboxgl.Marker({
            color: '#4285F4'
          })
            .setLngLat([userLocation.value.lng, userLocation.value.lat])
            .setPopup(new mapboxgl.Popup().setText('Your Location'))
            .addTo(mapInstance.value)
        }
      },
      (err) => {
        console.warn('Geolocation error:', err)
        error.value = 'Unable to get your location. Using default location.'
      }
    )
  }
}

const searchLocations = async () => {
  if (!searchQuery.value.trim()) {
    error.value = 'Please enter a search term'
    return
  }

  searching.value = true
  error.value = ''
  clearMarkers()

  try {
    const center = userLocation.value || { lng: defaultCenter.lng, lat: defaultCenter.lat }
    const query = searchQuery.value

    const response = await searchPlacesAPI({
      query,
      userLat: center.lat,
      userLng: center.lng,
      searchScope: searchScope.value
    })

    if (response.results && response.results.length > 0) {
      searchResults.value = response.results.map((place) => {
        const popupContent = `
          <div style="min-width: 200px;">
            <strong style="font-size: 14px;">${place.name}</strong><br>
            <span style="font-size: 12px; color: #666;">${place.address}</span>
            ${place.rating ? `<br><span style="color: #f39c12;">★ ${place.rating}</span>
            <span style="font-size: 11px;">(${place.userRatingsTotal} reviews)</span>` : ''}
            ${place.isOpen !== undefined ? `<br><span style="color: ${place.isOpen ? '#27ae60' : '#e74c3c'}; font-size: 11px;">
            ${place.isOpen ? 'Open now' : 'Closed'}</span>` : ''}
          </div>
        `

        const marker = new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([place.lng, place.lat])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(mapInstance.value)

        marker.getElement().addEventListener('click', () => {
          selectLocation({
            id: place.id,
            name: place.name,
            address: place.address,
            location: { lng: place.lng, lat: place.lat },
            distance: place.distance,
            rating: place.rating,
            userRatingsTotal: place.userRatingsTotal,
            isOpen: place.isOpen
          })
        })

        markers.value.push(marker)

        return {
          id: place.id,
          name: place.name,
          address: place.address,
          location: { lng: place.lng, lat: place.lat },
          distance: place.distance,
          rating: place.rating,
          userRatingsTotal: place.userRatingsTotal,
          isOpen: place.isOpen
        }
      })

      if (searchResults.value.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        response.results.forEach(place => {
          bounds.extend([place.lng, place.lat])
        })
        mapInstance.value.fitBounds(bounds, { padding: 50 })
      }
    } else {
      error.value = 'No results found. Try a different search.'
      searchResults.value = []
    }
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.message || 'Search failed. Please try again.'
  } finally {
    searching.value = false
  }
}

const selectLocation = (location) => {
  selectedLocation.value = location

  if (mapInstance.value) {
    mapInstance.value.setCenter([location.location.lng, location.location.lat])
    mapInstance.value.setZoom(15)

    const marker = markers.value.find(m => m.getLngLat().lng === location.location.lng && m.getLngLat().lat === location.location.lat)
    if (marker) {
      marker.getElement().click()
    }
  }
}

const getDirections = async () => {
  if (!selectedLocation.value || !userLocation.value) {
    error.value = 'Unable to get directions. Location not available.'
    return
  }

  try {
    const response = await getDirectionsAPI({
      originLat: userLocation.value.lat,
      originLng: userLocation.value.lng,
      destLat: selectedLocation.value.location.lat,
      destLng: selectedLocation.value.location.lng,
      mode: selectedTransportMode.value
    })

    if (response.route) {
      const route = response.route

      if (mapInstance.value.getSource('route')) {
        mapInstance.value.removeLayer('route')
        mapInstance.value.removeSource('route')
      }

      mapInstance.value.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      })

      mapInstance.value.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      })

      routeInfo.value = {
        mode: route.mode,
        distance: route.distance,
        duration: route.duration
      }

      routeLayer.value = 'route'
    } else {
      error.value = 'Unable to calculate route. Try a different transport mode.'
    }
  } catch (err) {
    console.error('Directions error:', err)
    error.value = err.message || 'Failed to get directions.'
  }
}

const changeTransportMode = (mode) => {
  selectedTransportMode.value = mode
  if (routeInfo.value) {
    getDirections()
  }
}

const clearRoute = () => {
  if (routeLayer.value && mapInstance.value.getLayer(routeLayer.value)) {
    mapInstance.value.removeLayer(routeLayer.value)
    mapInstance.value.removeSource(routeLayer.value)
    routeLayer.value = null
  }
  routeInfo.value = null
}

const clearMarkers = () => {
  markers.value.forEach(marker => marker.remove())
  markers.value = []
  clearRoute()
}

const resetView = () => {
  if (mapInstance.value) {
    const center = userLocation.value || defaultCenter
    mapInstance.value.flyTo({
      center: [center.lng, center.lat],
      zoom: defaultZoom
    })
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  clearMarkers()
  if (mapInstance.value) {
    mapInstance.value.remove()
  }
})
</script>

<style scoped>
.map-container {
  display: flex;
  height: calc(100vh - 60px);
  position: relative;
}

.map-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  transition: width 0.3s ease;
  position: relative;
  z-index: 10;
}

.map-sidebar.sidebar-collapsed {
  width: 50px;
}

.collapse-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.sidebar-content {
  padding: 20px;
  padding-top: 50px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #666;
}

.search-box {
  margin-bottom: 10px;
}

.filter-options {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.results-section {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #0d6efd;
  background: #f8f9ff;
}

.result-item.active {
  border-color: #0d6efd;
  background: #e7f1ff;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.result-address {
  font-size: 12px;
  color: #666;
}

.route-section {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.route-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.route-details {
  margin-bottom: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 14px;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 600;
}

.transport-modes {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #f0f0f0;
}

.mode-btn.active {
  background: #0d6efd;
  border-color: #0d6efd;
  transform: scale(1.1);
}

.map-main {
  flex: 1;
  position: relative;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.control-btn {
  padding: 10px 20px;
  width: auto;
  height: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  color: #333;
}

.control-btn:hover {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .map-sidebar {
    position: absolute;
    width: 100%;
    max-width: 350px;
    height: 100%;
    z-index: 20;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .map-sidebar.sidebar-collapsed {
    width: 50px;
  }
}
</style>
