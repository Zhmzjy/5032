<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Welcome Back</h2>
            <div v-if="formError" class="alert alert-danger" role="alert">{{ formError }}</div>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  :disabled="loading"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="position-relative">
                  <input
                    :type="showPwd ? 'text' : 'password'"
                    class="form-control pe-5"
                    id="password"
                    v-model="password"
                    autocomplete="current-password"
                    :disabled="loading"
                    required
                  />
                  <button
                    type="button"
                    class="position-absolute top-50 end-0 translate-middle-y pe-3"
                    style="background: transparent; border: none;"
                    :aria-label="showPwd ? 'Hide password' : 'Show password'"
                    @click="showPwd = !showPwd"
                    :disabled="loading"
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
              </div>
              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="remember"
                  v-model="remember"
                  :disabled="loading"
                />
                <label class="form-check-label" for="remember">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ loading ? 'Signing in…' : 'Login' }}
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../auth/authService'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const showPwd = ref(false)
const formError = ref('')

const handleLogin = async () => {
  formError.value = ''
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    const user = await login({ email: email.value, password: password.value })

    const nextPath = route.query.next
    if (nextPath && typeof nextPath === 'string') {
      router.push(decodeURIComponent(nextPath))
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    formError.value = error.message
  } finally {
    loading.value = false
  }
}
</script>
