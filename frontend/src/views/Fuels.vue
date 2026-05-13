<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="relative bg-linear-to-r from-amber-500 to-yellow-500 dark:from-amber-950 dark:to-yellow-950 rounded-2xl px-6 py-5 overflow-hidden shadow-md shadow-amber-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <FireIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">รายงานการเติมน้ำมัน</h1>
            <p class="text-amber-100 text-xs mt-0.5">บันทึกการเติมน้ำมันและเก็บรูปหลักฐาน</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-3 shrink-0">
          <div class="text-center bg-white/15 rounded-xl px-4 py-2">
            <div class="text-xl font-bold text-white">{{ histTotal }}</div>
            <div class="text-[10px] text-amber-100">รายการทั้งหมด</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <TabGroup :selected-index="activeTab" @change="activeTab = $event">
      <TabList class="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
        <Tab v-for="tab in tabs" :key="tab.id" as="template" v-slot="{ selected }">
          <button :class="[
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all',
            selected
              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-sm ring-1 ring-amber-100 dark:ring-amber-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
          ]">
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.id === 'history' && histTotal > 0"
              class="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              {{ histTotal }}
            </span>
          </button>
        </Tab>
      </TabList>

      <TabPanels>

        <!-- Tab 1: บันทึก -->
        <TabPanel>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0">

            <!-- ฟอร์ม -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800">
                <h2 class="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 text-sm">
                  <PlusCircleIcon class="w-4 h-4" /> กรอกข้อมูลการเติมน้ำมัน
                </h2>
              </div>

              <form @submit.prevent="submitFuel" class="p-6 space-y-6">

                <!-- ส่วน: ยานพาหนะ -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <TruckIcon class="w-3.5 h-3.5 text-amber-500" />
                    <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">ยานพาหนะ</span>
                    <div class="flex-1 h-px bg-amber-100 dark:bg-amber-800/40"></div>
                  </div>
                  <AppSelect v-model="form.vehicleId" :options="vehicleOptions" :icon="TruckIcon" placeholder="เลือกยานพาหนะ" />
                </div>

                <!-- ส่วน: เลขไมล์ -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <ArrowTrendingUpIcon class="w-3.5 h-3.5 text-amber-500" />
                    <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">เลขไมล์</span>
                    <div class="flex-1 h-px bg-amber-100 dark:bg-amber-800/40"></div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <!-- ก่อนเติม -->
                    <div class="space-y-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ก่อนเติม <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input v-model="form.mileageBefore" type="number" min="0" step="0.1" required placeholder="0"
                          class="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">กม.</span>
                      </div>
                      <label :class="['flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden relative', form.photos['mileagePhotoBefore'] ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10']">
                        <img v-if="previews['mileagePhotoBefore']" :src="previews['mileagePhotoBefore']" class="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <template v-else><CameraIcon class="w-5 h-5 text-slate-300" /><span class="text-[9px] text-slate-400">รูปไมล์ก่อนเติม</span></template>
                        <button v-if="form.photos['mileagePhotoBefore']" type="button" @click.prevent="clearPhoto('mileagePhotoBefore')" class="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 z-10 shadow"><XMarkIcon class="w-2.5 h-2.5" /></button>
                        <input type="file" accept="image/*" class="hidden" @change="onPhotoChange($event, 'mileagePhotoBefore')" />
                      </label>
                    </div>
                    <!-- หลังเติม -->
                    <div class="space-y-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        หลังเติม <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input v-model="form.mileageAfter" type="number" min="0" step="0.1" required placeholder="0"
                          class="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">กม.</span>
                      </div>
                      <label :class="['flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden relative', form.photos['mileagePhotoAfter'] ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10']">
                        <img v-if="previews['mileagePhotoAfter']" :src="previews['mileagePhotoAfter']" class="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <template v-else><CameraIcon class="w-5 h-5 text-slate-300" /><span class="text-[9px] text-slate-400">รูปไมล์หลังเติม</span></template>
                        <button v-if="form.photos['mileagePhotoAfter']" type="button" @click.prevent="clearPhoto('mileagePhotoAfter')" class="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 z-10 shadow"><XMarkIcon class="w-2.5 h-2.5" /></button>
                        <input type="file" accept="image/*" class="hidden" @change="onPhotoChange($event, 'mileagePhotoAfter')" />
                      </label>
                    </div>
                  </div>
                </div>

                <!-- ส่วน: น้ำมัน -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <FireIcon class="w-3.5 h-3.5 text-amber-500" />
                    <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">ข้อมูลการเติมน้ำมัน</span>
                    <div class="flex-1 h-px bg-amber-100 dark:bg-amber-800/40"></div>
                  </div>
                  <!-- ลิตร + บาท -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">จำนวนลิตร <span class="text-red-500">*</span></label>
                      <div class="relative">
                        <input v-model="form.liters" type="number" min="0" step="0.01" required placeholder="0.00"
                          class="w-full pl-4 pr-8 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">L</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">ยอดเงิน <span class="text-red-500">*</span></label>
                      <div class="relative">
                        <input v-model="form.amount" type="number" min="0" step="0.01" required placeholder="0.00"
                          class="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">บาท</span>
                      </div>
                    </div>
                  </div>
                  <!-- รูปเกจ + หน้าตู้ + ใบเสร็จ -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div v-for="pf in fuelPhotoFields" :key="pf.field" class="space-y-1">
                      <p class="text-[10px] font-semibold text-slate-500 text-center truncate">{{ pf.label }}</p>
                      <label :class="['flex flex-col items-center justify-center gap-1 h-24 sm:h-20 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden relative', form.photos[pf.field] ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10']">
                        <img v-if="previews[pf.field]" :src="previews[pf.field]" class="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <template v-else><CameraIcon class="w-4 h-4 text-slate-300" /><span class="text-[9px] text-slate-400">รูป</span></template>
                        <button v-if="form.photos[pf.field]" type="button" @click.prevent="clearPhoto(pf.field)" class="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 z-10 shadow"><XMarkIcon class="w-2.5 h-2.5" /></button>
                        <input type="file" accept="image/*" class="hidden" @change="onPhotoChange($event, pf.field)" />
                      </label>
                    </div>
                  </div>
                </div>

                <!-- ส่วน: หมายเหตุ -->
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">หมายเหตุ</span>
                    <div class="flex-1 h-px bg-slate-100"></div>
                  </div>
                  <textarea v-model="form.note" rows="2" placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    class="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition resize-none hover:border-amber-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                </div>

                <button type="submit"
                  :disabled="submitting || !form.vehicleId || !form.mileageBefore || !form.mileageAfter || !form.liters || !form.amount"
                  class="w-full py-3.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2">
                  <span v-if="submitting" class="flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    กำลังบันทึก...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <CheckCircleIcon class="w-4 h-4" /> บันทึกการเติมน้ำมัน
                  </span>
                </button>
              </form>
            </div>

            <!-- Info panel -->
            <div class="space-y-4">
              <transition name="fade">
                <div v-if="selectedVehicle" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800">
                    <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                      <TruckIcon class="w-4 h-4 text-slate-500" />
                      ข้อมูลยานพาหนะที่เลือก
                    </h3>
                  </div>
                  <div class="p-5 space-y-3">
                    <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <TruckIcon class="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div class="font-bold text-slate-800 dark:text-white">{{ selectedVehicle.licensePlate }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">{{ selectedVehicle.type }}</div>
                      </div>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ArrowTrendingUpIcon class="w-3.5 h-3.5" /> ไมล์ปัจจุบัน
                      </span>
                      <span class="font-semibold text-slate-700 dark:text-slate-200">
                        {{ selectedVehicle.currentMileage ? Number(selectedVehicle.currentMileage).toLocaleString('th-TH') + ' กม.' : 'ไม่มีข้อมูล' }}
                      </span>
                    </div>
                  </div>
                </div>
              </transition>

              <div v-if="!selectedVehicle" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center">
                  <FireIcon class="w-7 h-7 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <p class="font-bold text-amber-800 dark:text-amber-300 text-sm">คำแนะนำการบันทึก</p>
                  <ol class="text-amber-700 dark:text-amber-400 text-xs mt-2 space-y-1.5 text-left list-none">
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      เลือกยานพาหนะและกรอกเลขไมล์
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      กรอกจำนวนลิตรและยอดเงินที่เติม
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                      ถ่ายรูปหลักฐานตามช่องที่กำหนด
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                      กดบันทึกเพื่อเก็บประวัติ
                    </li>
                  </ol>
                </div>
              </div>
            </div>

          </div>
        </TabPanel>

        <!-- Tab 2: ประวัติ -->
        <TabPanel>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden mt-0">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-amber-500" />
                  ประวัติการเติมน้ำมัน
                  <span class="text-sm font-normal text-slate-400 dark:text-slate-500">{{ histTotal }} รายการ</span>
                </h2>
                <div class="w-56">
                  <AppSelect v-model="filterVehicleId" :options="vehicleFilterOptions" :icon="TruckIcon" placeholder="ยานพาหนะทั้งหมด" />
                </div>
              </div>
            </div>

            <!-- Desktop table -->
            <div class="hidden sm:block" v-if="fuelLogs.length">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50/70 dark:bg-slate-700/30">
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ยานพาหนะ</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">เลขไมล์ (ก่อน→หลัง)</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ลิตร</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ยอดเงิน</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">รูปภาพ</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">บันทึกเมื่อ</th>
                    <th class="py-3 px-5"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                  <tr v-for="log in fuelLogs" :key="log.id" class="hover:bg-amber-50/30 dark:hover:bg-slate-700/30 transition group">
                    <td class="py-3.5 px-5">
                      <div class="font-semibold text-sm text-slate-800 dark:text-white">{{ log.vehicle.licensePlate }}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500">{{ log.vehicle.type }}</div>
                    </td>
                    <td class="py-3.5 px-5 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <span>{{ Number(log.mileageBefore).toLocaleString('th-TH') }}</span>
                      <span class="text-slate-400 mx-1">→</span>
                      <span>{{ log.mileageAfter ? Number(log.mileageAfter).toLocaleString('th-TH') : '—' }}</span>
                      <span class="text-xs text-slate-400 ml-1">กม.</span>
                    </td>
                    <td class="py-3.5 px-5">
                      <span class="text-sm font-semibold text-amber-700">{{ log.liters }} L</span>
                    </td>
                    <td class="py-3.5 px-5">
                      <span class="text-sm font-semibold text-emerald-700">{{ Number(log.amount).toLocaleString('th-TH') }} ฿</span>
                    </td>
                    <td class="py-3.5 px-5">
                      <div class="flex gap-1 flex-wrap">
                        <template v-for="pf in photoFields" :key="pf.field">
                          <a v-if="log[pf.field]"
                            :href="`${BASE_URL}/uploads/${log[pf.field]}`" target="_blank"
                            :title="pf.label"
                            class="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 block hover:ring-2 hover:ring-amber-400 transition shrink-0">
                            <img :src="`${BASE_URL}/uploads/${log[pf.field]}`" class="w-full h-full object-cover" />
                          </a>
                        </template>
                        <span v-if="!hasAnyPhoto(log)" class="text-xs text-slate-300">—</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-5 text-xs text-slate-400 dark:text-slate-500">
                      <div>{{ fmtDateTime(log.createdAt) }}</div>
                      <div class="text-slate-500 dark:text-slate-400 font-medium">{{ log.user?.displayName || log.user?.username }}</div>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <button @click="deleteLog(log)"
                        class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile cards -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="fuelLogs.length">
              <div v-for="log in fuelLogs" :key="log.id" class="p-4 group">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <FireIcon class="w-4 h-4 text-amber-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-sm text-slate-800 dark:text-white">{{ log.vehicle.licensePlate }}</span>
                      <span class="text-xs text-slate-400 dark:text-slate-500">{{ log.vehicle.type }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-xs mt-0.5 flex-wrap">
                      <span class="text-slate-500">{{ Number(log.mileageBefore).toLocaleString('th-TH') }}→{{ log.mileageAfter ? Number(log.mileageAfter).toLocaleString('th-TH') : '—' }} กม.</span>
                      <span class="font-semibold text-amber-700">{{ log.liters }} L</span>
                      <span class="font-semibold text-emerald-700">{{ Number(log.amount).toLocaleString('th-TH') }} ฿</span>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">{{ fmtDateTime(log.createdAt) }} · {{ log.user?.displayName || log.user?.username }}</div>
                    <div v-if="log.note" class="text-xs text-slate-400 mt-0.5 italic">{{ log.note }}</div>
                    <div class="flex gap-1 mt-1.5 flex-wrap">
                      <template v-for="pf in photoFields" :key="pf.field">
                        <a v-if="log[pf.field]"
                          :href="`${BASE_URL}/uploads/${log[pf.field]}`" target="_blank"
                          :title="pf.label"
                          class="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 block shrink-0">
                          <img :src="`${BASE_URL}/uploads/${log[pf.field]}`" class="w-full h-full object-cover" />
                        </a>
                      </template>
                    </div>
                  </div>
                  <button @click="deleteLog(log)" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition shrink-0">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="histTotalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
              <span class="text-xs text-slate-400 dark:text-slate-500">
                แสดง {{ (histPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(histPage * PAGE_SIZE, histTotal) }} จาก {{ histTotal }} รายการ
              </span>
              <div class="flex items-center gap-1">
                <button @click="histPage--" :disabled="histPage <= 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-base">‹</button>
                <span class="text-xs text-slate-600 dark:text-slate-300 font-medium px-2">{{ histPage }} / {{ histTotalPages }}</span>
                <button @click="histPage++" :disabled="histPage >= histTotalPages"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-base">›</button>
              </div>
            </div>

            <div v-if="!fuelLogs.length" class="py-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
              <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <FireIcon class="w-8 h-8 opacity-40" />
              </div>
              <p class="text-sm font-medium">ยังไม่มีประวัติการเติมน้ำมัน</p>
              <button @click="activeTab = 0" class="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl transition">
                + บันทึกการเติมน้ำมันใหม่
              </button>
            </div>
          </div>
        </TabPanel>

      </TabPanels>
    </TabGroup>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import {
  FireIcon, PlusCircleIcon, TruckIcon, ClockIcon, CheckCircleIcon,
  XMarkIcon, TrashIcon, CameraIcon, ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import api from '../stores/api'
import { fmtDateTimeTh } from '../stores/date'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

const BASE_URL = `http://${window.location.hostname}:8099`
const PAGE_SIZE = 10

const vehicles = ref([])
const fuelLogs = ref([])
const submitting = ref(false)
const activeTab = ref(0)

const filterVehicleId = ref('')
const histPage = ref(1)
const histTotal = ref(0)
const histTotalPages = ref(0)

const photoFields = [
  { field: 'mileagePhotoBefore', label: 'ไมล์ก่อนเติม' },
  { field: 'mileagePhotoAfter', label: 'ไมล์หลังเติม' },
  { field: 'gaugePhotoBefore', label: 'เกจก่อนเติม' },
  { field: 'gaugePhotoAfter', label: 'เกจหลังเติม' },
  { field: 'pumpPhoto', label: 'หน้าตู้น้ำมัน' },
  { field: 'receiptPhoto', label: 'ใบเสร็จ' }
]

const fuelPhotoFields = [
  { field: 'gaugePhotoBefore', label: 'เกจก่อนเติม' },
  { field: 'gaugePhotoAfter', label: 'เกจหลังเติม' },
  { field: 'pumpPhoto', label: 'หน้าตู้น้ำมัน' },
  { field: 'receiptPhoto', label: 'ใบเสร็จ' }
]

const form = ref({ vehicleId: '', mileageBefore: '', mileageAfter: '', liters: '', amount: '', note: '', photos: {} })
const previews = ref({})

const tabs = [
  { id: 'form', label: 'บันทึกการเติมน้ำมัน', icon: PlusCircleIcon },
  { id: 'history', label: 'ประวัติ', icon: ClockIcon }
]

const vehicleOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} — ${v.type}` }))
)

const vehicleFilterOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: v.licensePlate }))
)

const selectedVehicle = computed(() =>
  vehicles.value.find(v => v.id === Number(form.value.vehicleId)) || null
)

function hasAnyPhoto(log) {
  return photoFields.some(pf => log[pf.field])
}

function onPhotoChange(e, field) {
  const file = e.target.files[0]
  if (!file) return
  form.value.photos[field] = file
  previews.value[field] = URL.createObjectURL(file)
}

function clearPhoto(field) {
  form.value.photos[field] = null
  previews.value[field] = null
}

function fmtDateTime(d) { return fmtDateTimeTh(d) }

async function loadVehicles() {
  const res = await api.get('/vehicles')
  vehicles.value = res.data
}

async function loadHistory() {
  const params = { page: histPage.value, limit: PAGE_SIZE }
  if (filterVehicleId.value) params.vehicleId = filterVehicleId.value
  const res = await api.get('/fuels', { params })
  fuelLogs.value = res.data.logs
  histTotal.value = res.data.total
  histTotalPages.value = res.data.totalPages
}

async function submitFuel() {
  if (!form.value.vehicleId || !form.value.mileageBefore || !form.value.mileageAfter || !form.value.liters || !form.value.amount) return
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('vehicleId', form.value.vehicleId)
    fd.append('userId', auth.user.id)
    fd.append('mileageBefore', form.value.mileageBefore)
    fd.append('mileageAfter', form.value.mileageAfter)
    fd.append('liters', form.value.liters)
    fd.append('amount', form.value.amount)
    if (form.value.note) fd.append('note', form.value.note)
    for (const pf of photoFields) {
      if (form.value.photos[pf.field]) fd.append(pf.field, form.value.photos[pf.field])
    }
    await api.post('/fuels', fd)
    swalSuccess('บันทึกสำเร็จ', 'บันทึกการเติมน้ำมันเรียบร้อยแล้ว')
    form.value = { vehicleId: form.value.vehicleId, mileageBefore: '', mileageAfter: '', liters: '', amount: '', note: '', photos: {} }
    previews.value = {}
    await loadHistory()
    activeTab.value = 1
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
  } finally {
    submitting.value = false
  }
}

async function deleteLog(log) {
  const result = await swalConfirm('ลบประวัติ', `ต้องการลบประวัติการเติมน้ำมัน ${log.vehicle.licensePlate}?`, 'ลบ', true)
  if (!result.isConfirmed) return
  try {
    await api.delete(`/fuels/${log.id}`, { data: { actionUserId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', 'ลบประวัติเรียบร้อยแล้ว')
    if (fuelLogs.value.length === 1 && histPage.value > 1) histPage.value--
    await loadHistory()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถลบได้')
  }
}

watch(filterVehicleId, () => { histPage.value = 1; loadHistory() })
watch(histPage, loadHistory)

onMounted(async () => {
  await Promise.all([loadVehicles(), loadHistory()])
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
