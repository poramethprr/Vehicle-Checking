import Swal from 'sweetalert2'

function dark() {
  return document.documentElement.classList.contains('dark')
}

function darkOpts() {
  if (!dark()) return {}
  return {
    background: '#1e293b',
    color: '#f1f5f9'
  }
}

function makeToast() {
  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    ...darkOpts(),
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer
      toast.onmouseleave = Swal.resumeTimer
    }
  })
}

export function swalSuccess(title, text = '') {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#10b981',
    ...darkOpts()
  })
}

export function swalError(title, text = '') {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#ef4444',
    ...darkOpts()
  })
}

export function swalInfo(title, text = '') {
  return makeToast().fire({ icon: 'info', title, text })
}

export function swalWarning(title, text = '') {
  return makeToast().fire({ icon: 'warning', title, text })
}

export function swalToast(title, icon = 'success') {
  return makeToast().fire({ icon, title })
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
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    ...darkOpts()
  })
}

export default Swal
