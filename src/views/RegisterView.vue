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
                  id="name"
                  v-model="name"
                  :disabled="submitting"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  :disabled="submitting"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  autocomplete="new-password"
                  :disabled="submitting"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  autocomplete="new-password"
                  :disabled="submitting"
                  required
                />
              </div>
              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="terms"
                  v-model="terms"
                  :disabled="submitting"
                  required
                />
                <label class="form-check-label" for="terms">
                  I agree to the terms and conditions
                </label>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="submitting"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const terms = ref(false)
const submitting = ref(false)

const handleRegister = async () => {
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
