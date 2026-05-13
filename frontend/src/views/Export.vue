<template>
  <div>
    <!-- Header banner -->
    <div class="relative bg-linear-to-r from-rose-500 to-pink-600 dark:from-rose-950 dark:to-pink-950 rounded-2xl px-6 py-5 mb-6 overflow-hidden shadow-md shadow-rose-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <ArrowDownTrayIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">Export ข้อมูล</h1>
          <p class="text-rose-200 text-xs mt-0.5">เลือกหัวข้อและยานพาหนะเพื่อส่งออกข้อมูลเป็น Excel แบบหลาย Sheet</p>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <!-- Filter card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/20 border border-gray-200 dark:border-slate-700 p-5">
        <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
          <FunnelIcon class="w-4 h-4 text-rose-500" /> ตัวกรองข้อมูล
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Month -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              <CalendarDaysIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> เดือน
            </label>
            <AppSelect v-model="month" :options="monthOptions" :allow-empty="false" :icon="CalendarDaysIcon" />
          </div>
          <!-- Year -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              <CalendarIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ปี
            </label>
            <AppSelect v-model="year" :options="yearOptions" :allow-empty="false" :icon="CalendarIcon" />
          </div>
          <!-- Vehicles -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              <TruckIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ยานพาหนะ
              <span class="text-slate-400 font-normal normal-case ml-1">(ว่าง = ทั้งหมด)</span>
            </label>
            <AppMultiSelect v-model="vehicleIds" :options="vehicleOptions" placeholder="ทั้งหมด" :icon="TruckIcon" />
          </div>
        </div>
      </div>

      <!-- Topic selection -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/20 border border-gray-200 dark:border-slate-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
            <TableCellsIcon class="w-4 h-4 text-rose-500" /> เลือกหัวข้อที่ต้องการ Export
            <span class="text-xs font-normal text-slate-400 dark:text-slate-500">แต่ละหัวข้อ = 1 Sheet ใน Excel</span>
          </h3>
          <div class="flex gap-2">
            <button @click="selectAll" class="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition">เลือกทั้งหมด</button>
            <span class="text-slate-300 dark:text-slate-600">|</span>
            <button @click="clearAll" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">ล้าง</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button v-for="t in topicList" :key="t.key" @click="toggleTopic(t.key)"
            :class="[
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
              selectedTopics.includes(t.key)
                ? `${t.activeBg} ${t.activeBorder} ${t.activeText}`
                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
            ]">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all', selectedTopics.includes(t.key) ? t.iconBg : 'bg-slate-200 dark:bg-slate-600']">
              <component :is="t.icon" :class="['w-5 h-5', selectedTopics.includes(t.key) ? 'text-white' : 'text-slate-400 dark:text-slate-400']" />
            </div>
            <div class="flex-1 min-w-0">
              <div :class="['text-sm font-semibold', selectedTopics.includes(t.key) ? t.activeText : 'text-slate-600 dark:text-slate-300']">{{ t.label }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{{ t.desc }}</div>
            </div>
            <div :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all', selectedTopics.includes(t.key) ? `${t.checkBg} border-transparent` : 'border-slate-300 dark:border-slate-500']">
              <CheckIcon v-if="selectedTopics.includes(t.key)" class="w-3 h-3 text-white" />
            </div>
          </button>
        </div>
      </div>

      <!-- Export button -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/20 border border-gray-200 dark:border-slate-700 p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">
              พร้อม Export
              <span v-if="selectedTopics.length" class="ml-1 text-rose-500">{{ selectedTopics.length }} หัวข้อ</span>
              <span v-else class="ml-1 text-slate-400 font-normal">(ยังไม่ได้เลือกหัวข้อ)</span>
              <span v-if="vehicleIds.length" class="ml-1 text-slate-500 dark:text-slate-400 font-normal text-xs">· {{ vehicleIds.length }} คัน</span>
              <span v-else class="ml-1 text-slate-500 dark:text-slate-400 font-normal text-xs">· ยานพาหนะทั้งหมด</span>
            </div>
            <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {{ thaiMonths[month - 1] }} {{ year }} · ไฟล์ Excel (.xlsx) หลาย Sheet
            </div>
            <!-- Sheet preview -->
            <div v-if="selectedTopics.length" class="flex flex-wrap gap-1.5 mt-2">
              <span v-for="t in selectedTopicDetails" :key="t.key"
                :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full', t.badgeBg, t.badgeText]">
                {{ t.sheetName }}
              </span>
            </div>
          </div>
          <button @click="doExport" :disabled="loading || !selectedTopics.length"
            class="bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 dark:from-rose-700 dark:to-pink-800 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-all text-sm shadow-sm active:scale-[0.98] flex items-center gap-2 shrink-0">
            <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <ArrowDownTrayIcon v-else class="w-4 h-4" />
            {{ loading ? 'กำลัง Export...' : 'Export Excel' }}
          </button>
        </div>
      </div>

      <!-- Inspection form note -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl px-5 py-4 flex items-start gap-3">
        <InformationCircleIcon class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div class="text-sm text-blue-700 dark:text-blue-300">
          <span class="font-semibold">สำหรับ "ใบตรวจเช็ค" แบบฟอร์มทางการ</span> (พร้อมโลโก้ SEMed และ SGS ISO) ไปที่
          <router-link to="/reports" class="underline font-semibold hover:text-blue-900 dark:hover:text-blue-100 transition">หน้ารายงานการตรวจเช็ค → Export</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ArrowDownTrayIcon, CalendarIcon, CalendarDaysIcon, TruckIcon, TableCellsIcon,
  ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, ArrowsRightLeftIcon,
  FireIcon, WrenchScrewdriverIcon, DocumentTextIcon, FunnelIcon,
  CheckIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppMultiSelect from '../components/AppMultiSelect.vue'
import api from '../stores/api'
import { swalSuccess, swalError } from '../stores/swal'

const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const now = new Date()

const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())
const vehicleIds = ref([])
const vehicles = ref([])
const loading = ref(false)
const selectedTopics = ref(['inspections', 'bookings', 'fuels', 'repairs', 'docs'])

