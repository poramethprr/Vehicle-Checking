<template>
  <div>
    <div class="relative bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-950 dark:to-orange-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-amber-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <ArrowsRightLeftIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานการเบิก/คืนรถ</h1>
          <p class="text-amber-100 text-xs mt-0.5">ค้นหาและส่งออกข้อมูลการเบิกและคืนยานพาหนะ</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 sm:p-5 mb-4">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">จากวันที่</label>
          <input v-model="bk.startDate" type="date" class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none dark:bg-slate-700 dark:text-white" /></div>
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ถึงวันที่</label>
          <input v-model="bk.endDate" type="date" class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none dark:bg-slate-700 dark:text-white" /></div>
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ยานพาหนะ</label>
          <AppMultiSelect v-model="bk.vehicleIds" :options="vehicleOptions" placeholder="ทั้งหมด" :icon="TruckIcon" /></div>
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">สถานะ</label>
          <AppSelect v-model="bk.status" :options="bkStatusOptions" placeholder="ทั้งหมด" :icon="FunnelIcon" /></div>
        <div class="flex items-end gap-2 col-span-2 sm:col-span-1">
          <button @click="loadBookings" class="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-700 dark:to-orange-800 dark:hover:from-amber-800 dark:hover:to-orange-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="exportBookings" class="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="bookings.length" class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-amber-600">{{ bookings.length }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">รายการทั้งหมด</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600">{{ num(bookings.filter(b=>b.distance).reduce((s,b)=>s+b.distance,0)) }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">ระยะทางรวม (กม.)</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ bookings.filter(b=>b.status==='RETURNED').length }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">คืนแล้ว</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden" v-if="bookings.length">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">วันที่เบิก</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">สถานที่</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">คนขับ</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ไมล์ออก</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ระยะ (กม.)</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">สถานะ</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="b in bookings" :key="b.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ fmtDT(b.checkoutDate) }}</td>
              <td class="py-3 px-4"><div class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ b.vehicle.licensePlate }}</div><div class="text-xs text-slate-400 dark:text-slate-500">{{ b.vehicle.type }}</div></td>
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-40 truncate">{{ b.destination }}</td>
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{{ b.driver.displayName || b.driver.username }}</td>
              <td class="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-300">{{ num(b.mileageOut) }}</td>
              <td class="py-3 px-4 text-sm text-right font-semibold" :class="b.distance ? 'text-blue-600' : 'text-slate-300'">{{ b.distance ? num(b.distance) : '-' }}</td>
              <td class="py-3 px-4 text-center"><span :class="bkBadge(b.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ bkLabel(b.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="b in bookings" :key="b.id" class="px-4 py-3">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ b.vehicle.licensePlate }}</span>
            <span :class="bkBadge(b.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ bkLabel(b.status) }}</span>
          </div>
          <div class="text-xs text-slate-400 dark:text-slate-500">{{ b.destination }} · {{ b.driver.displayName || b.driver.username }} · {{ fmtD(b.checkoutDate) }}</div>
          <div class="text-xs text-blue-600 font-medium mt-0.5" v-if="b.distance">ระยะ: {{ num(b.distance) }} กม.</div>
        </div>
      </div>
    </div>
    <AppEmpty v-else-if="bk.searched" :icon="ArrowsRightLeftIcon" title="ไม่พบข้อมูลการเบิก/คืนรถ" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowsRightLeftIcon, MagnifyingGlassIcon, TruckIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppMultiSelect from '../components/AppMultiSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'
import { fmtDateTh, fmtDateTimeTh } from '../stores/date'

const BASE_URL = `http://${window.location.hostname}:8099`
const vehicles = ref([])
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` })))
const bkStatusOptions = [{ value: 'CHECKED_OUT', label: 'กำลังใช้งาน' }, { value: 'RETURNED', label: 'คืนแล้ว' }, { value: 'CANCELLED', label: 'ยกเลิก' }]

function localDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const _now = new Date()
const bk = ref({ startDate: localDate(new Date(_now.getFullYear(), _now.getMonth(), 1)), endDate: localDate(_now), vehicleIds: [], status: '', searched: false })
const bookings = ref([])

function fmtD(d)  { return fmtDateTh(d) }
function fmtDT(d) { return fmtDateTimeTh(d) }
function num(n)   { return n != null ? Number(n).toLocaleString() : '-' }
function bkLabel(s) { return { CHECKED_OUT: 'กำลังใช้งาน', RETURNED: 'คืนแล้ว', CANCELLED: 'ยกเลิก' }[s] ?? s }
function bkBadge(s) { return { CHECKED_OUT: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800/50', RETURNED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800/50', CANCELLED: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-600' }[s] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 ring-slate-200 dark:ring-slate-600' }

async function loadBookings() {
  const p = new URLSearchParams()
  if (bk.value.startDate) p.set('startDate', bk.value.startDate)
  if (bk.value.endDate)   p.set('endDate',   bk.value.endDate)
  if (bk.value.status)    p.set('status',    bk.value.status)
  bk.value.vehicleIds.forEach(id => p.append('vehicleId', id))
  const res = await api.get('/bookings?' + p)
  bookings.value = res.data.bookings || res.data || []
  bk.value.searched = true
}

async function exportBookings() {
  const p = new URLSearchParams()
  if (bk.value.startDate) p.set('startDate', bk.value.startDate)
  if (bk.value.endDate)   p.set('endDate',   bk.value.endDate)
  if (bk.value.status)    p.set('status',    bk.value.status)
  bk.value.vehicleIds.forEach(id => p.append('vehicleId', id))
  window.open(`${BASE_URL}/api/export/bookings?${p}`, '_blank')
}

onMounted(async () => { vehicles.value = (await api.get('/vehicles')).data })
</script>
