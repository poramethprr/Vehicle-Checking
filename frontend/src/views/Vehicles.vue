<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">จัดการยานพาหนะ</h1>
        <p class="text-sm text-slate-400 mt-0.5">Vehicle Management — ข้อมูลยานพาหนะ, พ.ร.บ., ประกัน</p>
      </div>
      <div class="flex gap-2 self-start">
        <button @click="openForm(null)"
          class="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-1.5">
          <PlusCircleIcon class="w-4 h-4" /> เพิ่ม
        </button>
        <button @click="exportVehicles"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-1.5">
          <ArrowDownTrayIcon class="w-4 h-4" /> Export
        </button>
        <label class="bg-slate-500 hover:bg-slate-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-1.5">
          <ArrowUpTrayIcon class="w-4 h-4" /> Import
          <input type="file" accept=".xlsx,.xls" @change="importVehicles" class="hidden" />
        </label>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-5 overflow-visible">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input v-model="searchQuery" placeholder="ค้นหาทะเบียน, ประเภท, เลขตัวถัง, เลขเครื่อง..."
            class="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none text-sm transition" />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <XCircleIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="flex gap-2">
          <div class="w-36">
            <AppSelect v-model="filterStatus" :options="statusOptions" placeholder="สถานะทั้งหมด" :icon="FunnelIcon" />
          </div>
          <div class="w-36" v-if="vehicleTypes.length > 1">
            <AppSelect v-model="filterType" :options="typeOptions" placeholder="ประเภททั้งหมด" :icon="TruckIcon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-100">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <TruckIcon class="w-5 h-5 text-blue-500" /> รายการยานพาหนะ
          <span class="text-sm font-normal text-slate-400">{{ filteredVehicles.length }}/{{ vehicles.length }}</span>
        </h3>
      </div>

      <!-- Mobile: Cards -->
      <div class="sm:hidden divide-y divide-gray-50" v-if="filteredVehicles.length">
        <div v-for="v in filteredVehicles" :key="v.id" class="px-4 py-3.5">
          <div class="flex items-center gap-3 mb-2">
            <div :class="statusColor(v.status)" class="w-10 h-10 rounded-xl flex items-center justify-center">
              <TruckIcon class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800">{{ v.licensePlate }}</div>
              <div class="text-xs text-slate-400">{{ v.type }} · {{ statusLabel(v.status) }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mb-3 pl-13">
            <div v-if="v.chassisNumber"><span class="text-slate-400">ตัวถัง:</span> {{ v.chassisNumber }}</div>
            <div v-if="v.engineNumber"><span class="text-slate-400">เครื่อง:</span> {{ v.engineNumber }}</div>
            <div v-if="v.currentMileage"><span class="text-slate-400">ไมล์:</span> {{ num(v.currentMileage) }}</div>
            <div v-if="v.taxRenewalDate"><span class="text-slate-400">ต่อภาษี:</span> {{ fmtDate(v.taxRenewalDate) }}</div>
          </div>
          <div class="flex gap-2">
            <button @click="openForm(v)" class="flex-1 flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold py-2 rounded-xl transition ring-1 ring-amber-200">
              <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button @click="openDetail(v)" class="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold py-2 rounded-xl transition ring-1 ring-blue-200">
              <EyeIcon class="w-3.5 h-3.5" /> ดูข้อมูล
            </button>
            <button @click="confirmDelete(v)" class="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2 px-3 rounded-xl transition ring-1 ring-red-200">
              <TrashIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop: Table -->
      <div class="hidden sm:block overflow-x-auto" v-if="filteredVehicles.length">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50">
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ยานพาหนะ</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ทะเบียน</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">เลขตัวถัง</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">เลขเครื่อง</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ไมล์ปัจจุบัน</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">สถานะ</th>
            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ต่อภาษี</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">จัดการ</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="v in filteredVehicles" :key="v.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4"><div class="flex items-center gap-2">
                <div :class="statusColor(v.status)" class="w-8 h-8 rounded-lg flex items-center justify-center">
                  <TruckIcon class="w-4 h-4" />
                </div>
                <span class="text-sm font-medium text-slate-800">{{ v.type }}</span>
              </div></td>
              <td class="py-3 px-4 text-sm font-semibold text-slate-700">{{ v.licensePlate }}</td>
              <td class="py-3 px-4 text-xs text-slate-500">{{ v.chassisNumber || '-' }}</td>
              <td class="py-3 px-4 text-xs text-slate-500">{{ v.engineNumber || '-' }}</td>
              <td class="py-3 px-4 text-sm text-right text-slate-600">{{ v.currentMileage ? num(v.currentMileage) : '-' }}</td>
              <td class="py-3 px-4 text-center">
                <span :class="statusBadge(v.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full">{{ statusLabel(v.status) }}</span>
              </td>
              <td class="py-3 px-4 text-center text-xs text-slate-500">{{ v.taxRenewalDate ? fmtDate(v.taxRenewalDate) : '-' }}</td>
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <button @click="openDetail(v)" class="text-blue-600 hover:bg-blue-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1"><EyeIcon class="w-3.5 h-3.5" /></button>
                <button @click="openForm(v)" class="text-amber-600 hover:bg-amber-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1"><PencilSquareIcon class="w-3.5 h-3.5" /></button>
                <button @click="confirmDelete(v)" class="text-red-600 hover:bg-red-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1"><TrashIcon class="w-3.5 h-3.5" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppEmpty v-if="!filteredVehicles.length && vehicles.length" :icon="MagnifyingGlassIcon" title="ไม่พบยานพาหนะ" subtitle="ลองเปลี่ยนคำค้นหาหรือตัวกรอง" />
      <AppEmpty v-if="!vehicles.length" :icon="TruckIcon" title="ยังไม่มียานพาหนะ" subtitle="กดปุ่ม 'เพิ่มยานพาหนะ' เพื่อเริ่มต้น" />
    </div>

    <!-- Detail Modal -->
    <TransitionRoot :show="!!detailVehicle" as="template">
      <Dialog @close="detailVehicle = null" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
                <DialogTitle class="font-bold text-slate-800">ข้อมูลยานพาหนะ</DialogTitle>
                <button @click="detailVehicle = null" class="p-1 hover:bg-slate-100 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4" v-if="detailVehicle">
                <div class="flex items-center gap-3 mb-2">
                  <div :class="statusColor(detailVehicle.status)" class="w-12 h-12 rounded-xl flex items-center justify-center"><TruckIcon class="w-6 h-6" /></div>
                  <div>
                    <div class="font-bold text-lg text-slate-800">{{ detailVehicle.licensePlate }}</div>
                    <div class="text-sm text-slate-400">{{ detailVehicle.type }}</div>
                  </div>
                  <span :class="statusBadge(detailVehicle.status)" class="ml-auto text-xs font-semibold px-3 py-1 rounded-full">{{ statusLabel(detailVehicle.status) }}</span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <InfoItem label="เลขตัวถัง" :value="detailVehicle.chassisNumber" />
                  <InfoItem label="เลขเครื่องยนต์" :value="detailVehicle.engineNumber" />
                  <InfoItem label="ไมล์ปัจจุบัน" :value="detailVehicle.currentMileage ? num(detailVehicle.currentMileage) : null" />
                  <InfoItem label="ไมล์ครั้งต่อไป" :value="detailVehicle.nextMileage ? num(detailVehicle.nextMileage) : null" />
                  <InfoItem label="ระยะที่เกิน" :value="detailVehicle.overMileage ? num(detailVehicle.overMileage) : null" />
                  <InfoItem label="รอบต่อภาษี" :value="detailVehicle.taxRenewalDate ? fmtDate(detailVehicle.taxRenewalDate) : null" />
                </div>

                <div v-if="detailVehicle.note" class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">
                  <span class="font-semibold">หมายเหตุ:</span> {{ detailVehicle.note }}
                </div>

                <div class="border-t pt-4">
                  <h4 class="font-semibold text-slate-700 text-sm mb-2">พ.ร.บ.</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <BoolItem label="LMG" :val="detailVehicle.prbLmg" />
                    <BoolItem label="วิริยะ" :val="detailVehicle.prbViriya" />
                    <BoolItem label="อาคเนย์" :val="detailVehicle.prbAkney" />
                    <BoolItem label="เทเวศ" :val="detailVehicle.prbThewet" />
                    <BoolItem label="ประกันคุ้มภัย" :val="detailVehicle.prbInsurance" />
                    <BoolItem label="กรุงเทพประกันภัย" :val="detailVehicle.prbBangkokInsurance" />
                    <BoolItem label="ทำประกันภัย" :val="detailVehicle.prbThirdParty" />
                    <InfoItem label="วันหมดอายุ พ.ร.บ." :value="detailVehicle.prbExpiry ? fmtDate(detailVehicle.prbExpiry) : null" />
                    <InfoItem label="ต่อภาษี" :value="detailVehicle.prbTaxDate ? fmtDate(detailVehicle.prbTaxDate) : null" />
                    <InfoItem label="วัน พ.ร.บ." :value="detailVehicle.prbDate ? fmtDate(detailVehicle.prbDate) : null" />
                  </div>
                </div>

                <div class="border-t pt-4">
                  <h4 class="font-semibold text-slate-700 text-sm mb-2">รอบต่อประกัน</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <BoolItem label="LMG" :val="detailVehicle.insLmg" />
                    <BoolItem label="วิริยะ" :val="detailVehicle.insViriya" />
                    <BoolItem label="ไทยประกัน" :val="detailVehicle.insThaiInsurance" />
                    <BoolItem label="ประกันคุ้มภัย" :val="detailVehicle.insInsurance" />
                    <BoolItem label="อาคเนย์" :val="detailVehicle.insAkney" />
                    <BoolItem label="เทเวศ" :val="detailVehicle.insThewet" />
                    <BoolItem label="กรุงเทพประกันภัย" :val="detailVehicle.insBangkokInsurance" />
                    <InfoItem label="อาคเนย์" :value="detailVehicle.insDate ? fmtDate(detailVehicle.insDate) : null" />
                    <InfoItem label="เทวด" :value="detailVehicle.insTaxDate ? fmtDate(detailVehicle.insTaxDate) : null" />
                    <InfoItem label="วันหมด" :value="detailVehicle.insExpiry ? fmtDate(detailVehicle.insExpiry) : null" />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Add/Edit Modal -->
    <TransitionRoot :show="showFormModal" as="template">
      <Dialog @close="showFormModal = false" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800">{{ editingVehicle ? 'แก้ไขยานพาหนะ' : 'เพิ่มยานพาหนะใหม่' }}</DialogTitle>
                <button @click="showFormModal = false" class="p-1 hover:bg-slate-100 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-5">
                <!-- ข้อมูลทั่วไป -->
                <fieldset>
                  <legend class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5"><TruckIcon class="w-4 h-4 text-blue-500" /> ข้อมูลทั่วไป</legend>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput v-model="form.type" label="ประเภทรถ" placeholder="เช่น รถตู้" required />
                    <FormInput v-model="form.licensePlate" label="ทะเบียน" placeholder="เช่น กข 1234" required />
                    <FormInput v-model="form.chassisNumber" label="เลขตัวถัง" placeholder="VIN" />
                    <FormInput v-model="form.engineNumber" label="เลขเครื่องยนต์" />
                    <FormInput v-model="form.currentMileage" label="ไมล์ปัจจุบัน" type="number" />
                    <FormInput v-model="form.nextMileage" label="ไมล์ครั้งต่อไป" type="number" />
                    <FormInput v-model="form.overMileage" label="ระยะที่เกิน" type="number" />
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">สถานะ</label>
                      <AppSelect v-model="form.status" :options="vehicleStatusOptions" :allow-empty="false" />
                    </div>
                    <FormInput v-model="form.taxRenewalDate" label="รอบต่อภาษี" type="date" />
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">หมายเหตุ</label>
                      <AppEditor v-model="form.note" placeholder="หมายเหตุเพิ่มเติม..." height="120px" />
                    </div>
                  </div>
                </fieldset>

                <!-- พ.ร.บ. -->
                <fieldset class="border-t pt-4">
                  <legend class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5"><DocumentTextIcon class="w-4 h-4 text-amber-500" /> พ.ร.บ.</legend>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheck v-model="form.prbLmg" label="LMG" />
                    <FormCheck v-model="form.prbViriya" label="วิริยะ" />
                    <FormCheck v-model="form.prbAkney" label="อาคเนย์" />
                    <FormCheck v-model="form.prbThewet" label="เทเวศ" />
                    <FormCheck v-model="form.prbInsurance" label="ประกันคุ้มภัย" />
                    <FormCheck v-model="form.prbBangkokInsurance" label="กรุงเทพประกันภัย" />
                    <FormCheck v-model="form.prbThirdParty" label="ทำประกันภัย" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <FormInput v-model="form.prbTaxDate" label="ต่อภาษี" type="date" />
                    <FormInput v-model="form.prbExpiry" label="วันหมดอายุ พ.ร.บ." type="date" />
                    <FormInput v-model="form.prbDate" label="วัน พ.ร.บ." type="date" />
                  </div>
                </fieldset>

                <!-- รอบต่อประกัน -->
                <fieldset class="border-t pt-4">
                  <legend class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5"><ShieldCheckIcon class="w-4 h-4 text-emerald-500" /> รอบต่อประกัน</legend>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheck v-model="form.insLmg" label="LMG" />
                    <FormCheck v-model="form.insViriya" label="วิริยะ" />
                    <FormCheck v-model="form.insThaiInsurance" label="ไทยประกัน" />
                    <FormCheck v-model="form.insInsurance" label="ประกันคุ้มภัย" />
                    <FormCheck v-model="form.insAkney" label="อาคเนย์" />
                    <FormCheck v-model="form.insThewet" label="เทเวศ" />
                    <FormCheck v-model="form.insBangkokInsurance" label="กรุงเทพประกันภัย" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <FormInput v-model="form.insDate" label="อาคเนย์" type="date" />
                    <FormInput v-model="form.insTaxDate" label="เทวด" type="date" />
                    <FormInput v-model="form.insExpiry" label="วันหมด" type="date" />
                  </div>
                </fieldset>

                <!-- Submit -->
                <div class="border-t pt-4 flex justify-end gap-2">
                  <button @click="showFormModal = false" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition">ยกเลิก</button>
                  <button @click="saveVehicle" :disabled="saving"
                    class="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl text-sm transition shadow-sm active:scale-[0.98]">
                    {{ saving ? 'กำลังบันทึก...' : (editingVehicle ? 'อัพเดท' : 'เพิ่มยานพาหนะ') }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  TruckIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon,
  XCircleIcon, XMarkIcon, EyeIcon, FunnelIcon, DocumentTextIcon, ShieldCheckIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import AppEditor from '../components/AppEditor.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

// --- Inline sub-components ---
const FormInput = { props: ['modelValue', 'label', 'placeholder', 'type', 'required'],
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () => h('div', [
      h('label', { class: 'block text-xs font-semibold text-slate-500 mb-1' }, p.label),
      h('input', {
        type: p.type || 'text', value: p.modelValue || '', placeholder: p.placeholder || '',
        required: p.required,
        class: 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition',
        onInput: e => emit('update:modelValue', e.target.value)
      })
    ])
  }
}

const FormCheck = { props: ['modelValue', 'label'], emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () => h('label', { class: 'flex items-center gap-2 cursor-pointer select-none' }, [
      h('input', { type: 'checkbox', checked: p.modelValue, class: 'w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
        onChange: e => emit('update:modelValue', e.target.checked) }),
      h('span', { class: 'text-sm text-slate-700' }, p.label)
    ])
  }
}

