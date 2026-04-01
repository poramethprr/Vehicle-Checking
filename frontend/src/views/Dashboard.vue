<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">สวัสดี, {{ auth.user?.username }}</h1>
        <p class="text-sm text-slate-400 mt-0.5">ภาพรวมระบบตรวจเช็คยานพาหนะ</p>
      </div>
      <div class="text-right hidden sm:block">
        <div class="text-sm font-medium text-slate-500">{{ today }}</div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
      <div v-for="(stat, i) in statCards" :key="stat.label"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between mb-3">
          <div :class="stat.iconBg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
            <component :is="stat.icon" :class="stat.iconColor" class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span v-if="stat.value > 0" class="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-slate-800">{{ stat.value }}</div>
        <div class="text-xs sm:text-sm text-slate-400 mt-1">{{ stat.label }}</div>
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

      <!-- Mobile: Card view -->
      <div class="sm:hidden divide-y divide-gray-50" v-if="recentInspections.length">
        <div v-for="ins in recentInspections" :key="ins.id" class="px-4 py-3.5 hover:bg-slate-50 transition">
          <div class="flex justify-between items-start mb-1.5">
            <div>
              <span class="font-semibold text-sm text-slate-800">{{ ins.vehicle.licensePlate }}</span>
              <span class="text-xs text-slate-400 ml-1.5">{{ ins.vehicle.type }}</span>
            </div>
            <span v-if="hasAbnormal(ins)" class="text-xs bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full ring-1 ring-red-100">ผิดปกติ</span>
            <span v-else class="text-xs bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-full ring-1 ring-emerald-100">ปกติ</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <CalendarIcon class="w-3.5 h-3.5" />
            {{ formatDate(ins.inspectionDate) }}
            <span class="mx-1">·</span>
            <UserIcon class="w-3.5 h-3.5" />
            {{ ins.user.username }}
          </div>
        </div>
      </div>

      <!-- Desktop: Table view -->
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
                  <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                  ผิดปกติ {{ countAbnormal(ins) }} รายการ
                </span>
                <span v-else
                  class="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 font-medium px-3 py-1 rounded-full ring-1 ring-emerald-100">
                  <CheckCircleIcon class="w-3.5 h-3.5" />
                  ปกติทั้งหมด
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
import {
  TruckIcon, ClipboardDocumentCheckIcon, UsersIcon, ExclamationTriangleIcon,
  CheckCircleIcon, CalendarIcon, UserIcon
} from '@heroicons/vue/24/outline'
import api from '../stores/api'
import { auth } from '../stores/auth'

const stats = ref({ totalVehicles: 0, totalInspections: 0, totalUsers: 0, abnormalCount: 0 })
const recentInspections = ref([])

const today = computed(() => new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const statCards = computed(() => [
  { value: stats.value.totalVehicles, label: 'ยานพาหนะทั้งหมด', icon: TruckIcon, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { value: stats.value.totalInspections, label: 'ตรวจเช็คเดือนนี้', icon: ClipboardDocumentCheckIcon, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { value: stats.value.totalUsers, label: 'ผู้ใช้งาน', icon: UsersIcon, iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
  { value: stats.value.abnormalCount, label: 'ผิดปกติเดือนนี้', icon: ExclamationTriangleIcon, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' }
])

function formatDate(date) {
  return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function hasAbnormal(ins) { return ins.details.some(d => d.status === 'ABNORMAL') }
function countAbnormal(ins) { return ins.details.filter(d => d.status === 'ABNORMAL').length }

onMounted(async () => {
  try {
    const now = new Date()
    const [vehiclesRes, inspectionsRes, usersRes] = await Promise.all([
      api.get('/vehicles'),
      api.get('/inspections', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
      api.get('/users')
    ])

    stats.value.totalVehicles = vehiclesRes.data.length
    stats.value.totalInspections = inspectionsRes.data.length
    stats.value.totalUsers = usersRes.data.length
    stats.value.abnormalCount = inspectionsRes.data.reduce((sum, ins) => sum + ins.details.filter(d => d.status === 'ABNORMAL').length, 0)
    recentInspections.value = inspectionsRes.data.slice(0, 10)
  } catch (err) {
    console.error(err)
  }
})
</script>
