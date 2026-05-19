import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', redirect: '/login' },
  { path: '/microsoft-callback', name: 'MicrosoftCallback', component: () => import('../views/MicrosoftCallback.vue') },
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/inspection', name: 'Inspection', component: () => import('../views/Inspection.vue'), meta: { requiresAuth: true, vehicleOnly: true } },
  { path: '/reports', name: 'Reports', component: () => import('../views/Reports.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-bookings', name: 'ReportBookings', component: () => import('../views/ReportBookings.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-fuels', name: 'ReportFuels', component: () => import('../views/ReportFuels.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-repairs', name: 'ReportRepairs', component: () => import('../views/ReportRepairs.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/report-docs', name: 'ReportDocs', component: () => import('../views/ReportDocs.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/export', name: 'Export', component: () => import('../views/Export.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/bookings', name: 'Bookings', component: () => import('../views/Bookings.vue'), meta: { requiresAuth: true, vehicleOnly: true } },
  { path: '/renewals', name: 'Renewals', component: () => import('../views/Renewals.vue'), meta: { requiresAuth: true, vehicleOnly: true } },
  { path: '/repairs', name: 'Repairs', component: () => import('../views/Repairs.vue'), meta: { requiresAuth: true, vehicleOnly: true } },
  { path: '/fuels', name: 'Fuels', component: () => import('../views/Fuels.vue'), meta: { requiresAuth: true, vehicleOnly: true } },
  { path: '/accidents', name: 'Accidents', component: () => import('../views/Accidents.vue'), meta: { requiresAuth: true, vehicleOnly: true } },
  { path: '/vehicles', name: 'Vehicles', component: () => import('../views/Vehicles.vue'), meta: { requiresAuth: true, requiresDriverOrAdmin: true } },
  { path: '/users', name: 'Users', component: () => import('../views/Users.vue'), meta: { requiresAuth: true, requiresAdminOrManager: true } },
  { path: '/logs', name: 'Logs', component: () => import('../views/Logs.vue'), meta: { requiresAuth: true, requiresAdminOrManager: true } },
  // Maid section
  { path: '/maid', name: 'MaidDashboard', component: () => import('../views/MaidDashboard.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/areas', name: 'MaidAreas', component: () => import('../views/MaidAreas.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/maid/scan', name: 'MaidScanStart', component: () => import('../views/MaidScanStart.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/scan/:id', name: 'MaidScan', component: () => import('../views/MaidScan.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/logs', name: 'MaidLogs', component: () => import('../views/MaidLogs.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/issues', name: 'MaidIssues', component: () => import('../views/MaidIssues.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/reports', name: 'MaidReports', component: () => import('../views/MaidReports.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/report-logs', name: 'MaidReportLogs', component: () => import('../views/MaidReportLogs.vue'), meta: { requiresAuth: true, requiresMaid: true } },
  { path: '/maid/report-issues', name: 'MaidReportIssues', component: () => import('../views/MaidReportIssues.vue'), meta: { requiresAuth: true, requiresMaid: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !user) {
    next('/login?redirect=' + encodeURIComponent(to.fullPath))
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/microsoft-callback') && user) {
    next(user.role === 'MAID' ? '/maid' : '/')
  } else if (to.meta.requiresAdmin && user?.role !== 'ADMIN') {
    next(user?.role === 'MAID' ? '/maid' : '/')
  } else if (to.meta.requiresAdminOrManager && !['ADMIN', 'MANAGER'].includes(user?.role)) {
    next(user?.role === 'MAID' ? '/maid' : '/')
  } else if (to.meta.requiresMaid && !['ADMIN', 'MAID'].includes(user?.role)) {
    next('/')
  } else if (to.meta.requiresDriverOrAdmin && !['ADMIN', 'MANAGER', 'STAFF'].includes(user?.role)) {
    next(user?.role === 'MAID' ? '/maid' : '/')
  } else if (to.meta.vehicleOnly && user?.role === 'MAID') {
    next('/maid')
  } else if (to.path === '/' && user?.role === 'MAID') {
    next('/maid')
  } else {
    next()
  }
})

export default router
