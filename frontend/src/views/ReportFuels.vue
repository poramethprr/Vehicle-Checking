<template>
  <div>
    <div class="relative bg-linear-to-r from-blue-500 to-cyan-500 dark:from-blue-950 dark:to-cyan-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-blue-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <BeakerIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานเติมน้ำมัน</h1>
          <p class="text-blue-100 text-xs mt-0.5">ค้นหาและส่งออกข้อมูลการเติมน้ำมันยานพาหนะ</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 sm:p-5 mb-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">จากวันที่</label>
          <input v-model="fl.startDate" type="date" class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:text-white" /></div>
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ถึงวันที่</label>
          <input v-model="fl.endDate" type="date" class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:text-white" /></div>
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ยานพาหนะ</label>
          <AppMultiSelect v-model="fl.vehicleIds" :options="vehicleOptions" placeholder="ทั้งหมด" :icon="TruckIcon" /></div>
        <div class="flex items-end gap-2 col-span-2 sm:col-span-1">
          <button @click="loadFuels" class="flex-1 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 dark:from-teal-700 dark:to-cyan-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="exportFuels" class="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="fuels.length" class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600">{{ fuels.length }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">จำนวนครั้ง</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-cyan-600">{{ numDec(fuels.reduce((s,f)=>s+f.liters,0)) }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">ลิตรรวม (ล.)</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ num(fuels.reduce((s,f)=>s+f.amount,0)) }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">ค่าน้ำมันรวม (บ.)</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden" v-if="fuels.length">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">วันที่</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ไมล์ก่อน</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ไมล์หลัง</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ลิตร</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">จำนวนเงิน (บ.)</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ผู้บันทึก</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="f in fuels" :key="f.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ fmtDT(f.createdAt) }}</td>
              <td class="py-3 px-4"><div class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ f.vehicle.licensePlate }}</div><div class="text-xs text-slate-400 dark:text-slate-500">{{ f.vehicle.type }}</div></td>
              <td class="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-300">{{ num(f.mileageBefore) }}</td>
              <td class="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-300">{{ f.mileageAfter ? num(f.mileageAfter) : '-' }}</td>
              <td class="py-3 px-4 text-sm text-right font-semibold text-cyan-600">{{ numDec(f.liters) }}</td>
              <td class="py-3 px-4 text-sm text-right font-semibold text-emerald-600">{{ num(f.amount) }}</td>
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{{ f.user.displayName || f.user.username }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="f in fuels" :key="f.id" class="px-4 py-3">
          <div class="flex justify-between items-start">
            <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ f.vehicle.licensePlate }}</span>
            <span class="text-emerald-600 font-bold text-sm">{{ num(f.amount) }} บ.</span>
          </div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ fmtD(f.createdAt) }} · {{ numDec(f.liters) }} ล. · {{ f.user.displayName || f.user.username }}</div>
        </div>
      </div>
    </div>
    <AppEmpty v-else-if="fl.searched" :icon="BeakerIcon" title="ไม่พบข้อมูลการเติมน้ำมัน" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BeakerIcon, MagnifyingGlassIcon, TruckIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppMultiSelect from '../components/AppMultiSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'
import { fmtDateTh, fmtDateTimeTh } from '../stores/date'

const BASE_URL = `http://${window.location.hostname}:8099`
const vehicles = ref([])
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` })))

function localDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const _now = new Date()
const fl = ref({ startDate: localDate(new Date(_now.getFullYear(), _now.getMonth(), 1)), endDate: localDate(_now), vehicleIds: [], searched: false })
const fuels = ref([])

function fmtD(d)   { return fmtDateTh(d) }
function fmtDT(d)  { return fmtDateTimeTh(d) }
function num(n)    { return n != null ? Number(n).toLocaleString() : '-' }
function numDec(n) { return n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-' }

async function loadFuels() {
  const p = new URLSearchParams()
  if (fl.value.startDate) p.set('startDate', fl.value.startDate)
  if (fl.value.endDate)   p.set('endDate',   fl.value.endDate)
  fl.value.vehicleIds.forEach(id => p.append('vehicleId', id))
  const res = await api.get('/fuels?' + p)
  fuels.value = res.data.logs || res.data.fuels || res.data || []
  fl.value.searched = true
}

async function exportFuels() {
  const p = new URLSearchParams()
  if (fl.value.startDate) p.set('startDate', fl.value.startDate)
  if (fl.value.endDate)   p.set('endDate',   fl.value.endDate)
  fl.value.vehicleIds.forEach(id => p.append('vehicleId', id))
  window.open(`${BASE_URL}/api/export/fuels?${p}`, '_blank')
}

onMounted(async () => { vehicles.value = (await api.get('/vehicles')).data })
</script>
