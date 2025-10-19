import { createRouter, createWebHistory } from 'vue-router'
import { getSession, authReady } from '../auth/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
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
      meta: { requiresAuth: true }
    },
    {
      path: '/coaches',
      name: 'coaches',
      component: () => import('../views/CoachPage.vue')
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: () => import('../views/ReviewsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/email',
      name: 'email',
      component: () => import('../views/EmailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/xss-test',
      name: 'xss-test',
      component: () => import('../views/XSSTestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  console.log('[Router Guard] Navigating to:', to.path)
  console.log('[Router Guard] Waiting for auth to be ready...')

  await authReady

  console.log('[Router Guard] Auth is ready')

  const session = getSession()
  const isAuthenticated = !!session
  const userRole = session?.role

  console.log('[Router Guard] Session:', session)
  console.log('[Router Guard] IsAuthenticated:', isAuthenticated)

  if (to.path === '/' && isAuthenticated) {
    console.log('[Router Guard] Redirecting logged-in user from home to dashboard')
    next({ name: 'dashboard' })
    return
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('[Router Guard] Protected route, redirecting to login')
    next({ name: 'login', query: { next: to.fullPath } })
    return
  }

  if (to.meta.guestOnly && isAuthenticated) {
    console.log('[Router Guard] Guest-only route, redirecting to dashboard')
    next({ name: 'dashboard' })
    return
  }

  if (to.meta.roles && isAuthenticated && !to.meta.roles.includes(userRole)) {
    console.log('[Router Guard] User role not allowed, redirecting to dashboard')
    next({ name: 'dashboard' })
    return
  }

  console.log('[Router Guard] Allowing navigation to:', to.path)
  next()
})

export default router
