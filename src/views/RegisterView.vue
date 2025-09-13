<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Create account</h2>
            <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{'is-invalid': touched && !nameValid}"
                  id="name"
                  v-model="fullName"
                  @blur="touched = true"
                  :disabled="submitting"
                  placeholder="Enter your full name"
                />
                <div v-if="touched && !nameValid" class="invalid-feedback">
                  Full name is required.
                </div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{'is-invalid': touched && !emailValid}"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  @blur="touched = true"
                  :disabled="submitting"
                  required
                />
                <div v-if="touched && !emailValid" class="invalid-feedback">
                  Please enter a valid email address.
                </div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="position-relative">
                  <input
                      :type="showPwd ? 'text' : 'password'"
                      class="form-control pe-5"
                      :class="{'is-invalid': touched && !pwdValid}"
                      id="password"
                      v-model="password"
                      autocomplete="new-password"
                      @blur="touched = true"
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
                <div v-if="touched && !pwdValid" class="invalid-feedback d-block">
                  Password must be at least 8 characters with at least one letter and one digit.
                </div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm password</label>
                <div class="position-relative">
                  <input
                    :type="showConfirm ? 'text' : 'password'"
                    class="form-control pe-5"
                    :class="{'is-invalid': touched && !matchValid}"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    autocomplete="new-password"
                    @blur="touched = true"
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
                <div v-if="touched && !matchValid" class="invalid-feedback">
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

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('user')
const submitting = ref(false)
const touched = ref(false)
const showPwd = ref(false)
const showConfirm = ref(false)
const formError = ref('')

const nameValid = computed(() => {
  return fullName.value.trim().length > 0
})

const emailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const pwdValid = computed(() => {
  const hasLetter = /[a-zA-Z]/.test(password.value)
  const hasDigit = /\d/.test(password.value)
  const lengthValid = password.value.length >= 8
  return hasLetter && hasDigit && lengthValid
})

const matchValid = computed(() => {
  return confirmPassword.value === password.value && confirmPassword.value.length > 0
})

const formValid = computed(() => {
  return nameValid.value && emailValid.value && pwdValid.value && matchValid.value
})

const handleRegister = async () => {
  formError.value = ''

  if (!formValid.value) {
    touched.value = true
    return
  }

  submitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    await register({
      name: fullName.value,
      email: email.value,
      password: password.value,
      role: role.value
    })

    if (role.value === 'coach') {
      router.push('/coaches')
    } else {
      router.push('/login')
    }
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