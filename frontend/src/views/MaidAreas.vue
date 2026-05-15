<template>
  <div>
    <div class="relative bg-linear-to-r from-purple-600 to-fuchsia-500 dark:from-purple-950 dark:to-fuchsia-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-purple-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <MapPinIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">จัดการพื้นที่</h1>
            <p class="text-purple-100 text-xs mt-0.5">เพิ่ม แก้ไข และสร้าง QR Code สำหรับแต่ละพื้นที่</p>
          </div>
        </div>
        <button @click="openAdd" class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shrink-0">
          <PlusIcon class="w-4 h-4" /> เพิ่มพื้นที่
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16"><div class="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>

    <div v-else-if="areas.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="area in areas" :key="area.id" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="relative h-32 bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/30 dark:to-fuchsia-900/30">
          <img v-if="area.photo" :src="BASE_URL + area.photo" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <MapPinIcon class="w-10 h-10 text-purple-300 dark:text-purple-700" />
          </div>
          <div class="absolute top-2 right-2">
            <span :class="area.isActive ? 'bg-emerald-500' : 'bg-slate-400'" class="text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ area.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
          </div>
        </div>
        <div class="p-4">
          <div class="font-semibold text-slate-800 dark:text-white mb-0.5">{{ area.name }}</div>
          <div class="text-xs text-slate-400 mb-1" v-if="area.location"><MapPinIcon class="w-3 h-3 inline mr-0.5 -mt-0.5" />{{ area.location }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2" v-if="area.description">{{ area.description }}</div>
          <div class="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <span class="flex items-center gap-1"><CheckCircleIcon class="w-3.5 h-3.5 text-emerald-500" />{{ area._count.logs }} บันทึก</span>
            <span class="flex items-center gap-1"><ExclamationTriangleIcon class="w-3.5 h-3.5 text-amber-500" />{{ area._count.issues }} ปัญหา</span>
          </div>
          <div class="flex gap-2">
            <button @click="showQR(area)" class="flex-1 flex items-center justify-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold py-2 rounded-xl text-xs transition">
              <QrCodeIcon class="w-4 h-4" /> QR Code
            </button>
            <button @click="openEdit(area)" class="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold py-2 rounded-xl text-xs transition">
              <PencilIcon class="w-4 h-4" /> แก้ไข
            </button>
            <button @click="deleteArea(area)" class="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-xl transition">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-16 text-center">
      <MapPinIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-400">ยังไม่มีพื้นที่ กด "เพิ่มพื้นที่" เพื่อเริ่มต้น</p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modal.show = false"></div>
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">{{ modal.id ? 'แก้ไขพื้นที่' : 'เพิ่มพื้นที่ใหม่' }}</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">ชื่อพื้นที่ *</label>
            <input v-model="modal.name" type="text" placeholder="เช่น ห้องน้ำชาย ชั้น 1" class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">สถานที่</label>
            <input v-model="modal.location" type="text" placeholder="เช่น อาคาร A ชั้น 1" class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">รายละเอียด</label>
            <textarea v-model="modal.description" rows="2" placeholder="รายละเอียดเพิ่มเติม" class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">รูปภาพ</label>
            <input type="file" accept="image/*" @change="e => modal.file = e.target.files[0]" class="text-sm text-slate-500" />
          </div>
          <div v-if="modal.id" class="flex items-center gap-2">
            <input type="checkbox" v-model="modal.isActive" id="isActive" class="rounded" />
            <label for="isActive" class="text-sm text-slate-700 dark:text-slate-300">เปิดใช้งาน</label>
          </div>
        </div>
        <div class="flex gap-2 mt-5">
          <button @click="modal.show = false" class="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">ยกเลิก</button>
          <button @click="saveArea" :disabled="saving" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
        </div>
      </div>
    </div>

    <!-- QR Modal -->
    <div v-if="qrModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="qrModal.show = false"></div>
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">QR Code</h3>
        <p class="text-sm text-slate-500 mb-4">{{ qrModal.area?.name }}</p>
        <div class="flex justify-center mb-4">
          <img :src="qrModal.dataUrl" class="w-48 h-48 rounded-xl border-4 border-purple-100" />
        </div>
        <p class="text-xs text-slate-400 mb-4 break-all">{{ qrModal.url }}</p>
        <div class="flex gap-2">
          <button @click="qrModal.show = false" class="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">ปิด</button>
          <a :href="qrModal.dataUrl" :download="`qr-${qrModal.area?.name}.png`" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /> ดาวน์โหลด
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, QrCodeIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import QRCode from 'qrcode'
import api from '../stores/api'
import { auth } from '../stores/auth'

const BASE_URL = ``
const areas = ref([])
const loading = ref(true)
const saving = ref(false)
const modal = ref({ show: false, id: null, name: '', location: '', description: '', isActive: true, file: null })
const qrModal = ref({ show: false, area: null, dataUrl: '', url: '' })

async function load() {
  loading.value = true
  areas.value = (await api.get('/maid/areas')).data
  loading.value = false
}

function openAdd() {
  modal.value = { show: true, id: null, name: '', location: '', description: '', isActive: true, file: null }
}

function openEdit(area) {
  modal.value = { show: true, id: area.id, name: area.name, location: area.location || '', description: area.description || '', isActive: area.isActive, file: null }
}

async function saveArea() {
  if (!modal.value.name) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('name', modal.value.name)
    fd.append('location', modal.value.location)
    fd.append('description', modal.value.description)
    fd.append('userId', auth.user.id)
    if (modal.value.id) fd.append('isActive', modal.value.isActive)
    if (modal.value.file) fd.append('photo', modal.value.file)
    if (modal.value.id) {
      await api.put('/maid/areas/' + modal.value.id, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/maid/areas', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    modal.value.show = false
    await load()
  } finally { saving.value = false }
}

async function deleteArea(area) {
  if (!confirm(`ลบพื้นที่ "${area.name}" ?`)) return
  await api.delete('/maid/areas/' + area.id, { data: { userId: auth.user.id } })
  await load()
}

async function showQR(area) {
  const url = `${window.location.protocol}//${window.location.hostname}:3099/maid/scan/${area.id}`
  const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
  qrModal.value = { show: true, area, dataUrl, url }
}

onMounted(load)
</script>
