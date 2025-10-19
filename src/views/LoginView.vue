<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm rounded-4">
          <div class="card-body p-4">
            <h1 class="card-title text-center mb-4">Welcome Back</h1>
            <div
              v-if="formError"
              class="alert alert-danger"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              {{ formError }}
            </div>
            <div
              v-if="successMessage"
              class="alert alert-success"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              {{ successMessage }}
            </div>
            <form @submit.prevent="handleLogin" novalidate>
              <div class="mb-3">
                <label for="email" class="form-label required">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  :disabled="loading"
                  required
                  aria-required="true"
                  aria-describedby="email-help"
                />
                <small id="email-help" class="form-text text-muted">
                  Enter your registered email address
                </small>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label required">Password</label>
                <div class="position-relative">
                  <input
                    :type="showPwd ? 'text' : 'password'"
                    class="form-control pe-5"
                    id="password"
                    v-model="password"
                    autocomplete="current-password"
                    :disabled="loading"
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    class="position-absolute top-50 end-0 translate-middle-y pe-3"
                    style="background: transparent; border: none;"
                    :aria-label="showPwd ? 'Hide password' : 'Show password'"
                    :aria-pressed="showPwd"
                    @click="showPwd = !showPwd"
                    :disabled="loading"
                    tabindex="0"
                  >
                    <svg v-if="showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M21 2l-18 18"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <div class="form-check">
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
                <a href="#" @click.prevent="showForgotPassword = true" class="text-decoration-none small">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100 mb-3"
                :disabled="loading"
                :aria-busy="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>{{ loading ? 'Signing in...' : 'Login' }}</span>
              </button>
            </form>

            <div class="text-center mb-3">
              <small class="text-muted">or continue with</small>
            </div>

            <button
              @click="handleGoogleLogin"
              class="btn btn-outline-secondary w-100"
              :disabled="loading"
              :aria-busy="loading"
              aria-label="Sign in with Google"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" class="me-2" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
        <div class="text-center mt-3">
          <small class="text-muted">
            Don't have an account?
            <RouterLink to="/register" class="text-decoration-none">Sign up</RouterLink>
          </small>
        </div>
      </div>
    </div>

    <div v-if="showForgotPassword" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reset Password</h5>
            <button type="button" class="btn-close" @click="closeForgotPassword" :disabled="resetLoading"></button>
          </div>
          <div class="modal-body">
            <div v-if="resetError" class="alert alert-danger">{{ resetError }}</div>
            <div v-if="resetSuccess" class="alert alert-success">{{ resetSuccess }}</div>
            <p class="text-muted small">Enter your email address and we'll send you a link to reset your password.</p>
            <form @submit.prevent="handleResetPassword">
              <div class="mb-3">
                <label for="resetEmail" class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  id="resetEmail"
                  v-model="resetEmail"
                  :disabled="resetLoading"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="resetLoading">
                <span v-if="resetLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ resetLoading ? 'Sending...' : 'Send Reset Link' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, loginWithGoogle, resetPassword } from '../auth/authService'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const showPwd = ref(false)
const formError = ref('')
const successMessage = ref('')

const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref('')

const handleLogin = async () => {
  formError.value = ''
  successMessage.value = ''
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

const handleGoogleLogin = async () => {
  formError.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await loginWithGoogle()

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

const handleResetPassword = async () => {
  resetError.value = ''
  resetSuccess.value = ''
  resetLoading.value = true

  try {
    await resetPassword(resetEmail.value)
    resetSuccess.value = 'Password reset email sent! Please check your inbox.'
    setTimeout(() => {
      closeForgotPassword()
    }, 3000)
  } catch (error) {
    resetError.value = error.message
  } finally {
    resetLoading.value = false
  }
}

const closeForgotPassword = () => {
  showForgotPassword.value = false
  resetEmail.value = ''
  resetError.value = ''
  resetSuccess.value = ''
}
</script>
