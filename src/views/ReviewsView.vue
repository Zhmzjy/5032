<template>
  <div class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12">
        <div class="header-section mb-4">
          <h1 class="h3">Reviews & Ratings</h1>
          <p class="text-muted">Share your experience and read what others say</p>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Write a Review</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitReview">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="reviewType" class="form-label">Review Type</label>
                    <select class="form-select" id="reviewType" v-model="newReview.type" required>
                      <option value="">Select type</option>
                      <option value="coach">Coach</option>
                      <option value="activity">Activity</option>
                      <option value="general">General Experience</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="reviewSubject" class="form-label">Subject</label>
                    <input
                      type="text"
                      class="form-control"
                      id="reviewSubject"
                      v-model="newReview.subject"
                      placeholder="Coach name or activity title"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Rating</label>
                <div class="rating-input">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star-input"
                    :class="{ active: i <= newReview.rating }"
                    @click="setRating(i)"
                    @mouseover="hoverRating = i"
                    @mouseleave="hoverRating = 0"
                  >
                    ★
                  </span>
                  <span class="ms-2 text-muted">{{ getRatingText(newReview.rating) }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label for="reviewComment" class="form-label">Your Review</label>
                <textarea
                  class="form-control"
                  id="reviewComment"
                  rows="4"
                  v-model="newReview.comment"
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Submitting...' : 'Submit Review' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Rating Summary</h5>
          </div>
          <div class="card-body">
            <div class="rating-summary">
              <div class="overall-rating">
                <span class="rating-number">{{ overallRating.toFixed(1) }}</span>
                <div class="rating-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(overallRating) }">★</span>
                </div>
                <div class="total-reviews">Based on {{ totalReviews }} reviews</div>
              </div>

              <div class="rating-breakdown">
                <div v-for="rating in [5,4,3,2,1]" :key="rating" class="rating-bar-item">
                  <span class="rating-label">{{ rating }}★</span>
                  <div class="rating-bar">
                    <div class="rating-fill" :style="{ width: getRatingPercentage(rating) + '%' }"></div>
                  </div>
                  <span class="rating-count">{{ getRatingCount(rating) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">All Reviews</h5>
            <div class="filter-options">
              <select class="form-select form-select-sm" v-model="filterType" @change="filterReviews">
                <option value="all">All Reviews</option>
                <option value="coach">Coach Reviews</option>
                <option value="activity">Activity Reviews</option>
                <option value="general">General Reviews</option>
              </select>
            </div>
          </div>
          <div class="card-body">
            <div v-if="filteredReviews.length === 0" class="text-center text-muted py-4">
              No reviews found for the selected filter.
            </div>
            <div v-else>
              <div v-for="review in paginatedReviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <h6 class="reviewer-name">{{ review.userName }}</h6>
                    <div class="review-meta">
                      <span class="review-type badge bg-secondary">{{ review.type }}</span>
                      <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="review-rating">
                    <div class="rating-stars">
                      <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
                    </div>
                  </div>
                </div>
                <div class="review-content">
                  <h6 class="review-subject">{{ review.subject }}</h6>
                  <p class="review-comment" v-html="sanitizeHtml(review.comment)"></p>
                </div>
              </div>

              <nav v-if="totalPages > 1" class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">First</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">Previous</button>
                  </li>
                  <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                    <button class="page-link" @click="currentPage = page">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">Last</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../auth/authService'
import DOMPurify from 'dompurify'

const { currentUser, isAuthenticated } = useAuth()

const newReview = ref({
  type: '',
  subject: '',
  rating: 0,
  comment: ''
})

const reviews = ref([])
const submitting = ref(false)
const hoverRating = ref(0)
const filterType = ref('all')
const currentPage = ref(1)
const reviewsPerPage = 5

const filteredReviews = computed(() => {
  if (filterType.value === 'all') return reviews.value
  return reviews.value.filter(review => review.type === filterType.value)
})

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * reviewsPerPage
  const end = start + reviewsPerPage
  return filteredReviews.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredReviews.value.length / reviewsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const totalReviews = computed(() => reviews.value.length)

const overallRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((total, review) => total + review.rating, 0)
  return sum / reviews.value.length
})

const getRatingText = (rating) => {
  const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return texts[rating] || ''
}

const setRating = (rating) => {
  newReview.value.rating = rating
}

const getRatingPercentage = (rating) => {
  const count = getRatingCount(rating)
  return totalReviews.value > 0 ? (count / totalReviews.value) * 100 : 0
}

const getRatingCount = (rating) => {
  return reviews.value.filter(review => review.rating === rating).length
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html)
}

const submitReview = async () => {
  if (!isAuthenticated.value) {
    alert('Please login to submit a review')
    return
  }

  submitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const review = {
      id: Date.now().toString(),
      userId: currentUser.value.id,
      userName: currentUser.value.name,
      type: newReview.value.type,
      subject: sanitizeHtml(newReview.value.subject),
      rating: newReview.value.rating,
      comment: sanitizeHtml(newReview.value.comment),
      createdAt: new Date().toISOString()
    }

    const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]')
    existingReviews.unshift(review)
    localStorage.setItem('reviews', JSON.stringify(existingReviews))

    reviews.value.unshift(review)

    newReview.value = {
      type: '',
      subject: '',
      rating: 0,
      comment: ''
    }

    alert('Review submitted successfully!')
  } catch (error) {
    alert('Error submitting review. Please try again.')
  } finally {
    submitting.value = false
  }
}

const loadReviews = () => {
  const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  reviews.value = storedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const filterReviews = () => {
  currentPage.value = 1
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.header-section {
  text-align: center;
  padding: 2rem 0;
}

.rating-input {
  display: flex;
  align-items: center;
}

.star-input {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-right: 0.25rem;
}

.star-input:hover,
.star-input.active {
  color: #ffc107;
}

.rating-summary {
  text-align: center;
}

.overall-rating {
  margin-bottom: 2rem;
}

.rating-number {
  font-size: 3rem;
  font-weight: bold;
  color: #ffc107;
  display: block;
}

.rating-stars {
  margin: 0.5rem 0;
}

.star {
  font-size: 1.5rem;
  color: #ddd;
  margin-right: 0.25rem;
}

.star.filled {
  color: #ffc107;
}

.total-reviews {
  color: #6c757d;
  font-size: 0.9rem;
}

.rating-breakdown {
  text-align: left;
}

.rating-bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-label {
  width: 3rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.rating-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin: 0 0.75rem;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background: #ffc107;
  transition: width 0.3s ease;
}

.rating-count {
  width: 2rem;
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
}

.review-item {
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem 0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #495057;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.review-type {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.review-date {
  font-size: 0.85rem;
  color: #6c757d;
}

.review-rating .rating-stars {
  margin: 0;
}

.review-rating .star {
  font-size: 1rem;
  margin-right: 0.125rem;
}

.review-subject {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.review-comment {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 0;
}

.filter-options .form-select {
  min-width: 150px;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination .page-link {
  border: none;
  color: #007bff;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}
</style>