const monthOptions = thaiMonths.map((m, i) => ({ value: i + 1, label: m }))
const yearOptions = Array.from({ length: 5 }, (_, i) => ({ value: now.getFullYear() - i, label: String(now.getFullYear() - i) }))
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` })))

const topicList = [
  {
    key: 'inspections', label: 'การตรวจเช็ค', desc: 'ผลการตรวจเช็ครายวัน',
    sheetName: 'การตรวจเช็ค', icon: ClipboardDocumentCheckIcon,
    activeBg: 'bg-violet-50 dark:bg-violet-900/20', activeBorder: 'border-violet-400 dark:border-violet-600',
    activeText: 'text-violet-700 dark:text-violet-300', iconBg: 'bg-violet-500', checkBg: 'bg-violet-500',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/30', badgeText: 'text-violet-600 dark:text-violet-400'
  },
  {
    key: 'bookings', label: 'การเบิก/คืนรถ', desc: 'ประวัติการเบิกและคืนยานพาหนะ',
    sheetName: 'การเบิก-คืนรถ', icon: ArrowsRightLeftIcon,
    activeBg: 'bg-emerald-50 dark:bg-emerald-900/20', activeBorder: 'border-emerald-400 dark:border-emerald-600',
    activeText: 'text-emerald-700 dark:text-emerald-300', iconBg: 'bg-emerald-500', checkBg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30', badgeText: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    key: 'fuels', label: 'เติมน้ำมัน', desc: 'บันทึกการเติมน้ำมัน ลิตร และค่าใช้จ่าย',
    sheetName: 'เติมน้ำมัน', icon: FireIcon,
    activeBg: 'bg-amber-50 dark:bg-amber-900/20', activeBorder: 'border-amber-400 dark:border-amber-600',
    activeText: 'text-amber-700 dark:text-amber-300', iconBg: 'bg-amber-500', checkBg: 'bg-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30', badgeText: 'text-amber-600 dark:text-amber-400'
  },
  {
    key: 'repairs', label: 'แจ้งซ่อม', desc: 'รายการแจ้งซ่อมและสถานะการอนุมัติ',
    sheetName: 'แจ้งซ่อม', icon: WrenchScrewdriverIcon,
    activeBg: 'bg-orange-50 dark:bg-orange-900/20', activeBorder: 'border-orange-400 dark:border-orange-600',
    activeText: 'text-orange-700 dark:text-orange-300', iconBg: 'bg-orange-500', checkBg: 'bg-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/30', badgeText: 'text-orange-600 dark:text-orange-400'
  },
  {
    key: 'docs', label: 'เอกสารยานพาหนะ', desc: 'สถานะ พ.ร.บ. ภาษี และประกัน',
    sheetName: 'เอกสารยานพาหนะ', icon: DocumentTextIcon,
    activeBg: 'bg-teal-50 dark:bg-teal-900/20', activeBorder: 'border-teal-400 dark:border-teal-600',
    activeText: 'text-teal-700 dark:text-teal-300', iconBg: 'bg-teal-500', checkBg: 'bg-teal-500',
    badgeBg: 'bg-teal-100 dark:bg-teal-900/30', badgeText: 'text-teal-600 dark:text-teal-400'
  },
]

const selectedTopicDetails = computed(() => topicList.filter(t => selectedTopics.value.includes(t.key)))

function toggleTopic(key) {
  const idx = selectedTopics.value.indexOf(key)
  if (idx >= 0) selectedTopics.value.splice(idx, 1)
  else selectedTopics.value.push(key)
}
function selectAll() { selectedTopics.value = topicList.map(t => t.key) }
function clearAll() { selectedTopics.value = [] }

async function doExport() {
  if (!selectedTopics.value.length) return
  loading.value = true
  try {
    const res = await fetch(`${api.defaults.baseURL}/export/combined`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleIds: vehicleIds.value,
        topics: selectedTopics.value,
        month: month.value,
        year: year.value
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Export ไม่สำเร็จ' }))
      swalError('Export ไม่สำเร็จ', err.error)
      return
    }
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `export_${thaiMonths[month.value - 1]}_${year.value}.xlsx`
    a.click()
    URL.revokeObjectURL(a.href)
    swalSuccess('Export สำเร็จ', `ดาวน์โหลด ${selectedTopics.value.length} Sheet เรียบร้อยแล้ว`)
  } catch {
    swalError('เชื่อมต่อไม่ได้', 'กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่')
  } finally {
    loading.value = false
  }
}

onMounted(async () => { vehicles.value = (await api.get('/vehicles')).data })
</script>
