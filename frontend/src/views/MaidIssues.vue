<template>
  <div>
    <div class="relative bg-linear-to-r from-amber-500 to-orange-500 dark:from-amber-950 dark:to-orange-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-amber-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">รายงานปัญหา</h1>
            <p class="text-amber-100 text-xs mt-0.5">แจ้งและติดตามปัญหาในแต่ละพื้นที่</p>
          </div>
        </div>
        <button @click="openAdd" class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shrink-0">
          <PlusIcon class="w-4 h-4" /> แจ้งปัญหา
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-4 mb-4">
      <div class="flex flex-col gap-3">
        <div class="w-full">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">ช่วงเวลา</label>
          <AppDateFilter default-mode="all" @change="({ startDate, endDate }) => { filter.startDate = startDate; filter.endDate = endDate }" />
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-40">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">พื้นที่</label>
            <AppSelect v-model="filter.areaId" :options="areaOptions" placeholder="ทั้งหมด" :icon="MapPinIcon" />
          </div>
          <div class="flex-1 min-w-32">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">สถานะ</label>
            <AppSelect v-model="filter.status" :options="statusOptions" placeholder="ทั้งหมด" :icon="FunnelIcon" />
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="load" class="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5">
            <MagnifyingGlassIcon class="w-4 h-4" /> ค้นหา
          </button>
          <button @click="exportIssues" class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4" /><span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="issues.length" class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-amber-600">{{ issues.filter(i=>i.status==='OPEN').length }}</div>
        <div class="text-xs text-slate-400 mt-1">รอดำเนินการ</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600">{{ issues.filter(i=>i.status==='IN_PROGRESS').length }}</div>
        <div class="text-xs text-slate-400 mt-1">กำลังดำเนินการ</div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-emerald-600">{{ issues.filter(i=>i.status==='RESOLVED').length }}</div>
        <div class="text-xs text-slate-400 mt-1">แก้ไขแล้ว</div>
      </div>
    </div>

    <!-- List -->
    <div v-if="issues.length" class="space-y-3">
      <div v-for="issue in issues" :key="issue.id" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-slate-800 dark:text-white">{{ issue.title }}</div>
            <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span class="flex items-center gap-1"><MapPinIcon class="w-3 h-3" />{{ issue.area.name }}</span>
              <span>·</span>
              <span>{{ issue.user.displayName || issue.user.username }}</span>
              <span>·</span>
              <span>{{ fmtD(issue.createdAt) }}</span>
            </div>
          </div>
          <span :class="issueBadge(issue.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1 shrink-0">{{ issueLabel(issue.status) }}</span>
        </div>
        <div v-if="issue.description" class="text-sm text-slate-600 dark:text-slate-300 mb-3">{{ issue.description }}</div>
        <!-- Photos -->
        <div v-if="issue.photo1 || issue.photo2 || issue.photo3" class="flex gap-2 mb-3">
          <a v-for="(ph, i) in [issue.photo1, issue.photo2, issue.photo3].filter(Boolean)" :key="i" :href="BASE_URL + ph" target="_blank">
            <img :src="BASE_URL + ph" class="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-600" />
          </a>
        </div>
        <!-- Admin actions -->
        <div v-if="auth.isAdmin && issue.status !== 'RESOLVED'" class="flex gap-2">
          <button v-if="issue.status === 'OPEN'" @click="updateStatus(issue, 'IN_PROGRESS')" class="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold rounded-xl text-xs transition">กำลังดำเนินการ</button>
          <button @click="openResolve(issue)" class="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xl text-xs transition">แก้ไขแล้ว</button>
        </div>
        <div v-if="issue.status === 'RESOLVED' && issue.resolverNote" class="mt-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
          <span class="font-semibold">หมายเหตุ:</span> {{ issue.resolverNote }}
        </div>
      </div>
    </div>
    <div v-else-if="searched" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-16 text-center">
      <ExclamationTriangleIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-400">ไม่พบปัญหา</p>
    </div>

    <!-- Add Issue Modal -->
    <div v-if="addModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="addModal.show = false"></div>
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">แจ้งปัญหาใหม่</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">พื้นที่ *</label>
            <AppSelect v-model="addModal.areaId" :options="areaOptions.filter(o => o.value)" placeholder="เลือกพื้นที่" :icon="MapPinIcon" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">หัวข้อ *</label>
            <input v-model="addModal.title" type="text" placeholder="สรุปปัญหา" class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">รายละเอียด</label>
            <textarea v-model="addModal.description" rows="3" placeholder="อธิบายปัญหาเพิ่มเติม" class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"></textarea>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase mb-1 block">รูปภาพ (สูงสุด 3 รูป)</label>
            <input type="file" accept="image/*" multiple @change="onFilesChange" class="text-sm text-slate-500" />
          </div>
        </div>
        <div class="flex gap-2 mt-5">
          <button @click="addModal.show = false" class="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">ยกเลิก</button>
          <button @click="saveIssue" :disabled="saving" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">{{ saving ? 'กำลังบันทึก...' : 'ส่งรายงาน' }}</button>
        </div>
      </div>
    </div>

    <!-- Resolve Modal -->
    <div v-if="resolveModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="resolveModal.show = false"></div>
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">บันทึกการแก้ไข</h3>
        <textarea v-model="resolveModal.note" rows="3" placeholder="หมายเหตุการแก้ไข (ไม่บังคับ)" class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4"></textarea>
        <div class="flex gap-2">
          <button @click="resolveModal.show = false" class="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">ยกเลิก</button>
          <button @click="resolveIssue" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ExclamationTriangleIcon, PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, MapPinIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { fmtDateTh } from '../stores/date'

