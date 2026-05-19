<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="relative bg-linear-to-r from-rose-500 to-red-600 dark:from-rose-950 dark:to-red-950 rounded-2xl px-6 py-5 overflow-hidden shadow-md shadow-rose-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">รายงานอุบัติเหตุ</h1>
            <p class="text-rose-100 text-xs mt-0.5">บันทึกเหตุการณ์อุบัติเหตุและเก็บรูปหลักฐาน</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-3 shrink-0">
          <div class="text-center bg-white/15 rounded-xl px-4 py-2">
            <div class="text-xl font-bold text-white">{{ histTotal }}</div>
            <div class="text-[10px] text-rose-100">รายการทั้งหมด</div>
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
              ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 shadow-sm ring-1 ring-rose-100 dark:ring-rose-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
          ]">
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.id === 'history' && histTotal > 0"
              class="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
              {{ histTotal }}
            </span>
          </button>
        </Tab>
      </TabList>

      <TabPanels>

        <!-- Tab 1: รายงาน -->
        <TabPanel>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0">

            <!-- ฟอร์ม -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-rose-50 to-red-50 dark:from-slate-800 dark:to-slate-800">
                <h2 class="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 text-sm">
                  <PlusCircleIcon class="w-4 h-4" /> กรอกข้อมูลอุบัติเหตุ
                </h2>
              </div>

              <form @submit.prevent="submitReport" class="p-6 space-y-6">

                <!-- ยานพาหนะ -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <TruckIcon class="w-3.5 h-3.5 text-rose-500" />
                    <span class="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">ยานพาหนะ</span>
                    <div class="flex-1 h-px bg-rose-100"></div>
                  </div>
                  <AppSelect v-model="form.vehicleId" :options="vehicleOptions" :icon="TruckIcon" placeholder="เลือกยานพาหนะ" />
                </div>

                <!-- สถานที่ -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <MapPinIcon class="w-3.5 h-3.5 text-rose-500" />
                    <span class="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">สถานที่เกิดเหตุ</span>
                    <div class="flex-1 h-px bg-rose-100"></div>
                  </div>
                  <input
                    v-model="form.location"
                    type="text"
                    required
                    placeholder="ระบุสถานที่เกิดเหตุ"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition hover:border-rose-300 shadow-sm dark:text-white dark:placeholder-slate-400"
                  />
                </div>

                <!-- จุดที่ได้รับความเสียหาย -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <WrenchScrewdriverIcon class="w-3.5 h-3.5 text-rose-500" />
                    <span class="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">จุดที่ได้รับความเสียหาย</span>
                    <div class="flex-1 h-px bg-rose-100"></div>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      v-for="part in CAR_PARTS"
                      :key="part"
                      type="button"
                      @click="togglePart(part)"
                      :class="[
                        'px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all text-left',
                        selectedParts.includes(part)
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-rose-300 hover:text-rose-700'
                      ]"
                    >
                      {{ part }}
                    </button>
                  </div>
                  <p v-if="selectedParts.length === 0" class="text-[10px] text-slate-400 dark:text-slate-500">กรุณาเลือกอย่างน้อย 1 จุด</p>
                  <div v-else class="flex flex-wrap gap-1.5">
                    <span v-for="part in selectedParts" :key="part"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                      {{ part }}
                      <button type="button" @click="togglePart(part)" class="hover:text-rose-900">×</button>
                    </span>
                  </div>
                </div>

                <!-- รายละเอียด -->
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <DocumentTextIcon class="w-3.5 h-3.5 text-rose-500" />
                    <span class="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">รายละเอียด</span>
                    <div class="flex-1 h-px bg-rose-100"></div>
                  </div>
                  <textarea v-model="form.detail" rows="3" placeholder="อธิบายรายละเอียดของอุบัติเหตุ (ไม่บังคับ)"
                    class="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition resize-none hover:border-rose-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                </div>

                <!-- รูปภาพ -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <PhotoIcon class="w-3.5 h-3.5 text-rose-500" />
                    <span class="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">รูปภาพประกอบ</span>
                    <div class="flex-1 h-px bg-rose-100"></div>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div v-for="(pf, idx) in PHOTO_FIELDS" :key="pf.key" class="space-y-1">
                      <p class="text-[10px] font-semibold text-slate-500 text-center">รูปที่ {{ idx + 1 }}</p>
                      <label :class="['flex flex-col items-center justify-center gap-1 h-24 sm:h-20 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden relative', photoFiles[pf.key] ? 'border-rose-300 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-900/10']">
                        <img v-if="photoPreview[pf.key]" :src="photoPreview[pf.key]" class="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <template v-else>
                          <CameraIcon class="w-5 h-5 text-slate-300" />
                          <span class="text-[9px] text-slate-400">แนบรูป</span>
                        </template>
                        <button v-if="photoFiles[pf.key]" type="button" @click.prevent="clearPhoto(pf.key)"
                          class="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 z-10 shadow">
                          <XMarkIcon class="w-2.5 h-2.5" />
                        </button>
                        <input type="file" accept="image/*" class="hidden" @change="onPhoto($event, pf.key)" />
                      </label>
                    </div>
                  </div>
                </div>

                <!-- หมายเหตุ -->
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">หมายเหตุ</span>
                    <div class="flex-1 h-px bg-slate-100"></div>
                  </div>
                  <textarea v-model="form.note" rows="2" placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    class="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition resize-none hover:border-rose-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                </div>

                <button type="submit"
                  :disabled="submitting || !form.vehicleId || !form.location || selectedParts.length === 0"
                  class="w-full py-3.5 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2">
                  <span v-if="submitting" class="flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    กำลังบันทึก...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <CheckCircleIcon class="w-4 h-4" /> บันทึกรายงาน
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
                      <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                        <TruckIcon class="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <div class="font-bold text-slate-800 dark:text-white">{{ selectedVehicle.licensePlate }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">{{ selectedVehicle.type }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

              <div v-if="!selectedVehicle" class="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
                  <ExclamationTriangleIcon class="w-7 h-7 text-rose-500" />
                </div>
                <div>
                  <p class="font-bold text-rose-800 dark:text-rose-300 text-sm">คำแนะนำการบันทึก</p>
                  <ol class="text-rose-700 dark:text-rose-400 text-xs mt-2 space-y-1.5 text-left list-none">
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-rose-200 text-rose-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      เลือกยานพาหนะที่เกิดอุบัติเหตุ
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-rose-200 text-rose-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      ระบุสถานที่และจุดที่เสียหาย
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-rose-200 text-rose-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                      ถ่ายรูปหลักฐานความเสียหาย
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
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
                <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-rose-500" />
                  ประวัติรายงานอุบัติเหตุ
                  <span class="text-sm font-normal text-slate-400 dark:text-slate-500">{{ histTotal }} รายการ</span>
                </h2>
                <div class="flex flex-wrap items-center gap-2">
                  <AppDateFilter default-mode="all" @change="onDateChange" />
                  <div class="w-44">
                    <AppSelect v-model="filterVehicleId" :options="vehicleFilterOptions" :icon="TruckIcon" placeholder="ยานพาหนะทั้งหมด" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop table -->
            <div class="hidden sm:block" v-if="reports.length">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50/70 dark:bg-slate-700/30">
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ยานพาหนะ</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">สถานที่</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">จุดที่เสียหาย</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">รูปภาพ</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">บันทึกเมื่อ</th>
                    <th class="py-3 px-5"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                  <tr v-for="r in reports" :key="r.id" class="hover:bg-rose-50/30 dark:hover:bg-slate-700/30 transition group">
                    <td class="py-3.5 px-5">
                      <div class="font-semibold text-sm text-slate-800 dark:text-white">{{ r.vehicle?.licensePlate }}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500">{{ r.vehicle?.type }}</div>
                    </td>
                    <td class="py-3.5 px-5 text-sm text-slate-700 dark:text-slate-200 max-w-32 truncate">{{ r.location }}</td>
                    <td class="py-3.5 px-5">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="part in parseParts(r.damagedParts)" :key="part"
                          class="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold whitespace-nowrap">
                          {{ part }}
                        </span>
                      </div>
                    </td>
                    <td class="py-3.5 px-5">
                      <div class="flex gap-1 flex-wrap">
                        <template v-for="pf in PHOTO_FIELDS" :key="pf.key">
                          <a v-if="r[pf.key]"
                            :href="resolveUrl(r[pf.key])" target="_blank"
                            class="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 block hover:ring-2 hover:ring-rose-400 transition shrink-0">
                            <img :src="resolveUrl(r[pf.key])" class="w-full h-full object-cover" />
                          </a>
                        </template>
                        <span v-if="!hasAnyPhoto(r)" class="text-xs text-slate-300">—</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-5 text-xs text-slate-400 dark:text-slate-500">
                      <div>{{ fmtDateTime(r.createdAt) }}</div>
                      <div class="text-slate-500 dark:text-slate-400 font-medium">{{ r.user?.displayName || r.user?.username }}</div>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <button v-if="auth.isAdmin" @click="deleteReport(r)"
                        class="p-1.5 rounded-lg hover:bg-red-50 text-slate-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile cards -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="reports.length">
              <div v-for="r in reports" :key="r.id" class="p-4 group">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                    <ExclamationTriangleIcon class="w-4 h-4 text-rose-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-sm text-slate-800 dark:text-white">{{ r.vehicle?.licensePlate }}</span>
                      <span class="text-xs text-slate-400 dark:text-slate-500">{{ r.vehicle?.type }}</span>
                    </div>
                    <div class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                      <MapPinIcon class="w-3 h-3 text-rose-400 shrink-0" />
                      {{ r.location }}
                    </div>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span v-for="part in parseParts(r.damagedParts)" :key="part"
                        class="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                        {{ part }}
                      </span>
                    </div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{{ fmtDateTime(r.createdAt) }} · {{ r.user?.displayName || r.user?.username }}</div>
                    <div v-if="r.detail" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ r.detail }}</div>
                    <div class="flex gap-1 mt-1.5 flex-wrap">
                      <template v-for="pf in PHOTO_FIELDS" :key="pf.key">
                        <a v-if="r[pf.key]"
                          :href="resolveUrl(r[pf.key])" target="_blank"
                          class="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 block shrink-0">
                          <img :src="resolveUrl(r[pf.key])" class="w-full h-full object-cover" />
                        </a>
                      </template>
                    </div>
                  </div>
                  <button v-if="auth.isAdmin" @click="deleteReport(r)"
                    class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition shrink-0">
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

            <div v-if="!reports.length" class="py-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
              <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <ExclamationTriangleIcon class="w-8 h-8 opacity-40" />
              </div>
              <p class="text-sm font-medium">ยังไม่มีประวัติรายงานอุบัติเหตุ</p>
              <button @click="activeTab = 0" class="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl transition">
                + รายงานอุบัติเหตุใหม่
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
  ExclamationTriangleIcon, PlusCircleIcon, TruckIcon, ClockIcon, CheckCircleIcon,
  XMarkIcon, TrashIcon, CameraIcon, MapPinIcon, WrenchScrewdriverIcon,
  DocumentTextIcon, PhotoIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { fmtDateTimeTh } from '../stores/date'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

