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

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
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

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="submitting"
              >
                <span v-if="submitting">Processing...</span>
                <span v-else>Start Application</span>
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
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const submitting = ref(false)

const handleSubmit = async () => {
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  submitting.value = false
}
</script>

<style scoped>
</style>
