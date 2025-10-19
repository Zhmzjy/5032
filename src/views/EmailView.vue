<template>
  <div class="container mt-5 pt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Send Email</h4>
          </div>
          <div class="card-body p-4">
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleSendEmail" novalidate>
              <div class="mb-3">
                <label for="recipient" class="form-label">Recipient Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  id="recipient"
                  v-model="formData.to"
                  :class="{'is-invalid': touched && !recipientValid}"
                  :disabled="sending"
                  placeholder="recipient@example.com"
                  required
                  aria-required="true"
                  aria-describedby="recipientHelp"
                />
                <div id="recipientHelp" class="form-text">
                  Enter the email address of the person you want to contact
                </div>
                <div v-if="touched && !recipientValid" class="invalid-feedback">
                  Please enter a valid email address
                </div>
              </div>

              <div class="mb-3">
                <label for="subject" class="form-label">Subject</label>
                <input
                  type="text"
                  class="form-control"
                  id="subject"
                  v-model="formData.subject"
                  :class="{'is-invalid': touched && !subjectValid}"
                  :disabled="sending"
                  placeholder="Enter email subject"
                  maxlength="200"
                  required
                  aria-required="true"
                />
                <div class="form-text">
                  {{ formData.subject.length }}/200 characters
                </div>
                <div v-if="touched && !subjectValid" class="invalid-feedback">
                  Subject is required
                </div>
              </div>

              <div class="mb-3">
                <label for="message" class="form-label">Message</label>
                <textarea
                  class="form-control"
                  id="message"
                  v-model="formData.message"
                  :class="{'is-invalid': touched && !messageValid}"
                  :disabled="sending"
                  rows="8"
                  placeholder="Write your message here..."
                  maxlength="5000"
                  required
                  aria-required="true"
                ></textarea>
                <div class="form-text">
                  {{ formData.message.length }}/5000 characters
                </div>
                <div v-if="touched && !messageValid" class="invalid-feedback">
                  Message is required
                </div>
              </div>

              <div class="mb-3">
                <label for="replyTo" class="form-label">Reply-To Email (Optional)</label>
                <input
                  type="email"
                  class="form-control"
                  id="replyTo"
                  v-model="formData.replyTo"
                  :disabled="sending"
                  placeholder="your-email@example.com"
                  aria-describedby="replyToHelp"
                />
                <div id="replyToHelp" class="form-text">
                  If left blank, replies will go to your registered email: {{ currentUser.email }}
                </div>
              </div>

              <div class="alert alert-info">
                <small>
                  <strong>Note:</strong> Emails are sent from FitTogether on your behalf.
                  Recipients can reply directly to {{ formData.replyTo || currentUser.email }}.
                </small>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="sending || !formValid"
                >
                  <span v-if="sending" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ sending ? 'Sending...' : 'Send Email' }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="resetForm"
                  :disabled="sending"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Email Logs Table -->
        <div class="card shadow-sm mt-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Email History</h5>
            <span class="badge bg-secondary">{{ totalEmails }} total</span>
          </div>

          <!-- Search and Filter Controls -->
          <div class="card-body border-bottom">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search">🔍</i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search by recipient or subject..."
                    v-model="searchQuery"
                    @input="handleSearch"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="statusFilter" @change="handleFilterChange">
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="pageSize" @change="handlePageSizeChange">
                  <option :value="10">10 per page</option>
                  <option :value="20">20 per page</option>
                  <option :value="50">50 per page</option>
                </select>
              </div>
            </div>

            <!-- Export Buttons -->
            <div class="d-flex gap-2 align-items-center">
              <button
                class="btn btn-success btn-sm"
                @click="exportToCSV"
                :disabled="exporting || filteredEmails.length === 0"
              >
                <span v-if="exporting && exportType === 'csv'" class="spinner-border spinner-border-sm me-1"></span>
                {{ exporting && exportType === 'csv' ? 'Exporting...' : 'Export CSV' }}
              </button>

              <button
                class="btn btn-danger btn-sm"
                @click="exportToPDF"
                :disabled="exporting || filteredEmails.length === 0"
              >
                <span v-if="exporting && exportType === 'pdf'" class="spinner-border spinner-border-sm me-1"></span>
                {{ exporting && exportType === 'pdf' ? 'Exporting...' : 'Export PDF' }}
              </button>

              <span v-if="filteredEmails.length > 0" class="text-muted small ms-2">
                {{ filteredEmails.length }} records ready to export
              </span>
            </div>

            <!-- Export Progress Bar -->
            <div v-if="exporting" class="mt-3">
              <div class="progress" style="height: 20px;">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated"
                  :class="exportProgress === 100 ? 'bg-success' : 'bg-primary'"
                  role="progressbar"
                  :style="{ width: exportProgress + '%' }"
                  :aria-valuenow="exportProgress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {{ exportProgress }}%
                </div>
              </div>
              <small class="text-muted">{{ exportMessage }}</small>
            </div>

            <!-- Export Success Message -->
            <div v-if="exportSuccess" class="alert alert-success alert-dismissible fade show mt-3" role="alert">
              <strong>✓ Success!</strong> {{ exportSuccess }}
              <button type="button" class="btn-close" @click="exportSuccess = ''" aria-label="Close"></button>
            </div>

            <!-- Export Error Message -->
            <div v-if="exportError" class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              <strong>✗ Error!</strong> {{ exportError }}
              <button type="button" class="btn-close" @click="exportError = ''" aria-label="Close"></button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0" role="table" aria-label="Email history">
              <thead class="table-light">
                <tr>
                  <th
                    scope="col"
                    @click="handleSort('timestamp')"
                    @keydown.enter="handleSort('timestamp')"
                    @keydown.space.prevent="handleSort('timestamp')"
                    class="sortable"
                    tabindex="0"
                    role="button"
                    :aria-sort="sortBy === 'timestamp' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
                    aria-label="Sort by time"
                  >
                    Time
                    <span v-if="sortBy === 'timestamp'" aria-hidden="true">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th
                    scope="col"
                    @click="handleSort('to')"
                    @keydown.enter="handleSort('to')"
                    @keydown.space.prevent="handleSort('to')"
                    class="sortable"
                    tabindex="0"
                    role="button"
                    :aria-sort="sortBy === 'to' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
                    aria-label="Sort by recipient"
                  >
                    Recipient
                    <span v-if="sortBy === 'to'" aria-hidden="true">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th
                    scope="col"
                    @click="handleSort('subject')"
                    @keydown.enter="handleSort('subject')"
                    @keydown.space.prevent="handleSort('subject')"
                    class="sortable"
                    tabindex="0"
                    role="button"
                    :aria-sort="sortBy === 'subject' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
                    aria-label="Sort by subject"
                  >
                    Subject
                    <span v-if="sortBy === 'subject'" aria-hidden="true">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th
                    scope="col"
                    @click="handleSort('status')"
                    @keydown.enter="handleSort('status')"
                    @keydown.space.prevent="handleSort('status')"
                    class="sortable text-center"
                    tabindex="0"
                    role="button"
                    :aria-sort="sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
                    aria-label="Sort by status"
                  >
                    Status
                    <span v-if="sortBy === 'status'" aria-hidden="true">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th scope="col" class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingHistory">
                  <td colspan="5" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm me-2" role="status" aria-label="Loading"></div>
                    <span>Loading email logs...</span>
                  </td>
                </tr>
                <tr v-else-if="filteredEmails.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    <div class="mb-2" aria-hidden="true">📭</div>
                    <span>{{ searchQuery ? 'No emails found matching your search.' : 'No emails sent yet.' }}</span>
                  </td>
                </tr>
                <tr v-else v-for="email in paginatedEmails" :key="email.id">
                  <td class="text-nowrap">
                    <small>{{ formatDate(email.timestamp) }}</small>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 200px;" :title="email.to">
                      {{ email.to }}
                    </div>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 250px;" :title="email.subject">
                      {{ email.subject }}
                    </div>
                  </td>
                  <td class="text-center">
                    <span
                      class="badge"
                      :class="email.status === 'success' ? 'bg-success' : 'bg-danger'"
                      role="status"
                    >
                      <span aria-hidden="true">{{ email.status === 'success' ? '✓' : '✗' }}</span>
                      <span>{{ email.status === 'success' ? ' Success' : ' Failed' }}</span>
                    </span>
                  </td>
                  <td class="text-center">
                    <button
                      class="btn btn-sm btn-info"
                      @click="viewEmailDetails(email)"
                      :aria-label="`View details for email to ${email.to}`"
                    >
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="card-footer d-flex justify-content-between align-items-center">
            <div class="text-muted small" role="status" aria-live="polite">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredEmails.length }} emails
            </div>
            <nav aria-label="Email pagination">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    aria-label="Go to previous page"
                  >
                    Previous
                  </button>
                </li>
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button
                    class="page-link"
                    @click="goToPage(page)"
                    :aria-label="`Go to page ${page}`"
                    :aria-current="page === currentPage ? 'page' : undefined"
                  >
                    {{ page }}
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button
                    class="page-link"
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    aria-label="Go to next page"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Details Modal -->
    <div v-if="selectedEmail" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Email Details</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <strong>Recipient:</strong>
              <div class="mt-1">{{ selectedEmail.to }}</div>
            </div>
            <div class="mb-3">
              <strong>Subject:</strong>
              <div class="mt-1">{{ selectedEmail.subject }}</div>
            </div>
            <div class="mb-3">
              <strong>Sent:</strong>
              <div class="mt-1">{{ formatDate(selectedEmail.timestamp) }}</div>
            </div>
            <div class="mb-3">
              <strong>From:</strong>
              <div class="mt-1">{{ selectedEmail.fromName }} ({{ selectedEmail.fromEmail }})</div>
            </div>
            <div class="mb-3">
              <strong>Status:</strong>
              <div class="mt-1">
                <span
                  class="badge"
                  :class="selectedEmail.status === 'success' ? 'bg-success' : 'bg-danger'"
                >
                  {{ selectedEmail.status }}
                </span>
              </div>
            </div>
            <div v-if="selectedEmail.status === 'failed' && selectedEmail.error" class="mb-3">
              <strong>Error:</strong>
              <div class="mt-1 text-danger">{{ selectedEmail.error }}</div>
            </div>
            <div v-if="selectedEmail.messageLength" class="mb-3">
              <strong>Message Length:</strong>
              <div class="mt-1">{{ selectedEmail.messageLength }} characters</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedEmail" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../auth/authService'
