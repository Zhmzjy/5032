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

              <div class="mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  v-model="phone"
                  :disabled="submitting"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="specialization" class="form-label">Specialization</label>
                <select
                  class="form-select"
                  id="specialization"
                  v-model="specialization"
                  :disabled="submitting"
                  required
                >
                  <option value="">Select your specialization</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Dance">Dance</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Personal Trainer">Personal Trainer</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="experience" class="form-label">Years of Experience</label>
                <input
                  type="number"
                  class="form-control"
                  id="experience"
                  v-model="experience"
                  min="1"
                  max="50"
                  :disabled="submitting"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="certifications" class="form-label">Certifications</label>
                <textarea
                  class="form-control"
                  id="certifications"
                  v-model="certifications"
                  rows="2"
                  :disabled="submitting"
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
                  :disabled="submitting"
                  placeholder="Tell us about yourself and your coaching philosophy"
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="terms"
                    v-model="terms"
                    :disabled="submitting"
                    required
                  />
                  <label class="form-check-label" for="terms">
                    I accept the terms and conditions
                  </label>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="submitting"
              >
                <span v-if="submitting">Processing...</span>
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
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const phone = ref('')
const specialization = ref('')
const experience = ref('')
const certifications = ref('')
const bio = ref('')
const terms = ref(false)
const submitting = ref(false)

const handleSubmit = async () => {
  submitting.value = true

  console.log({
    name: name.value,
    email: email.value,
    phone: phone.value,
    specialization: specialization.value,
    experience: experience.value,
    certifications: certifications.value,
    bio: bio.value,
    terms: terms.value
  })

  await new Promise(resolve => setTimeout(resolve, 800))
  submitting.value = false
}
</script>

<style scoped>
</style>
