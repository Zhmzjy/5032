import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuth } from './auth/authService'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const { initAuth } = useAuth()
initAuth()

app.mount('#app')