const InfoItem = { props: ['label', 'value'],
  setup(p) {
    return () => h('div', { class: 'bg-slate-50 rounded-lg px-3 py-2' }, [
      h('div', { class: 'text-xs text-slate-400' }, p.label),
      h('div', { class: 'text-sm font-medium text-slate-700' }, p.value || '-')
    ])
  }
}

const BoolItem = { props: ['label', 'val'],
  setup(p) {
    return () => h('div', { class: 'flex items-center gap-1.5' }, [
      h('span', { class: p.val ? 'text-emerald-500' : 'text-slate-300' }, p.val ? '✓' : '✗'),
      h('span', { class: 'text-slate-600' }, p.label)
    ])
  }
}

// --- Data ---
const vehicles = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const showFormModal = ref(false)
const editingVehicle = ref(null)
const detailVehicle = ref(null)
const saving = ref(false)

const defaultForm = () => ({
  type: '', licensePlate: '', chassisNumber: '', engineNumber: '',
  currentMileage: '', nextMileage: '', overMileage: '', status: 'ACTIVE', note: '',
  prbDate: '', prbLmg: false, prbViriya: false, prbAkney: false, prbThewet: false, prbInsurance: false, prbBangkokInsurance: false, prbTaxDate: '', prbThirdParty: false, prbExpiry: '',
  insLmg: false, insViriya: false, insThaiInsurance: false, insInsurance: false, insAkney: false, insThewet: false, insBangkokInsurance: false, insDate: '', insTaxDate: '', insExpiry: '',
  taxRenewalDate: ''
})
const form = ref(defaultForm())

