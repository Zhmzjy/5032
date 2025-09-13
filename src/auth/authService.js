import { ref, computed } from 'vue'

const currentUser = ref(null)
const isAuthenticated = computed(() => !!currentUser.value)

const sha256 = async (text) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const getUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]')
}

const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users))
}

const getSession = () => {
  const sessionData = localStorage.getItem('session')
  return sessionData ? JSON.parse(sessionData) : null
}

const saveSession = (session) => {
  localStorage.setItem('session', JSON.stringify(session))
}

const clearSession = () => {
  localStorage.removeItem('session')
}

const register = async ({ email, password, name, role = 'user' }) => {
  const users = getUsers()
  const normalizedEmail = email.toLowerCase()

  const existingUser = users.find(u => u.email === normalizedEmail)
  if (existingUser) {
    throw new Error('This email is already registered.')
  }

  const passwordHash = await sha256(password)

  const newUser = {
    email: normalizedEmail,
    passwordHash,
    name,
    role,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveUsers(users)

  return { email: newUser.email, name: newUser.name, role: newUser.role, id: newUser.id }
}

const login = async ({ email, password }) => {
  const users = getUsers()
  const normalizedEmail = email.toLowerCase()

  const user = users.find(u => u.email === normalizedEmail)
  if (!user) {
    throw new Error('Invalid email or password.')
  }

  const passwordHash = await sha256(password)
  if (user.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.')
  }

  const session = {
    email: user.email,
    name: user.name,
    role: user.role,
    id: user.id
  }

  saveSession(session)
  currentUser.value = session

  return session
}

const logout = () => {
  clearSession()
  currentUser.value = null
}

const isAuthed = () => {
  return !!getSession()
}

const hasRole = (role) => {
  const session = getSession()
  return session?.role === role
}

const initAuth = () => {
  const session = getSession()
  if (session) {
    currentUser.value = session
  }
}

const updateUserRole = async (userId, newRole) => {
  const users = getUsers()
  const userIndex = users.findIndex(u => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex].role = newRole
    saveUsers(users)

    const session = getSession()
    if (session && session.id === userId) {
      session.role = newRole
      saveSession(session)
      currentUser.value = session
    }
  }
}

export const useAuth = () => {
  return {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    initAuth,
    updateUserRole
  }
}

export {
  sha256,
  register,
  login,
  logout,
  getSession,
  isAuthed,
  hasRole
}