const BASE_URL = ``
const PAGE_SIZE = 10
function resolveUrl(val) {
  if (!val) return null
  if (val.startsWith('https://')) return `${BASE_URL}/api/media/proxy?url=${encodeURIComponent(val)}`
  if (val.startsWith('http')) return val
  return `${BASE_URL}/uploads/${val}`
}

const CAR_PARTS = [
  'กันชนหน้า', 'กันชนหลัง', 'ฝากระโปรงหน้า', 'ฝากระโปรงหลัง',
  'บังโคลนหน้าซ้าย', 'บังโคลนหน้าขวา', 'บังโคลนหลังซ้าย', 'บังโคลนหลังขวา',
  'ประตูหน้าซ้าย', 'ประตูหน้าขวา', 'ประตูหลังซ้าย', 'ประตูหลังขวา',
  'กระจกหน้า', 'กระจกหลัง', 'กระจกข้างซ้าย', 'กระจกข้างขวา',
  'หลังคา', 'ท้องรถ', 'ล้อ/ยาง', 'อื่นๆ'
]

const PHOTO_FIELDS = [
  { key: 'photo1' }, { key: 'photo2' }, { key: 'photo3' },
  { key: 'photo4' }, { key: 'photo5' }, { key: 'photo6' }
]

const tabs = [
  { id: 'report', label: 'รายงานอุบัติเหตุ', icon: PlusCircleIcon },
  { id: 'history', label: 'ประวัติ', icon: ClockIcon }
]

