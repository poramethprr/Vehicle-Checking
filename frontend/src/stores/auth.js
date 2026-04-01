import { reactive } from 'vue'

export const auth = reactive({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,

  login(token, user) {
    this.token = token
    this.user = user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  setUser(user) {
    this.user = user
    localStorage.setItem('user', JSON.stringify(user))
  },

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  get isAdmin() {
    return this.user?.role === 'ADMIN'
  },

  get isStaff() {
    return this.user?.role === 'STAFF'
  },

  get canManageVehicles() {
    return ['ADMIN', 'STAFF'].includes(this.user?.role)
  },

  get canManageUsers() {
    return this.user?.role === 'ADMIN'
  },

  get canCheckoutVehicles() {
    return ['ADMIN', 'STAFF'].includes(this.user?.role)
  },

  get canViewReports() {
    return ['ADMIN', 'STAFF'].includes(this.user?.role)
  }
})
