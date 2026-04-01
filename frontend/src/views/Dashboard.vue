<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">สวัสดี, {{ auth.user?.username }}</h1>
        <p class="text-sm text-slate-400 mt-0.5">{{ today }}</p>
      </div>
    </div>

    <!-- Expiry Alerts -->
    <div v-if="expiringDocs.length" class="space-y-2">
      <div v-for="doc in expiringDocs" :key="doc.key"
        :class="doc.urgent ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'"
        class="border rounded-2xl px-4 py-3 flex items-start gap-3 text-sm">
        <ExclamationTriangleIcon class="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <span class="font-semibold">{{ doc.vehicleName }}</span>
          — {{ doc.label }}
          <span class="font-bold ml-1">{{ doc.urgent ? 'หมดอายุแล้ว/วันนี้' : `อีก ${doc.daysLeft} วัน (${doc.dateStr})` }}</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="stat in statCards" :key="stat.label"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3">
          <div :class="stat.iconBg" class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center">
            <component :is="stat.icon" :class="stat.iconColor" class="w-5 h-5" />
          </div>
          <span v-if="stat.badge" :class="stat.badgeClass" class="text-xs font-semibold px-2 py-0.5 rounded-full">{{ stat.badge }}</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-slate-800">{{ stat.value }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Fast Navigation -->
    <div>
      <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <BoltIcon class="w-4 h-4" /> ทางลัด
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <router-link to="/inspection"
          class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 p-4 flex flex-col items-center gap-3 transition-all active:scale-[0.97]">
          <div class="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
            <ClipboardDocumentCheckIcon class="w-6 h-6 text-blue-600" />
          </div>
          <span class="text-sm font-semibold text-slate-700 text-center leading-tight">บันทึก<br>การตรวจ</span>
        </router-link>

        <router-link to="/bookings"
          class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 p-4 flex flex-col items-center gap-3 transition-all active:scale-[0.97]">
          <div class="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
            <ArrowUpTrayIcon class="w-6 h-6 text-emerald-600" />
          </div>
          <span class="text-sm font-semibold text-slate-700 text-center leading-tight">เบิก<br>ยานพาหนะ</span>
        </router-link>

        <router-link to="/bookings" @click.native="goToReturn"
          class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 p-4 flex flex-col items-center gap-3 transition-all active:scale-[0.97]">
          <div class="w-12 h-12 bg-amber-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors relative">
            <ArrowDownTrayIcon class="w-6 h-6 text-amber-600" />
            <span v-if="stats.inUse > 0"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {{ stats.inUse }}
            </span>
          </div>
          <span class="text-sm font-semibold text-slate-700 text-center leading-tight">คืน<br>ยานพาหนะ</span>
        </router-link>

        <router-link to="/reports"
          class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 p-4 flex flex-col items-center gap-3 transition-all active:scale-[0.97]">
          <div class="w-12 h-12 bg-violet-50 group-hover:bg-violet-100 rounded-xl flex items-center justify-center transition-colors">
            <ChartBarIcon class="w-6 h-6 text-violet-600" />
          </div>
          <span class="text-sm font-semibold text-slate-700 text-center leading-tight">ดู<br>รายงาน</span>
        </router-link>

        <router-link to="/export"
          class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-rose-200 p-4 flex flex-col items-center gap-3 transition-all active:scale-[0.97]">
          <div class="w-12 h-12 bg-rose-50 group-hover:bg-rose-100 rounded-xl flex items-center justify-center transition-colors">
            <ArrowDownTrayIcon class="w-6 h-6 text-rose-600" />
          </div>
          <span class="text-sm font-semibold text-slate-700 text-center leading-tight">Export<br>Excel/PDF</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Inspections -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <ClipboardDocumentCheckIcon class="w-5 h-5 text-blue-500" />
          การตรวจเช็คล่าสุด
        </h3>
        <router-link to="/reports" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">ดูทั้งหมด →</router-link>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-50" v-if="recentInspections.length">
        <div v-for="ins in recentInspections" :key="ins.id" class="px-4 py-3.5">
          <div class="flex justify-between items-start mb-1.5">
            <div>
              <span class="font-semibold text-sm text-slate-800">{{ ins.vehicle.licensePlate }}</span>
              <span class="text-xs text-slate-400 ml-1.5">{{ ins.vehicle.type }}</span>
            </div>
            <span v-if="hasAbnormal(ins)" class="text-xs bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full ring-1 ring-red-100">ผิดปกติ</span>
            <span v-else class="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full ring-1 ring-emerald-100">ปกติ</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <CalendarIcon class="w-3.5 h-3.5" />{{ formatDate(ins.inspectionDate) }}
            <span class="mx-1">·</span>
            <UserIcon class="w-3.5 h-3.5" />{{ ins.user.username }}
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block" v-if="recentInspections.length">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">วันที่</th>
              <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ยานพาหนะ</th>
              <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ผู้ตรวจ</th>
              <th class="text-center py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="ins in recentInspections" :key="ins.id" class="hover:bg-slate-50/50 transition">
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
                <span v-if="hasAbnormal(ins)"
                  class="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 font-medium px-3 py-1 rounded-full ring-1 ring-red-100">
                  <ExclamationTriangleIcon class="w-3.5 h-3.5" /> ผิดปกติ {{ countAbnormal(ins) }} รายการ
                </span>
                <span v-else
                  class="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 font-medium px-3 py-1 rounded-full ring-1 ring-emerald-100">
                  <CheckCircleIcon class="w-3.5 h-3.5" /> ปกติทั้งหมด
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!recentInspections.length" class="px-6 py-16 text-center">
        <ClipboardDocumentCheckIcon class="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p class="text-slate-400 text-sm">ยังไม่มีข้อมูลการตรวจเช็ค</p>
        <router-link to="/inspection" class="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold">เริ่มบันทึกการตรวจ →</router-link>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  TruckIcon, ClipboardDocumentCheckIcon, UsersIcon, ExclamationTriangleIcon,
  CheckCircleIcon, CalendarIcon, UserIcon, BoltIcon, ChartBarIcon,
  ArrowUpTrayIcon, ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import api from '../stores/api'