const vehicleTypes = computed(() => [...new Set(vehicles.value.map(v => v.type))])
const typeOptions = computed(() => vehicleTypes.value.map(t => ({ value: t, label: t })))
const statusOptions = [
  { value: 'ACTIVE', label: 'พร้อมใช้งาน' },
  { value: 'IN_USE', label: 'กำลังใช้งาน' },
  { value: 'MAINTENANCE', label: 'ซ่อมบำรุง' },
  { value: 'INACTIVE', label: 'ปลดระวาง' }
]
const vehicleStatusOptions = statusOptions.map(s => ({ ...s }))

const filteredVehicles = computed(() => {
  let result = vehicles.value
  if (filterStatus.value) result = result.filter(v => v.status === filterStatus.value)
  if (filterType.value) result = result.filter(v => v.type === filterType.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(v =>
      v.licensePlate.toLowerCase().includes(q) || v.type.toLowerCase().includes(q) ||
      (v.chassisNumber && v.chassisNumber.toLowerCase().includes(q)) ||
      (v.engineNumber && v.engineNumber.toLowerCase().includes(q))
    )
  }
  return result
})

function statusLabel(s) {
  return { ACTIVE: 'พร้อมใช้งาน', IN_USE: 'กำลังใช้งาน', MAINTENANCE: 'ซ่อมบำรุง', INACTIVE: 'ปลดระวาง' }[s] || s
}
function statusColor(s) {
  return {
    ACTIVE: 'bg-emerald-50 text-emerald-500',
    IN_USE: 'bg-blue-50 text-blue-500',
    MAINTENANCE: 'bg-amber-50 text-amber-500',
    INACTIVE: 'bg-slate-100 text-slate-400'
  }[s]
}
function statusBadge(s) {
  return {
    ACTIVE: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    IN_USE: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    MAINTENANCE: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    INACTIVE: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
  }[s]
}
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-' }
function num(n) { return n != null ? Number(n).toLocaleString() : '-' }

