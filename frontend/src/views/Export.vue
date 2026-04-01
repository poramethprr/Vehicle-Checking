<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-slate-800">Export ข้อมูล</h1>
      <p class="text-sm text-slate-400 mt-0.5">ส่งออกข้อมูลการตรวจเช็คเป็น Excel หรือ PDF</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-100">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <ArrowDownTrayIcon class="w-5 h-5 text-blue-500" />
          เลือกข้อมูลสำหรับ Export
        </h3>
      </div>

      <div class="p-5 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              <CalendarDaysIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> เดือน
            </label>
            <AppSelect v-model="month" :options="monthOptions" :allow-empty="false" :icon="CalendarDaysIcon" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              <CalendarIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ปี
            </label>
            <AppSelect v-model="year" :options="yearOptionsList" :allow-empty="false" :icon="CalendarIcon" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              <TruckIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ยานพาหนะ
            </label>
            <AppSelect v-model="vehicleId" :options="vehicleOptions" placeholder="-- เลือกยานพาหนะ --" :icon="TruckIcon" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="vehicleId">
          <button @click="exportExcel"
            class="group flex items-center gap-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl p-5 transition-all active:scale-[0.98]">
            <div class="w-14 h-14 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-xl transition-shadow">
              <TableCellsIcon class="w-7 h-7 text-white" />
            </div>
            <div class="text-left">
              <div class="font-bold text-emerald-800 flex items-center gap-1.5">
                <ArrowDownTrayIcon class="w-4 h-4" /> Export Excel
              </div>
              <div class="text-xs text-emerald-600 mt-0.5">ไฟล์ .xlsx สำหรับเปิดใน Excel</div>
            </div>
          </button>

          <button @click="exportPdf"
            class="group flex items-center gap-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-2xl p-5 transition-all active:scale-[0.98]">
            <div class="w-14 h-14 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 group-hover:shadow-xl transition-shadow">
              <DocumentTextIcon class="w-7 h-7 text-white" />
            </div>
            <div class="text-left">
              <div class="font-bold text-red-800 flex items-center gap-1.5">
                <ArrowDownTrayIcon class="w-4 h-4" /> Export PDF
              </div>
              <div class="text-xs text-red-600 mt-0.5">ไฟล์ .pdf สำหรับพิมพ์เอกสาร</div>
            </div>
          </button>
        </div>

        <AppEmpty v-else :icon="ArrowDownTrayIcon" title="เลือกยานพาหนะ" subtitle="กรุณาเลือกยานพาหนะเพื่อ Export ข้อมูล" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowDownTrayIcon, CalendarIcon, CalendarDaysIcon, TruckIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'
import { swalSuccess, swalError } from '../stores/swal'

const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())
const vehicleId = ref('')
const vehicles = ref([])

const monthOptions = thaiMonths.map((m, i) => ({ value: i + 1, label: m }))
const yearOptionsList = Array.from({ length: 5 }, (_, i) => ({ value: now.getFullYear() - i, label: String(now.getFullYear() - i) }))
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.type} - ${v.licensePlate}` })))

async function doExport(type) {
  const url = `${api.defaults.baseURL}/export/${type}?vehicleId=${vehicleId.value}&month=${month.value}&year=${year.value}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'ไม่สามารถ export ได้' }))
      swalError('Export ไม่สำเร็จ', err.error)
      return
    }
    const blob = await res.blob()
    const ext = type === 'excel' ? 'xlsx' : 'pdf'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `inspection_${month.value}_${year.value}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
    swalSuccess('Export สำเร็จ', `ดาวน์โหลดไฟล์ ${ext.toUpperCase()} เรียบร้อยแล้ว`)
  } catch (err) {
    swalError('เชื่อมต่อไม่ได้', 'กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่')
  }
}

function exportExcel() { doExport('excel') }
function exportPdf() { doExport('pdf') }

onMounted(async () => { vehicles.value = (await api.get('/vehicles')).data })
</script>
