<template>
  <div v-if="currentUser" class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12">
        <div class="header-section mb-4">
          <h1 class="h3">{{ currentUser.role === 'coach' ? 'Class Reviews' : 'Reviews' }}</h1>
          <p class="text-muted">
            {{ currentUser.role === 'coach' ? 'Manage reviews for your classes' : 'Write and manage your reviews' }}
          </p>
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
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>

            <div v-if="enrolledClasses.length === 0" class="text-center text-muted py-3">
              You haven't joined any classes yet. Join a class from your dashboard to write reviews.
            </div>
            <form v-else @submit.prevent="submitReview" class="row g-3">
              <div class="col-md-4">
                <select
                  class="form-select"
                  v-model="newReview.classId"
                  :class="{ 'is-invalid': touched && !newReview.classId }"
                  required
                >
                  <option value="">Select a class</option>
                  <option v-for="cls in enrolledClasses" :key="cls.id" :value="cls.id">
                    {{ cls.name }}
                  </option>
                </select>
                <div v-if="touched && !newReview.classId" class="invalid-feedback">
                  Please select a class
                </div>
              </div>

              <div class="col-md-3">
                <div class="rating-input-wrapper">
                  <div class="rating-stars-input">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star-input"
                      :class="{ active: i <= newReview.rating }"
                      @click="setRating(i)"
                    >★</span>
                  </div>
                  <small class="text-muted ms-2">
                    {{ newReview.rating > 0 ? newReview.rating + ' star' + (newReview.rating > 1 ? 's' : '') : 'Rate' }}
                  </small>
                </div>
              </div>

              <div class="col-md-3">
                <input
                  type="text"
                  class="form-control"
                  v-model="newReview.comment"
                  placeholder="Write your review..."
                  maxlength="280"
                  required
                />
              </div>

              <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100" :disabled="submitting || !formValid">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  {{ submitting ? 'Submitting...' : 'Submit' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentUser.role === 'coach'" class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">Average Rating</h5>
            <div class="stat-number text-warning">{{ averageRating.toFixed(1) }}</div>
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(averageRating) }">★</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">Total Reviews</h5>
            <div class="stat-number text-primary">{{ coachReviews.length }}</div>
            <small class="text-muted">reviews received</small>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">This Month</h5>
            <div class="stat-number text-info">{{ thisMonthReviews }}</div>
            <small class="text-muted">new reviews</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ currentUser.role === 'coach' ? 'Reviews for My Classes' : 'My Reviews' }}</h5>
            <span class="badge bg-secondary">{{ totalReviews }} total</span>
          </div>

          <div class="card-body border-bottom">
            <div class="row g-3">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-text">🔍</span>
                  <input
                    type="text"
                    class="form-control"
                    :placeholder="currentUser.role === 'coach' ? 'Search by student or class...' : 'Search by class...'"
                    v-model="searchQuery"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="ratingFilter">
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div class="col-md-2">
                <select class="form-select" v-model="pageSize">
                  <option :value="10">10 per page</option>
                  <option :value="20">20 per page</option>
                  <option :value="50">50 per page</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-outline-secondary w-100" @click="loadData">
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0">
              <thead class="table-light">
                <tr>
                  <th v-if="currentUser.role === 'coach'" @click="handleSort('userName')" class="sortable">
                    Student
                    <span v-if="sortBy === 'userName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="handleSort('className')" class="sortable">
                    Class
                    <span v-if="sortBy === 'className'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th @click="handleSort('rating')" class="sortable text-center">
                    Rating
                    <span v-if="sortBy === 'rating'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th>Review</th>
                  <th @click="handleSort('createdAt')" class="sortable">
                    Date
                    <span v-if="sortBy === 'createdAt'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                  </th>
                  <th v-if="currentUser.role === 'user'" class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td :colspan="currentUser.role === 'coach' ? 5 : 6" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading reviews...
                  </td>
                </tr>
                <tr v-else-if="paginatedReviews.length === 0">
                  <td :colspan="currentUser.role === 'coach' ? 5 : 6" class="text-center py-4 text-muted">
                    <div class="mb-2">📭</div>
                    {{ searchQuery ? 'No reviews found matching your search.' : 'No reviews yet.' }}
                  </td>
                </tr>
                <tr v-else v-for="review in paginatedReviews" :key="review.id">
                  <td v-if="currentUser.role === 'coach'">
                    <strong>{{ review.userName }}</strong>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 200px;" :title="review.className">
                      {{ review.className }}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="rating-stars">
                      <span v-for="i in 5" :key="i" class="star-small" :class="{ filled: i <= review.rating }">★</span>
                    </div>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 300px;" :title="review.comment">
                      {{ review.comment }}
                    </div>
                  </td>
                  <td class="text-nowrap">
                    <small>{{ formatDate(review.createdAt) }}</small>
                  </td>
                  <td v-if="currentUser.role === 'user'" class="text-center">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" @click="editReview(review)" title="Edit">
                        Edit
                      </button>
                      <button class="btn btn-outline-danger" @click="deleteReviewConfirm(review.id)" title="Delete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredReviews.length }} reviews
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                    Previous
                  </button>
                </li>
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingReview" class="modal fade show d-block" tabindex="-1" @click.self="closeEditModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Review</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Rating</label>
              <div class="rating-stars-input">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="star-input"
                  :class="{ active: i <= editingReview.rating }"
                  @click="editingReview.rating = i"
                >★</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Review</label>
              <textarea
                class="form-control"
                v-model="editingReview.comment"
                rows="4"
                maxlength="280"
              ></textarea>
              <div class="form-text">{{ editingReview.comment.length }}/280 characters</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveEdit" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="editingReview" class="modal-backdrop fade show"></div>
  </div>
  <div v-else class="container mt-5 pt-4">
    <div class="row">
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading reviews...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../auth/authService'
import { submitReview as submitReviewService, updateReview, deleteReview, getReviewsByUser, getReviewsByCoach } from '../services/reviewService'
import { getUserEnrollments } from '../services/classService'
import { getAllClasses } from '../services/classService'
import { sanitizeText } from '../utils/security'

