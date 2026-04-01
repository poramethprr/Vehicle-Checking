import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/inspection', name: 'Inspection', component: () => import('../views/Inspection.vue'), meta: { requiresAuth: true } },
  { path: '/reports', name: 'Reports', component: () => import('../views/Reports.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/export', name: 'Export', component: () => import('../views/Export.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/bookings', name: 'Bookings', component: () => import('../views/Bookings.vue'), meta: { requiresAuth: true } },
  { path: '/vehicles', name: 'Vehicles', component: () => import('../views/Vehicles.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/users', name: 'Users', component: () => import('../views/Users.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/logs', name: 'Logs', component: () => import('../views/Logs.vue'), meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && user) {
    next('/')
  } else if (to.meta.requiresAdmin && user?.role !== 'ADMIN') {
    next('/')
  } else if (to.meta.requiresDriverOrAdmin && !['ADMIN', 'STAFF'].includes(user?.role)) {
    next('/')
  } else {
    next()
  }
})

export default router