const BASE_URL = ``
const issues = ref([])
const searched = ref(false)
const saving = ref(false)
const areas = ref([])
const areaOptions = computed(() => [{ value: '', label: 'ทั้งหมด' }, ...areas.value.map(a => ({ value: a.id, label: a.name }))])
const statusOptions = [
  { value: 'OPEN', label: 'รอดำเนินการ' },
  { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
  { value: 'RESOLVED', label: 'แก้ไขแล้ว' },
]
const filter = ref({ startDate: null, endDate: null, areaId: '', status: '' })
const addModal = ref({ show: false, areaId: '', title: '', description: '', files: [] })
const resolveModal = ref({ show: false, issue: null, note: '' })

function fmtD(d) { return fmtDateTh(d) }
function issueLabel(s) { return { OPEN: 'รอดำเนินการ', IN_PROGRESS: 'กำลังดำเนินการ', RESOLVED: 'แก้ไขแล้ว' }[s] ?? s }
function issueBadge(s) { return { OPEN: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-700/50', IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-700/50', RESOLVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-700/50' }[s] ?? '' }

async function load() {
  const p = new URLSearchParams()
  if (filter.value.startDate) p.set('startDate', filter.value.startDate)
  if (filter.value.endDate) p.set('endDate', filter.value.endDate)
  if (filter.value.areaId) p.set('areaId', filter.value.areaId)
  if (filter.value.status) p.set('status', filter.value.status)
  p.set('limit', 200)
  const res = await api.get('/maid/issues?' + p)
  issues.value = res.data.issues || []
  searched.value = true
}

function openAdd() { addModal.value = { show: true, areaId: '', title: '', description: '', files: [] } }
function onFilesChange(e) { addModal.value.files = Array.from(e.target.files).slice(0, 3) }

async function saveIssue() {
  if (!addModal.value.areaId || !addModal.value.title) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('areaId', addModal.value.areaId)
    fd.append('userId', auth.user.id)
    fd.append('title', addModal.value.title)
    fd.append('description', addModal.value.description)
    addModal.value.files.forEach((f, i) => fd.append(`photo${i + 1}`, f))
    await api.post('/maid/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    addModal.value.show = false
    await load()
  } finally { saving.value = false }
}

async function updateStatus(issue, status) {
  await api.put('/maid/issues/' + issue.id, { status, userId: auth.user.id })
  await load()
}

function openResolve(issue) { resolveModal.value = { show: true, issue, note: '' } }
async function resolveIssue() {
  await api.put('/maid/issues/' + resolveModal.value.issue.id, {
    status: 'RESOLVED', resolvedById: auth.user.id, resolverNote: resolveModal.value.note, userId: auth.user.id
  })
  resolveModal.value.show = false
  await load()
}

function exportIssues() {
  const p = new URLSearchParams()
  if (filter.value.startDate) p.set('startDate', filter.value.startDate)
  if (filter.value.endDate) p.set('endDate', filter.value.endDate)
  if (filter.value.areaId) p.set('areaId', filter.value.areaId)
  if (filter.value.status) p.set('status', filter.value.status)
  window.open(`/api/maid/export/issues?${p}`, '_blank')
}

onMounted(async () => {
  areas.value = (await api.get('/maid/areas')).data
  await load()
})
</script>
