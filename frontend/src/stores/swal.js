import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

export function swalSuccess(title, text = '') {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#10b981'
  })
}

export function swalError(title, text = '') {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#ef4444'
  })
}

export function swalInfo(title, text = '') {
  return Toast.fire({ icon: 'info', title, text })
}

export function swalWarning(title, text = '') {
  return Toast.fire({ icon: 'warning', title, text })
}

export function swalToast(title, icon = 'success') {
  return Toast.fire({ icon, title })
}

export function swalConfirm(title, text, confirmText = 'ยืนยัน', isDanger = false) {
  return Swal.fire({
    title,
    text,
    icon: isDanger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: isDanger ? '#ef4444' : '#3b82f6',
    cancelButtonColor: '#94a3b8',
    reverseButtons: true
  })
}

export default Swal
