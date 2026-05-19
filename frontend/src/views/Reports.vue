<template>
  <div>
    <div class="relative bg-linear-to-r from-violet-600 to-purple-600 dark:from-violet-950 dark:to-purple-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-violet-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <ClipboardDocumentListIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานการตรวจเช็ค</h1>
          <p class="text-violet-200 text-xs mt-0.5">ค้นหาและส่งออกข้อมูลการตรวจเช็คยานพาหนะ</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 sm:p-5 mb-4">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-start gap-3">
          <div class="w-full">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ช่วงเวลา</label>
            <AppDateFilter default-mode="month" @change="onDateChange" />
          </div>
          <div class="flex-1 min-w-40">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5"><TruckIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ยานพาหนะ</label>
            <AppMultiSelect v-model="ins.vehicleIds" :options="vehicleOptions" placeholder="ทั้งหมด" :icon="TruckIcon" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="loadInspections" class="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 dark:from-violet-700 dark:to-purple-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="exportInspections('excel')" :disabled="!ins.month || !ins.vehicleIds.length"
            class="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
          <button @click="exportInspections('pdf')" :disabled="!ins.month || !ins.vehicleIds.length"
            class="bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <DocumentArrowDownIcon class="w-4 h-4" /><span class="hidden sm:inline">PDF</span>
          </button>
          <span v-if="!ins.month" class="text-xs text-amber-600 dark:text-amber-400">Excel/PDF ต้องเลือกรายเดือน</span>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden" v-if="inspections.length">
      <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between flex-wrap gap-2">
        <span class="font-semibold text-slate-800 dark:text-white text-sm">ผลการตรวจเช็ค <span class="text-slate-400 dark:text-slate-500 font-normal">{{ inspections.length }} รายการ</span></span>
        <div class="flex gap-2">
          <input v-model="ins.search" placeholder="ค้นหา..." class="w-40 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 outline-none dark:bg-slate-700 dark:text-white" />
          <AppSelect v-model="ins.statusFilter" :options="insStatusOptions" placeholder="สถานะทั้งหมด" :icon="FunnelIcon" class="w-40" />
        </div>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="i in filteredInspections" :key="i.id" class="px-4 py-3 flex items-center justify-between" @click="selectedInspection = i">
          <div>
            <div class="font-semibold text-sm text-slate-800 dark:text-white">{{ i.vehicle.licensePlate }}</div>
            <div class="text-xs text-slate-400 dark:text-slate-500">{{ fmtD(i.inspectionDate) }} · {{ i.user.displayName || i.user.username }}</div>
            <div class="flex gap-1.5 mt-1">
              <span class="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full ring-1 ring-emerald-100 dark:ring-emerald-800/50">ปกติ {{ countByStatus(i,'NORMAL') }}</span>
              <span v-if="countByStatus(i,'ABNORMAL')" class="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full ring-1 ring-red-100 dark:ring-red-800/50">ผิดปกติ {{ countByStatus(i,'ABNORMAL') }}</span>
            </div>
          </div>
          <ChevronRightIcon class="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
        </div>
      </div>
      <!-- Desktop -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">วันที่</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ผู้ตรวจ</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ผลตรวจ</th>
            <th class="py-3 px-4"></th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="i in filteredInspections" :key="i.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition cursor-pointer" @click="selectedInspection = i">
              <td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{{ fmtD(i.inspectionDate) }}</td>
              <td class="py-3 px-4"><div class="text-sm font-medium text-slate-800 dark:text-white">{{ i.vehicle.licensePlate }}</div><div class="text-xs text-slate-400 dark:text-slate-500">{{ i.vehicle.type }}</div></td>
              <td class="py-3 px-4 text-sm text-slate-700 dark:text-slate-200">{{ i.user.displayName || i.user.username }}</td>
              <td class="py-3 px-4 text-center">
                <span class="text-emerald-500 font-bold text-sm mr-3"><CheckCircleIcon class="w-4 h-4 inline" /> {{ countByStatus(i,'NORMAL') }}</span>
                <span :class="countByStatus(i,'ABNORMAL') ? 'text-red-500 font-bold' : 'text-slate-300'" class="text-sm"><XCircleIcon class="w-4 h-4 inline" /> {{ countByStatus(i,'ABNORMAL') }}</span>
              </td>
              <td class="py-3 px-4 text-center"><button @click.stop="editInspection(i)" class="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs px-2 py-1.5 rounded-lg transition"><PencilSquareIcon class="w-3.5 h-3.5" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <AppEmpty v-else-if="ins.searched" :icon="ClipboardDocumentListIcon" title="ไม่พบข้อมูลการตรวจเช็ค" />

    <!-- Detail Modal -->
    <TransitionRoot :show="!!selectedInspection" as="template">
      <Dialog @close="selectedInspection = null" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-150" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between">
                <DialogTitle class="font-bold text-slate-800 dark:text-white">รายละเอียดการตรวจเช็ค</DialogTitle>
                <button @click="selectedInspection = null" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" /></button>
              </div>
              <div class="px-5 py-4 overflow-y-auto flex-1" v-if="selectedInspection">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><TruckIcon class="w-3.5 h-3.5" />{{ selectedInspection.vehicle.type }} - {{ selectedInspection.vehicle.licensePlate }}</span>
                  <span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><CalendarIcon class="w-3.5 h-3.5" />{{ fmtD(selectedInspection.inspectionDate) }}</span>
                  <span class="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><UserIcon class="w-3.5 h-3.5" />{{ selectedInspection.user.displayName || selectedInspection.user.username }}</span>
                </div>
                <div class="space-y-2">
                  <div v-for="d in selectedInspection.details" :key="d.id"
                    :class="['rounded-xl p-3.5 text-sm border', d.status === 'NORMAL' ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' : 'bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50']">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2.5">
                        <span :class="d.status === 'NORMAL' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'" class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{{ d.itemNumber }}</span>
                        <span class="text-slate-700 dark:text-slate-200">{{ d.itemName }}</span>
                      </div>
                      <span :class="d.status === 'NORMAL' ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'" class="text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {{ d.status === 'NORMAL' ? 'ปกติ' : 'ผิดปกติ' }}
                      </span>
                    </div>
                    <p v-if="d.abnormalNote" class="text-red-600 text-xs mt-2 pl-8 flex items-start gap-1">
                      <ChatBubbleLeftIcon class="w-3.5 h-3.5 shrink-0 mt-0.5" />{{ d.abnormalNote }}
                    </p>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  ClipboardDocumentListIcon, MagnifyingGlassIcon, CalendarIcon, CalendarDaysIcon, TruckIcon, UserIcon,
  ArrowDownTrayIcon, DocumentArrowDownIcon, FunnelIcon, XMarkIcon, CheckCircleIcon, XCircleIcon,
  ChatBubbleLeftIcon, PencilSquareIcon, ChevronRightIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppMultiSelect from '../components/AppMultiSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { swalError } from '../stores/swal'
