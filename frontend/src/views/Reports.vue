<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-slate-800">รายงานการตรวจเช็ค</h1>
      <p class="text-sm text-slate-400 mt-0.5">ดูประวัติและรายละเอียดการตรวจเช็คทั้งหมด</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5 overflow-visible">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <AppSelect v-model="vehicleId" :options="vehicleOptions" placeholder="ทั้งหมด" :icon="TruckIcon" />
        </div>
        <div class="flex items-end col-span-2 sm:col-span-1">
          <button @click="loadReports"
            class="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]">
            <MagnifyingGlassIcon class="w-4 h-4 inline-block mr-1 -mt-0.5" /> ค้นหา
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible" v-if="inspections.length">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="font-bold text-slate-800">ผลการตรวจเช็ค
            <span class="text-sm font-normal text-slate-400 ml-1">{{ filteredInspections.length }}/{{ inspections.length }} รายการ</span>
          </h3>
          <!-- Search + filter -->
          <div class="flex gap-2 w-full sm:w-auto">
            <div class="relative flex-1 sm:flex-none sm:w-52">
              <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input v-model="searchText" placeholder="ค้นหาทะเบียน, ผู้ตรวจ..."
                class="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none text-sm transition" />
              <button v-if="searchText" @click="searchText = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <XCircleIcon class="w-4 h-4" />
              </button>
            </div>
            <div class="w-40 sm:w-44 shrink-0">
              <AppSelect v-model="statusFilter" :options="statusOptions" placeholder="สถานะทั้งหมด" :icon="FunnelIcon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-50">
        <div v-for="ins in filteredInspections" :key="ins.id" class="px-4 py-3.5">
          <div @click="showDetail(ins)" class="cursor-pointer">
            <div class="flex justify-between items-start mb-1">
              <span class="font-semibold text-sm text-slate-800">{{ ins.vehicle.licensePlate }}</span>
              <ChevronRightIcon class="w-4 h-4 text-slate-300" />
            </div>
            <div class="text-xs text-slate-400 mb-2">{{ formatDate(ins.inspectionDate) }} · {{ ins.user.username }}</div>
            <div class="flex gap-2 mb-2">
              <span class="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full ring-1 ring-emerald-100">
                <CheckCircleIcon class="w-3 h-3 inline -mt-0.5" /> ปกติ {{ countByStatus(ins, 'NORMAL') }}
              </span>
              <span v-if="countByStatus(ins, 'ABNORMAL') > 0" class="text-xs bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full ring-1 ring-red-100">
                <XCircleIcon class="w-3 h-3 inline -mt-0.5" /> ผิดปกติ {{ countByStatus(ins, 'ABNORMAL') }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 mt-1">
            <button @click="editInspection(ins)" class="flex-1 flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold py-2 rounded-xl transition ring-1 ring-amber-200">
              <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button @click="deleteInspection(ins)" class="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2 rounded-xl transition ring-1 ring-red-200">
              <TrashIcon class="w-3.5 h-3.5" /> ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">วันที่</th>
              <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ยานพาหนะ</th>
              <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ผู้ตรวจ</th>
              <th class="text-center py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ผลการตรวจ</th>
              <th class="text-center py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="ins in filteredInspections" :key="ins.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3.5 px-6 text-sm text-slate-500">{{ formatDate(ins.inspectionDate) }}</td>
              <td class="py-3.5 px-6">
                <div class="text-sm font-medium text-slate-800">{{ ins.vehicle.licensePlate }}</div>
                <div class="text-xs text-slate-400">{{ ins.vehicle.type }}</div>
              </td>
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ ins.user.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm text-slate-700">{{ ins.user.username }}</span>
                </div>
              </td>
              <td class="py-3.5 px-6 text-center">
                <div class="flex items-center justify-center gap-3">
                  <span class="text-emerald-500 font-bold text-sm flex items-center gap-0.5">
                    <CheckCircleIcon class="w-4 h-4" /> {{ countByStatus(ins, 'NORMAL') }}
                  </span>
                  <span :class="countByStatus(ins, 'ABNORMAL') > 0 ? 'text-red-500 font-bold' : 'text-slate-300'" class="text-sm flex items-center gap-0.5">
                    <XCircleIcon class="w-4 h-4" /> {{ countByStatus(ins, 'ABNORMAL') }}
                  </span>
                </div>
              </td>
              <td class="py-3.5 px-6 text-center whitespace-nowrap">
                <button @click="showDetail(ins)"
                  class="text-blue-600 hover:bg-blue-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                  <EyeIcon class="w-3.5 h-3.5" /> ดู
                </button>
                <button @click="editInspection(ins)"
                  class="text-amber-600 hover:bg-amber-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                  <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
                </button>
                <button @click="deleteInspection(ins)"
                  class="text-red-600 hover:bg-red-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                  <TrashIcon class="w-3.5 h-3.5" /> ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="searched" class="bg-white rounded-2xl shadow-sm border border-gray-100">
      <AppEmpty :icon="ChartBarIcon" title="ไม่พบข้อมูล" subtitle="ไม่พบข้อมูลการตรวจเช็คในช่วงเวลาที่เลือก" />
    </div>

    <!-- Detail Modal -->
    <TransitionRoot :show="!!selectedInspection" as="template">
      <Dialog @close="selectedInspection = null" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template"
            enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:translate-y-4 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-full sm:translate-y-4 sm:scale-95">
            <DialogPanel class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div class="sticky top-0 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between">
                <DialogTitle class="font-bold text-slate-800 text-lg">รายละเอียดการตรวจเช็ค</DialogTitle>
                <button @click="selectedInspection = null" class="p-1.5 hover:bg-slate-100 rounded-lg transition">
                  <XMarkIcon class="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div class="px-5 sm:px-6 py-4 overflow-y-auto flex-1" v-if="selectedInspection">
                <div class="flex flex-wrap gap-2 mb-5">
                  <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <TruckIcon class="w-3.5 h-3.5" /> {{ selectedInspection.vehicle.type }} - {{ selectedInspection.vehicle.licensePlate }}
                  </span>
                  <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CalendarIcon class="w-3.5 h-3.5" /> {{ formatDate(selectedInspection.inspectionDate) }}
                  </span>
                  <span class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <UserIcon class="w-3.5 h-3.5" /> {{ selectedInspection.user.username }}
                  </span>
                </div>
                <div class="space-y-2">
                  <div v-for="d in selectedInspection.details" :key="d.id"
                    :class="['rounded-xl p-3.5 text-sm border transition-colors',
                      d.status === 'NORMAL' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100']">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2.5">
                        <span :class="[d.status === 'NORMAL' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600']"
                          class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{{ d.itemNumber }}</span>
                        <span class="text-slate-700">{{ d.itemName }}</span>
                      </div>
                      <span :class="d.status === 'NORMAL' ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'"
                        class="text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                        <CheckCircleIcon v-if="d.status === 'NORMAL'" class="w-3 h-3" />
                        <XCircleIcon v-else class="w-3 h-3" />
                        {{ d.status === 'NORMAL' ? 'ปกติ' : 'ผิดปกติ' }}
                      </span>
                    </div>
                    <p v-if="d.abnormalNote" class="text-red-600 text-xs mt-2 pl-8 flex items-start gap-1">
                      <ChatBubbleLeftIcon class="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {{ d.abnormalNote }}
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
  MagnifyingGlassIcon, ChartBarIcon, ChevronRightIcon, XMarkIcon, CalendarIcon,
  CalendarDaysIcon, TruckIcon, UserIcon, EyeIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftIcon,
  PencilSquareIcon, TrashIcon, FunnelIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'
import { useRouter } from 'vue-router'

const router = useRouter()
const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

const now = new Date()
const month = ref(now.getMonth() + 1)
const year = ref(now.getFullYear())
const vehicleId = ref('')
const vehicles = ref([])
const inspections = ref([])
const searched = ref(false)
const selectedInspection = ref(null)
const searchText = ref('')
const statusFilter = ref('')

const monthOptions = thaiMonths.map((m, i) => ({ value: i + 1, label: m }))
const yearOptionsList = Array.from({ length: 5 }, (_, i) => ({ value: now.getFullYear() - i, label: String(now.getFullYear() - i) }))
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.type} - ${v.licensePlate}` })))
const statusOptions = [
  { value: 'ALL_NORMAL', label: 'ปกติทั้งหมด' },
  { value: 'HAS_ABNORMAL', label: 'มีรายการผิดปกติ' }
]

const filteredInspections = computed(() => {
  let result = inspections.value
  // Text search: ทะเบียน, ประเภท, ผู้ตรวจ
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(ins =>
      ins.vehicle.licensePlate.toLowerCase().includes(q) ||
      ins.vehicle.type.toLowerCase().includes(q) ||
      ins.user.username.toLowerCase().includes(q)
    )
  }
  // Status filter
  if (statusFilter.value === 'ALL_NORMAL') {
    result = result.filter(ins => ins.details.every(d => d.status === 'NORMAL'))
  } else if (statusFilter.value === 'HAS_ABNORMAL') {
    result = result.filter(ins => ins.details.some(d => d.status === 'ABNORMAL'))
  }
  return result
})

function formatDate(date) { return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) }
function countByStatus(ins, status) { return ins.details.filter(d => d.status === status).length }
function showDetail(ins) { selectedInspection.value = ins }

function editInspection(ins) {
  const date = new Date(ins.inspectionDate).toISOString().slice(0, 10)
  router.push({ path: '/inspection', query: { vehicleId: ins.vehicleId, date } })
}

async function deleteInspection(ins) {
  const result = await swalConfirm(
    'ลบผลการตรวจ',
    `ต้องการลบผลการตรวจ ${ins.vehicle.licensePlate} วันที่ ${formatDate(ins.inspectionDate)} ?`,
    'ลบ', true
  )
  if (!result.isConfirmed) return
  try {
    await api.delete(`/inspections/${ins.id}`, { data: { userId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', 'ลบผลการตรวจเรียบร้อยแล้ว')
    await loadReports()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถลบได้')
  }
}

async function loadReports() {
  const params = { month: month.value, year: year.value }
  if (vehicleId.value) params.vehicleId = vehicleId.value
  inspections.value = (await api.get('/inspections', { params })).data
  searched.value = true
}

onMounted(async () => { vehicles.value = (await api.get('/vehicles')).data; loadReports() })
</script>
