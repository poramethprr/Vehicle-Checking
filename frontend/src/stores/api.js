import axios from 'axios'

const api = axios.create({
  baseURL: `http://${window.location.hostname}:8099/api`
})

export default api
