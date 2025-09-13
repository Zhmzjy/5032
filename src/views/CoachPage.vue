<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h1 class="h4 text-center mb-3">Become a Coach</h1>
            <p class="text-center text-muted mb-4">
              Join our community of fitness coaches and help others achieve their health goals.
              Create and manage fitness events while building meaningful connections.
            </p>

            <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="name"
                  :disabled="loading"
                  :class="{'is-invalid': touched && !nameValid}"
                  required
                />
                <div class="invalid-feedback">
                  Name must be at least 2 characters long.
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  :disabled="loading"
                  :class="{'is-invalid': touched && !emailValid}"
                  required
                />
                <div class="invalid-feedback">
                  Please enter a valid email address.
                </div>
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  v-model="phone"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  :disabled="loading"
                  :class="{'is-invalid': touched && !phoneValid}"
                  @blur="touched = true"
                  required
                />
                <div class="invalid-feedback">
                  Please enter a valid Australian phone number (10 digits starting with 02, 03, 04, 07, or 08).
                </div>
              </div>

              <div class="mb-3">
                <label for="specialization" class="form-label">Specialization</label>
                <select
                  class="form-select"
                  id="specialization"
                  v-model="specialization"
                  :disabled="loading"
                  :class="{'is-invalid': touched && !specializationValid}"
                  @blur="touched = true"
                  required
                >
                  <option value="">Select your specialization</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Dance">Dance</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Personal Trainer">Personal Trainer</option>
                </select>
                <div class="invalid-feedback">
                  Please select a specialization.
                </div>
              </div>

              <div class="mb-3">
                <label for="experience" class="form-label">Years of Experience</label>
                <input
                  type="number"
                  class="form-control"
                  id="experience"
                  v-model.number="experience"
                  min="1"
                  max="50"
                  :disabled="loading"
                  :class="{'is-invalid': touched && !experienceValid}"
                  @blur="touched = true"
                  required
                />
                <div class="invalid-feedback">
                  Experience must be between 1 and 50 years.
                </div>
              </div>

              <div class="mb-3">
                <label for="certifications" class="form-label">Certifications</label>
                <textarea
                  class="form-control"
                  id="certifications"
                  v-model="certifications"
                  rows="2"
                  :disabled="loading"
                  placeholder="List your relevant certifications"
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="bio" class="form-label">Bio</label>
                <textarea
                  class="form-control"
                  id="bio"
                  v-model="bio"
                  rows="3"
                  :disabled="loading"
                  :class="{'is-invalid': touched && !bioValid}"
                  @blur="touched = true"
                  placeholder="Tell us about yourself and your coaching philosophy"
                  required
                ></textarea>
                <div class="invalid-feedback">
                  Bio must be at least 20 characters long.
                </div>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="terms"
                    v-model="terms"
                    :disabled="loading"
                    :class="{'is-invalid': touched && !termsValid}"
                    required
                  />
                  <label class="form-check-label" for="terms">
                    I accept the terms and conditions
                  </label>
                  <div class="invalid-feedback">
                    You must accept the terms and conditions.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading || !formValid"
              >
                <span v-if="loading">Processing...</span>
                <span v-else>Submit Application</span>
              </button>
            </form>
          </div>
        </div>

        <div class="text-center mt-3">
          <RouterLink to="/" class="text-decoration-none">Back to Home</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../auth/authService'

const router = useRouter()
const { currentUser, isAuthenticated, updateUserRole } = useAuth()

const name = ref(currentUser.value?.name || '')
const email = ref(currentUser.value?.email || '')
const phone = ref('')
const specialization = ref('')
const experience = ref('')
const certifications = ref('')
const bio = ref('')
const terms = ref(false)
const touched = ref(false)
const loading = ref(false)
const formError = ref(null)

const nameValid = computed(() => name.value.trim().length >= 2)
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const phoneValid = computed(() => {
  const phoneDigits = phone.value.replace(/\D/g, '')
  return phoneDigits.length === 10 && (phoneDigits.startsWith('04') || phoneDigits.startsWith('02') || phoneDigits.startsWith('03') || phoneDigits.startsWith('07') || phoneDigits.startsWith('08'))
})
const specializationValid = computed(() => specialization.value !== '')
const experienceValid = computed(() => experience.value >= 1 && experience.value <= 50)
const bioValid = computed(() => bio.value.trim().length >= 20)
const termsValid = computed(() => terms.value === true)

const formValid = computed(() => {
  return nameValid.value && emailValid.value && phoneValid.value &&
         specializationValid.value && experienceValid.value && bioValid.value && termsValid.value
})

const handleSubmit = async () => {
  if (!isAuthenticated.value) {
    formError.value = 'Please login to submit a coach application.'
    return
  }

  if (!formValid.value) {
    touched.value = true
    return
  }

  loading.value = true
  formError.value = null

  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    const applicationData = {
      userId: currentUser.value.id,
      name: name.value,
      email: email.value,
      phone: phone.value,
      specialization: specialization.value,
      experience: experience.value,
      certifications: certifications.value,
      bio: bio.value,
      appliedAt: new Date().toISOString(),
      status: 'approved'
    }

    const applications = JSON.parse(localStorage.getItem('coachApplications') || '[]')
    applications.push(applicationData)
    localStorage.setItem('coachApplications', JSON.stringify(applications))

    updateUserRole(currentUser.value.id, 'coach')

    alert('Congratulations! Your coach application has been approved. You are now a certified coach!')
    router.push('/coach')
  } catch (error) {
    formError.value = 'An error occurred while processing your application. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