import { sendEmail, getEmailHistory } from '../services/emailService'
import { sanitizeText } from '../utils/security'
import {
  exportToCSV as exportCSVUtil,
  exportToPDF as exportPDFUtil,
  generateExportFilename,
  validateExportData,
  formatDateTime as formatDateTimeUtil
} from '../utils/exportUtils'

const { currentUser } = useAuth()

// Form data
const formData = ref({
  to: '',
  subject: '',
  message: '',
  replyTo: ''
})

const sending = ref(false)
const touched = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Table data
const allEmails = ref([])
const loadingHistory = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('timestamp')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedEmail = ref(null)

// Export data
const exporting = ref(false)
const exportType = ref('csv') // or 'pdf'
const exportProgress = ref(0)
const exportMessage = ref('')
const exportSuccess = ref('')
const exportError = ref('')

// Form validation
const recipientValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formData.value.to)
})

const subjectValid = computed(() => {
  return formData.value.subject.trim().length > 0
})

const messageValid = computed(() => {
  return formData.value.message.trim().length > 0
})

const formValid = computed(() => {
  return recipientValid.value && subjectValid.value && messageValid.value
})

// Table computed properties
const filteredEmails = computed(() => {
  let emails = [...allEmails.value]

  // Apply status filter
  if (statusFilter.value !== 'all') {
    emails = emails.filter(email => email.status === statusFilter.value)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    emails = emails.filter(email =>
      email.to?.toLowerCase().includes(query) ||
      email.subject?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  emails.sort((a, b) => {
    let aVal, bVal

    if (sortBy.value === 'timestamp') {
      aVal = a.timestamp?.toDate?.() || new Date(a.timestamp || 0)
      bVal = b.timestamp?.toDate?.() || new Date(b.timestamp || 0)
    } else {
      aVal = (a[sortBy.value] || '').toString().toLowerCase()
      bVal = (b[sortBy.value] || '').toString().toLowerCase()
    }

    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return emails
})

const totalEmails = computed(() => filteredEmails.value.length)

const totalPages = computed(() => Math.ceil(filteredEmails.value.length / pageSize.value) || 1)

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)

const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredEmails.value.length))

const paginatedEmails = computed(() => {
  return filteredEmails.value.slice(startIndex.value, endIndex.value)
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

// Methods
const loadEmailHistory = async () => {
  try {
    console.log('=== loadEmailHistory START ===')
    loadingHistory.value = true

    // Wait for currentUser to be initialized
    if (!currentUser.value || !currentUser.value.id) {
      console.log('Waiting for user authentication...')
      console.log('currentUser:', currentUser.value)
      loadingHistory.value = false
      return
    }

    console.log('Loading email history for user:', currentUser.value.id)
    allEmails.value = await getEmailHistory(currentUser.value.id)
    console.log('Loaded emails:', allEmails.value.length)
    console.log('Emails data:', allEmails.value)
  } catch (error) {
    console.error('Error loading email history:', error)
    errorMessage.value = 'Failed to load email history'
  } finally {
    loadingHistory.value = false
    console.log('=== loadEmailHistory END ===')
  }
}

const handleSendEmail = async () => {
  touched.value = true
  successMessage.value = ''
  errorMessage.value = ''

  if (!formValid.value) {
    return
  }

  try {
    const sanitizedSubject = sanitizeText(formData.value.subject, 200)
    const sanitizedMessage = sanitizeText(formData.value.message, 5000)

    sending.value = true

    await sendEmail({
      to: formData.value.to,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      replyTo: formData.value.replyTo || currentUser.value.email
    })

    successMessage.value = 'Email sent successfully! The recipient can reply directly to you.'

    await loadEmailHistory()

    resetForm()

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    errorMessage.value = error.message
  } finally {
    sending.value = false
  }
}

const resetForm = () => {
  formData.value = {
    to: '',
    subject: '',
    message: '',
    replyTo: ''
  }
  touched.value = false
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const viewEmailDetails = (email) => {
  selectedEmail.value = email
}

const closeModal = () => {
  selectedEmail.value = null
}

const exportToCSV = async () => {
  if (exporting.value) return

  exporting.value = true
  exportType.value = 'csv'
  exportProgress.value = 0
  exportMessage.value = 'Preparing CSV export...'
  exportSuccess.value = ''
  exportError.value = ''

  try {
    validateExportData(filteredEmails.value)

    if (filteredEmails.value.length > 5000) {
      exportMessage.value = 'Large dataset detected. This may take a moment...'
    }

    const columns = [
      { key: 'timestamp', label: 'Date & Time', format: (val) => formatDateTimeUtil(val) },
      { key: 'to', label: 'Recipient' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status', format: (val) => val === 'success' ? 'Success' : 'Failed' },
      { key: 'fromName', label: 'Sender Name' },
      { key: 'fromEmail', label: 'Sender Email' },
      { key: 'messageLength', label: 'Message Size (chars)' }
    ]

    const filters = {
      search: searchQuery.value,
      status: statusFilter.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    }

    const filename = generateExportFilename('email_logs', 'csv', filters)

    const result = await exportCSVUtil({
      data: filteredEmails.value,
      columns,
      filename,
      onProgress: (progress) => {
        exportProgress.value = progress
        if (progress < 30) {
          exportMessage.value = 'Preparing data...'
        } else if (progress < 80) {
          exportMessage.value = 'Generating CSV file...'
        } else if (progress < 100) {
          exportMessage.value = 'Finalizing export...'
        }
      }
    })

    exportMessage.value = 'CSV export completed!'
    exportSuccess.value = `Successfully exported ${result.rowCount} email records to ${filename}`

    setTimeout(() => {
      exportSuccess.value = ''
    }, 5000)

  } catch (error) {
    console.error('CSV export error:', error)
    exportMessage.value = 'Export failed'
    exportError.value = error.message || 'Failed to export CSV. Please try again.'

    setTimeout(() => {
      exportError.value = ''
    }, 10000)
  } finally {
    setTimeout(() => {
      exporting.value = false
      exportProgress.value = 0
    }, 1000)
  }
}

const exportToPDF = async () => {
  if (exporting.value) return

  exporting.value = true
  exportType.value = 'pdf'
  exportProgress.value = 0
  exportMessage.value = 'Preparing PDF export...'
  exportSuccess.value = ''
  exportError.value = ''

  try {
    validateExportData(filteredEmails.value)

    if (filteredEmails.value.length > 1000) {
      exportMessage.value = 'Large dataset detected. PDF generation may take a moment...'
    }

    const columns = [
      { key: 'timestamp', label: 'Date & Time', format: (val) => formatDateTimeUtil(val) },
      { key: 'to', label: 'Recipient' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status', format: (val) => val === 'success' ? 'Success' : 'Failed' },
      { key: 'fromName', label: 'Sender' }
    ]

    const filters = {
      search: searchQuery.value,
      status: statusFilter.value
    }

    const filename = generateExportFilename('email_logs', 'pdf', filters)

    const result = await exportPDFUtil({
      data: filteredEmails.value,
      columns,
      filename,
      title: 'Email History Report',
      filters,
      onProgress: (progress) => {
        exportProgress.value = progress
        if (progress < 20) {
          exportMessage.value = 'Initializing PDF...'
        } else if (progress < 50) {
          exportMessage.value = 'Formatting data...'
        } else if (progress < 90) {
          exportMessage.value = 'Generating PDF pages...'
        } else {
          exportMessage.value = 'Finalizing document...'
        }
      }
    })

    exportMessage.value = 'PDF export completed!'
    exportSuccess.value = `Successfully exported ${result.rowCount} email records to ${filename}`

    setTimeout(() => {
      exportSuccess.value = ''
    }, 5000)

  } catch (error) {
    console.error('PDF export error:', error)
    exportMessage.value = 'Export failed'
    exportError.value = error.message || 'Failed to export PDF. Please try again.'

    setTimeout(() => {
      exportError.value = ''
    }, 10000)
  } finally {
    setTimeout(() => {
      exporting.value = false
      exportProgress.value = 0
    }, 1000)
  }
}

// Watch for filter changes
watch([statusFilter, searchQuery], () => {
  currentPage.value = 1
})

// Watch for currentUser to be initialized, then load email history
watch(
  () => currentUser.value?.id,
  (newId, oldId) => {
    console.log('Watch triggered - currentUser.value:', currentUser.value)
    console.log('Watch triggered - newId:', newId, 'oldId:', oldId)
    if (newId) {
      console.log('Calling loadEmailHistory because newId exists:', newId)
      loadEmailHistory()
    } else {
      console.log('Not calling loadEmailHistory because newId is:', newId)
    }
  },
  { immediate: true }
)

onMounted(() => {
  console.log('EmailView onMounted - currentUser:', currentUser.value)
  loadEmailHistory()
})
</script>

<style scoped>
.card {
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0;
}

.form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.table th.sortable:hover {
  background-color: #e9ecef;
}

.table tbody tr {
  transition: background-color 0.2s;
}

.pagination {
  margin: 0;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
