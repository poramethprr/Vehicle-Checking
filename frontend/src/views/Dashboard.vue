<template>
  <div class="space-y-5">

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="stat in statCards" :key="stat.label"
        :class="stat.gradient"
        class="relative rounded-2xl p-4 sm:p-5 overflow-hidden shadow-sm">
        <div class="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center mb-3">
            <component :is="stat.icon" class="w-5 h-5 text-white" />
          </div>
          <div class="text-2xl sm:text-3xl font-bold text-white">{{ stat.value }}</div>
          <div class="text-xs text-white/75 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Fast Navigation -->
    <div>
      <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <BoltIcon class="w-4 h-4 text-amber-500" /> ทางลัด
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        <router-link to="/inspection"
          class="group relative bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5 transition-all active:scale-[0.97] overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl pointer-events-none"></div>
          <div class="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center">
            <ClipboardDocumentCheckIcon class="w-6 h-6 text-white" />
          </div>
          <span class="text-sm font-bold text-white text-center leading-tight">บันทึก<br>การตรวจ</span>
        </router-link>

        <router-link to="/bookings"
          class="group relative bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all active:scale-[0.97] overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl pointer-events-none"></div>
          <div class="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center">
            <ArrowUpTrayIcon class="w-6 h-6 text-white" />
          </div>
          <span class="text-sm font-bold text-white text-center leading-tight">เบิก<br>ยานพาหนะ</span>
        </router-link>

        <router-link to="/bookings" @click.native="goToReturn"
          class="group relative bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 hover:-translate-y-0.5 transition-all active:scale-[0.97] overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl pointer-events-none"></div>
          <div class="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center relative">
            <ArrowDownTrayIcon class="w-6 h-6 text-white" />
            <span v-if="stats.inUse > 0"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-amber-400">
              {{ stats.inUse }}
            </span>
          </div>
          <span class="text-sm font-bold text-white text-center leading-tight">คืน<br>ยานพาหนะ</span>
        </router-link>

        <router-link to="/reports"
          class="group relative bg-linear-to-br from-violet-500 to-purple-600 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:-translate-y-0.5 transition-all active:scale-[0.97] overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl pointer-events-none"></div>
          <div class="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center">
            <ChartBarIcon class="w-6 h-6 text-white" />
          </div>
          <span class="text-sm font-bold text-white text-center leading-tight">ดู<br>รายงาน</span>
        </router-link>

        <router-link to="/export"
          class="group relative bg-linear-to-br from-rose-500 to-pink-600 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-300 hover:-translate-y-0.5 transition-all active:scale-[0.97] overflow-hidden">
          <div class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl pointer-events-none"></div>
          <div class="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center">
            <ArrowDownTrayIcon class="w-6 h-6 text-white" />
          </div>
          <span class="text-sm font-bold text-white text-center leading-tight">Export<br>Excel/PDF</span>
        </router-link>

      </div>
    </div>

    <!-- Recent Inspections -->
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardDocumentCheckIcon class="w-3.5 h-3.5 text-blue-600" />
          </div>
          การตรวจเช็คล่าสุด
        </h3>
        <router-link to="/reports" class="text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">ดูทั้งหมด →</router-link>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100" v-if="recentInspections.length">
        <div v-for="ins in recentInspections" :key="ins.id" class="px-4 py-3.5 hover:bg-slate-50/50 transition">
          <div class="flex justify-between items-start mb-1.5">
            <div>
              <span class="font-semibold text-sm text-slate-800">{{ ins.vehicle.licensePlate }}</span>
              <span class="text-xs text-slate-400 ml-1.5">{{ ins.vehicle.type }}</span>
            </div>
            <span v-if="hasAbnormal(ins)" class="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full ring-1 ring-red-100">ผิดปกติ</span>
            <span v-else class="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full ring-1 ring-emerald-100">ปกติ</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <CalendarIcon class="w-3.5 h-3.5" />{{ formatDate(ins.inspectionDate) }}
            <span>·</span>
            <UserIcon class="w-3.5 h-3.5" />{{ ins.user.username }}
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block" v-if="recentInspections.length">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50">
              <th class="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">วันที่</th>
              <th class="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">ยานพาหนะ</th>
              <th class="text-left py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">ผู้ตรวจ</th>
              <th class="text-center py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ins in recentInspections" :key="ins.id" class="hover:bg-blue-50/30 transition">
              <td class="py-3.5 px-6 text-sm text-slate-500">{{ formatDate(ins.inspectionDate) }}</td>
              <td class="py-3.5 px-6">
                <div class="text-sm font-semibold text-slate-800">{{ ins.vehicle.licensePlate }}</div>
                <div class="text-xs text-slate-400">{{ ins.vehicle.type }}</div>
              </td>
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {{ ins.user.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm text-slate-700">{{ ins.user.username }}</span>
                </div>
              </td>
              <td class="py-3.5 px-6 text-center">
                <span v-if="hasAbnormal(ins)"
                  class="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 font-semibold px-3 py-1 rounded-full">
                  <ExclamationTriangleIcon class="w-3.5 h-3.5" /> ผิดปกติ {{ countAbnormal(ins) }} รายการ
                </span>
                <span v-else
                  class="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
                  <CheckCircleIcon class="w-3.5 h-3.5" /> ปกติทั้งหมด
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!recentInspections.length" class="px-6 py-16 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardDocumentCheckIcon class="w-8 h-8 text-slate-300" />
        </div>
        <p class="text-slate-400 text-sm font-medium">ยังไม่มีข้อมูลการตรวจเช็ค</p>
        <router-link to="/inspection" class="inline-flex items-center gap-1.5 mt-3 text-sm text-white font-semibold bg-linear-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition">
          เริ่มบันทึกการตรวจ →
        </router-link>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  TruckIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon,
  CheckCircleIcon, CalendarIcon, UserIcon, BoltIcon, ChartBarIcon,
  ArrowUpTrayIcon, ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import api from '../stores/api'

const router = useRouter()
const statsRaw = ref({ totalVehicles: 0, totalInspections: 0, totalUsers: 0, abnormalCount: 0, inUse: 0, available: 0 })
const recentInspections = ref([])

const stats = computed(() => statsRaw.value)

const statCards = computed(() => [
  { value: stats.value.totalVehicles, label: 'ยานพาหนะทั้งหมด', icon: TruckIcon, gradient: 'bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-200' },
  { value: stats.value.available, label: 'รถพร้อมใช้งาน', icon: TruckIcon, gradient: 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-200' },
  { value: stats.value.inUse, label: 'กำลังใช้งาน', icon: TruckIcon, gradient: 'bg-linear-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-200' },
  { value: stats.value.abnormalCount, label: 'ผิดปกติเดือนนี้', icon: ExclamationTriangleIcon, gradient: 'bg-linear-to-br from-rose-500 to-red-600 shadow-sm shadow-rose-200' },
])


function formatDate(date) {
  return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}
function hasAbnormal(ins) { return ins.details.some(d => d.status === 'ABNORMAL') }
function countAbnormal(ins) { return ins.details.filter(d => d.status === 'ABNORMAL').length }

function goToReturn() {
  router.push('/bookings?tab=1')
}

onMounted(async () => {
  try {
    const now = new Date()
    const [vehiclesRes, inspectionsRes, usersRes, bookingsRes] = await Promise.all([
      api.get('/vehicles'),
      api.get('/inspections', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
      api.get('/users'),
      api.get('/bookings/available/vehicles')
    ])

    const allVehicles = vehiclesRes.data
    const availableVehicles = bookingsRes.data

    statsRaw.value.totalVehicles = allVehicles.length
    statsRaw.value.available = availableVehicles.length
    statsRaw.value.inUse = allVehicles.filter(v => v.status === 'IN_USE').length
    statsRaw.value.totalInspections = inspectionsRes.data.length
    statsRaw.value.totalUsers = usersRes.data.length
    statsRaw.value.abnormalCount = inspectionsRes.data.reduce(
      (sum, ins) => sum + ins.details.filter(d => d.status === 'ABNORMAL').length, 0
    )
    recentInspections.value = inspectionsRes.data.slice(0, 8)
  } catch (err) {
    console.error(err)
  }
})
</script>
