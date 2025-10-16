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

        <div v-if="recentEmails.length > 0" class="card shadow-sm mt-4">
          <div class="card-header">
            <h5 class="mb-0">Recent Emails</h5>
          </div>
          <div class="card-body">
            <div class="list-group">
              <div
                v-for="email in recentEmails"
                :key="email.id"
                class="list-group-item"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ email.subject }}</h6>
                    <p class="mb-1 text-muted small">
                      To: {{ email.to }}
                    </p>
                    <small class="text-muted">
                      {{ formatDate(email.timestamp) }}
                    </small>
                  </div>
                  <span
                    class="badge"
                    :class="email.status === 'success' ? 'bg-success' : 'bg-danger'"
                  >
                    {{ email.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loadingHistory" class="text-center mt-3">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../auth/authService'
import { sendEmail, getEmailHistory } from '../services/emailService'
import { sanitizeText } from '../utils/security'

const { currentUser } = useAuth()

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
const recentEmails = ref([])
const loadingHistory = ref(false)

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

const loadEmailHistory = async () => {
  try {
    loadingHistory.value = true
    recentEmails.value = await getEmailHistory(currentUser.value.id)
  } catch (error) {
    console.error('Error loading email history:', error)
  } finally {
    loadingHistory.value = false
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

onMounted(() => {
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

.list-group-item {
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.list-group-item:hover {
  border-left-color: #3498db;
  background-color: #f8f9fa;
}
</style>
