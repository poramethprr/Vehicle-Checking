<template>
  <div>
    <div class="relative bg-linear-to-r from-slate-700 to-slate-800 rounded-2xl px-6 py-5 mb-6 overflow-hidden shadow-md shadow-slate-400/30">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
          <ClockIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">Log การดำเนินการ</h1>
          <p class="text-slate-300 text-xs mt-0.5">ติดตามประวัติการใช้งานระบบทั้งหมด</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-linear-to-br from-white to-slate-50/60 rounded-2xl shadow-lg shadow-slate-300/40 border border-slate-300 p-5 sm:p-6 mb-5">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <CalendarIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> จากวันที่
          </label>
          <div class="relative">
            <CalendarIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input v-model="startDate" type="date" class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm hover:border-blue-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <CalendarIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ถึงวันที่
          </label>
          <div class="relative">
            <CalendarIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input v-model="endDate" type="date" class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm hover:border-blue-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <FunnelIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ประเภท
          </label>
          <AppSelect v-model="actionFilter" :options="actionSelectOptions" placeholder="ทั้งหมด" :icon="FunnelIcon" />
        </div>
        <div class="flex items-end col-span-2 sm:col-span-1">
          <button @click="loadLogs"
            class="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]">
            <MagnifyingGlassIcon class="w-4 h-4 inline-block mr-1 -mt-0.5" /> ค้นหา
          </button>
        </div>
      </div>
    </div>

    <!-- Log List -->
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-200">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <ClockIcon class="w-5 h-5 text-blue-500" /> ประวัติกิจกรรม
          <span class="text-sm font-normal text-slate-400">{{ total }} รายการ</span>
        </h3>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100" v-if="logs.length">
        <div v-for="log in logs" :key="log.id" class="px-4 py-3.5">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
              {{ log.user.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-sm text-slate-800">{{ log.user.username }}</span>
                <span :class="getActionColor(log.action)" class="text-xs font-medium px-2 py-0.5 rounded-full ring-1 inline-flex items-center gap-1">
                  <component :is="getActionIcon(log.action)" class="w-3 h-3" />
                  {{ getActionLabel(log.action) }}
                </span>
              </div>
              <p class="text-sm text-slate-600 mt-0.5 leading-snug">{{ log.detail }}</p>
              <div class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <ClockIcon class="w-3 h-3" /> {{ formatDateTime(log.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block" v-if="logs.length">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50">
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">เวลา</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ผู้ดำเนินการ</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ประเภท</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">รายละเอียด</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3.5 px-6 text-sm text-slate-400 whitespace-nowrap">{{ formatDateTime(log.createdAt) }}</td>
              <td class="py-3.5 px-6"><div class="flex items-center gap-2">
                <div class="w-7 h-7 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{{ log.user.username.charAt(0).toUpperCase() }}</div>
                <span class="text-sm text-slate-700">{{ log.user.username }}</span>
              </div></td>
              <td class="py-3.5 px-6">
                <span :class="getActionColor(log.action)" class="text-xs font-medium px-2.5 py-0.5 rounded-full ring-1 inline-flex items-center gap-1">
                  <component :is="getActionIcon(log.action)" class="w-3 h-3" />
                  {{ getActionLabel(log.action) }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-sm text-slate-600 max-w-md truncate">{{ log.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppEmpty v-if="!logs.length" :icon="ClockIcon" title="ไม่พบข้อมูล Log" subtitle="ยังไม่มีกิจกรรมในช่วงเวลาที่เลือก" />

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-slate-400">หน้า {{ page }} จาก {{ totalPages }}</div>
        <div class="flex gap-2">
          <button @click="changePage(page - 1)" :disabled="page <= 1"
            class="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-1">
            <ChevronLeftIcon class="w-3.5 h-3.5" /> ก่อนหน้า
          </button>
          <button @click="changePage(page + 1)" :disabled="page >= totalPages"
            class="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-1">
            ถัดไป <ChevronRightIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ClockIcon, MagnifyingGlassIcon, CalendarIcon, FunnelIcon,
  ChevronLeftIcon, ChevronRightIcon,
  ArrowRightOnRectangleIcon, UserPlusIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon,
  TruckIcon, ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'

const logs = ref([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const startDate = ref('')
const endDate = ref('')
const actionFilter = ref('')

const actionOptions = [
  { value: 'LOGIN', label: 'เข้าสู่ระบบ', icon: ArrowRightOnRectangleIcon, color: 'bg-blue-50 text-blue-600 ring-blue-200' },
  { value: 'REGISTER', label: 'สมัครสมาชิก', icon: UserPlusIcon, color: 'bg-indigo-50 text-indigo-600 ring-indigo-200' },
  { value: 'CREATE_INSPECTION', label: 'บันทึกการตรวจ', icon: ClipboardDocumentCheckIcon, color: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
  { value: 'UPDATE_INSPECTION', label: 'แก้ไขการตรวจ', icon: PencilSquareIcon, color: 'bg-amber-50 text-amber-600 ring-amber-200' },
  { value: 'DELETE_INSPECTION', label: 'ลบการตรวจ', icon: TrashIcon, color: 'bg-red-50 text-red-600 ring-red-200' },
  { value: 'CREATE_VEHICLE', label: 'เพิ่มยานพาหนะ', icon: TruckIcon, color: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
  { value: 'UPDATE_VEHICLE', label: 'แก้ไขยานพาหนะ', icon: PencilSquareIcon, color: 'bg-amber-50 text-amber-600 ring-amber-200' },
  { value: 'DELETE_VEHICLE', label: 'ลบยานพาหนะ', icon: TrashIcon, color: 'bg-red-50 text-red-600 ring-red-200' },
  { value: 'UPDATE_USER', label: 'แก้ไขผู้ใช้', icon: PencilSquareIcon, color: 'bg-amber-50 text-amber-600 ring-amber-200' },
  { value: 'DELETE_USER', label: 'ลบผู้ใช้', icon: TrashIcon, color: 'bg-red-50 text-red-600 ring-red-200' }
]

const actionSelectOptions = actionOptions.map(a => ({ value: a.value, label: a.label }))

function getActionColor(action) { return actionOptions.find(a => a.value === action)?.color || 'bg-slate-50 text-slate-600 ring-slate-200' }
function getActionLabel(action) { return actionOptions.find(a => a.value === action)?.label || action }
function getActionIcon(action) { return actionOptions.find(a => a.value === action)?.icon || ClockIcon }

function formatDateTime(date) {
  return new Date(date).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function loadLogs() {
  const params = { page: page.value, limit: 50 }
  if (startDate.value) params.startDate = startDate.value
  if (endDate.value) params.endDate = endDate.value
  if (actionFilter.value) params.action = actionFilter.value
  const { data } = await api.get('/logs', { params })
  logs.value = data.logs; total.value = data.total; totalPages.value = data.totalPages
}

function changePage(p) { page.value = p; loadLogs() }

onMounted(loadLogs)
</script>
