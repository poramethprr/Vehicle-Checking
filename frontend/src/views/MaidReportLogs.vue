<template>
  <div>
    <div class="relative bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-950 dark:to-teal-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-emerald-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <ClipboardDocumentListIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานบันทึกทำความสะอาด</h1>
          <p class="text-emerald-100 text-xs mt-0.5">ประวัติการทำความสะอาดทุกพื้นที่</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 mb-4">
      <div class="flex flex-col gap-3">
        <div class="w-full">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ช่วงเวลา</label>
          <AppDateFilter default-mode="month" @change="({ startDate, endDate }) => { filter.startDate = startDate; filter.endDate = endDate }" />
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-40">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">พื้นที่</label>
            <AppSelect v-model="filter.areaId" :options="areaOptions" placeholder="ทั้งหมด" :icon="MapPinIcon" />
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="load" class="flex-1 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="doExport" class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="searched" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ total }}</div>
        <div class="text-xs text-slate-400 mt-1">รายการทั้งหมด</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-teal-600">{{ uniqueAreas }}</div>
        <div class="text-xs text-slate-400 mt-1">พื้นที่ที่ทำความสะอาด</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm hidden sm:block">
        <div class="text-2xl font-bold text-purple-600">{{ uniqueUsers }}</div>
        <div class="text-xs text-slate-400 mt-1">ผู้บันทึก</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden" v-if="logs.length">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">วันที่/เวลา</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">พื้นที่</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ผู้บันทึก</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">หมายเหตุ</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">รูป</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="l in logs" :key="l.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{{ fmtDT(l.createdAt) }}</td>
              <td class="py-3 px-4">
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ l.area.name }}</div>
                <div class="text-xs text-slate-400">{{ l.area.location }}</div>
              </td>
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{{ l.user.displayName || l.user.username }}</td>
              <td class="py-3 px-4 text-sm text-slate-500 max-w-40 truncate">{{ l.note || '-' }}</td>
              <td class="py-3 px-4 text-center">
                <a v-if="l.photo" :href="l.photo" target="_blank" class="text-purple-500 hover:text-purple-700 transition">
                  <PhotoIcon class="w-5 h-5 mx-auto" />
                </a>
                <span v-else class="text-slate-300 dark:text-slate-600">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="l in logs" :key="l.id" class="px-4 py-3">
          <div class="flex justify-between items-start mb-0.5">
            <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ l.area.name }}</span>
            <span class="text-xs text-slate-400">{{ fmtDT(l.createdAt) }}</span>
          </div>
          <div class="text-xs text-slate-400">{{ l.area.location }} · {{ l.user.displayName || l.user.username }}</div>
          <div v-if="l.note" class="text-xs text-slate-500 mt-0.5">{{ l.note }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="searched" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-16 text-center">
      <ClipboardDocumentListIcon class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-slate-400">ไม่พบบันทึกการทำความสะอาด</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ClipboardDocumentListIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, MapPinIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { fmtDateTimeTh } from '../stores/date'

const logs = ref([])
const total = ref(0)
const searched = ref(false)
const areas = ref([])
const areaOptions = computed(() => [{ value: '', label: 'ทั้งหมด' }, ...areas.value.map(a => ({ value: a.id, label: a.name }))])

const now = new Date()
const todayStr = now.toISOString().slice(0, 10)
const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
const filter = ref({ startDate: monthStart, endDate: todayStr, areaId: '' })

const uniqueAreas = computed(() => new Set(logs.value.map(l => l.areaId)).size)
const uniqueUsers = computed(() => new Set(logs.value.map(l => l.userId)).size)

function fmtDT(d) { return fmtDateTimeTh(d) }

async function load() {
  const p = new URLSearchParams()
  if (filter.value.startDate) p.set('startDate', filter.value.startDate)
  if (filter.value.endDate) p.set('endDate', filter.value.endDate)
  if (filter.value.areaId) p.set('areaId', filter.value.areaId)
  p.set('limit', 500)
  const res = await api.get('/maid/logs?' + p)
  logs.value = res.data.logs || []
  total.value = res.data.total || 0
  searched.value = true
}

function doExport() {
  const p = new URLSearchParams()
  if (filter.value.startDate) p.set('startDate', filter.value.startDate)
  if (filter.value.endDate) p.set('endDate', filter.value.endDate)
  if (filter.value.areaId) p.set('areaId', filter.value.areaId)
  window.open(`/api/maid/export/logs?${p}`, '_blank')
}

onMounted(async () => {
  areas.value = (await api.get('/maid/areas')).data
  await load()
})
</script>
