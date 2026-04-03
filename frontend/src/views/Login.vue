<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
    </div>

    <div class="relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 w-full max-w-md border border-slate-100">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-100 rounded-b-full"></div>

      <div class="p-8 sm:p-10">
        <div class="flex justify-center mb-6">
          <img src="../assets/logo-icon.png" alt="logo" class="w-20 h-20 rounded-full shadow-lg shadow-emerald-200 object-cover" />
        </div>

        <h2 class="text-center text-2xl font-bold text-slate-800 mb-1">ยินดีต้อนรับกลับมา</h2>
        <p class="text-center text-sm text-slate-400 mb-8">เข้าสู่ระบบตรวจเช็คยานพาหนะ</p>

        <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
          <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <ExclamationCircleIcon class="w-5 h-5 shrink-0" />
            {{ error }}
          </div>
        </transition>

        <form @submit.prevent="login" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">ชื่อผู้ใช้</label>
            <div class="relative">
              <UserIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input v-model="username" type="text" placeholder="กรอกชื่อผู้ใช้" required autofocus
                class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-slate-600 mb-1.5">รหัสผ่าน</label>
            <div class="relative">
              <LockClosedIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="กรอกรหัสผ่าน" required
                class="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                <EyeSlashIcon v-if="showPassword" class="w-5 h-5" />
                <EyeIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="loading"
              class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-4 rounded-2xl transition-all text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                กำลังดำเนินการ...
              </span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>
          </div>
        </form>

        <div class="relative my-7">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
          <div class="relative flex justify-center"><span class="bg-white px-4 text-xs text-slate-400">หรือ</span></div>
        </div>

        <p class="text-center text-sm text-slate-500">
          ยังไม่มีบัญชี?
          <router-link to="/register" class="text-blue-600 font-semibold hover:text-blue-700 transition">ลงทะเบียนใหม่</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserIcon, LockClosedIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import api from '../stores/api'
import { auth } from '../stores/auth'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function login() {
  error.value = ''
  loading.value = true
  try {
    const res = await api.post('/auth/login', {
      username: username.value.trim(),
      password: password.value
    })
    auth.login(res.data.token, res.data.user)
    router.push('/')
  } catch (err) {
    if (!err.response) {
      error.value = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง'
    } else {
      error.value = err.response?.data?.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    }
  } finally {
    loading.value = false
  }
}
</script>
