<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="relative bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-950 dark:to-cyan-950 rounded-2xl px-6 py-5 overflow-hidden shadow-md shadow-teal-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <DocumentTextIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">ต่อ พ.ร.บ. / ภาษี / ประกัน / แก๊ส</h1>
            <p class="text-teal-100 text-xs mt-0.5">บันทึกการต่ออายุเอกสารและเก็บประวัติ</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-3 shrink-0">
          <div class="text-center bg-white/15 rounded-xl px-4 py-2">
            <div class="text-xl font-bold text-white">{{ histTotal }}</div>
            <div class="text-[10px] text-teal-100">รายการทั้งหมด</div>
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
              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm ring-1 ring-teal-100 dark:ring-teal-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
          ]">
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.id === 'history' && histTotal > 0"
              class="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
              {{ histTotal }}
            </span>
          </button>
        </Tab>
      </TabList>

      <TabPanels>

        <!-- Tab 1: ภาพรวมยานพาหนะ -->
        <TabPanel>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden mt-0">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TableCellsIcon class="w-5 h-5 text-teal-500" />
                ภาพรวมเอกสารยานพาหนะ
                <span class="text-sm font-normal text-slate-400">{{ vehicles.length }} คัน</span>
              </h2>
              <div class="flex flex-wrap items-center gap-2">
                <input v-model="overviewSearch" placeholder="ค้นหาทะเบียน, ประเภท..."
                  class="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:bg-slate-700 dark:text-white w-52" />
                <AppSelect v-model="overviewFilter" :options="overviewFilterOptions" placeholder="ทุกสถานะ" :icon="TruckIcon" />
              </div>
            </div>

            <!-- Summary pills -->
            <div class="grid grid-cols-3 gap-3 px-5 py-3 border-b border-gray-100 dark:border-slate-700">
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl px-3 py-2.5 text-center">
                <div class="text-xl font-bold text-red-600 dark:text-red-400">{{ overviewStats.expired }}</div>
                <div class="text-[10px] text-red-500 dark:text-red-400 mt-0.5">หมดอายุ</div>
              </div>
              <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl px-3 py-2.5 text-center">
                <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ overviewStats.warning }}</div>
                <div class="text-[10px] text-amber-500 dark:text-amber-400 mt-0.5">ใกล้หมด (≤30 วัน)</div>
              </div>
              <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl px-3 py-2.5 text-center">
                <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ overviewStats.ok }}</div>
                <div class="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">ปกติ</div>
              </div>
            </div>

            <!-- Desktop table -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50/70 dark:bg-slate-700/30">
                    <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">ยานพาหนะ</th>
                    <th class="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">พ.ร.บ.</th>
                    <th class="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">ภาษี</th>
                    <th class="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">ประกัน</th>
                    <th class="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">แก๊ส</th>
                    <th class="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">เบอร์ติดต่อ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                  <tr v-for="v in filteredOverviewVehicles" :key="v.id" class="hover:bg-teal-50/30 dark:hover:bg-slate-700/30 transition">
                    <td class="py-3 px-4">
                      <div class="font-semibold text-sm text-slate-800 dark:text-white">{{ v.licensePlate }}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500">{{ v.type }}</div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex flex-col items-center gap-0.5">
                        <span :class="ovChip(v.prbExpiry)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ ovLabel(v.prbExpiry) }}</span>
                        <span class="text-[10px] text-slate-400">{{ v.prbExpiry ? fmtDate(v.prbExpiry) : '-' }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex flex-col items-center gap-0.5">
                        <span :class="ovChip(v.taxRenewalDate)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ ovLabel(v.taxRenewalDate) }}</span>
                        <span class="text-[10px] text-slate-400">{{ v.taxRenewalDate ? fmtDate(v.taxRenewalDate) : '-' }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex flex-col items-center gap-0.5">
                        <span :class="ovChip(v.insExpiry)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ ovLabel(v.insExpiry) }}</span>
                        <span class="text-[10px] text-slate-400">{{ v.insExpiry ? fmtDate(v.insExpiry) : '-' }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex flex-col items-center gap-0.5">
                        <div class="flex gap-1 mb-0.5">
                          <span v-if="v.gasNgv" class="text-[9px] font-bold bg-orange-100 text-orange-600 px-1 py-0.5 rounded">NGV</span>
                          <span v-if="v.gasLpg" class="text-[9px] font-bold bg-orange-100 text-orange-600 px-1 py-0.5 rounded">LPG</span>
                        </div>
                        <span :class="ovChip(v.gasExpiry)" class="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">{{ ovLabel(v.gasExpiry) }}</span>
                        <span class="text-[10px] text-slate-400">{{ v.gasExpiry ? fmtDate(v.gasExpiry) : '-' }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-xs space-y-0.5">
                      <div v-if="v.prbContact" class="flex items-center gap-1 text-blue-600">
                        <PhoneIcon class="w-3 h-3 shrink-0" /><span>พรบ. {{ v.prbContact }}</span>
                      </div>
                      <div v-if="v.insContact" class="flex items-center gap-1 text-blue-600">
                        <PhoneIcon class="w-3 h-3 shrink-0" /><span>ประกัน {{ v.insContact }}</span>
                      </div>
                      <div v-if="v.gasContact" class="flex items-center gap-1 text-blue-600">
                        <PhoneIcon class="w-3 h-3 shrink-0" /><span>แก๊ส {{ v.gasContact }}</span>
                      </div>
                      <span v-if="!v.prbContact && !v.insContact && !v.gasContact" class="text-slate-300 dark:text-slate-600">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile cards -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700">
              <div v-for="v in filteredOverviewVehicles" :key="v.id" class="px-4 py-3.5">
                <div class="font-semibold text-sm text-slate-800 dark:text-white mb-2">
                  {{ v.licensePlate }} <span class="font-normal text-slate-400 text-xs">{{ v.type }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span :class="ovChip(v.prbExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">พ.ร.บ. {{ ovLabel(v.prbExpiry) }}</span>
                  <span :class="ovChip(v.taxRenewalDate)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">ภาษี {{ ovLabel(v.taxRenewalDate) }}</span>
                  <span :class="ovChip(v.insExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">ประกัน {{ ovLabel(v.insExpiry) }}</span>
                  <span v-if="v.gasNgv || v.gasLpg || v.gasExpiry" :class="ovChip(v.gasExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg">แก๊ส {{ ovLabel(v.gasExpiry) }}</span>
                </div>
              </div>
            </div>

            <div v-if="!filteredOverviewVehicles.length" class="py-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
              <TruckIcon class="w-10 h-10 opacity-30" />
              <p class="text-sm font-medium">ไม่พบยานพาหนะ</p>
            </div>
          </div>
        </TabPanel>

        <!-- Tab 2: บันทึกใหม่ -->
        <TabPanel>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0">

            <!-- ฟอร์ม -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800">
                <h2 class="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2 text-sm">
                  <PlusCircleIcon class="w-4 h-4" /> กรอกข้อมูลการต่ออายุ
                </h2>
              </div>

              <form @submit.prevent="submitRenewal" class="p-6 space-y-5">

                <!-- เลือกยานพาหนะ -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    ยานพาหนะ <span class="text-red-500">*</span>
                  </label>
                  <AppSelect
                    v-model="form.vehicleId"
                    :options="vehicleOptions"
                    :icon="TruckIcon"
                    placeholder="เลือกยานพาหนะ"
                    @update:model-value="onVehicleChange"
                  />
                </div>

                <!-- ประเภท -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    ประเภทการต่ออายุ <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button v-for="t in renewalTypes" :key="t.value" type="button"
                      @click="form.type = t.value; selectedProviders = []"
                      :class="[
                        'flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 font-bold text-sm transition-all',
                        form.type === t.value
                          ? t.activeClass
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                      ]">
                      <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', form.type === t.value ? t.iconBg : 'bg-slate-100']">
                        <component :is="t.icon" class="w-4 h-4" />
                      </div>
                      {{ t.label }}
                    </button>
                  </div>
                </div>

                <!-- ข้อมูลปัจจุบัน -->
                <transition name="fade">
                  <div v-if="selectedVehicle && form.type"
                    class="flex items-center justify-between bg-slate-50 dark:bg-slate-700/30 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                    <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CalendarDaysIcon class="w-3.5 h-3.5" />
                      วันหมดอายุปัจจุบัน
                    </div>
                    <span :class="currentExpiryClass" class="text-xs font-bold">{{ currentExpiryDisplay }}</span>
                  </div>
                </transition>

                <!-- บริษัทที่ต่อ / ประเภทแก๊ส -->
                <transition name="fade">
                  <div v-if="form.type !== 'TAX' && availableProviders.length > 0">
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      {{ form.type === 'GAS' ? 'ประเภทแก๊ส' : 'บริษัทที่ต่อ' }}
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <button v-for="p in availableProviders" :key="p.value" type="button"
                        @click="toggleProvider(p.value)"
                        :class="[
                          'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                          selectedProviders.includes(p.value)
                            ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                            : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-teal-300 hover:text-teal-600'
                        ]">
                        <span v-if="selectedProviders.includes(p.value)" class="mr-1">✓</span>{{ p.label }}
                      </button>
                    </div>
                  </div>
                </transition>

                <!-- วันหมดอายุใหม่ -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    วันหมดอายุใหม่ <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <CalendarIcon class="w-5 h-5 text-teal-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input v-model="form.expiryDate" type="date" required
                      class="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition hover:border-teal-300 shadow-sm" />
                  </div>
                </div>

                <!-- หมายเหตุ -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">หมายเหตุ</label>
                  <textarea v-model="form.note" rows="2" placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    class="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition resize-none hover:border-teal-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                </div>

                <!-- แนบเอกสาร -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">เอกสารแนบ (รูปภาพ / PDF)</label>
                  <label class="group flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-slate-700/30 transition">
                    <div class="w-8 h-8 bg-slate-100 dark:bg-slate-700 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 rounded-lg flex items-center justify-center transition shrink-0">
                      <PaperClipIcon class="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-teal-700 transition truncate">
                        {{ form.documentFile ? form.documentFile.name : 'เลือกไฟล์แนบ' }}
                      </p>
                      <p class="text-[10px] text-slate-400 dark:text-slate-500">jpg, png, pdf — ไม่เกิน 20 MB</p>
                    </div>
                    <input type="file" accept="image/*,.pdf" class="hidden" @change="onFileChange" />
                  </label>
                  <div v-if="docPreview" class="mt-2 relative rounded-xl overflow-hidden border border-slate-200">
                    <img :src="docPreview" class="w-full max-h-40 object-cover" />
                    <button type="button" @click="clearFile"
                      class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition">
                      <XMarkIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div v-else-if="form.documentFile"
                    class="mt-2 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl px-3.5 py-2.5">
                    <DocumentTextIcon class="w-4 h-4 text-red-500 shrink-0" />
                    <span class="truncate">{{ form.documentFile.name }}</span>
                    <button type="button" @click="clearFile" class="ml-auto text-slate-400 hover:text-red-500 transition">
                      <XMarkIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button type="submit"
                  :disabled="submitting || !form.vehicleId || !form.type || !form.expiryDate"
                  class="w-full py-3.5 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2">
                  <span v-if="submitting" class="flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    กำลังบันทึก...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <CheckCircleIcon class="w-4 h-4" /> บันทึกการต่ออายุ
                  </span>
                </button>
              </form>
            </div>

            <!-- Preview ยานพาหนะที่เลือก -->
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
                      <div class="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                        <TruckIcon class="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <div class="font-bold text-slate-800 dark:text-white">{{ selectedVehicle.licensePlate }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">{{ selectedVehicle.type }}</div>
                      </div>
                    </div>

                    <!-- Status of each type -->
                    <div v-for="t in renewalTypes" :key="t.value" class="flex items-center justify-between">
                      <div class="flex items-center gap-2 text-sm">
                        <div :class="['w-6 h-6 rounded-lg flex items-center justify-center', t.iconBg]">
                          <component :is="t.icon" class="w-3.5 h-3.5" :class="t.iconColor" />
                        </div>
                        <span class="text-slate-600 dark:text-slate-300 font-medium">{{ t.label }}</span>
                      </div>
                      <div class="text-right">
                        <span v-if="getVehicleExpiry(t.value)"
                          :class="getExpiryClass(getVehicleExpiry(t.value))"
                          class="text-xs font-bold">
                          {{ fmtDate(getVehicleExpiry(t.value)) }}
                        </span>
                        <span v-else class="text-xs text-slate-300 dark:text-slate-600">ไม่มีข้อมูล</span>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- Help card -->
              <div v-if="!selectedVehicle" class="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <DocumentTextIcon class="w-7 h-7 text-teal-500" />
                </div>
                <div>
                  <p class="font-semibold text-teal-800 dark:text-teal-300 text-sm">เลือกยานพาหนะก่อน</p>
                  <p class="text-teal-600 dark:text-teal-400 text-xs mt-1">ระบบจะแสดงข้อมูลวันหมดอายุปัจจุบัน<br>และบริษัทที่บันทึกไว้สำหรับคันนั้น</p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Tab 3: ประวัติ -->
        <TabPanel>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden mt-0">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
                <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-teal-500" />
                  ประวัติการต่ออายุ
                  <span class="text-sm font-normal text-slate-400">{{ histTotal }} รายการ</span>
                </h2>
                <div class="flex flex-wrap items-center gap-2">
                  <AppDateFilter default-mode="all" @change="onDateChange" />
                  <div class="w-52">
                    <AppSelect v-model="filterVehicleId" :options="vehicleFilterOptions" :icon="TruckIcon" placeholder="ยานพาหนะทั้งหมด" />
                  </div>
                  <div class="w-36">
                    <AppSelect v-model="filterType" :options="typeFilterOptions" placeholder="ทุกประเภท" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop table -->
            <div class="hidden sm:block" v-if="filteredRenewals.length">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50/70 dark:bg-slate-700/30">
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ยานพาหนะ</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ประเภท</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">บริษัท</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">วันหมดอายุใหม่</th>
                    <th class="text-left py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">บันทึกเมื่อ</th>
                    <th class="text-center py-3 px-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">เอกสาร</th>
                    <th class="py-3 px-5"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                  <tr v-for="r in filteredRenewals" :key="r.id" class="hover:bg-teal-50/30 dark:hover:bg-slate-700/30 transition group">
                    <td class="py-3.5 px-5">
                      <div class="font-semibold text-sm text-slate-800 dark:text-white">{{ r.vehicle.licensePlate }}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500">{{ r.vehicle.type }}</div>
                    </td>
                    <td class="py-3.5 px-5">
                      <span :class="typePillClass(r.type)"
                        class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full">
                        <component :is="typeIconMap[r.type]" class="w-3 h-3" />
                        {{ typeLabel(r.type) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-5 text-sm text-slate-600 dark:text-slate-300">{{ r.provider || '—' }}</td>
                    <td class="py-3.5 px-5">
                      <span :class="getExpiryClass(r.expiryDate)" class="text-sm font-semibold">
                        {{ fmtDate(r.expiryDate) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300">
                      <div>{{ fmtDateTime(r.createdAt) }}</div>
                      <div class="text-slate-500 dark:text-slate-400 font-medium">{{ r.user?.displayName || r.user?.username }}</div>
                    </td>
                    <td class="py-3.5 px-5 text-center">
                      <a v-if="r.documentPath" :href="fileUrl(r.documentPath)" target="_blank"
                        class="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 px-2.5 py-1 rounded-lg transition font-medium">
                        <component :is="isPdf(r.documentPath) ? DocumentTextIcon : PhotoIcon" class="w-3.5 h-3.5" />
                        ดูไฟล์
                      </a>
                      <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <button @click="deleteRenewal(r)"
                        class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                        <TrashIcon class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile cards -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="filteredRenewals.length">
              <div v-for="r in filteredRenewals" :key="r.id" class="p-4 group">
                <div class="flex items-start gap-3">
                  <div :class="typeBadgeClass(r.type)" class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                    <component :is="typeIconMap[r.type]" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-sm text-slate-800 dark:text-white">{{ r.vehicle.licensePlate }}</span>
                      <span :class="typePillClass(r.type)" class="text-[10px] font-bold px-2 py-0.5 rounded-full">{{ typeLabel(r.type) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      <span v-if="r.provider">{{ r.provider }}</span>
                      <span>หมดอายุ <span :class="getExpiryClass(r.expiryDate)" class="font-bold">{{ fmtDate(r.expiryDate) }}</span></span>
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{{ fmtDateTime(r.createdAt) }} · {{ r.user?.displayName || r.user?.username }}</div>
                    <div v-if="r.note" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{{ r.note }}</div>
                    <div class="flex gap-2 mt-1.5">
                      <a v-if="r.documentPath" :href="fileUrl(r.documentPath)" target="_blank"
                        class="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-lg font-medium">
                        <component :is="isPdf(r.documentPath) ? DocumentTextIcon : PhotoIcon" class="w-3 h-3" />ดูไฟล์
                      </a>
                    </div>
                  </div>
                  <button @click="deleteRenewal(r)" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100 shrink-0">
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

            <div v-if="!filteredRenewals.length" class="py-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
              <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <DocumentTextIcon class="w-8 h-8 opacity-40" />
              </div>
              <p class="text-sm font-medium">ยังไม่มีประวัติการต่ออายุ</p>
              <button @click="activeTab = 1" class="text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-xl transition">
                + บันทึกการต่ออายุใหม่
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
import { useRouter } from 'vue-router'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import {
  DocumentTextIcon, PlusCircleIcon, TruckIcon, CalendarIcon, CalendarDaysIcon,
  ClockIcon, CheckCircleIcon, XMarkIcon, TrashIcon, PaperClipIcon, PhotoIcon,
  BuildingOfficeIcon, ShieldCheckIcon, FireIcon, TableCellsIcon, PhoneIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { fmtDateTh, fmtDateTimeTh, toLocalDateStr } from '../stores/date'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

const BASE_URL = ``
const router = useRouter()

const PAGE_SIZE = 10

const vehicles = ref([])
const renewals = ref([])
const submitting = ref(false)
const activeTab = ref(0)

const filterVehicleId = ref('')
const filterType = ref('')
const filterStart = ref('')
const filterEnd = ref('')
const histPage = ref(1)
const histTotal = ref(0)
const histTotalPages = ref(0)

function onDateChange({ startDate, endDate }) {
  filterStart.value = startDate
  filterEnd.value = endDate
  histPage.value = 1
  loadHistory()
}

const form = ref({ vehicleId: '', type: '', expiryDate: '', note: '', documentFile: null })
const selectedProviders = ref([])
const docPreview = ref(null)

const PRB_PROVIDERS = [
  { field: 'prbLmg', label: 'LMG' }, { field: 'prbViriya', label: 'วิริยะ' },
  { field: 'prbAkney', label: 'อาคเนย์' }, { field: 'prbThewet', label: 'เทเวศ' },
  { field: 'prbInsurance', label: 'ประกันคุ้มภัย' }, { field: 'prbBangkokInsurance', label: 'กรุงเทพประกันภัย' },
  { field: 'prbThirdParty', label: 'ทำประกันภัย' }
]
const INS_PROVIDERS = [
  { field: 'insLmg', label: 'LMG' }, { field: 'insViriya', label: 'วิริยะ' },
  { field: 'insThaiInsurance', label: 'ไทยประกัน' }, { field: 'insInsurance', label: 'ประกันคุ้มภัย' },
  { field: 'insAkney', label: 'อาคเนย์' }, { field: 'insThewet', label: 'เทเวศ' },
  { field: 'insBangkokInsurance', label: 'กรุงเทพประกันภัย' }
]

const renewalTypes = [
  { value: 'PRB', label: 'พ.ร.บ.', icon: ShieldCheckIcon, activeClass: 'border-blue-400 bg-blue-50 text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { value: 'TAX', label: 'ภาษี', icon: BuildingOfficeIcon, activeClass: 'border-amber-400 bg-amber-50 text-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { value: 'INS', label: 'ประกัน', icon: DocumentTextIcon, activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { value: 'GAS', label: 'แก๊ส', icon: FireIcon, activeClass: 'border-orange-400 bg-orange-50 text-orange-700', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
]

const typeIconMap = { PRB: ShieldCheckIcon, TAX: BuildingOfficeIcon, INS: DocumentTextIcon, GAS: FireIcon }

const tabs = [
  { id: 'overview', label: 'ภาพรวมยานพาหนะ', icon: TableCellsIcon },
  { id: 'form', label: 'บันทึกการต่ออายุ', icon: PlusCircleIcon },
  { id: 'history', label: 'ประวัติทั้งหมด', icon: ClockIcon }
]

const vehicleOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} — ${v.type}` }))
)

const vehicleFilterOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: v.licensePlate }))
)

const typeFilterOptions = [
  { value: 'PRB', label: 'พ.ร.บ.', icon: ShieldCheckIcon },
  { value: 'TAX', label: 'ภาษี', icon: BuildingOfficeIcon },
  { value: 'INS', label: 'ประกัน', icon: DocumentTextIcon },
  { value: 'GAS', label: 'แก๊ส', icon: FireIcon }
]

const selectedVehicle = computed(() =>
  vehicles.value.find(v => v.id === Number(form.value.vehicleId)) || null
)

const GAS_TYPES = [
  { field: 'gasNgv', label: 'NGV' },
  { field: 'gasLpg', label: 'LPG' }
]

const availableProviders = computed(() => {
  if (!form.value.type) return []
  const v = selectedVehicle.value
  if (form.value.type === 'PRB' && v) return PRB_PROVIDERS.filter(p => v[p.field]).map(p => ({ value: p.label, label: p.label }))
  if (form.value.type === 'INS' && v) return INS_PROVIDERS.filter(p => v[p.field]).map(p => ({ value: p.label, label: p.label }))
  if (form.value.type === 'GAS') return GAS_TYPES.map(p => ({ value: p.label, label: p.label }))
  return []
})

function getVehicleExpiry(type) {
  if (!selectedVehicle.value) return null
  return {
    PRB: selectedVehicle.value.prbExpiry,
    TAX: selectedVehicle.value.taxRenewalDate,
    INS: selectedVehicle.value.insExpiry,
    GAS: selectedVehicle.value.gasExpiry
  }[type]
}

const currentExpiryDisplay = computed(() => {
  const val = getVehicleExpiry(form.value.type)
  return val ? fmtDateTh(val) : 'ยังไม่มีข้อมูล'
})

const currentExpiryClass = computed(() => {
  const val = getVehicleExpiry(form.value.type)
  return getExpiryClass(val)
})

function getExpiryClass(val) {
  if (!val) return 'text-slate-400'
  const diff = Math.round((new Date(val) - new Date()) / 86400000)
  if (diff < 0) return 'text-red-600'
  if (diff <= 30) return 'text-amber-600'
  return 'text-emerald-600'
}

const filteredRenewals = computed(() => renewals.value)

function toggleProvider(val) {
  const idx = selectedProviders.value.indexOf(val)
  if (idx === -1) selectedProviders.value.push(val)
  else selectedProviders.value.splice(idx, 1)
}

function onVehicleChange() { selectedProviders.value = []; form.value.type = '' }
function onFileChange(e) {
  const file = e.target.files[0]; if (!file) return
  form.value.documentFile = file
  docPreview.value = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
}
function clearFile() { form.value.documentFile = null; docPreview.value = null }

function fmtDate(d) { return fmtDateTh(d) }
function fmtDateTime(d) { return fmtDateTimeTh(d) }
function fileUrl(filename) {
  if (!filename) return null
  if (filename.startsWith('https://')) return `${BASE_URL}/api/media/proxy?url=${encodeURIComponent(filename)}`
  if (filename.startsWith('http')) return filename
  return `${BASE_URL}/uploads/${filename}`
}
function isPdf(filename) { return filename?.toLowerCase().endsWith('.pdf') }
function typeLabel(type) { return { PRB: 'พ.ร.บ.', TAX: 'ภาษี', INS: 'ประกัน', GAS: 'แก๊ส' }[type] }
function typePillClass(type) {
  return {
    PRB: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    TAX: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    INS: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    GAS: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
  }[type]
}
function typeBadgeClass(type) {
  return {
    PRB: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    TAX: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    INS: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    GAS: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
  }[type]
}

async function loadVehicles() {
  const res = await api.get('/vehicles')
  vehicles.value = res.data
}

async function loadHistory() {
  const params = { page: histPage.value, limit: PAGE_SIZE }
  if (filterVehicleId.value) params.vehicleId = filterVehicleId.value
  if (filterType.value) params.type = filterType.value
  if (filterStart.value) params.startDate = filterStart.value
  if (filterEnd.value) params.endDate = filterEnd.value
  const res = await api.get('/renewals', { params })
  renewals.value = res.data.renewals
  histTotal.value = res.data.total
  histTotalPages.value = res.data.totalPages
}

async function loadData() {
  await Promise.all([loadVehicles(), loadHistory()])
}

async function submitRenewal() {
  if (!form.value.vehicleId || !form.value.type || !form.value.expiryDate) return
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('vehicleId', form.value.vehicleId)
    fd.append('userId', auth.user.id)
    fd.append('type', form.value.type)
    fd.append('expiryDate', form.value.expiryDate)
    if (selectedProviders.value.length) fd.append('provider', selectedProviders.value.join(', '))
    if (form.value.note) fd.append('note', form.value.note)
    if (form.value.documentFile) fd.append('document', form.value.documentFile)

    const savedVehicleId = form.value.vehicleId
    const savedVehicle = selectedVehicle.value
    await api.post('/renewals', fd)
    const tLabel = typeLabel(form.value.type)

    form.value = { vehicleId: form.value.vehicleId, type: '', expiryDate: '', note: '', documentFile: null }
    selectedProviders.value = []
    docPreview.value = null

    histPage.value = 1
    await Promise.all([loadVehicles(), loadHistory()])

    const confirm = await swalConfirm(
      'บันทึกสำเร็จ',
      `ต่ออายุ${tLabel}เรียบร้อยแล้ว\n\nต้องการเบิกยานพาหนะ "${savedVehicle?.licensePlate}" เลยไหม?`,
      'เบิกยานพาหนะ'
    )
    if (confirm.isConfirmed) {
      router.push(`/bookings?vehicleId=${savedVehicleId}`)
    }
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
  } finally {
    submitting.value = false
  }
}

async function deleteRenewal(r) {
  const result = await swalConfirm('ลบประวัติ', `ต้องการลบประวัติต่ออายุ${typeLabel(r.type)} ${r.vehicle.licensePlate} ?`, 'ลบ', true)
  if (!result.isConfirmed) return
  try {
    await api.delete(`/renewals/${r.id}`, { data: { actionUserId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', 'ลบประวัติเรียบร้อยแล้ว')
    if (renewals.value.length === 1 && histPage.value > 1) histPage.value--
    await loadHistory()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถลบได้')
  }
}

// ─── Overview tab ────────────────────────────────────────────────────────────
const overviewSearch = ref('')
const overviewFilter = ref('')
const overviewFilterOptions = [
  { value: 'expired', label: 'หมดอายุ' },
  { value: 'warning', label: 'ใกล้หมด (≤30 วัน)' },
  { value: 'ok', label: 'ปกติ' }
]

function ovStatus(d) {
  if (!d) return 'none'
  const days = Math.floor((new Date(d) - new Date()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 30) return 'warning'
  return 'ok'
}
function ovChip(d) {
  return {
    none:    'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500',
    expired: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    ok:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
  }[ovStatus(d)]
}
function ovLabel(d) {
  const s = ovStatus(d)
  if (s === 'none') return '-'
  const days = Math.floor((new Date(d) - new Date()) / 86400000)
  if (s === 'expired') return 'หมดแล้ว'
  if (s === 'warning') return `${days} วัน`
  return 'ปกติ'
}

const filteredOverviewVehicles = computed(() => {
  let r = vehicles.value
  if (overviewSearch.value) {
    const q = overviewSearch.value.toLowerCase()
    r = r.filter(v => v.licensePlate.toLowerCase().includes(q) || v.type.toLowerCase().includes(q))
  }
  if (overviewFilter.value) {
    const f = overviewFilter.value
    r = r.filter(v => [ovStatus(v.prbExpiry), ovStatus(v.taxRenewalDate), ovStatus(v.insExpiry), ovStatus(v.gasExpiry)].includes(f))
  }
  return r
})

const overviewStats = computed(() => {
  const allStatuses = v => [ovStatus(v.prbExpiry), ovStatus(v.taxRenewalDate), ovStatus(v.insExpiry), ovStatus(v.gasExpiry)].filter(s => s !== 'none')
  return {
    expired: vehicles.value.filter(v => allStatuses(v).includes('expired')).length,
    warning: vehicles.value.filter(v => !allStatuses(v).includes('expired') && allStatuses(v).includes('warning')).length,
    ok:      vehicles.value.filter(v => allStatuses(v).length > 0 && allStatuses(v).every(s => s === 'ok')).length
  }
})

watch(filterVehicleId, () => { histPage.value = 1; loadHistory() })
watch(filterType, () => { histPage.value = 1; loadHistory() })
watch(histPage, loadHistory)

onMounted(loadData)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
