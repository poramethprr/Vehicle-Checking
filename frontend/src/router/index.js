import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/inspection', name: 'Inspection', component: () => import('../views/Inspection.vue'), meta: { requiresAuth: true } },
  { path: '/reports', name: 'Reports', component: () => import('../views/Reports.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-bookings', name: 'ReportBookings', component: () => import('../views/ReportBookings.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-fuels', name: 'ReportFuels', component: () => import('../views/ReportFuels.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-repairs', name: 'ReportRepairs', component: () => import('../views/ReportRepairs.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-docs', name: 'ReportDocs', component: () => import('../views/ReportDocs.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/export', name: 'Export', component: () => import('../views/Export.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/bookings', name: 'Bookings', component: () => import('../views/Bookings.vue'), meta: { requiresAuth: true } },
  { path: '/renewals', name: 'Renewals', component: () => import('../views/Renewals.vue'), meta: { requiresAuth: true } },
  { path: '/repairs', name: 'Repairs', component: () => import('../views/Repairs.vue'), meta: { requiresAuth: true } },
  { path: '/fuels', name: 'Fuels', component: () => import('../views/Fuels.vue'), meta: { requiresAuth: true } },
  { path: '/accidents', name: 'Accidents', component: () => import('../views/Accidents.vue'), meta: { requiresAuth: true } },
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
