<template>
  <div class="flex flex-col gap-2 w-full">
    <!-- Mode toggle -->
    <div class="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden w-full">
      <button v-for="m in MODES" :key="m.value" @click="setMode(m.value)"
        :class="[
          'flex-1 px-2 py-2 text-sm font-semibold transition border-r last:border-r-0 border-slate-200 dark:border-slate-600 whitespace-nowrap text-center',
          mode === m.value
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
        ]">
        {{ m.label }}
      </button>
    </div>

    <!-- รายวัน: from–to date range -->
    <template v-if="mode === 'day'">
      <div class="flex items-center gap-2 w-full">
        <input type="date" v-model="dayFrom" :class="[inputCls, 'flex-1']" />
        <span class="text-slate-400 dark:text-slate-500 text-sm font-medium shrink-0">ถึง</span>
        <input type="date" v-model="dayTo" :min="dayFrom" :class="[inputCls, 'flex-1']" />
      </div>
    </template>

    <!-- รายเดือน: month + year -->
    <template v-if="mode === 'month'">
      <div class="flex gap-2 w-full">
        <div class="flex-1">
          <AppSelect v-model="month" :options="monthOptions" :allow-empty="false" :icon="CalendarDaysIcon" :compact="true" />
        </div>
        <div class="w-28">
          <AppSelect v-model="year" :options="yearOptions" :allow-empty="false" :compact="true" />
        </div>
      </div>
    </template>

    <!-- รายปี: year only -->
    <template v-if="mode === 'year'">
      <div class="w-full">
        <AppSelect v-model="year" :options="yearOptions" :allow-empty="false" :compact="true" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import AppSelect from './AppSelect.vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  defaultMode: { type: String, default: 'month' }
})
const emit = defineEmits(['change'])

const inputCls = 'px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:border-blue-400 dark:[color-scheme:dark]'

const MODES = [
  { value: 'all',   label: 'ทั้งหมด' },
  { value: 'day',   label: 'รายวัน' },
  { value: 'month', label: 'รายเดือน' },
  { value: 'year',  label: 'รายปี' },
]

const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

const now      = new Date()
const today    = now.toISOString().slice(0, 10)
const yearList = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i)

const mode    = ref(props.defaultMode)
const dayFrom = ref(today)
const dayTo   = ref(today)
const month   = ref(now.getMonth() + 1)
const year    = ref(now.getFullYear())

const monthOptions = THAI_MONTHS.map((m, i) => ({ value: i + 1, label: m }))
const yearOptions  = yearList.map(y => ({ value: y, label: String(y) }))

function computeDates() {
  if (mode.value === 'all') {
    return { startDate: null, endDate: null, label: 'ทั้งหมด' }
  }
  if (mode.value === 'day') {
    const from = new Date(dayFrom.value + 'T00:00:00')
    const label = dayFrom.value === dayTo.value
      ? from.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
      : `${dayFrom.value}_ถึง_${dayTo.value}`
    return { startDate: dayFrom.value, endDate: dayTo.value, label }
  }
  const y = Number(year.value)
  if (mode.value === 'month') {
    const m = Number(month.value)
    const lastDay = new Date(y, m, 0).getDate()
    return {
      startDate: `${y}-${String(m).padStart(2,'0')}-01`,
      endDate:   `${y}-${String(m).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`,
      label:     `${THAI_MONTHS[m - 1]}_${y}`
    }
  }
  return { startDate: `${y}-01-01`, endDate: `${y}-12-31`, label: `ปี${y}` }
}

function emitChange() { emit('change', computeDates()) }
function setMode(m) { mode.value = m; emitChange() }

watch([dayFrom, dayTo, month, year], emitChange)
onMounted(emitChange)
</script>

<style>
.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) brightness(0.8);
  cursor: pointer;
}
</style>