const vehicles = ref([])
const reports = ref([])
const submitting = ref(false)
const activeTab = ref(0)
const filterVehicleId = ref('')
const filterStart = ref('')
const filterEnd = ref('')
const histPage = ref(1)
const histTotal = ref(0)
const histTotalPages = ref(0)
const selectedParts = ref([])

function onDateChange({ startDate, endDate }) {
  filterStart.value = startDate
  filterEnd.value = endDate
  histPage.value = 1
  loadHistory()
}
const photoFiles = ref({})
const photoPreview = ref({})

const form = ref({ vehicleId: '', location: '', detail: '', note: '' })

const vehicleOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} — ${v.type}` }))
)

const vehicleFilterOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: v.licensePlate }))
)

const selectedVehicle = computed(() =>
  vehicles.value.find(v => v.id === Number(form.value.vehicleId)) || null
)

function togglePart(part) {
  const idx = selectedParts.value.indexOf(part)
  if (idx >= 0) selectedParts.value.splice(idx, 1)
  else selectedParts.value.push(part)
}

function onPhoto(e, key) {
  const file = e.target.files[0]
  if (!file) return
  photoFiles.value[key] = file
  photoPreview.value[key] = URL.createObjectURL(file)
}

function clearPhoto(key) {
  photoFiles.value[key] = null
  photoPreview.value[key] = null
}

function parseParts(str) {
  try { return JSON.parse(str) } catch { return str ? str.split(',') : [] }
}

function hasAnyPhoto(r) {
  return PHOTO_FIELDS.some(f => r[f.key])
}

function fmtDateTime(d) { return fmtDateTimeTh(d) }

async function loadVehicles() {
  const res = await api.get('/vehicles')
  vehicles.value = res.data
}

async function loadHistory() {
  const params = { page: histPage.value, limit: PAGE_SIZE }
  if (filterVehicleId.value) params.vehicleId = filterVehicleId.value
  if (filterStart.value) params.startDate = filterStart.value
  if (filterEnd.value) params.endDate = filterEnd.value
  const res = await api.get('/accidents', { params })
  reports.value = res.data.reports
  histTotal.value = res.data.total
  histTotalPages.value = res.data.totalPages
}

async function submitReport() {
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('vehicleId', form.value.vehicleId)
    fd.append('userId', auth.user.id)
    fd.append('location', form.value.location)
    fd.append('damagedParts', JSON.stringify(selectedParts.value))
    if (form.value.detail) fd.append('detail', form.value.detail)
    if (form.value.note) fd.append('note', form.value.note)
    for (const pf of PHOTO_FIELDS) {
      if (photoFiles.value[pf.key]) fd.append(pf.key, photoFiles.value[pf.key])
    }
    await api.post('/accidents', fd)
    swalSuccess('บันทึกสำเร็จ', 'บันทึกรายงานอุบัติเหตุเรียบร้อยแล้ว')
    form.value = { vehicleId: form.value.vehicleId, location: '', detail: '', note: '' }
    selectedParts.value = []
    photoFiles.value = {}
    photoPreview.value = {}
    await loadHistory()
    activeTab.value = 1
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
  } finally {
    submitting.value = false
  }
}

async function deleteReport(r) {
  const result = await swalConfirm('ลบรายงาน', `ต้องการลบรายงานอุบัติเหตุ ${r.vehicle?.licensePlate}?`, 'ลบ', true)
  if (!result.isConfirmed) return
  try {
    await api.delete(`/accidents/${r.id}`, { data: { actionUserId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', 'ลบรายงานเรียบร้อยแล้ว')
    if (reports.value.length === 1 && histPage.value > 1) histPage.value--
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
