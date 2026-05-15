<template>
  <div class="min-h-screen flex items-center justify-center p-4" v-if="!auth.user">
    <div class="text-center text-slate-400">กำลังโหลด...</div>
  </div>
  <div v-else class="max-w-md mx-auto">
    <!-- Success -->
    <div v-if="success" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
      <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon class="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">บันทึกสำเร็จ!</h2>
      <p class="text-slate-500 text-sm mb-1">{{ area?.name }}</p>
      <p class="text-slate-400 text-xs mb-6">{{ area?.location }}</p>
      <button @click="reset" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition">บันทึกอีกครั้ง</button>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
      <ExclamationCircleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-1">ไม่พบพื้นที่นี้</h2>
      <p class="text-slate-400 text-sm">QR Code อาจหมดอายุหรือถูกลบแล้ว</p>
    </div>

    <!-- Scan Form -->
    <div v-else-if="area">
      <div class="relative bg-linear-to-r from-purple-600 to-fuchsia-500 rounded-2xl px-6 py-5 mb-4 shadow-md overflow-hidden">
        <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
        <div class="relative">
          <p class="text-purple-200 text-xs mb-1">สแกน QR Code</p>
          <h2 class="text-xl font-bold text-white">{{ area.name }}</h2>
          <p class="text-purple-100 text-sm mt-0.5 flex items-center gap-1" v-if="area.location">
            <MapPinIcon class="w-3.5 h-3.5" />{{ area.location }}
          </p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-5">
        <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl mb-4">
          <div class="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
            <UserIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ auth.user.displayName || auth.user.username }}</div>
            <div class="text-xs text-slate-400">{{ now }}</div>
          </div>
        </div>

        <!-- Photo -->
        <div class="mb-3">
          <label class="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">รูปภาพ (ไม่บังคับ)</label>
          <input type="file" accept="image/*" capture="environment" @change="e => form.file = e.target.files[0]" class="text-sm text-slate-500 dark:text-slate-400" />
        </div>

        <!-- Note -->
        <div class="mb-4">
          <label class="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">หมายเหตุ</label>
          <textarea v-model="form.note" rows="2" placeholder="หมายเหตุเพิ่มเติม..." class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
        </div>

        <button @click="submitLog" :disabled="submitting" class="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2">
          <CheckCircleIcon v-if="!submitting" class="w-5 h-5" />
          <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ submitting ? 'กำลังบันทึก...' : 'บันทึกการทำความสะอาด' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircleIcon, ExclamationCircleIcon, MapPinIcon, UserIcon } from '@heroicons/vue/24/outline'
import api from '../stores/api'
import { auth } from '../stores/auth'

const route = useRoute()
const area = ref(null)
const notFound = ref(false)
const success = ref(false)
const submitting = ref(false)
const form = ref({ note: '', file: null })

const now = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })

async function load() {
  try {
    area.value = (await api.get('/maid/areas/' + route.params.id)).data
  } catch { notFound.value = true }
}

async function submitLog() {
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('areaId', area.value.id)
    fd.append('userId', auth.user.id)
    if (form.value.note) fd.append('note', form.value.note)
    if (form.value.file) fd.append('photo', form.value.file)
    await api.post('/maid/logs', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    success.value = true
  } finally { submitting.value = false }
}

function reset() {
  success.value = false
  form.value = { note: '', file: null }
}

onMounted(load)
</script>