function openDetail(v) { detailVehicle.value = v }

function openForm(v) {
  if (v) {
    editingVehicle.value = v
    const f = defaultForm()
    for (const key of Object.keys(f)) {
      if (v[key] !== undefined && v[key] !== null) {
        // Convert dates to YYYY-MM-DD for input[type=date]
        if (typeof v[key] === 'string' && v[key].includes('T') && key !== 'note') {
          f[key] = v[key].slice(0, 10)
        } else {
          f[key] = v[key]
        }
      }
    }
    form.value = f
  } else {
    editingVehicle.value = null
    form.value = defaultForm()
  }
  showFormModal.value = true
}

async function loadVehicles() { vehicles.value = (await api.get('/vehicles')).data }

async function saveVehicle() {
  saving.value = true
  try {
    const payload = { ...form.value, userId: auth.user.id }
    if (editingVehicle.value) {
      await api.put(`/vehicles/${editingVehicle.value.id}`, payload)
      swalSuccess('อัพเดทสำเร็จ', 'แก้ไขยานพาหนะเรียบร้อยแล้ว')
    } else {
      await api.post('/vehicles', payload)
      swalSuccess('เพิ่มสำเร็จ', 'เพิ่มยานพาหนะใหม่เรียบร้อยแล้ว')
    }
    showFormModal.value = false
    await loadVehicles()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
  } finally { saving.value = false }
}

async function confirmDelete(v) {
  const result = await swalConfirm('ลบยานพาหนะ', `ต้องการลบ ${v.type} ทะเบียน ${v.licensePlate} ?`, 'ลบ', true)
  if (!result.isConfirmed) return
  try {
    await api.delete(`/vehicles/${v.id}`, { data: { userId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', `ลบยานพาหนะ ${v.licensePlate} แล้ว`)
    await loadVehicles()
  } catch (err) { swalError('เกิดข้อผิดพลาด', err.response?.data?.error) }
}

async function exportVehicles() {
  try {
    const response = await api.get('/vehicles/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `vehicles_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    swalSuccess('Export สำเร็จ', 'ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว')
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', 'ไม่สามารถ export ข้อมูลได้')
  }
}

async function importVehicles(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post('/vehicles/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    swalSuccess('Import สำเร็จ', `นำเข้าข้อมูล ${response.data.imported} รายการเรียบร้อยแล้ว`)
    await loadVehicles()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถ import ข้อมูลได้')
  }

  // Reset file input
  event.target.value = ''
}

onMounted(loadVehicles)
</script>
