<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Welcome Back</h2>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{'is-invalid': touched && !emailValid}"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  @blur="touched = true"
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
                  autocomplete="current-password"
                  @blur="touched = true"
                  required
                />
                <div v-if="touched && !pwdValid" class="invalid-feedback">
                  Password must be at least 8 characters long.
                </div>
              </div>
              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="remember"
                  v-model="remember"
                />
                <label class="form-check-label" for="remember">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="submitting || !formValid"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ submitting ? 'Signing In...' : 'Sign In' }}
              </button>
            </form>
          </div>
        </div>
        <div class="text-center mt-3">
          <p class="mb-0">
            Don't have an account?
            <RouterLink to="/register" class="text-decoration-none">Sign up here</RouterLink>
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

const email = ref('')
const password = ref('')
const remember = ref(false)
const submitting = ref(false)
const touched = ref(false)

const emailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const pwdValid = computed(() => {
  return password.value.length >= 8
})

const formValid = computed(() => {
  return emailValid.value && pwdValid.value
})

const handleLogin = async () => {
  touched.value = true

  if (!formValid.value) {
    return
  }

  submitting.value = true

  await new Promise(resolve => setTimeout(resolve, 600))

  console.log('Login attempt:', {
    email: email.value,
    password: password.value,
    remember: remember.value
  })

  submitting.value = false
  router.push('/')
}
</script>
