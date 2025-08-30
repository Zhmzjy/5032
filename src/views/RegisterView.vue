<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Create account</h2>
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
                <input
                  type="password"
                  class="form-control"
                  :class="{'is-invalid': touched && !pwdValid}"
                  id="password"
                  v-model="password"
                  autocomplete="new-password"
                  @blur="touched = true"
                  :disabled="submitting"
                  required
                />
                <div v-if="touched && !pwdValid" class="invalid-feedback">
                  Password must be at least 8 characters and contain at least one letter and one digit.
                </div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm password</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{'is-invalid': touched && !matchValid}"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  autocomplete="new-password"
                  @blur="touched = true"
                  :disabled="submitting"
                  required
                />
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
                {{ submitting ? 'Creating account...' : 'Create account' }}
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

const nameValid = computed(() => {
  return name.value.trim().length >= 2
})

const emailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const pwdValid = computed(() => {
  const hasLetter = /[a-zA-Z]/.test(password.value)
  const hasDigit = /\d/.test(password.value)
  return password.value.length >= 8 && hasLetter && hasDigit
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