import { useRouter } from 'vue-router'
import { toLocalDateStr, fmtDateTh } from '../stores/date'

const router = useRouter()
const BASE_URL = ``

const now = new Date()
const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const monthOptions = thaiMonths.map((m, i) => ({ value: i + 1, label: m }))
const yearOptions  = Array.from({ length: 5 }, (_, i) => ({ value: now.getFullYear() - i, label: String(now.getFullYear() - i) }))
const insStatusOptions = [{ value: 'ALL_NORMAL', label: 'ปกติทั้งหมด' }, { value: 'HAS_ABNORMAL', label: 'มีรายการผิดปกติ' }]

const vehicles = ref([])
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` })))

const ins = ref({ month: now.getMonth() + 1, year: now.getFullYear(), startDate: null, endDate: null, vehicleIds: [], search: '', statusFilter: '', searched: false })

function onDateChange({ startDate, endDate }) {
  ins.value.startDate = startDate
  ins.value.endDate = endDate
  if (startDate) {
    const d = new Date(startDate)
    ins.value.year = d.getFullYear()
    // month mode: startDate and endDate are in the same month
    const dEnd = new Date(endDate)
    ins.value.month = d.getMonth() === dEnd.getMonth() ? d.getMonth() + 1 : null
  } else {
    ins.value.month = null
    ins.value.year = null
  }
}
const inspections = ref([])
const selectedInspection = ref(null)

function fmtD(d) { return fmtDateTh(d) }
function countByStatus(i, s) { return i.details.filter(d => d.status === s).length }
function editInspection(i) { router.push({ path: '/inspection', query: { vehicleId: i.vehicleId, date: toLocalDateStr(i.inspectionDate) } }) }

const filteredInspections = computed(() => {
  let r = inspections.value
  if (ins.value.search) {
    const q = ins.value.search.toLowerCase()
    r = r.filter(i => i.vehicle.licensePlate.toLowerCase().includes(q) || (i.user.displayName || i.user.username).toLowerCase().includes(q))
  }
  if (ins.value.statusFilter === 'ALL_NORMAL') r = r.filter(i => i.details.every(d => d.status === 'NORMAL'))
  else if (ins.value.statusFilter === 'HAS_ABNORMAL') r = r.filter(i => i.details.some(d => d.status === 'ABNORMAL'))
  return r
})

async function loadInspections() {
  const params = new URLSearchParams()
  if (ins.value.month) params.set('month', ins.value.month)
  if (ins.value.year)  params.set('year',  ins.value.year)
  if (ins.value.startDate && !ins.value.month) params.set('startDate', ins.value.startDate)
  if (ins.value.endDate   && !ins.value.month) params.set('endDate',   ins.value.endDate)
  ins.value.vehicleIds.forEach(id => params.append('vehicleId', id))
  inspections.value = (await api.get('/inspections', { params })).data
  ins.value.searched = true
}

async function exportInspections(type) {
  if (!ins.value.vehicleIds.length) return swalError('กรุณาเลือกยานพาหนะก่อน Export')
  const params = new URLSearchParams({ month: ins.value.month, year: ins.value.year })
  ins.value.vehicleIds.forEach(id => params.append('vehicleId', id))
  window.open(`${BASE_URL}/api/export/${type}?${params}`, '_blank')
}

onMounted(async () => {
  vehicles.value = (await api.get('/vehicles')).data
  loadInspections()
})
</script>
