import { createRouter, createWebHistory } from 'vue-router'
import { getSession } from '../auth/authService'

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
