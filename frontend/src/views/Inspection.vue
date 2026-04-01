<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-slate-800">บันทึกการตรวจเช็ค</h1>
      <p class="text-sm text-slate-400 mt-0.5">เลือกยานพาหนะและวันที่เพื่อเริ่มบันทึกการตรวจ</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <CalendarIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> วันที่ตรวจ
          </label>
          <div class="relative">
            <CalendarIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input v-model="inspectionDate" type="date"
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm shadow-sm hover:border-blue-300" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            <TruckIcon class="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" /> ยานพาหนะ
          </label>
          <AppSelect v-model="selectedVehicleId" :options="vehicleOptions" placeholder="-- เลือกยานพาหนะ --" :icon="TruckIcon" />
        </div>
        <div class="flex items-end">
          <button @click="loadExisting" :disabled="!selectedVehicleId || !inspectionDate"
            class="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]">
            <MagnifyingGlassIcon class="w-4 h-4 inline-block mr-1 -mt-0.5" />
            โหลดข้อมูล
          </button>
        </div>
      </div>
    </div>

    <!-- Checklist -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" v-if="selectedVehicleId && inspectionDate">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <ClipboardDocumentCheckIcon class="w-5 h-5 text-blue-500" />
          รายการตรวจเช็ค
          <span class="text-slate-400 font-normal text-sm">{{ checklistItems.length }} รายการ</span>
        </h3>
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-emerald-200"></span> ปกติ {{ normalCount }}</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-200"></span> ผิดปกติ {{ abnormalCount }}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="h-1 bg-slate-100">
        <div class="h-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- Mobile: Card layout -->
      <div class="sm:hidden divide-y divide-gray-50">
        <div v-for="item in checklistItems" :key="item.number" class="p-4">
          <div class="flex items-start gap-3 mb-3">
            <span :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
              item.status === 'ABNORMAL' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
            ]">{{ item.number }}</span>
            <span class="text-sm font-medium text-slate-700 leading-snug pt-1">{{ item.name }}</span>
          </div>
          <div class="flex gap-2 mb-2">
            <button @click="item.status = 'NORMAL'"
              :class="['flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5',
                item.status === 'NORMAL'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 active:scale-95']">
              <CheckCircleIcon class="w-4.5 h-4.5" /> ปกติ
            </button>
            <button @click="item.status = 'ABNORMAL'"
              :class="['flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 flex items-center justify-center gap-1.5',
                item.status === 'ABNORMAL'
                  ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-red-300 active:scale-95']">
              <XCircleIcon class="w-4.5 h-4.5" /> ผิดปกติ
            </button>
          </div>
          <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-32"
            leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 max-h-32" leave-to-class="opacity-0 max-h-0">
            <div v-if="item.status === 'ABNORMAL'" class="overflow-hidden">
              <textarea v-model="item.abnormalNote" rows="2"
                placeholder="ระบุรายละเอียดความผิดปกติ..."
                class="w-full px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none placeholder-red-300 mt-1"></textarea>
            </div>
          </transition>
        </div>
      </div>

      <!-- Desktop: Table layout -->
      <div class="hidden sm:block">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase w-14">ที่</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">รายละเอียดการตรวจสอบ</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase w-48">สถานะ</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in checklistItems" :key="item.number"
              :class="['transition-colors', item.status === 'ABNORMAL' ? 'bg-red-50/30' : 'hover:bg-slate-50/50']">
              <td class="text-center py-3 px-4">
                <span :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold mx-auto transition-colors',
                  item.status === 'ABNORMAL' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                ]">{{ item.number }}</span>
              </td>
              <td class="py-3 px-4 text-sm text-slate-700">{{ item.name }}</td>
              <td class="py-3 px-4">
                <div class="flex gap-1.5 justify-center">
                  <button @click="item.status = 'NORMAL'"
                    :class="['group px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1',
                      item.status === 'NORMAL'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-500']">
                    <CheckCircleIcon class="w-3.5 h-3.5" /> ปกติ
                  </button>
                  <button @click="item.status = 'ABNORMAL'"
                    :class="['group px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1',
                      item.status === 'ABNORMAL'
                        ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-200'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-500']">
                    <XCircleIcon class="w-3.5 h-3.5" /> ผิดปกติ
                  </button>
                </div>
              </td>
              <td class="py-3 px-4">
                <transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100">
                  <textarea v-if="item.status === 'ABNORMAL'" v-model="item.abnormalNote" rows="1"
                    placeholder="ระบุรายละเอียด..."
                    class="w-full px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none placeholder-red-300"></textarea>
                </transition>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Save button -->
      <div class="px-5 sm:px-6 py-4 bg-slate-50/50 border-t border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="text-xs text-slate-400">
            ปกติ <span class="font-bold text-emerald-500">{{ normalCount }}</span> · ผิดปกติ <span class="font-bold text-red-500">{{ abnormalCount }}</span> รายการ
          </div>
          <button @click="saveInspection" :disabled="saving"
            class="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold px-8 py-3 rounded-xl transition-all text-sm shadow-lg shadow-emerald-200/50 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
            <span v-if="saving" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              กำลังบันทึก...
            </span>
            <span v-else class="flex items-center gap-1.5">
              <CheckCircleIcon class="w-4.5 h-4.5" />
              {{ editingId ? 'อัพเดทการตรวจเช็ค' : 'บันทึกการตรวจเช็ค' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  CalendarIcon, TruckIcon, MagnifyingGlassIcon, ClipboardDocumentCheckIcon,
  CheckCircleIcon, XCircleIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalInfo } from '../stores/swal'

const route = useRoute()
const inspectionDate = ref(route.query.date || new Date().toISOString().slice(0, 10))
const selectedVehicleId = ref('')
const vehicles = ref([])
const saving = ref(false)
const editingId = ref(null)

const vehicleOptions = computed(() => vehicles.value.map(v => ({ value: v.id, label: `${v.type} - ${v.licensePlate}` })))

const ITEMS = [
  { number: 1, name: 'ปริมาณน้ำมันรถ' }, { number: 2, name: 'ปริมาณน้ำในหม้อน้ำ' },
  { number: 3, name: 'ความสะอาดของรถ' }, { number: 4, name: 'ระดับน้ำกลั่นจิ้วแบตเตอรี่ สายวัด' },
  { number: 5, name: 'ลายยางทิดสม' }, { number: 6, name: 'พวงมาลัย' },
  { number: 7, name: 'ความร้าวไฟหน้า / ไฟเลี้ยว ข้าง-หลัง' }, { number: 8, name: 'ไฟเบรค/ไฟหรี่/ไฟห้องโดย' },
  { number: 9, name: 'แตร' }, { number: 10, name: 'สภาพยางรถ (ยาง 4 ล้อ)' },
  { number: 11, name: 'ยางอะไหล่ และเครื่องมือเปลี่ยนยาง' }, { number: 12, name: 'ความดันลมยาง' },
  { number: 13, name: 'ระบบเบรคการทำงานของเบรค' }, { number: 14, name: 'ระดับน้ำมันเครื่อง' },
  { number: 15, name: 'น้ำมันเบรค' }, { number: 16, name: 'น้ำมันเกียร์' },
  { number: 17, name: 'ที่ปัดน้ำฝน/ใบปัดน้ำฝน' }, { number: 18, name: 'เครื่องกระจุกเครื่องทิดปกติ' },
  { number: 19, name: 'สิ่งของคืนรถ' }, { number: 20, name: 'ระบบแอร์ ความเย็นของแอร์' }
]

const checklistItems = ref(ITEMS.map(i => ({ ...i, status: 'NORMAL', abnormalNote: '' })))

const normalCount = computed(() => checklistItems.value.filter(i => i.status === 'NORMAL').length)
const abnormalCount = computed(() => checklistItems.value.filter(i => i.status === 'ABNORMAL').length)
const progressPercent = computed(() => (normalCount.value / checklistItems.value.length) * 100)

function resetChecklist() {
  checklistItems.value = ITEMS.map(i => ({ ...i, status: 'NORMAL', abnormalNote: '' }))
  editingId.value = null
}

async function loadExisting() {
  resetChecklist()
  try {
    const date = new Date(inspectionDate.value)
    const { data } = await api.get('/inspections', {
      params: { vehicleId: selectedVehicleId.value, month: date.getMonth() + 1, year: date.getFullYear() }
    })
    const existing = data.find(ins => new Date(ins.inspectionDate).toISOString().slice(0, 10) === inspectionDate.value)
    if (existing) {
      editingId.value = existing.id
      for (const detail of existing.details) {
        const item = checklistItems.value.find(i => i.number === detail.itemNumber)
        if (item) { item.status = detail.status; item.abnormalNote = detail.abnormalNote || '' }
      }
      swalInfo('พบข้อมูลเดิม สามารถแก้ไขได้')
    } else {
      swalInfo('เริ่มบันทึกใหม่')
    }
  } catch (err) { /* no existing data */ }
}

async function saveInspection() {
  saving.value = true
  try {
    const details = checklistItems.value.map(i => ({
      itemNumber: i.number, itemName: i.name, status: i.status,
      abnormalNote: i.status === 'ABNORMAL' ? i.abnormalNote : null
    }))
    if (editingId.value) {
      await api.put(`/inspections/${editingId.value}`, { userId: auth.user.id, details })
      await swalSuccess('อัพเดทสำเร็จ', 'บันทึกการแก้ไขเรียบร้อยแล้ว')
    } else {
      await api.post('/inspections', {
        vehicleId: Number(selectedVehicleId.value), userId: auth.user.id,
        inspectionDate: inspectionDate.value, details
      })
      await swalSuccess('บันทึกสำเร็จ', 'บันทึกการตรวจเช็คเรียบร้อยแล้ว')
    }
    // Reset form after successful save
    resetChecklist()
    selectedVehicleId.value = ''
    inspectionDate.value = new Date().toISOString().slice(0, 10)
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
  } finally { saving.value = false }
}

onMounted(async () => {
  try {
    vehicles.value = (await api.get('/vehicles')).data
    // Auto-load if coming from Reports edit
    if (route.query.vehicleId && route.query.date) {
      selectedVehicleId.value = Number(route.query.vehicleId)
      inspectionDate.value = route.query.date
      await loadExisting()
    }
  } catch (err) { console.error(err) }
})
</script>
