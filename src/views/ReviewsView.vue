<template>
  <div class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12">
        <div class="header-section mb-4">
          <h1 class="h3">{{ currentUser.role === 'coach' ? 'Class Reviews' : 'Write Reviews' }}</h1>
          <p class="text-muted">
            {{ currentUser.role === 'coach' ? 'View reviews for your classes' : 'Rate and review classes you have joined' }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="row mb-4">
      <div class="col-12">
        <div class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>
      </div>
    </div>

    <div v-if="currentUser.role === 'user'" class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Write a Review</h5>
          </div>
          <div class="card-body">
            <div v-if="userEnrolledClasses.length === 0" class="text-center text-muted py-4">
              You haven't joined any classes yet. Join a class from your dashboard to write reviews.
            </div>
            <form v-else @submit.prevent="submitReview" novalidate>
              <div class="mb-3">
                <label for="classSelect" class="form-label">Select Class</label>
                <select
                  id="classSelect"
                  class="form-select"
                  v-model="selectedClassId"
                  :class="{ 'is-invalid': touched && !selectedClassId }"
                  @change="touched = true"
                  required
                >
                  <option value="">Choose a class to review</option>
                  <option v-for="classItem in userEnrolledClasses" :key="classItem.id" :value="classItem.id">
                    {{ classItem.name }} - {{ classItem.category }}
                  </option>
                </select>
                <div v-if="touched && !selectedClassId" class="invalid-feedback">
                  Please select a class to review
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Rating</label>
                <div class="rating-input">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star-input"
                    :class="{ active: i <= rating }"
                    @click="setRating(i)"
                  >
                    ★
                  </span>
                  <span class="ms-2 text-muted">
                    {{ rating === 0 ? 'Select a rating' : `${rating} star${rating > 1 ? 's' : ''}` }}
                  </span>
                </div>
                <div v-if="touched && !rating" class="invalid-feedback d-block">
                  Please select a rating
                </div>
              </div>

              <div class="mb-3">
                <label for="comment" class="form-label">Your Review</label>
                <textarea
                  id="comment"
                  class="form-control"
                  :class="{ 'is-invalid': touched && !commentValid }"
                  rows="4"
                  v-model="comment"
                  placeholder="Share your experience with this class..."
                  maxlength="280"
                  @blur="touched = true"
                ></textarea>
                <div class="form-text">
                  {{ comment.length }}/280 characters
                </div>
                <div v-if="touched && !commentValid" class="invalid-feedback">
                  Please write a review comment
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="submitting || !formValid"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Submitting...' : 'Submit Review' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div v-if="currentUser.role === 'coach'" class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Overall Rating</h5>
          </div>
          <div class="card-body">
            <div class="rating-summary">
              <div class="overall-rating text-center mb-4">
                <div class="rating-number">{{ averageRating.toFixed(2) }}</div>
                <div class="rating-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(averageRating) }">★</span>
                </div>
                <div class="total-reviews">{{ coachReviews.length }} review{{ coachReviews.length !== 1 ? 's' : '' }}</div>
              </div>

              <div class="rating-breakdown">
                <div v-for="star in [5,4,3,2,1]" :key="star" class="rating-bar-item d-flex align-items-center mb-2">
                  <span class="rating-label">{{ star }}★</span>
                  <div class="rating-bar flex-grow-1 mx-2">
                    <div class="rating-fill" :style="{ width: getStarPercentage(star) + '%' }"></div>
                  </div>
                  <span class="rating-count">{{ getStarCount(star) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div :class="currentUser.role === 'coach' ? 'col-md-8' : 'col-12'">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ currentUser.role === 'coach' ? 'Reviews for Your Classes' : 'Your Reviews' }}</h5>
          </div>
          <div class="card-body">
            <div v-if="displayReviews.length === 0" class="text-center text-muted py-4">
              {{ currentUser.role === 'coach' ? 'No reviews for your classes yet.' : 'You haven\'t written any reviews yet.' }}
            </div>
            <div v-else>
              <div v-for="review in displayReviews" :key="review.id" class="review-item border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="mb-1">
                      {{ currentUser.role === 'coach' ? review.userName : review.className }}
                    </h6>
                    <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                    <div v-if="currentUser.role === 'coach'" class="class-info">
                      <span class="badge bg-light text-dark">{{ review.className }}</span>
                    </div>
                  </div>
                  <div class="rating-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
                  </div>
                </div>
                <p class="review-comment mb-0">{{ review.comment }}</p>
              </div>
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
import { sanitizeText, validateCommentLength, containsScript } from '../utils/security'

const { currentUser } = useAuth()

const rating = ref(0)
const comment = ref('')
const selectedClassId = ref('')
const reviews = ref([])
const submitting = ref(false)
const touched = ref(false)
const successMessage = ref('')
const userEnrolledClasses = ref([])

const commentValid = computed(() => {
  try {
    validateCommentLength(comment.value)
    return true
  } catch {
    return false
  }
})

const formValid = computed(() => rating.value > 0 && commentValid.value && selectedClassId.value)

const coachReviews = computed(() => {
  if (currentUser.value?.role !== 'coach') return []
  return reviews.value.filter(review => review.coachId === currentUser.value?.id)
})

const userReviews = computed(() => {
  if (currentUser.value?.role !== 'user') return []
  return reviews.value.filter(review => review.userId === currentUser.value?.id)
})

const displayReviews = computed(() => {
  return currentUser.value?.role === 'coach' ? coachReviews.value : userReviews.value
})

const averageRating = computed(() => {
  if (coachReviews.value.length === 0) return 0
  const total = coachReviews.value.reduce((sum, review) => sum + review.rating, 0)
  return total / coachReviews.value.length
})

const getStarCount = (starLevel) => {
  return coachReviews.value.filter(review => review.rating === starLevel).length
}

const getStarPercentage = (starLevel) => {
  if (coachReviews.value.length === 0) return 0
  return (getStarCount(starLevel) / coachReviews.value.length) * 100
}

const setRating = (value) => {
  rating.value = value
  touched.value = true
}

const loadData = () => {
  const savedReviews = localStorage.getItem('classReviews')
  if (savedReviews) {
    reviews.value = JSON.parse(savedReviews)
  }

  if (currentUser.value?.role === 'user') {
    const enrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]')
    const userEnrollments = enrollments.filter(enrollment => enrollment.userId === currentUser.value?.id)

    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]')
    userEnrolledClasses.value = allClasses.filter(cls =>
      userEnrollments.some(enrollment => enrollment.classId === cls.id)
    )
  }
}