import { auth } from '../stores/auth'

const router = useRouter()
const statsRaw = ref({ totalVehicles: 0, totalInspections: 0, totalUsers: 0, abnormalCount: 0, inUse: 0, available: 0 })
const recentInspections = ref([])
const vehicles = ref([])

const today = computed(() => new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const stats = computed(() => statsRaw.value)

const statCards = computed(() => [
  { value: stats.value.totalVehicles, label: 'ยานพาหนะทั้งหมด', icon: TruckIcon, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', badge: null },
  { value: stats.value.available, label: 'รถพร้อมใช้งาน', icon: TruckIcon, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', badge: 'พร้อม', badgeClass: 'bg-emerald-100 text-emerald-600' },
  { value: stats.value.inUse, label: 'กำลังใช้งาน', icon: TruckIcon, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', badge: stats.value.inUse > 0 ? 'ออกรถ' : null, badgeClass: 'bg-amber-100 text-amber-600' },
  { value: stats.value.abnormalCount, label: 'ผิดปกติเดือนนี้', icon: ExclamationTriangleIcon, iconBg: 'bg-red-50', iconColor: 'text-red-500', badge: null },
])

// เช็คเอกสารใกล้หมดอายุภายใน 30 วัน
const expiringDocs = computed(() => {
  const alerts = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const warn = new Date(today)
  warn.setDate(warn.getDate() + 30)

  for (const v of vehicles.value) {
    const name = `${v.type} (${v.licensePlate})`
    const checks = [
      { key: `${v.id}-prb`, field: v.prbExpiry, label: 'พ.ร.บ. หมดอายุ' },
      { key: `${v.id}-ins`, field: v.insExpiry, label: 'ประกันภัย หมดอายุ' },
      { key: `${v.id}-tax`, field: v.taxRenewalDate, label: 'ต่อภาษีรถ ครบกำหนด' },
    ]
    for (const c of checks) {
      if (!c.field) continue
      const d = new Date(c.field)
      d.setHours(0, 0, 0, 0)
      if (d <= warn) {
        const daysLeft = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
        alerts.push({
          key: c.key,
          vehicleName: name,
          label: c.label,
          daysLeft,
          urgent: daysLeft <= 0,
          dateStr: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
        })
      }
    }
  }
  return alerts.sort((a, b) => a.daysLeft - b.daysLeft)
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}
function hasAbnormal(ins) { return ins.details.some(d => d.status === 'ABNORMAL') }
function countAbnormal(ins) { return ins.details.filter(d => d.status === 'ABNORMAL').length }

function goToReturn() {
  // Navigate to bookings tab 1 (กำลังใช้งาน) — handled by query param
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

    vehicles.value = vehiclesRes.data
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