const { currentUser } = useAuth()

const loading = ref(false)
const submitting = ref(false)
const touched = ref(false)
const successMessage = ref('')

const allReviews = ref([])
const enrolledClasses = ref([])
const allClassesData = ref([])

const searchQuery = ref('')
const ratingFilter = ref('all')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(10)

const editingReview = ref(null)

const newReview = ref({
  classId: '',
  rating: 0,
  comment: ''
})

const formValid = computed(() => {
  return newReview.value.classId && newReview.value.rating > 0 && newReview.value.comment.trim().length > 0
})

const coachReviews = computed(() => {
  return currentUser.value?.role === 'coach' ? allReviews.value : []
})

const userReviews = computed(() => {
  return currentUser.value?.role === 'user' ? allReviews.value : []
})

const displayReviews = computed(() => {
  return currentUser.value?.role === 'coach' ? coachReviews.value : userReviews.value
})

const averageRating = computed(() => {
  if (coachReviews.value.length === 0) return 0
  const total = coachReviews.value.reduce((sum, review) => sum + review.rating, 0)
  return total / coachReviews.value.length
})

const thisMonthReviews = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return coachReviews.value.filter(review => {
    if (!review.createdAt) return false
    const reviewDate = review.createdAt?.toDate ? review.createdAt.toDate() : new Date(review.createdAt)
    return reviewDate.getMonth() === currentMonth && reviewDate.getFullYear() === currentYear
  }).length
})