const saveReviews = () => {
  localStorage.setItem('classReviews', JSON.stringify(reviews.value))
}

const submitReview = async () => {
  touched.value = true

  if (!formValid.value) {
    return
  }

  try {
    const sanitizedComment = sanitizeText(comment.value, 280)
    const validatedComment = validateCommentLength(sanitizedComment)

    if (containsScript(validatedComment)) {
      throw new Error('Invalid content detected in comment')
    }

    const selectedClass = userEnrolledClasses.value.find(cls => cls.id === selectedClassId.value)
    if (!selectedClass) {
      throw new Error('Invalid class selection')
    }

    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 600))

    const newReview = {
      id: Date.now().toString(),
      userId: currentUser.value.id,
      userName: currentUser.value.name,
      classId: selectedClassId.value,
      className: selectedClass.name,
      coachId: selectedClass.coachId,
      rating: rating.value,
      comment: validatedComment,
      createdAt: new Date().toISOString()
    }

    reviews.value.push(newReview)
    saveReviews()

    rating.value = 0
    comment.value = ''
    selectedClassId.value = ''
    touched.value = false
    successMessage.value = 'Thank you for your review! It has been submitted successfully.'

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    alert(error.message)
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.header-section {
  text-align: center;
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

.rating-number {
  font-size: 3rem;
  font-weight: bold;
  color: #ffc107;
}

.rating-stars {
  margin: 0.5rem 0;
}

.star {
  font-size: 1.5rem;
  color: #ddd;
  margin-right: 0.125rem;
}

.star.filled {
  color: #ffc107;
}

.total-reviews {
  color: #6c757d;
  font-size: 0.9rem;
}

.rating-breakdown {
  margin-top: 1.5rem;
}

.rating-label {
  min-width: 2.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.rating-bar {
  height: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background-color: #ffc107;
  transition: width 0.3s ease;
}

.rating-count {
  min-width: 2rem;
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
}

.review-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.review-comment {
  line-height: 1.5;
  color: #495057;
}

.class-info {
  margin-top: 0.25rem;
}
</style>
