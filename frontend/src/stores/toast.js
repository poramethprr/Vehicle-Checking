import { ref } from 'vue'

export const toasts = ref([])

let toastId = 0

export function addToast(title, message = '', type = 'info', duration = 3500) {
  const id = ++toastId
  toasts.value.push({ id, title, message, type })
  setTimeout(() => removeToast(id), duration)
  return id
}

export function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export const toast = {
  success: (title, message) => addToast(title, message, 'success'),
  error: (title, message) => addToast(title, message, 'error'),
  info: (title, message) => addToast(title, message, 'info'),
  warning: (title, message) => addToast(title, message, 'warning')
}
