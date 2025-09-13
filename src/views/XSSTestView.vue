<template>
  <div class="container mt-5 pt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">XSS Protection Test</h4>
            <small class="text-muted">Test that script content is safely rendered as text</small>
          </div>
          <div class="card-body">
            <form @submit.prevent="addTestContent">
              <div class="mb-3">
                <label for="testInput" class="form-label">Test Input</label>
                <textarea
                  id="testInput"
                  class="form-control"
                  v-model="testInput"
                  rows="3"
                  placeholder="Try entering script tags to test XSS protection"
                ></textarea>
                <div class="form-text">
                  Try entering malicious content like script tags to see how they are safely rendered.
                </div>
              </div>
              <button type="submit" class="btn btn-primary">Add Test Content</button>
              <button type="button" class="btn btn-secondary ms-2" @click="addDemoScripts">Add Demo Scripts</button>
              <button type="button" class="btn btn-outline-danger ms-2" @click="clearAll">Clear All</button>
            </form>
          </div>
        </div>

        <div v-if="testContents.length > 0" class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">Safely Rendered Content</h5>
            <small class="text-muted">All content below is rendered as plain text, never as HTML</small>
          </div>
          <div class="card-body">
            <div v-for="(content, index) in testContents" :key="index" class="test-item border-bottom pb-3 mb-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <strong>Test #{{ index + 1 }}</strong>
                <small class="text-muted">{{ formatDate(content.timestamp) }}</small>
              </div>
              <div class="test-content">
                <div class="mb-2">
                  <strong>Raw Input:</strong>
                  <code class="d-block bg-light p-2 mt-1">{{ content.raw }}</code>
                </div>
                <div class="mb-2">
                  <strong>Safely Rendered:</strong>
                  <div class="bg-light p-2 mt-1 border">{{ content.sanitized }}</div>
                </div>
                <div v-if="content.wasBlocked" class="alert alert-warning py-2 mb-0">
                  <small><strong>Security Alert:</strong> Potentially malicious content was detected and blocked.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { sanitizeText, containsScript } from '../utils/security'

const testInput = ref('')
const testContents = ref([])

const addTestContent = () => {
  if (!testInput.value.trim()) return

  try {
    const raw = testInput.value
    const sanitized = sanitizeText(raw, 500)
    const wasBlocked = containsScript(raw)

    testContents.value.unshift({
      raw,
      sanitized,
      wasBlocked,
      timestamp: new Date().toISOString()
    })

    testInput.value = ''
  } catch (error) {
    alert(error.message)
  }
}

const addDemoScripts = () => {
  const demoScripts = [
    '&lt;script&gt;alert("XSS Attack")&lt;/script&gt;',
    '&lt;img src="x" onerror="alert(XSS)" /&gt;',
    'javascript:alert("XSS")',
    '&lt;div onload="alert(XSS)"&gt;Click me&lt;/div&gt;',
    'Normal text content is safe',
    '&lt;h1&gt;HTML tags are escaped&lt;/h1&gt;'
  ]

  demoScripts.forEach(script => {
    const sanitized = sanitizeText(script, 500)
    const wasBlocked = containsScript(script)

    testContents.value.unshift({
      raw: script,
      sanitized,
      wasBlocked,
      timestamp: new Date().toISOString()
    })
  })
}

const clearAll = () => {
  testContents.value = []
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.test-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.test-content code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.test-content .bg-light {
  border-radius: 0.375rem;
}
</style>
