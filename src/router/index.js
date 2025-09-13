import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getSession } from '../auth/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, roles: ['user', 'coach'] }
    },
    {
      path: '/coaches',
      name: 'coach-application',
      component: () => import('../views/CoachPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: () => import('../views/ReviewsView.vue'),
      meta: { requiresAuth: true, roles: ['user', 'coach'] }
    },
    {
      path: '/xss-test',
      name: 'xss-test',
      component: () => import('../views/XSSTestView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const session = getSession()
  const isAuthenticated = !!session
  const userRole = session?.role

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { next: to.fullPath } })
    return
  }

  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  if (to.meta.roles && isAuthenticated && !to.meta.roles.includes(userRole)) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
