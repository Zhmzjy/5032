<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Create account</h2>
            <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{'is-invalid': touchedFields.name && !nameValid}"
                  id="name"
                  v-model="fullName"
                  @blur="touchedFields.name = true"
                  :disabled="submitting"
                  placeholder="Enter your full name"
                />
                <div v-if="touchedFields.name && !nameValid" class="invalid-feedback">
                  Full name is required.
                </div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{'is-invalid': touchedFields.email && !emailValid}"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  @blur="touchedFields.email = true"
                  :disabled="submitting"
                  required
                />
                <div v-if="touchedFields.email && !emailValid" class="invalid-feedback">
                  Please enter a valid email address.
                </div>
              </div>
              <div class="mb-3">
                <label for="gender" class="form-label">Gender</label>
                <select
                  class="form-select"
                  id="gender"
                  v-model="gender"
                  :class="{'is-invalid': touchedFields.gender && !genderValid}"
                  @blur="touchedFields.gender = true"
                  :disabled="submitting"
                  required
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <div v-if="touchedFields.gender && !genderValid" class="invalid-feedback">
                  Please select your gender.
                </div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="position-relative">
                  <input
                      :type="showPwd ? 'text' : 'password'"
                      class="form-control pe-5"
                      :class="{'is-invalid': touchedFields.password && !pwdValid}"
                      id="password"
                      v-model="password"
                      autocomplete="new-password"
                      @blur="touchedFields.password = true"
                      :disabled="submitting"
                      required
                  />
                  <button
                      type="button"
                      class="position-absolute top-50 end-0 translate-middle-y pe-3"
                      style="background: transparent; border: none;"
                      :aria-label="showPwd ? 'Hide password' : 'Show password'"
                      @click="showPwd = !showPwd"
                      :disabled="submitting"
                  >
                    <svg v-if="showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M21 2l-18 18"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <div v-if="password.length > 0" class="mt-2">
                  <div class="d-flex align-items-center mb-1">
                    <div class="flex-grow-1 me-2">
                      <div class="progress" style="height: 6px;">
                        <div
                          class="progress-bar"
                          :class="strengthClass"
                          :style="{ width: strengthWidth }"
                          role="progressbar"
                        ></div>
                      </div>
                    </div>
                    <small :class="strengthTextClass" class="fw-bold">{{ strengthText }}</small>
                  </div>
                </div>
                <div v-if="touchedFields.password && !pwdValid" class="invalid-feedback d-block">
                  Password must be at least 8 characters with at least one letter and one digit.
                </div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm password</label>
                <div class="position-relative">
                  <input
                    :type="showConfirm ? 'text' : 'password'"
                    class="form-control pe-5"
                    :class="{'is-invalid': touchedFields.confirmPassword && !matchValid}"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    autocomplete="new-password"
                    @blur="touchedFields.confirmPassword = true"
                    :disabled="submitting"
                    required
                  />
                  <button
                    type="button"
                    class="position-absolute top-50 end-0 translate-middle-y pe-3"
                    style="background: transparent; border: none;"
                    :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                    @click="showConfirm = !showConfirm"
                    :disabled="submitting"
                  >
                    <svg v-if="showConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M21 2l-18 18"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <div v-if="touchedFields.confirmPassword && !matchValid" class="invalid-feedback">
                  Passwords must match.
                </div>
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Role</label>
                <select
                  class="form-select"
                  id="role"
                  v-model="role"
                  :disabled="submitting"
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="submitting || !formValid"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ submitting ? 'Creating…' : 'Create account' }}
              </button>
            </form>
          </div>
        </div>
        <div class="text-center mt-3">
          <p class="mb-0">
            Already have an account?
            <RouterLink to="/login" class="text-decoration-none">Sign in here</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../auth/authService'
import { sanitizeText, validateNameLength } from '../utils/security'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const gender = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('user')
const submitting = ref(false)
const touchedFields = ref({
  name: false,
  email: false,
  gender: false,
  password: false,
  confirmPassword: false
})
const showPwd = ref(false)
const showConfirm = ref(false)
const formError = ref('')
const successMessage = ref('')

const nameValid = computed(() => {
  try {
    validateNameLength(fullName.value)
    return true
  } catch {
    return false
  }
})

const emailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const genderValid = computed(() => {
  return gender.value && gender.value.trim().length > 0
})

const pwdValid = computed(() => {
  const hasLetter = /[a-zA-Z]/.test(password.value)
  const hasDigit = /\d/.test(password.value)
  const lengthValid = password.value.length >= 8
  return hasLetter && hasDigit && lengthValid
})

const passwordStrength = computed(() => {
  const pwd = password.value
  if (pwd.length === 0) return 0

  let strength = 0
  if (pwd.length >= 8) strength++
  if (pwd.length >= 12) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  return strength
})

const strengthWidth = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return '20%'
  if (strength === 2) return '40%'
  if (strength === 3) return '60%'
  if (strength === 4) return '80%'
  return '100%'
})

const strengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'bg-danger'
  if (strength === 2) return 'bg-warning'
  if (strength === 3) return 'bg-info'
  return 'bg-success'
})

const strengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'Weak'
  if (strength === 2) return 'Fair'
  if (strength === 3) return 'Good'
  if (strength >= 4) return 'Strong'
  return ''
})

const strengthTextClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'text-danger'
  if (strength === 2) return 'text-warning'
  if (strength === 3) return 'text-info'
  return 'text-success'
})

const matchValid = computed(() => {
  return confirmPassword.value === password.value && confirmPassword.value.length > 0
})

const formValid = computed(() => {
  return nameValid.value && emailValid.value && genderValid.value && pwdValid.value && matchValid.value
})

const handleRegister = async () => {
  formError.value = ''
  successMessage.value = ''

  if (!formValid.value) {
    touchedFields.value = {
      name: true,
      email: true,
      gender: true,
      password: true,
      confirmPassword: true
    }
    return
  }

  try {
    const sanitizedName = sanitizeText(fullName.value, 100)
    const validatedName = validateNameLength(sanitizedName)

    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 600))
    await register({
      name: validatedName,
      email: email.value,
      gender: gender.value,
      password: password.value,
      role: role.value
    })

    successMessage.value = 'Account created! Please check your email to verify your account.'

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    formError.value = error.message
  } finally {
    submitting.value = false
  }
}
</script>
<style scoped>
.form-control.is-invalid,
.was-validated .form-control:invalid {
  background-image: none !important;
  background-size: 0 !important;
  background-position: right center !important;
}
.form-control.pe-5.is-invalid {
  padding-right: 3rem !important;
}
</style>