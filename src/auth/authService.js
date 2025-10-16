import { ref, computed } from 'vue'
import { auth, db } from '../firebase/config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const currentUser = ref(null)
const isAuthenticated = computed(() => !!currentUser.value)

const getUserDataFromFirestore = async (userId) => {
  try {
    const userDocRef = doc(db, 'userData', userId)
    const userDoc = await getDoc(userDocRef)
    return userDoc.exists() ? userDoc.data() : null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

const saveUserDataToFirestore = async (userId, data) => {
  try {
    const userDocRef = doc(db, 'userData', userId)
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error('Error saving user data:', error)
  }
}

const getErrorMessage = (errorCode) => {
  const errors = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/weak-password': 'Password is too weak.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign in cancelled.',
    'auth/cancelled-popup-request': 'Sign in cancelled.'
  }
  return errors[errorCode] || 'An error occurred. Please try again.'
}

const register = async ({ email, password, name, gender, role = 'user' }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    await updateProfile(user, { displayName: name })

    const registrationData = {
      userId: user.uid,
      name: name,
      email: user.email,
      gender: gender,
      role: role,
      accountCreatedAt: new Date().toISOString(),
      accountCreatedDate: new Date().toLocaleDateString('en-AU'),
      accountCreatedTime: new Date().toLocaleTimeString('en-AU'),
      emailVerified: user.emailVerified,
      authProvider: 'email',
      lastLoginAt: new Date().toISOString(),
      profileCompleted: true,
      accountStatus: 'active'
    }

    await saveUserDataToFirestore(user.uid, registrationData)

    await sendEmailVerification(user)

    currentUser.value = {
      email: user.email,
      name: name,
      gender: gender,
      role: role,
      id: user.uid,
      emailVerified: user.emailVerified
    }

    return currentUser.value
  } catch (error) {
    throw new Error(getErrorMessage(error.code))
  }
}

const login = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const firestoreData = await getUserDataFromFirestore(user.uid)

    currentUser.value = {
      email: user.email,
      name: user.displayName || firestoreData?.name || email.split('@')[0],
      role: firestoreData?.role || 'user',
      id: user.uid,
      emailVerified: user.emailVerified
    }

    return currentUser.value
  } catch (error) {
    throw new Error(getErrorMessage(error.code))
  }
}

const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    let firestoreData = await getUserDataFromFirestore(user.uid)

    if (!firestoreData) {
      await saveUserDataToFirestore(user.uid, {
        role: 'user',
        name: user.displayName,
        email: user.email,
        createdAt: new Date().toISOString()
      })
      firestoreData = { role: 'user', name: user.displayName }
    }

    currentUser.value = {
      email: user.email,
      name: user.displayName || firestoreData?.name || user.email.split('@')[0],
      role: firestoreData?.role || 'user',
      id: user.uid,
      emailVerified: user.emailVerified
    }

    return currentUser.value
  } catch (error) {
    throw new Error(getErrorMessage(error.code))
  }
}

const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw new Error(getErrorMessage(error.code))
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    currentUser.value = null
  } catch (error) {
    throw new Error(getErrorMessage(error.code))
  }
}

const getSession = () => {
  return currentUser.value
}

const isAuthed = () => {
  return !!currentUser.value
}

const hasRole = (role) => {
  return currentUser.value?.role === role
}

const initAuth = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const firestoreData = await getUserDataFromFirestore(user.uid)

        currentUser.value = {
          email: user.email,
          name: user.displayName || firestoreData?.name || user.email.split('@')[0],
          role: firestoreData?.role || 'user',
          id: user.uid,
          emailVerified: user.emailVerified
        }
      } else {
        currentUser.value = null
      }
      resolve(user)
    })
  })
}

const updateUserRole = async (userId, newRole) => {
  await saveUserDataToFirestore(userId, { role: newRole })

  if (currentUser.value && currentUser.value.id === userId) {
    currentUser.value.role = newRole
  }
}

const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No user logged in')
    }
    if (user.emailVerified) {
      throw new Error('Email already verified')
    }

    const actionCodeSettings = {
      url: 'https://assignment3-3b99b.web.app/dashboard',
      handleCodeInApp: false
    }

    await sendEmailVerification(user, actionCodeSettings)

    console.log('Verification email sent to:', user.email)

    return {
      success: true,
      email: user.email
    }
  } catch (error) {
    console.error('Detailed error sending verification email:', {
      code: error.code,
      message: error.message,
      email: auth.currentUser?.email
    })
    throw new Error(getErrorMessage(error.code) || error.message)
  }
}

const reloadUserStatus = async () => {
  try {
    const user = auth.currentUser
    if (!user) {
      return false
    }
    await user.reload()

    if (currentUser.value) {
      currentUser.value.emailVerified = user.emailVerified
    }

    return user.emailVerified
  } catch (error) {
    console.error('Error reloading user status:', error)
    return false
  }
}

export const useAuth = () => {
  return {
    currentUser,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    initAuth,
    updateUserRole,
    resendVerificationEmail,
    reloadUserStatus
  }
}

export {
  register,
  login,
  loginWithGoogle,
  resetPassword,
  logout,
  getSession,
  isAuthed,
  hasRole,
  initAuth,
  updateUserRole,
  resendVerificationEmail,
  reloadUserStatus
}
