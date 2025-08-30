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
                <label for="name" class="form-label">Name</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{'is-invalid': touched && !nameValid}"
                  id="name"
                  v-model="name"
                  @blur="touched = true"
                  :disabled="submitting"
                  required
                />
                <div v-if="touched && !nameValid" class="invalid-feedback">
                  Name must be at least 2 characters long.
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
                  Password must be 8–16 characters and include at least one uppercase letter, one lowercase letter, and one digit.
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
                  Passwords do not match.
                </div>
              </div>
              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :class="{'is-invalid': touched && !termsValid}"
                  id="terms"
                  v-model="terms"
                  @change="touched = true"
                  :disabled="submitting"
                  required
                />
                <label class="form-check-label" for="terms">
                  I agree to the terms and conditions
                </label>
                <div v-if="touched && !termsValid" class="invalid-feedback">
                  You must accept the terms and conditions.
                </div>
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

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const terms = ref(false)
const submitting = ref(false)
const touched = ref(false)
const showPwd = ref(false)
const showConfirm = ref(false)
const formError = ref('')

const nameValid = computed(() => {
  return name.value.trim().length >= 2
})

const emailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const pwdValid = computed(() => {
  const hasUpper = /[A-Z]/.test(password.value)
  const hasLower = /[a-z]/.test(password.value)
  const hasDigit = /\d/.test(password.value)
  const lengthValid = password.value.length >= 8 && password.value.length <= 16
  return hasUpper && hasLower && hasDigit && lengthValid
})

const matchValid = computed(() => {
  return confirmPassword.value === password.value && confirmPassword.value.length > 0
})

const termsValid = computed(() => {
  return terms.value === true
})

const formValid = computed(() => {
  return nameValid.value && emailValid.value && pwdValid.value && matchValid.value && termsValid.value
})

const handleRegister = async () => {
  formError.value = ''

  if (!formValid.value) {
    touched.value = true
    return
  }

  submitting.value = true

  await new Promise(resolve => setTimeout(resolve, 600))

  console.log('Registration attempt:', {
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    terms: terms.value
  })

  submitting.value = false
  router.push('/login')
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