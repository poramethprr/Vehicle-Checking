<template>
  <div>
    <div class="relative bg-linear-to-r from-violet-600 to-purple-600 dark:from-violet-950 dark:to-purple-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-violet-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <ChartBarIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">รายงานสรุป</h1>
          <p class="text-violet-100 text-xs mt-0.5">สรุปการทำความสะอาดรายพื้นที่</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 mb-4">
      <div class="flex flex-col gap-3">
        <div class="w-full">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ช่วงเวลา</label>
          <AppDateFilter default-mode="month" @change="onDateChange" />
        </div>
        <div class="flex gap-2">
          <button @click="load" class="flex-1 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="exportSummary" class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Overall Stats -->
    <div v-if="rows.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-purple-600">{{ rows.length }}</div>
        <div class="text-xs text-slate-400 mt-1">พื้นที่</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ rows.reduce((s,r) => s + r.logs, 0) }}</div>
        <div class="text-xs text-slate-400 mt-1">บันทึกรวม</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-amber-600">{{ rows.reduce((s,r) => s + r.openIssues, 0) }}</div>
        <div class="text-xs text-slate-400 mt-1">ปัญหาค้างอยู่</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600">{{ rows.reduce((s,r) => s + r.totalIssues, 0) }}</div>
        <div class="text-xs text-slate-400 mt-1">ปัญหาทั้งหมด</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden" v-if="rows.length">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">พื้นที่</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">สถานที่</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">บันทึก</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ปัญหาทั้งหมด</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">แก้ไขแล้ว</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ค้างอยู่</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="r in rows" :key="r.areaId" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{{ r.name }}</td>
              <td class="py-3 px-4 text-sm text-slate-500">{{ r.location || '-' }}</td>
              <td class="py-3 px-4 text-right font-semibold text-emerald-600">{{ r.logs }}</td>
              <td class="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{{ r.totalIssues }}</td>
              <td class="py-3 px-4 text-right text-emerald-600">{{ r.resolvedIssues }}</td>
              <td class="py-3 px-4 text-right" :class="r.openIssues ? 'text-amber-600 font-semibold' : 'text-slate-400'">{{ r.openIssues }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="r in rows" :key="r.areaId" class="px-4 py-3">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ r.name }}</span>
            <span class="text-emerald-600 font-bold text-sm">{{ r.logs }} บันทึก</span>
          </div>
          <div class="text-xs text-slate-400">{{ r.location }}</div>
          <div class="text-xs text-slate-500 mt-1">ปัญหา: {{ r.totalIssues }} รวม · <span class="text-amber-600">{{ r.openIssues }} ค้างอยู่</span></div>
        </div>
      </div>
    </div>
    <div v-else-if="searched" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-16 text-center">
      <ChartBarIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-400">ไม่พบข้อมูล</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ChartBarIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'

const rows = ref([])
const searched = ref(false)
const filter = ref({ startDate: null, endDate: null })

function onDateChange({ startDate, endDate }) {
  filter.value.startDate = startDate
  filter.value.endDate = endDate
}

async function load() {
  const p = new URLSearchParams()
  if (filter.value.startDate) p.set('startDate', filter.value.startDate)
  if (filter.value.endDate) p.set('endDate', filter.value.endDate)

  const areas = (await api.get('/maid/areas')).data
  const result = []
  for (const area of areas) {
    const lp = new URLSearchParams(p)
    lp.set('areaId', area.id)
    lp.set('limit', 1)
    const [logsRes, issuesRes] = await Promise.all([
      api.get('/maid/logs?' + lp),
      api.get('/maid/issues?' + lp)
    ])
    const allIssues = issuesRes.data.issues || []
    result.push({
      areaId: area.id,
      name: area.name,
      location: area.location,
      logs: logsRes.data.total || 0,
      totalIssues: allIssues.length,
      resolvedIssues: allIssues.filter(i => i.status === 'RESOLVED').length,
      openIssues: allIssues.filter(i => i.status !== 'RESOLVED').length,
    })
  }
  rows.value = result
  searched.value = true
}

function exportSummary() {
  const p = new URLSearchParams()
  if (filter.value.startDate) p.set('startDate', filter.value.startDate)
  if (filter.value.endDate) p.set('endDate', filter.value.endDate)
  window.open(`/api/maid/export/summary?${p}`, '_blank')
}

onMounted(load)
</script>
