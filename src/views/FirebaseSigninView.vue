<template>
  <div>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="register">Register</button>
    <button @click="login">Login</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyDoDZEP-YZez8RdPSvzEVvKrfv0mo0UGzo",
  authDomain: "week7-junyi.firebaseapp.com",
  projectId: "week7-junyi",
  storageBucket: "week7-junyi.firebasestorage.app",
  messagingSenderId: "950475868202",
  appId: "1:950475868202:web:c0f3fac471f0fa32c5db53"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const email = ref('')
const password = ref('')

const register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    alert('Registration successful')
  } catch (error) {
    alert('Registration failed: ' + error.message)
  }
}

const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    alert('Login successful')
    console.log(userCredential.user)
  } catch (error) {
    alert('Login failed: ' + error.message)
  }
}
</script>
