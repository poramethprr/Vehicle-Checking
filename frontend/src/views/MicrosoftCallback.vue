<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 relative">
        <svg class="animate-spin w-16 h-16 text-blue-500" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p class="text-slate-600 dark:text-slate-300 font-medium">กำลังเข้าสู่ระบบด้วย Microsoft...</p>
      <p class="text-slate-400 text-sm mt-1">กรุณารอสักครู่</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalError } from '../stores/swal'

const router = useRouter()
const route = useRoute()

const errorMessages = {
  microsoft_cancelled: 'คุณยกเลิกการเข้าสู่ระบบ',
  invalid_state:       'เซสชันหมดอายุ กรุณาลองใหม่อีกครั้ง',
  microsoft_failed:    'ไม่สามารถเข้าสู่ระบบด้วย Microsoft ได้',
  account_not_found:   'ไม่พบบัญชีผู้ใช้ที่เชื่อมต่อกับ Microsoft นี้ กรุณาติดต่อผู้ดูแลระบบ',
}

onMounted(async () => {
  const { token, error } = route.query

  if (error) {
    await swalError('เข้าสู่ระบบไม่สำเร็จ', errorMessages[error] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    router.push('/login')
    return
  }

  if (!token) {
    await swalError('เกิดข้อผิดพลาด', 'ไม่พบ token กรุณาลองใหม่อีกครั้ง')
    router.push('/login')
    return
  }

  try {
    const res = await api.get('/auth/me', { params: { token } })
    auth.login(res.data.token, res.data.user)
    router.push(res.data.user.role === 'MAID' ? '/maid' : '/')
  } catch {
    await swalError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง')
    router.push('/login')
  }
})
</script>
