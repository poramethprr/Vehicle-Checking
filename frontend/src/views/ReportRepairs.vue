<template>
  <div>
    <div class="relative bg-linear-to-r from-orange-500 to-red-500 dark:from-orange-950 dark:to-red-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-orange-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <WrenchScrewdriverIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานแจ้งซ่อม</h1>
          <p class="text-orange-100 text-xs mt-0.5">ค้นหาและส่งออกข้อมูลการแจ้งซ่อมยานพาหนะ</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 sm:p-5 mb-4">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-start gap-3">
          <div class="w-full">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ช่วงเวลา</label>
            <AppDateFilter default-mode="month" @change="({ startDate, endDate }) => { rp.startDate = startDate; rp.endDate = endDate }" />
          </div>
          <div class="flex-1 min-w-40">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ยานพาหนะ</label>
            <AppMultiSelect v-model="rp.vehicleIds" :options="vehicleOptions" placeholder="ทั้งหมด" :icon="TruckIcon" />
          </div>
          <div class="flex-1 min-w-32">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">สถานะ</label>
            <AppSelect v-model="rp.status" :options="rpStatusOptions" placeholder="ทั้งหมด" :icon="FunnelIcon" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="loadRepairs" class="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 dark:from-orange-800 dark:to-red-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="exportRepairs" class="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="repairs.length" class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-slate-700 dark:text-slate-200">{{ repairs.length }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">รายการทั้งหมด</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-amber-600">{{ repairs.filter(r=>r.status==='PENDING').length }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">รออนุมัติ</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ repairs.filter(r=>r.status==='APPROVED'||r.status==='COMPLETED').length }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">อนุมัติแล้ว</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-orange-600">{{ num(repairs.filter(r=>r.estimatedCost).reduce((s,r)=>s+(r.estimatedCost||0),0)) }}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">วงเงินรวม (บ.)</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden" v-if="repairs.length">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">วันที่แจ้ง</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">หัวข้อ</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">วงเงิน (บ.)</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ผู้แจ้ง</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">สถานะ</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="r in repairs" :key="r.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ fmtDT(r.createdAt) }}</td>
              <td class="py-3 px-4"><div class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ r.vehicle.licensePlate }}</div><div class="text-xs text-slate-400 dark:text-slate-500">{{ r.vehicle.type }}</div></td>
              <td class="py-3 px-4 text-sm text-slate-700 dark:text-slate-200 max-w-48 truncate">{{ r.title }}</td>
              <td class="py-3 px-4 text-sm text-right font-semibold text-orange-600">{{ r.estimatedCost ? num(r.estimatedCost) : '-' }}</td>
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{{ r.user.displayName || r.user.username }}</td>
              <td class="py-3 px-4 text-center"><span :class="rpBadge(r.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ rpLabel(r.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="r in repairs" :key="r.id" class="px-4 py-3">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ r.vehicle.licensePlate }}</span>
            <span :class="rpBadge(r.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ rpLabel(r.status) }}</span>
          </div>
          <div class="text-sm text-slate-700 dark:text-slate-200 mb-0.5">{{ r.title }}</div>
          <div class="text-xs text-slate-400 dark:text-slate-500">{{ fmtD(r.createdAt) }} · {{ r.user.displayName || r.user.username }}{{ r.estimatedCost ? ` · ${num(r.estimatedCost)} บ.` : '' }}</div>
        </div>
      </div>
    </div>
    <AppEmpty v-else-if="rp.searched" :icon="WrenchScrewdriverIcon" title="ไม่พบข้อมูลการแจ้งซ่อม" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { WrenchScrewdriverIcon, MagnifyingGlassIcon, TruckIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppMultiSelect from '../components/AppMultiSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { fmtDateTh, fmtDateTimeTh } from '../stores/date'

const BASE_URL = ``
const vehicles = ref([])
const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` })))
const rpStatusOptions = [{ value: 'PENDING', label: 'รออนุมัติ' }, { value: 'APPROVED', label: 'อนุมัติแล้ว' }, { value: 'REJECTED', label: 'ไม่อนุมัติ' }, { value: 'COMPLETED', label: 'เสร็จสิ้น' }]

function localDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const _now = new Date()
const rp = ref({ startDate: localDate(new Date(_now.getFullYear(), _now.getMonth(), 1)), endDate: localDate(_now), vehicleIds: [], status: '', searched: false })
const repairs = ref([])

function fmtD(d)  { return fmtDateTh(d) }
function fmtDT(d) { return fmtDateTimeTh(d) }
function num(n)   { return n != null ? Number(n).toLocaleString() : '-' }
function rpLabel(s) { return { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ', COMPLETED: 'เสร็จสิ้น' }[s] ?? s }
function rpBadge(s) { return { PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-700/50', APPROVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-700/50', REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-700/50', COMPLETED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-700/50' }[s] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 ring-slate-200 dark:ring-slate-600' }

async function loadRepairs() {
  const p = new URLSearchParams()
  if (rp.value.startDate) p.set('startDate', rp.value.startDate)
  if (rp.value.endDate)   p.set('endDate',   rp.value.endDate)
  if (rp.value.status)    p.set('status',    rp.value.status)
  rp.value.vehicleIds.forEach(id => p.append('vehicleId', id))
  const res = await api.get('/repairs?' + p)
  repairs.value = res.data.requests || res.data.repairs || res.data || []
  rp.value.searched = true
}

async function exportRepairs() {
  const p = new URLSearchParams()
  if (rp.value.startDate) p.set('startDate', rp.value.startDate)
  if (rp.value.endDate)   p.set('endDate',   rp.value.endDate)
  if (rp.value.status)    p.set('status',    rp.value.status)
  rp.value.vehicleIds.forEach(id => p.append('vehicleId', id))
  window.open(`${BASE_URL}/api/export/repairs?${p}`, '_blank')
}

onMounted(async () => { vehicles.value = (await api.get('/vehicles')).data })
</script>
