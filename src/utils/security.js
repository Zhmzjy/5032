const MAX_TEXT_LENGTH = 1000
const MAX_COMMENT_LENGTH = 280
const MAX_NAME_LENGTH = 100

export const escapeHtml = (text) => {
  if (typeof text !== 'string') return ''

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export const sanitizeText = (text, maxLength = MAX_TEXT_LENGTH) => {
  if (typeof text !== 'string') return ''

  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()

  if (cleaned.length > maxLength) {
    throw new Error(`Text exceeds maximum length of ${maxLength} characters`)
  }

  return cleaned
}

export const validateCommentLength = (comment) => {
  const trimmed = comment.trim()
  if (trimmed.length === 0) {
    throw new Error('Comment cannot be empty')
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters`)
  }
  return trimmed
}

export const validateNameLength = (name) => {
  const trimmed = name.trim()
  if (trimmed.length === 0) {
    throw new Error('Name cannot be empty')
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Name exceeds maximum length of ${MAX_NAME_LENGTH} characters`)
  }
  return trimmed
}

export const containsScript = (text) => {
  if (typeof text !== 'string') return false
  const lowercaseText = text.toLowerCase()
  return lowercaseText.includes('<script') ||
         lowercaseText.includes('javascript:') ||
         lowercaseText.includes('onload=') ||
         lowercaseText.includes('onerror=') ||
         lowercaseText.includes('onclick=')
}
