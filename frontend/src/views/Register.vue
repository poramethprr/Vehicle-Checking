<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
    <!-- Background Decorative Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
    </div>

    <div class="relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 w-full max-w-md border border-slate-100">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-100 rounded-b-full"></div>
      
      <div class="p-8 sm:p-10">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <UserPlusIcon class="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 class="text-center text-2xl font-bold text-slate-800 mb-1">สร้างบัญชีใหม่</h2>
        <p class="text-center text-sm text-slate-400 mb-8">ระบบตรวจเช็คยานพาหนะ</p>

        <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
          <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <ExclamationCircleIcon class="w-5 h-5 shrink-0" />
            {{ error }}
          </div>
        </transition>

        <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
          <div v-if="success" class="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <CheckCircleIcon class="w-5 h-5 shrink-0" />
            {{ success }}
          </div>
        </transition>

        <form @submit.prevent="register" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">ชื่อผู้ใช้</label>
            <div class="relative">
              <UserIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input v-model="username" type="text" placeholder="กรอกชื่อ-นามสกุล หรือชื่อเรียก" required autofocus
                class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">เบอร์โทรศัพท์</label>
            <div class="relative">
              <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input v-model="phone" type="tel" placeholder="0xx-xxx-xxxx" required
                class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5 z-20">
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">บทบาท (Role)</label>
              <AppSelect v-model="role" :options="roleOptions" placeholder="เลือกบทบาท" :icon="ShieldCheckIcon" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-slate-600 mb-1.5">รหัสสมัครสมาชิก</label>
              <div class="relative">
                <KeyIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input v-model="regCode" type="password" placeholder="รหัสลับจาก ENV" required
                  class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base" />
              </div>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="loading"
              class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-4 rounded-2xl transition-all text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                กำลังดำเนินการ...
              </span>
              <span v-else>ลงทะเบียนเข้าใช้งาน</span>
            </button>
          </div>
        </form>

        <div class="relative my-7">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
          <div class="relative flex justify-center"><span class="bg-white px-4 text-xs text-slate-400">หรือ</span></div>
        </div>

        <p class="text-center text-sm text-slate-500">
          มีบัญชีแล้ว?
          <router-link to="/login" class="text-blue-600 font-semibold hover:text-blue-700 transition">เข้าสู่ระบบ</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserPlusIcon, UserIcon, PhoneIcon, ExclamationCircleIcon, CheckCircleIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import api from '../stores/api'

const username = ref('')
const phone = ref('')
const role = ref('STAFF')
const regCode = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const router = useRouter()

const roleOptions = [
  { value: 'STAFF', label: 'Staff (เจ้าหน้าที่)' },
  { value: 'ADMIN', label: 'Admin (ผู้ดูแล)' }
]

async function register() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await api.post('/auth/register', { 
      username: username.value.trim(),
      phone: phone.value.trim(),
      role: role.value,
      regCode: regCode.value
    })
    success.value = 'สมัครสมาชิกสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...'
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>
