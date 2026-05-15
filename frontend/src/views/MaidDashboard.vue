<template>
  <div>
    <div class="relative bg-linear-to-r from-purple-600 to-fuchsia-500 dark:from-purple-950 dark:to-fuchsia-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-purple-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <SparklesIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-white">ระบบงานแม่บ้าน</h1>
          <p class="text-purple-100 text-xs mt-0.5">ภาพรวมการทำความสะอาดและสถานะพื้นที่</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-purple-600">{{ stats.areas }}</div>
        <div class="text-xs text-slate-400 mt-1">พื้นที่ทั้งหมด</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ stats.logsToday }}</div>
        <div class="text-xs text-slate-400 mt-1">บันทึกวันนี้</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-amber-600">{{ stats.openIssues }}</div>
        <div class="text-xs text-slate-400 mt-1">ปัญหารอดำเนินการ</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600">{{ stats.logsMonth }}</div>
        <div class="text-xs text-slate-400 mt-1">บันทึกเดือนนี้</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Recent Logs -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <span class="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
            บันทึกล่าสุด
          </span>
          <router-link to="/maid/logs" class="text-xs text-purple-600 dark:text-purple-400 hover:underline">ดูทั้งหมด</router-link>
        </div>
        <div v-if="recentLogs.length" class="divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="l in recentLogs" :key="l.id" class="px-5 py-3 flex items-center gap-3">
            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircleIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ l.area.name }}</div>
              <div class="text-xs text-slate-400">{{ l.area.location }} · {{ l.user.displayName || l.user.username }}</div>
            </div>
            <div class="text-xs text-slate-400 shrink-0">{{ fmtDT(l.createdAt) }}</div>
          </div>
        </div>
        <div v-else class="px-5 py-8 text-center text-slate-400 text-sm">ยังไม่มีบันทึก</div>
      </div>

      <!-- Open Issues -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <span class="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
            ปัญหาที่รอดำเนินการ
          </span>
          <router-link to="/maid/issues" class="text-xs text-purple-600 dark:text-purple-400 hover:underline">ดูทั้งหมด</router-link>
        </div>
        <div v-if="openIssues.length" class="divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="issue in openIssues" :key="issue.id" class="px-5 py-3 flex items-center gap-3">
            <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ issue.title }}</div>
              <div class="text-xs text-slate-400">{{ issue.area.name }} · {{ issue.user.displayName || issue.user.username }}</div>
            </div>
            <span :class="issueBadge(issue.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1 shrink-0">{{ issueLabel(issue.status) }}</span>
          </div>
        </div>
        <div v-else class="px-5 py-8 text-center text-emerald-500 text-sm font-medium">ไม่มีปัญหาค้างอยู่</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import api from '../stores/api'
import { fmtDateTimeTh } from '../stores/date'

const stats = ref({ areas: 0, logsToday: 0, openIssues: 0, logsMonth: 0 })
const recentLogs = ref([])
const openIssues = ref([])

function fmtDT(d) { return fmtDateTimeTh(d) }
function issueLabel(s) { return { OPEN: 'รอดำเนินการ', IN_PROGRESS: 'กำลังดำเนินการ', RESOLVED: 'แก้ไขแล้ว' }[s] ?? s }
function issueBadge(s) { return { OPEN: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-700/50', IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-700/50', RESOLVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-700/50' }[s] ?? '' }

onMounted(async () => {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const monthEnd = todayStr

  const [areas, logsToday, logsMonth, issues] = await Promise.all([
    api.get('/maid/areas'),
    api.get(`/maid/logs?startDate=${todayStr}&endDate=${todayStr}&limit=5`),
    api.get(`/maid/logs?startDate=${monthStart}&endDate=${monthEnd}&limit=1`),
    api.get('/maid/issues?limit=5'),
  ])

  stats.value.areas = areas.data.length
  stats.value.logsToday = logsToday.data.total
  stats.value.logsMonth = logsMonth.data.total
  stats.value.openIssues = issues.data.issues.filter(i => i.status !== 'RESOLVED').length
  recentLogs.value = logsToday.data.logs
  openIssues.value = issues.data.issues.filter(i => i.status !== 'RESOLVED').slice(0, 5)
})
</script>
