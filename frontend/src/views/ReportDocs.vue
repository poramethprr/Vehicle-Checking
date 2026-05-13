<template>
  <div>
    <div class="relative bg-linear-to-r from-emerald-500 to-teal-500 dark:from-emerald-950 dark:to-teal-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-emerald-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <DocumentTextIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานเอกสารยานพาหนะ</h1>
          <p class="text-emerald-100 text-xs mt-0.5">ติดตามสถานะ พ.ร.บ. ภาษี และประกันของยานพาหนะ</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 sm:p-5 mb-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">กรองสถานะ</label>
          <AppSelect v-model="vd.docFilter" :options="docFilterOptions" placeholder="ทั้งหมด" :icon="FunnelIcon" /></div>
        <div><label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ค้นหา</label>
          <input v-model="vd.search" placeholder="ทะเบียน, ประเภท..." class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-700 dark:text-white" /></div>
        <div class="flex items-end gap-2 col-span-2">
          <button @click="exportVehicleDocs" class="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Summary pills -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl p-4 text-center">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ vdStats.expired }}</div>
        <div class="text-xs text-red-500 dark:text-red-400 mt-1">เอกสารหมดอายุ</div>
      </div>
      <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-4 text-center">
        <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ vdStats.warning }}</div>
        <div class="text-xs text-amber-500 dark:text-amber-400 mt-1">ใกล้หมดอายุ (≤30 วัน)</div>
      </div>
      <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 text-center">
        <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ vdStats.ok }}</div>
        <div class="text-xs text-emerald-500 dark:text-emerald-400 mt-1">ปกติ</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ทะเบียน</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">พ.ร.บ.</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">เบอร์ พ.ร.บ.</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ภาษี</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ประกัน</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">เบอร์ประกัน</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="v in filteredVehicleDocs" :key="v.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 text-sm font-medium text-slate-800 dark:text-white">{{ v.type }}</td>
              <td class="py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200">{{ v.licensePlate }}</td>
              <td class="py-3 px-4 text-center">
                <div class="flex flex-col items-center gap-0.5">
                  <span :class="expiryChip(v.prbExpiry)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ expiryLabel(v.prbExpiry) }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ v.prbExpiry ? fmtD(v.prbExpiry) : '' }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-xs text-blue-600">
                <a v-if="v.prbContact" :href="`tel:${v.prbContact}`" class="hover:underline flex items-center gap-1"><PhoneIcon class="w-3 h-3" />{{ v.prbContact }}</a>
                <span v-else class="text-slate-300 dark:text-slate-600">-</span>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex flex-col items-center gap-0.5">
                  <span :class="expiryChip(v.taxRenewalDate)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ expiryLabel(v.taxRenewalDate) }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ v.taxRenewalDate ? fmtD(v.taxRenewalDate) : '' }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex flex-col items-center gap-0.5">
                  <span :class="expiryChip(v.insExpiry)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ expiryLabel(v.insExpiry) }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ v.insExpiry ? fmtD(v.insExpiry) : '' }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-xs text-blue-600">
                <a v-if="v.insContact" :href="`tel:${v.insContact}`" class="hover:underline flex items-center gap-1"><PhoneIcon class="w-3 h-3" />{{ v.insContact }}</a>
                <span v-else class="text-slate-300 dark:text-slate-600">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="v in filteredVehicleDocs" :key="v.id" class="px-4 py-3">
          <div class="font-semibold text-sm text-slate-800 dark:text-white mb-2">{{ v.licensePlate }} <span class="font-normal text-slate-400 dark:text-slate-500">{{ v.type }}</span></div>
          <div class="flex gap-1.5 flex-wrap">
            <span :class="expiryChip(v.prbExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">พ.ร.บ. {{ expiryLabel(v.prbExpiry) }}</span>
            <span :class="expiryChip(v.taxRenewalDate)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">ภาษี {{ expiryLabel(v.taxRenewalDate) }}</span>
            <span :class="expiryChip(v.insExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">ประกัน {{ expiryLabel(v.insExpiry) }}</span>
          </div>
        </div>
      </div>
      <AppEmpty v-if="!filteredVehicleDocs.length" :icon="DocumentTextIcon" title="ไม่พบยานพาหนะ" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DocumentTextIcon, FunnelIcon, ArrowDownTrayIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'
import { fmtDateTh } from '../stores/date'

const BASE_URL = `http://${window.location.hostname}:8099`
const docFilterOptions = [{ value: 'expired', label: 'หมดอายุ' }, { value: 'warning', label: 'ใกล้หมด (≤30 วัน)' }, { value: 'ok', label: 'ปกติ' }]

const vd = ref({ docFilter: '', search: '' })
const vehicleDocs = ref([])

function fmtD(d) { return fmtDateTh(d) }

function expiryStatus(d) {
  if (!d) return 'none'
  const days = Math.floor((new Date(d) - new Date()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 30) return 'warning'
  return 'ok'
}
function expiryChip(d) {
  return { none: 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500', expired: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', ok: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }[expiryStatus(d)]
}
function expiryLabel(d) {
  const s = expiryStatus(d)
  if (s === 'none') return '-'
  const days = Math.floor((new Date(d) - new Date()) / 86400000)
  if (s === 'expired') return 'หมดแล้ว'
  if (s === 'warning') return `${days} วัน`
  return 'ปกติ'
}

const filteredVehicleDocs = computed(() => {
  let r = vehicleDocs.value
  if (vd.value.docFilter) r = r.filter(v => expiryStatus(v.prbExpiry) === vd.value.docFilter || expiryStatus(v.taxRenewalDate) === vd.value.docFilter || expiryStatus(v.insExpiry) === vd.value.docFilter)
  if (vd.value.search) {
    const q = vd.value.search.toLowerCase()
    r = r.filter(v => v.licensePlate.toLowerCase().includes(q) || v.type.toLowerCase().includes(q))
  }
  return r
})

const vdStats = computed(() => {
  const check = v => [expiryStatus(v.prbExpiry), expiryStatus(v.taxRenewalDate), expiryStatus(v.insExpiry)]
  return {
    expired: vehicleDocs.value.filter(v => check(v).includes('expired')).length,
    warning: vehicleDocs.value.filter(v => !check(v).includes('expired') && check(v).includes('warning')).length,
    ok:      vehicleDocs.value.filter(v => check(v).every(s => s === 'ok')).length,
  }
})

async function exportVehicleDocs() {
  const p = new URLSearchParams()
  if (vd.value.docFilter) p.set('docFilter', vd.value.docFilter)
  window.open(`${BASE_URL}/api/export/vehicles-docs?${p}`, '_blank')
}

onMounted(async () => { vehicleDocs.value = (await api.get('/vehicles')).data })
</script>