const filteredReviews = computed(() => {
  let reviews = [...displayReviews.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    reviews = reviews.filter(review =>
      review.className?.toLowerCase().includes(query) ||
      review.userName?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query)
    )
  }

  if (ratingFilter.value !== 'all') {
    reviews = reviews.filter(review => review.rating === parseInt(ratingFilter.value))
  }

  reviews.sort((a, b) => {
    let aVal, bVal

    if (sortBy.value === 'createdAt') {
      aVal = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      bVal = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
    } else if (sortBy.value === 'rating') {
      aVal = a.rating || 0
      bVal = b.rating || 0
    } else {
      aVal = (a[sortBy.value] || '').toString().toLowerCase()
      bVal = (b[sortBy.value] || '').toString().toLowerCase()
    }

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return reviews
})

const totalReviews = computed(() => filteredReviews.value.length)
const totalPages = computed(() => Math.ceil(filteredReviews.value.length / pageSize.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredReviews.value.length))

const paginatedReviews = computed(() => {
  return filteredReviews.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const setRating = (rating) => {
  newReview.value.rating = rating
  touched.value = true
}

const loadData = async () => {
  loading.value = true
  try {
    if (currentUser.value?.role === 'coach') {
      allReviews.value = await getReviewsByCoach(currentUser.value.id)
    } else {
      allReviews.value = await getReviewsByUser(currentUser.value.id)

      const enrollments = await getUserEnrollments(currentUser.value.id)
      allClassesData.value = await getAllClasses()

      enrolledClasses.value = allClassesData.value.filter(cls =>
        enrollments.some(enrollment => enrollment.classId === cls.id)
      )
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  touched.value = true

  if (!formValid.value) return

  submitting.value = true
  try {
    const selectedClass = enrolledClasses.value.find(cls => cls.id === newReview.value.classId)
    if (!selectedClass) {
      throw new Error('Class not found')
    }

    const sanitizedComment = sanitizeText(newReview.value.comment, 280)

    await submitReviewService({
      userId: currentUser.value.id,
      userName: currentUser.value.name,
      classId: newReview.value.classId,
      className: selectedClass.name,
      coachId: selectedClass.coachId,
      rating: newReview.value.rating,
      comment: sanitizedComment
    })

    await loadData()

    newReview.value = {
      classId: '',
      rating: 0,
      comment: ''
    }
    touched.value = false
    successMessage.value = 'Review submitted successfully!'

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error) {
    console.error('Error submitting review:', error)
    alert('Failed to submit review. Please try again.')
  } finally {
    submitting.value = false
  }
}

const editReview = (review) => {
  editingReview.value = { ...review }
}

const closeEditModal = () => {
  editingReview.value = null
}

const saveEdit = async () => {
  if (!editingReview.value) return

  submitting.value = true
  try {
    const sanitizedComment = sanitizeText(editingReview.value.comment, 280)

    await updateReview(editingReview.value.id, {
      rating: editingReview.value.rating,
      comment: sanitizedComment
    })

    await loadData()
    closeEditModal()
    alert('Review updated successfully!')
  } catch (error) {
    console.error('Error updating review:', error)
    alert('Failed to update review. Please try again.')
  } finally {
    submitting.value = false
  }
}

const deleteReviewConfirm = async (reviewId) => {
  if (confirm('Are you sure you want to delete this review?')) {
    try {
      await deleteReview(reviewId)
      await loadData()
      alert('Review deleted successfully')
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review. Please try again.')
    }
  }
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.header-section {
  text-align: left;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  display: block;
  margin: 0.5rem 0;
}

.rating-stars {
  margin-top: 0.5rem;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffc107;
}

.star-small {
  color: #ddd;
  font-size: 1rem;
}

.star-small.filled {
  color: #ffc107;
}

.rating-input-wrapper {
  display: flex;
  align-items: center;
  height: 38px;
}

.rating-stars-input {
  display: inline-flex;
  gap: 2px;
}

.star-input {
  color: #ddd;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.star-input.active {
  color: #ffc107;
}

.star-input:hover {
  color: #ffb300;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
