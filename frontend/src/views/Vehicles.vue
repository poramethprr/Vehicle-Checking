<template>
  <div>
    <div class="relative bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-950 dark:to-cyan-950 rounded-2xl px-6 py-5 mb-6 overflow-hidden shadow-md shadow-blue-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <TruckIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">จัดการยานพาหนะ</h1>
            <p class="text-blue-200 text-xs mt-0.5">ข้อมูลยานพาหนะ, พ.ร.บ., ประกัน, แก๊ส</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 self-start sm:self-auto">
          <button @click="openForm(null)"
            class="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-700 dark:to-teal-800 dark:hover:from-emerald-800 dark:hover:to-teal-900 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-300 dark:shadow-black/30 hover:-translate-y-0.5 active:scale-[0.97] flex items-center gap-1.5 ring-2 ring-emerald-400/40 dark:ring-white/10">
            <PlusCircleIcon class="w-4 h-4 shrink-0" /> <span>เพิ่มยานพาหนะ</span>
          </button>
          <button @click="exportVehicles"
            class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold px-3 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-4 h-4 shrink-0" /> <span class="hidden sm:inline">Export</span>
          </button>
          <label
            class="bg-slate-500 hover:bg-slate-600 text-white font-semibold px-3 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-1.5">
            <ArrowUpTrayIcon class="w-4 h-4 shrink-0" /> <span class="hidden sm:inline">Import</span>
            <input type="file" accept=".xlsx,.xls" @change="importVehicles" class="hidden" />
          </label>
          <button @click="printAllQR"
            class="bg-violet-500 hover:bg-violet-600 dark:bg-violet-700 dark:hover:bg-violet-800 text-white font-semibold px-3 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-1.5">
            <QrCodeIcon class="w-4 h-4 shrink-0" /> <span class="hidden sm:inline">QR ทั้งหมด</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-linear-to-br from-white to-blue-50/40 dark:from-slate-800 dark:to-slate-800 rounded-2xl shadow-lg shadow-blue-200/40 border border-blue-200 dark:border-slate-700 p-4 sm:p-5 mb-5 overflow-visible">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon
            class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input v-model="searchQuery" placeholder="ค้นหาทะเบียน, ประเภท, เลขตัวถัง, เลขเครื่อง..."
            class="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm transition hover:border-blue-400 dark:text-white dark:placeholder-slate-400" />
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-visible">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TruckIcon class="w-5 h-5 text-blue-500" /> รายการยานพาหนะ
          <span class="text-sm font-normal text-slate-400 dark:text-slate-500">{{ filteredVehicles.length }}/{{ vehicles.length }}</span>
        </h3>
      </div>

      <!-- Mobile: Cards -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="paginatedVehicles.length">
        <div v-for="v in paginatedVehicles" :key="v.id" class="px-4 py-3.5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700/50">
              <img v-if="v.photo" :src="resolveUrl(v.photo)" class="w-full h-full object-cover" />
              <div v-else :class="statusColor(v.status)" class="w-full h-full flex items-center justify-center">
                <TruckIcon class="w-5 h-5" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800 dark:text-white">{{ v.licensePlate }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500">{{ v.type }} · {{ statusLabel(v.status) }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3 pl-13">
            <div v-if="v.chassisNumber"><span class="text-slate-400 dark:text-slate-500">ตัวถัง:</span> {{ v.chassisNumber }}</div>
            <div v-if="v.engineNumber"><span class="text-slate-400 dark:text-slate-500">เครื่อง:</span> {{ v.engineNumber }}</div>
            <div v-if="v.registrationBookNumber"><span class="text-slate-400 dark:text-slate-500">เล่มทะเบียน:</span> {{ v.registrationBookNumber }}</div>
            <div v-if="v.currentMileage"><span class="text-slate-400 dark:text-slate-500">ไมล์:</span> {{ num(v.currentMileage) }}</div>
            <div v-if="v.taxRenewalDate"><span class="text-slate-400 dark:text-slate-500">ต่อภาษี:</span> {{ fmtDate(v.taxRenewalDate) }}
            </div>
          </div>
          <div class="flex gap-1 mb-3 flex-wrap">
            <span :class="expiryChip(v.prbExpiry)" class="flex-1 text-center text-[10px] font-semibold px-1.5 py-1.5 rounded-lg min-w-0">
              {{ expiryShortLabel(v.prbExpiry, 'พ.ร.บ.') }}
            </span>
            <span :class="expiryChip(v.taxRenewalDate)" class="flex-1 text-center text-[10px] font-semibold px-1.5 py-1.5 rounded-lg min-w-0">
              {{ expiryShortLabel(v.taxRenewalDate, 'ภาษี') }}
            </span>
            <span :class="expiryChip(v.insExpiry)" class="flex-1 text-center text-[10px] font-semibold px-1.5 py-1.5 rounded-lg min-w-0">
              {{ expiryShortLabel(v.insExpiry, 'ประกัน') }}
            </span>
            <span v-if="v.gasExpiry" :class="expiryChip(v.gasExpiry)" class="flex-1 text-center text-[10px] font-semibold px-1.5 py-1.5 rounded-lg min-w-0">
              {{ expiryShortLabel(v.gasExpiry, 'แก๊ส') }}
            </span>
          </div>
          <div class="flex gap-2">
            <button @click="openForm(v)"
              class="flex-1 flex items-center justify-center gap-1 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold py-2 rounded-xl transition ring-1 ring-amber-200 dark:ring-amber-800/50">
              <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button @click="openDetail(v)"
              class="flex-1 flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold py-2 rounded-xl transition ring-1 ring-blue-200 dark:ring-blue-800/50">
              <EyeIcon class="w-3.5 h-3.5" /> ดูข้อมูล
            </button>
            <button @click="openQr(v)"
              class="flex items-center justify-center gap-1 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold py-2 px-3 rounded-xl transition ring-1 ring-violet-200 dark:ring-violet-800/50">
              <QrCodeIcon class="w-3.5 h-3.5" />
            </button>
            <button @click="confirmDelete(v)"
              class="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold py-2 px-3 rounded-xl transition ring-1 ring-red-200 dark:ring-red-800/50">
              <TrashIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop: Table -->
      <div class="hidden sm:block overflow-x-auto" v-if="paginatedVehicles.length">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-700/30">
              <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase w-8"></th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
              <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ทะเบียน</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">สถานะ</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">พ.ร.บ. / ภาษี / ประกัน / แก๊ส</th>
              <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="v in paginatedVehicles" :key="v.id">
              <!-- Main row -->
              <tr class="border-t border-gray-100 dark:border-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition cursor-pointer"
                  @click="expandedId = expandedId === v.id ? null : v.id">
                <!-- Chevron -->
                <td class="py-3 pl-4 pr-1 w-8">
                  <ChevronDownIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200"
                    :class="expandedId === v.id ? 'rotate-180 text-blue-500' : ''" />
                </td>
                <!-- ยานพาหนะ -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700/50">
                      <img v-if="v.photo" :src="resolveUrl(v.photo)" class="w-full h-full object-cover" />
                      <div v-else :class="statusColor(v.status)" class="w-full h-full flex items-center justify-center">
                        <TruckIcon class="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-800 dark:text-white">{{ v.type }}</div>
                      <div v-if="v.currentMileage" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ไมล์: {{ num(v.currentMileage) }} กม.</div>
                    </div>
                  </div>
                </td>
                <!-- ทะเบียน -->
                <td class="py-3 px-4">
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">{{ v.licensePlate }}</div>
                  <div v-if="v.registrationBookNumber" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">เล่มทะเบียน: {{ v.registrationBookNumber }}</div>
                </td>
                <!-- สถานะ -->
                <td class="py-3 px-4 text-center">
                  <span :class="statusBadge(v.status)" class="text-xs font-semibold px-2.5 py-1 rounded-full">{{ statusLabel(v.status) }}</span>
                </td>
                <!-- เอกสาร chips -->
                <td class="py-3 px-4 text-center">
                  <div class="flex items-center justify-center gap-1.5 flex-wrap">
                    <span :class="expiryChip(v.prbExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                      {{ expiryShortLabel(v.prbExpiry, 'พ.ร.บ.') }}
                    </span>
                    <span :class="expiryChip(v.taxRenewalDate)" class="text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                      {{ expiryShortLabel(v.taxRenewalDate, 'ภาษี') }}
                    </span>
                    <span :class="expiryChip(v.insExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                      {{ expiryShortLabel(v.insExpiry, 'ประกัน') }}
                    </span>
                    <span v-if="v.gasExpiry" :class="expiryChip(v.gasExpiry)" class="text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                      {{ expiryShortLabel(v.gasExpiry, 'แก๊ส') }}
                    </span>
                  </div>
                </td>
                <!-- Actions -->
                <td class="py-3 px-4 text-right whitespace-nowrap" @click.stop>
                  <button @click="openForm(v)"
                    class="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                    <PencilSquareIcon class="w-3.5 h-3.5" />
                  </button>
                  <button @click="openQr(v)"
                    class="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                    <QrCodeIcon class="w-3.5 h-3.5" />
                  </button>
                  <button @click="confirmDelete(v)"
                    class="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>

              <!-- Expanded detail panel -->
              <tr v-if="expandedId === v.id" class="border-t border-blue-100 dark:border-slate-700">
                <td colspan="6" class="px-0 py-0">
                  <div class="bg-linear-to-br from-blue-50/60 to-slate-50/40 dark:from-slate-700/40 dark:to-slate-700/20 px-6 py-4 border-b border-blue-100 dark:border-slate-700">
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

                      <!-- Col 1: ข้อมูลพื้นฐาน -->
                      <div class="space-y-3">
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ข้อมูลรถ</p>
                        <div class="space-y-1.5 text-xs">
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-24">เลขตัวถัง</span>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ v.chassisNumber || '-' }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-24">เลขเครื่องยนต์</span>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ v.engineNumber || '-' }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-24">เล่มทะเบียน</span>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ v.registrationBookNumber || '-' }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-24">ไมล์ปัจจุบัน</span>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ v.currentMileage ? num(v.currentMileage) + ' กม.' : '-' }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-24">ไมล์ถัดไป</span>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ v.nextMileage ? num(v.nextMileage) + ' กม.' : '-' }}</span>
                          </div>
                          <div class="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                            <div class="flex items-baseline gap-2">
                              <span class="text-slate-400 dark:text-slate-500 shrink-0 w-24">ต่อภาษีรถ</span>
                              <span :class="v.taxRenewalDate ? expiryChip(v.taxRenewalDate) : 'text-slate-400'" class="font-medium text-xs px-1.5 py-0.5 rounded">{{ v.taxRenewalDate ? fmtDate(v.taxRenewalDate) : '-' }}</span>
                            </div>
                            <button v-if="v.taxDoc" @click.stop="openDoc(v.taxDoc)" class="mt-1.5 flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                              <PaperClipIcon class="w-3 h-3" /> ดูเอกสารภาษี
                            </button>
                          </div>
                          <div v-if="v.note" class="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg px-2.5 py-1.5 text-amber-800 dark:text-amber-300">
                            <span class="font-semibold">หมายเหตุ:</span> {{ v.note }}
                          </div>
                        </div>
                      </div>

                      <!-- Col 2: พ.ร.บ. -->
                      <div class="space-y-3">
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">พ.ร.บ.</p>
                        <div class="space-y-1.5 text-xs">
                          <div class="flex items-center gap-2">
                            <span :class="expiryChip(v.prbExpiry)" class="text-[10px] font-bold px-2 py-0.5 rounded-md">{{ expiryShortLabel(v.prbExpiry, 'พ.ร.บ.') }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันหมดอายุ</span>
                            <span class="font-semibold" :class="v.prbExpiry ? (expiryStatus(v.prbExpiry) === 'expired' ? 'text-red-600' : expiryStatus(v.prbExpiry) === 'warning' ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'">{{ v.prbExpiry ? fmtDate(v.prbExpiry) : 'ไม่ระบุ' }}</span>
                          </div>
                          <div v-if="v.prbDate" class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันที่ พ.ร.บ.</span>
                            <span class="text-slate-600 dark:text-slate-300">{{ fmtDate(v.prbDate) }}</span>
                          </div>
                          <div v-if="v.prbTaxDate" class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันต่อภาษี</span>
                            <span class="text-slate-600 dark:text-slate-300">{{ fmtDate(v.prbTaxDate) }}</span>
                          </div>
                          <div v-if="v.prbContact" class="flex items-center gap-1.5 text-blue-600 font-medium">
                            <PhoneIcon class="w-3 h-3 shrink-0" />
                            <a :href="`tel:${v.prbContact}`" class="hover:underline" @click.stop>{{ v.prbContact }}</a>
                          </div>
                          <button v-if="v.prbDoc" @click.stop="openDoc(v.prbDoc)" class="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                            <PaperClipIcon class="w-3 h-3" /> ดูเอกสาร พ.ร.บ.
                          </button>
                          <div class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                            <span :class="v.prbLmg ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.prbLmg ? '✓' : '✗' }}</span> LMG</span>
                            <span :class="v.prbViriya ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.prbViriya ? '✓' : '✗' }}</span> วิริยะ</span>
                            <span :class="v.prbAkney ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.prbAkney ? '✓' : '✗' }}</span> อาคเนย์</span>
                            <span :class="v.prbThewet ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.prbThewet ? '✓' : '✗' }}</span> เทเวศ</span>
                            <span :class="v.prbInsurance ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.prbInsurance ? '✓' : '✗' }}</span> คุ้มภัย</span>
                            <span :class="v.prbBangkokInsurance ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.prbBangkokInsurance ? '✓' : '✗' }}</span> กรุงเทพ</span>
                            <span :class="v.prbThirdParty ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1 col-span-2"><span>{{ v.prbThirdParty ? '✓' : '✗' }}</span> ทำประกันภัยรถ</span>
                          </div>
                        </div>
                      </div>

                      <!-- Col 3: ประกัน -->
                      <div class="space-y-3">
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">รอบต่อประกัน</p>
                        <div class="space-y-1.5 text-xs">
                          <div class="flex items-center gap-2">
                            <span :class="expiryChip(v.insExpiry)" class="text-[10px] font-bold px-2 py-0.5 rounded-md">{{ expiryShortLabel(v.insExpiry, 'ประกัน') }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันหมดอายุ</span>
                            <span class="font-semibold" :class="v.insExpiry ? (expiryStatus(v.insExpiry) === 'expired' ? 'text-red-600' : expiryStatus(v.insExpiry) === 'warning' ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'">{{ v.insExpiry ? fmtDate(v.insExpiry) : 'ไม่ระบุ' }}</span>
                          </div>
                          <div v-if="v.insDate" class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันที่ประกัน</span>
                            <span class="text-slate-600 dark:text-slate-300">{{ fmtDate(v.insDate) }}</span>
                          </div>
                          <div v-if="v.insTaxDate" class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันต่อภาษี</span>
                            <span class="text-slate-600 dark:text-slate-300">{{ fmtDate(v.insTaxDate) }}</span>
                          </div>
                          <div v-if="v.insContact" class="flex items-center gap-1.5 text-blue-600 font-medium">
                            <PhoneIcon class="w-3 h-3 shrink-0" />
                            <a :href="`tel:${v.insContact}`" class="hover:underline" @click.stop>{{ v.insContact }}</a>
                          </div>
                          <button v-if="v.insDoc" @click.stop="openDoc(v.insDoc)" class="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                            <PaperClipIcon class="w-3 h-3" /> ดูเอกสารประกัน
                          </button>
                          <div class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                            <span :class="v.insLmg ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.insLmg ? '✓' : '✗' }}</span> LMG</span>
                            <span :class="v.insViriya ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.insViriya ? '✓' : '✗' }}</span> วิริยะ</span>
                            <span :class="v.insThaiInsurance ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.insThaiInsurance ? '✓' : '✗' }}</span> ไทยประกัน</span>
                            <span :class="v.insInsurance ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.insInsurance ? '✓' : '✗' }}</span> คุ้มภัย</span>
                            <span :class="v.insAkney ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.insAkney ? '✓' : '✗' }}</span> อาคเนย์</span>
                            <span :class="v.insThewet ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.insThewet ? '✓' : '✗' }}</span> เทเวศ</span>
                            <span :class="v.insBangkokInsurance ? 'text-emerald-600' : 'text-slate-300'" class="flex items-center gap-1 col-span-2"><span>{{ v.insBangkokInsurance ? '✓' : '✗' }}</span> กรุงเทพ</span>
                          </div>
                        </div>
                      </div>

                      <!-- Col 4: แก๊ส -->
                      <div class="space-y-3">
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">แก๊ส</p>
                        <div class="space-y-1.5 text-xs">
                          <div class="flex gap-3">
                            <span :class="v.gasNgv ? 'text-emerald-600 font-semibold' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.gasNgv ? '✓' : '✗' }}</span> NGV</span>
                            <span :class="v.gasLpg ? 'text-emerald-600 font-semibold' : 'text-slate-300'" class="flex items-center gap-1"><span>{{ v.gasLpg ? '✓' : '✗' }}</span> LPG</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span :class="expiryChip(v.gasExpiry)" class="text-[10px] font-bold px-2 py-0.5 rounded-md">{{ expiryShortLabel(v.gasExpiry, 'แก๊ส') }}</span>
                          </div>
                          <div class="flex items-baseline gap-2">
                            <span class="text-slate-400 dark:text-slate-500 shrink-0 w-20">วันหมดอายุ</span>
                            <span class="font-semibold" :class="v.gasExpiry ? (expiryStatus(v.gasExpiry) === 'expired' ? 'text-red-600' : expiryStatus(v.gasExpiry) === 'warning' ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'">{{ v.gasExpiry ? fmtDate(v.gasExpiry) : 'ไม่ระบุ' }}</span>
                          </div>
                          <div v-if="v.gasContact" class="flex items-center gap-1.5 text-blue-600 font-medium">
                            <PhoneIcon class="w-3 h-3 shrink-0" />
                            <a :href="`tel:${v.gasContact}`" class="hover:underline" @click.stop>{{ v.gasContact }}</a>
                          </div>
                          <button v-if="v.gasDoc" @click.stop="openDoc(v.gasDoc)" class="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                            <PaperClipIcon class="w-3 h-3" /> ดูเอกสารแก๊ส
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <AppEmpty v-if="!filteredVehicles.length && vehicles.length" :icon="MagnifyingGlassIcon" title="ไม่พบยานพาหนะ"
        subtitle="ลองเปลี่ยนคำค้นหาหรือตัวกรอง" />
      <AppEmpty v-if="!vehicles.length" :icon="TruckIcon" title="ยังไม่มียานพาหนะ"
        subtitle="กดปุ่ม 'เพิ่มยานพาหนะ' เพื่อเริ่มต้น" />

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-slate-700">
        <span class="text-xs text-slate-400 dark:text-slate-500">
          แสดง {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredVehicles.length) }}
          จาก {{ filteredVehicles.length }} รายการ
        </span>
        <div class="flex items-center gap-1">
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-medium">
            ‹
          </button>
          <template v-for="p in totalPages" :key="p">
            <button @click="currentPage = p"
              :class="[p === currentPage ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700', 'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition']">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-medium">
            ›
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <TransitionRoot :show="!!detailVehicle" as="template">
      <Dialog @close="detailVehicle = null" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 sm:scale-100"
            leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel
              class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div
                class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
                <DialogTitle class="font-bold text-slate-800 dark:text-white">ข้อมูลยานพาหนะ</DialogTitle>
                <button @click="detailVehicle = null" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <XMarkIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              <div class="p-5 space-y-4" v-if="detailVehicle">
                <!-- รูปยานพาหนะ -->
                <div v-if="detailVehicle.photo" class="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-700 max-h-48">
                  <img :src="resolveUrl(detailVehicle.photo)" class="w-full h-full object-cover" />
                </div>
                <div class="flex items-center gap-3 mb-2">
                  <div :class="statusColor(detailVehicle.status)"
                    class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <TruckIcon class="w-6 h-6" />
                  </div>
                  <div>
                    <div class="font-bold text-lg text-slate-800 dark:text-white">{{ detailVehicle.licensePlate }}</div>
                    <div class="text-sm text-slate-400 dark:text-slate-500">{{ detailVehicle.type }}</div>
                  </div>
                  <span :class="statusBadge(detailVehicle.status)"
                    class="ml-auto text-xs font-semibold px-3 py-1 rounded-full">{{ statusLabel(detailVehicle.status)
                    }}</span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <InfoItem label="เลขตัวถัง" :value="detailVehicle.chassisNumber" />
                  <InfoItem label="เลขเครื่องยนต์" :value="detailVehicle.engineNumber" />
                  <InfoItem label="เลขเล่มทะเบียนรถ" :value="detailVehicle.registrationBookNumber" />
                  <InfoItem label="ไมล์ปัจจุบัน"
                    :value="detailVehicle.currentMileage ? num(detailVehicle.currentMileage) : null" />
                  <InfoItem label="ไมล์ครั้งต่อไป"
                    :value="detailVehicle.nextMileage ? num(detailVehicle.nextMileage) : null" />
                  <InfoItem label="ระยะที่เกิน"
                    :value="detailVehicle.overMileage ? num(detailVehicle.overMileage) : null" />
                  <InfoItem label="รอบต่อภาษี"
                    :value="detailVehicle.taxRenewalDate ? fmtDate(detailVehicle.taxRenewalDate) : null" />
                </div>

                <div v-if="detailVehicle.note"
                  class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                  <span class="font-semibold">หมายเหตุ:</span> {{ detailVehicle.note }}
                </div>

                <div class="border-t dark:border-slate-700 pt-4">
                  <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">พ.ร.บ.</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <BoolItem label="LMG" :val="detailVehicle.prbLmg" />
                    <BoolItem label="วิริยะ" :val="detailVehicle.prbViriya" />
                    <BoolItem label="อาคเนย์" :val="detailVehicle.prbAkney" />
                    <BoolItem label="เทเวศ" :val="detailVehicle.prbThewet" />
                    <BoolItem label="ประกันคุ้มภัย" :val="detailVehicle.prbInsurance" />
                    <BoolItem label="กรุงเทพประกันภัย" :val="detailVehicle.prbBangkokInsurance" />
                    <BoolItem label="ทำประกันภัย" :val="detailVehicle.prbThirdParty" />
                    <InfoItem label="วันหมดอายุ พ.ร.บ."
                      :value="detailVehicle.prbExpiry ? fmtDate(detailVehicle.prbExpiry) : null" />
                    <InfoItem label="เบอร์ติดต่อ พ.ร.บ." :value="detailVehicle.prbContact" />
                  </div>
                </div>

                <div class="border-t dark:border-slate-700 pt-4">
                  <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">รอบต่อประกัน</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <BoolItem label="LMG" :val="detailVehicle.insLmg" />
                    <BoolItem label="วิริยะ" :val="detailVehicle.insViriya" />
                    <BoolItem label="ไทยประกัน" :val="detailVehicle.insThaiInsurance" />
                    <BoolItem label="ประกันคุ้มภัย" :val="detailVehicle.insInsurance" />
                    <BoolItem label="อาคเนย์" :val="detailVehicle.insAkney" />
                    <BoolItem label="เทเวศ" :val="detailVehicle.insThewet" />
                    <BoolItem label="กรุงเทพประกันภัย" :val="detailVehicle.insBangkokInsurance" />
                    <InfoItem label="วันหมดอายุประกัน"
                      :value="detailVehicle.insExpiry ? fmtDate(detailVehicle.insExpiry) : null" />
                    <InfoItem label="เบอร์ติดต่อประกัน" :value="detailVehicle.insContact" />
                  </div>
                </div>

                <div v-if="detailVehicle.gasNgv || detailVehicle.gasLpg || detailVehicle.gasExpiry || detailVehicle.gasContact"
                  class="border-t dark:border-slate-700 pt-4">
                  <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-2">แก๊ส</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <BoolItem label="NGV" :val="detailVehicle.gasNgv" />
                    <BoolItem label="LPG" :val="detailVehicle.gasLpg" />
                    <InfoItem label="วันหมดอายุ"
                      :value="detailVehicle.gasExpiry ? fmtDate(detailVehicle.gasExpiry) : null" />
                    <InfoItem label="เบอร์ติดต่อ" :value="detailVehicle.gasContact" />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- QR Code Modal -->
    <TransitionRoot :show="showQrModal" as="template">
      <Dialog @close="showQrModal = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <QrCodeIcon class="w-5 h-5 text-violet-500" /> QR Code ยานพาหนะ
                  </DialogTitle>
                  <button @click="showQrModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-400 dark:text-slate-500">
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
                <div class="p-5 flex flex-col items-center gap-4" v-if="qrVehicle">
                  <!-- QR Card (printable) -->
                  <div id="qr-print-card" class="bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-5 flex flex-col items-center gap-3 w-full">
                    <img src="../assets/logo-icon.png" alt="logo" class="w-12 h-12 rounded-full object-cover" />
                    <div class="text-center">
                      <div class="font-bold text-slate-800 dark:text-white text-xl tracking-wide">{{ qrVehicle.licensePlate }}</div>
                      <div class="text-slate-400 dark:text-slate-400 text-sm mt-0.5">{{ qrVehicle.type }}</div>
                    </div>
                    <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-48 h-48 rounded-lg" />
                    <div v-else class="w-48 h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-600 rounded-lg">
                      <svg class="animate-spin w-8 h-8 text-violet-400" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    </div>
                    <p class="text-xs text-slate-400 dark:text-slate-500 text-center">สแกนเพื่อบันทึกการตรวจเช็ค</p>
                  </div>
                  <!-- Actions -->
                  <div class="flex gap-3 w-full">
                    <button @click="downloadQr"
                      class="flex-1 flex items-center justify-center gap-1.5 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold py-2.5 rounded-xl text-sm transition ring-1 ring-violet-200 dark:ring-violet-800/50">
                      <ArrowDownTrayIcon class="w-4 h-4" /> Download
                    </button>
                    <button @click="printQr"
                      class="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl text-sm transition ring-1 ring-slate-200 dark:ring-slate-600">
                      <PrinterIcon class="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Add/Edit Modal -->
    <TransitionRoot :show="showFormModal" as="template">
      <Dialog @close="showFormModal = false" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 sm:scale-100"
            leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel
              class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div
                class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 dark:text-white">{{ editingVehicle ? 'แก้ไขยานพาหนะ' : 'เพิ่มยานพาหนะใหม่'
                  }}
                </DialogTitle>
                <button @click="showFormModal = false" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <XMarkIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              <div class="p-5 space-y-5">
                <!-- ข้อมูลทั่วไป -->
                <fieldset class="bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl p-4">
                  <legend class="text-sm font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-1.5">
                    <TruckIcon class="w-4 h-4 text-blue-500" /> ข้อมูลทั่วไป
                  </legend>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput v-model="form.type" label="ประเภทรถ" placeholder="เช่น รถตู้" required />
                    <!-- ทะเบียนรถ 3 ส่วน -->
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">เลขทะเบียนรถ <span class="text-red-500">*</span></label>
                      <div class="flex gap-2 items-center">
                        <div class="flex-none w-28">
                          <input v-model="form.lpPrefix" placeholder="ตัวอักษร เช่น กข"
                            class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400 text-center font-bold tracking-widest dark:text-white dark:placeholder-slate-400" />
                          <div class="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-0.5">ตัวอักษรนำหน้า</div>
                        </div>
                        <div class="text-slate-300 dark:text-slate-600 font-bold text-lg shrink-0">-</div>
                        <div class="flex-none w-24">
                          <input v-model="form.lpNumber" placeholder="เช่น 1234" maxlength="5"
                            class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400 text-center font-bold tracking-widest dark:text-white dark:placeholder-slate-400" />
                          <div class="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-0.5">หมายเลข</div>
                        </div>
                        <div class="text-slate-300 dark:text-slate-600 font-bold text-lg shrink-0">-</div>
                        <div class="flex-1">
                          <input v-model="form.lpProvince" list="province-list" placeholder="จังหวัด"
                            class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400 dark:text-white dark:placeholder-slate-400" />
                          <datalist id="province-list">
                            <option v-for="p in PROVINCES" :key="p" :value="p" />
                          </datalist>
                          <div class="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-0.5">จังหวัด</div>
                        </div>
                      </div>
                      <div v-if="form.lpPrefix || form.lpNumber || form.lpProvince" class="mt-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-xl px-3 py-2 flex items-center gap-2">
                        <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">ทะเบียนรถ:</span>
                        <span class="text-sm font-bold text-blue-700 dark:text-blue-300 tracking-wide">{{ [form.lpPrefix, form.lpNumber, form.lpProvince].filter(Boolean).join(' ') }}</span>
                      </div>
                    </div>
                    <FormInput v-model="form.registrationBookNumber" label="เลขเล่มทะเบียนรถ" placeholder="เลขเล่มทะเบียน" />
                    <FormInput v-model="form.chassisNumber" label="เลขตัวถัง" placeholder="VIN" />
                    <FormInput v-model="form.engineNumber" label="เลขเครื่องยนต์" />
                    <FormInput v-model="form.currentMileage" label="ไมล์ปัจจุบัน" type="number" />
                    <FormInput v-model="form.nextMileage" label="ไมล์ครั้งต่อไป" type="number" />
                    <FormInput v-model="form.overMileage" label="ระยะที่เกิน" type="number" />
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">สถานะ</label>
                      <AppSelect v-model="form.status" :options="vehicleStatusOptions" :allow-empty="false" />
                    </div>
                    <FormInput v-model="form.taxRenewalDate" label="รอบต่อภาษี" type="date" />
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">เอกสารภาษี</label>
                      <div v-if="(form.taxDocUrl && !docClear.tax) || docFiles.tax" class="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-2">
                        <PaperClipIcon class="w-4 h-4 text-blue-600 shrink-0" />
                        <span class="text-xs text-blue-700 dark:text-blue-300 flex-1 truncate">{{ docFiles.tax ? docFiles.tax.name : 'มีเอกสารแนบ' }}</span>
                        <button v-if="form.taxDocUrl && !docClear.tax && !docFiles.tax" type="button" @click="openDoc(form.taxDocUrl)" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" /> ดู
                        </button>
                        <button type="button" @click="docFiles.tax ? clearDocNew('tax') : removeExistingDoc('tax')" class="text-xs text-red-500 hover:text-red-700">ลบ</button>
                      </div>
                      <label v-else class="flex items-center gap-2 cursor-pointer border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-2.5 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition">
                        <PaperClipIcon class="w-4 h-4 text-slate-400" />
                        <span class="text-xs text-slate-400 dark:text-slate-500">แนบไฟล์ภาษี (รูปหรือ PDF)</span>
                        <input type="file" accept="image/*,.pdf" class="hidden" data-doc-input="tax" @change="onDocChange('tax', $event)" />
                      </label>
                    </div>

                    <!-- รูปยานพาหนะ -->
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">รูปยานพาหนะ</label>
                      <div class="flex items-start gap-3">
                        <div class="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                          <img v-if="photoPreview" :src="photoPreview" class="absolute inset-0 w-full h-full object-cover" />
                          <div v-else class="flex flex-col items-center gap-1 text-slate-300">
                            <PhotoIcon class="w-8 h-8" />
                            <span class="text-[10px]">ไม่มีรูป</span>
                          </div>
                          <button v-if="photoPreview" type="button" @click="clearVehiclePhoto"
                            class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow transition z-10">
                            <XMarkIcon class="w-3 h-3" />
                          </button>
                        </div>
                        <label class="flex-1 flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-600 cursor-pointer transition">
                          <CameraIcon class="w-6 h-6 text-slate-300" />
                          <span class="text-xs text-slate-400 dark:text-slate-500">คลิกเพื่อเลือกรูป</span>
                          <span class="text-[10px] text-slate-300 dark:text-slate-500">jpg, png — ไม่เกิน 20 MB</span>
                          <input type="file" accept="image/*" class="hidden" @change="onVehiclePhotoChange" />
                        </label>
                      </div>
                    </div>

                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">หมายเหตุ</label>
                      <AppEditor v-model="form.note" placeholder="หมายเหตุเพิ่มเติม..." height="120px" />
                    </div>
                  </div>
                </fieldset>

                <!-- พ.ร.บ. -->
                <fieldset class="bg-amber-50/40 dark:bg-amber-900/10 rounded-2xl p-4">
                  <legend class="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                    <DocumentTextIcon class="w-4 h-4 text-amber-500" /> พ.ร.บ.
                  </legend>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheck v-model="form.prbLmg" label="LMG" />
                    <FormCheck v-model="form.prbViriya" label="วิริยะ" />
                    <FormCheck v-model="form.prbAkney" label="อาคเนย์" />
                    <FormCheck v-model="form.prbThewet" label="เทเวศ" />
                    <FormCheck v-model="form.prbInsurance" label="ประกันคุ้มภัย" />
                    <FormCheck v-model="form.prbBangkokInsurance" label="กรุงเทพประกันภัย" />
                    <FormCheck v-model="form.prbThirdParty" label="ทำประกันภัย" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <FormInput v-model="form.prbExpiry" label="วันหมดอายุ พ.ร.บ." type="date" />
                    <FormInput v-model="form.prbContact" label="เบอร์ติดต่อ พ.ร.บ." placeholder="เช่น 02-xxx-xxxx" />
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">เอกสาร พ.ร.บ.</label>
                      <div v-if="(form.prbDocUrl && !docClear.prb) || docFiles.prb" class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-3 py-2">
                        <PaperClipIcon class="w-4 h-4 text-amber-600 shrink-0" />
                        <span class="text-xs text-amber-700 dark:text-amber-300 flex-1 truncate">{{ docFiles.prb ? docFiles.prb.name : 'มีเอกสารแนบ' }}</span>
                        <button v-if="form.prbDocUrl && !docClear.prb && !docFiles.prb" type="button" @click="openDoc(form.prbDocUrl)" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" /> ดู
                        </button>
                        <button type="button" @click="docFiles.prb ? clearDocNew('prb') : removeExistingDoc('prb')" class="text-xs text-red-500 hover:text-red-700">ลบ</button>
                      </div>
                      <label v-else class="flex items-center gap-2 cursor-pointer border-2 border-dashed border-amber-200 dark:border-amber-800/50 rounded-xl px-3 py-2.5 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition">
                        <PaperClipIcon class="w-4 h-4 text-slate-400" />
                        <span class="text-xs text-slate-400 dark:text-slate-500">แนบไฟล์เอกสาร (รูปหรือ PDF)</span>
                        <input type="file" accept="image/*,.pdf" class="hidden" data-doc-input="prb" @change="onDocChange('prb', $event)" />
                      </label>
                    </div>
                  </div>
                </fieldset>

                <!-- รอบต่อประกัน -->
                <fieldset class="bg-emerald-50/40 dark:bg-emerald-900/10 rounded-2xl p-4">
                  <legend class="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                    <ShieldCheckIcon class="w-4 h-4 text-emerald-500" /> รอบต่อประกัน
                  </legend>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormCheck v-model="form.insLmg" label="LMG" />
                    <FormCheck v-model="form.insViriya" label="วิริยะ" />
                    <FormCheck v-model="form.insThaiInsurance" label="ไทยประกัน" />
                    <FormCheck v-model="form.insInsurance" label="ประกันคุ้มภัย" />
                    <FormCheck v-model="form.insAkney" label="อาคเนย์" />
                    <FormCheck v-model="form.insThewet" label="เทเวศ" />
                    <FormCheck v-model="form.insBangkokInsurance" label="กรุงเทพประกันภัย" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <FormInput v-model="form.insExpiry" label="วันหมดอายุประกัน" type="date" />
                    <FormInput v-model="form.insContact" label="เบอร์ติดต่อประกัน" placeholder="เช่น 02-xxx-xxxx" />
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">เอกสารประกัน</label>
                      <div v-if="(form.insDocUrl && !docClear.ins) || docFiles.ins" class="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2">
                        <PaperClipIcon class="w-4 h-4 text-emerald-600 shrink-0" />
                        <span class="text-xs text-emerald-700 dark:text-emerald-300 flex-1 truncate">{{ docFiles.ins ? docFiles.ins.name : 'มีเอกสารแนบ' }}</span>
                        <button v-if="form.insDocUrl && !docClear.ins && !docFiles.ins" type="button" @click="openDoc(form.insDocUrl)" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" /> ดู
                        </button>
                        <button type="button" @click="docFiles.ins ? clearDocNew('ins') : removeExistingDoc('ins')" class="text-xs text-red-500 hover:text-red-700">ลบ</button>
                      </div>
                      <label v-else class="flex items-center gap-2 cursor-pointer border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2.5 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition">
                        <PaperClipIcon class="w-4 h-4 text-slate-400" />
                        <span class="text-xs text-slate-400 dark:text-slate-500">แนบไฟล์เอกสาร (รูปหรือ PDF)</span>
                        <input type="file" accept="image/*,.pdf" class="hidden" data-doc-input="ins" @change="onDocChange('ins', $event)" />
                      </label>
                    </div>
                  </div>
                </fieldset>

                <!-- แก๊ส -->
                <fieldset class="bg-orange-50/40 dark:bg-orange-900/10 rounded-2xl p-4">
                  <legend class="text-sm font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-1.5">
                    <FireIcon class="w-4 h-4 text-orange-500" /> แก๊ส
                  </legend>
                  <div class="flex gap-4 mb-3">
                    <FormCheck v-model="form.gasNgv" label="NGV" />
                    <FormCheck v-model="form.gasLpg" label="LPG" />
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput v-model="form.gasExpiry" label="วันหมดอายุ" type="date" />
                    <FormInput v-model="form.gasContact" label="เบอร์ติดต่อ" placeholder="เช่น 02-xxx-xxxx" />
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">เอกสารแก๊ส</label>
                      <div v-if="(form.gasDocUrl && !docClear.gas) || docFiles.gas" class="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl px-3 py-2">
                        <PaperClipIcon class="w-4 h-4 text-orange-600 shrink-0" />
                        <span class="text-xs text-orange-700 dark:text-orange-300 flex-1 truncate">{{ docFiles.gas ? docFiles.gas.name : 'มีเอกสารแนบ' }}</span>
                        <button v-if="form.gasDocUrl && !docClear.gas && !docFiles.gas" type="button" @click="openDoc(form.gasDocUrl)" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" /> ดู
                        </button>
                        <button type="button" @click="docFiles.gas ? clearDocNew('gas') : removeExistingDoc('gas')" class="text-xs text-red-500 hover:text-red-700">ลบ</button>
                      </div>
                      <label v-else class="flex items-center gap-2 cursor-pointer border-2 border-dashed border-orange-200 dark:border-orange-800/50 rounded-xl px-3 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition">
                        <PaperClipIcon class="w-4 h-4 text-slate-400" />
                        <span class="text-xs text-slate-400 dark:text-slate-500">แนบไฟล์เอกสาร (รูปหรือ PDF)</span>
                        <input type="file" accept="image/*,.pdf" class="hidden" data-doc-input="gas" @change="onDocChange('gas', $event)" />
                      </label>
                    </div>
                  </div>
                </fieldset>

                <!-- Submit -->
                <div class="border-t dark:border-slate-700 pt-4 flex justify-end gap-2">
                  <button @click="showFormModal = false"
                    class="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm transition">ยกเลิก</button>
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
import { ref, computed, onMounted, watch, h } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  TruckIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon,
  XCircleIcon, XMarkIcon, EyeIcon, FunnelIcon, DocumentTextIcon, ShieldCheckIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon, QrCodeIcon, PrinterIcon, CameraIcon, PhotoIcon,
  ChevronDownIcon, PhoneIcon, FireIcon, PaperClipIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import QRCode from 'qrcode'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import AppEditor from '../components/AppEditor.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'
import { fmtDateTh, toLocalDateStr } from '../stores/date'

// --- Inline sub-components ---
const FormInput = {
  props: ['modelValue', 'label', 'placeholder', 'type', 'required'],
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () => h('div', [
      h('label', { class: 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1' }, p.label),
      h('input', {
        type: p.type || 'text', value: p.modelValue || '', placeholder: p.placeholder || '',
        required: p.required,
        class: 'w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400 dark:text-white dark:placeholder-slate-400',
        onInput: e => emit('update:modelValue', e.target.value)
      })
    ])
  }
}

const FormCheck = {
  props: ['modelValue', 'label'], emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () => h('label', { class: 'flex items-center gap-2 cursor-pointer select-none' }, [
      h('input', {
        type: 'checkbox', checked: p.modelValue, class: 'w-4 h-4 rounded border-slate-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 dark:bg-slate-700',
        onChange: e => emit('update:modelValue', e.target.checked)
      }),
      h('span', { class: 'text-sm text-slate-700 dark:text-slate-200' }, p.label)
    ])
  }
}

const InfoItem = {
  props: ['label', 'value'],
  setup(p) {
    return () => h('div', { class: 'bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2' }, [
      h('div', { class: 'text-xs text-slate-400 dark:text-slate-500' }, p.label),
      h('div', { class: 'text-sm font-medium text-slate-700 dark:text-slate-200' }, p.value || '-')
    ])
  }
}

const BoolItem = {
  props: ['label', 'val'],
  setup(p) {
    return () => h('div', { class: 'flex items-center gap-1.5' }, [
      h('span', { class: p.val ? 'text-emerald-500' : 'text-slate-300' }, p.val ? '✓' : '✗'),
      h('span', { class: 'text-slate-600 dark:text-slate-300' }, p.label)
    ])
  }
}

const BASE_URL = ``
function resolveUrl(val) {
  if (!val) return null
  if (val.startsWith('https://')) return `${BASE_URL}/api/media/proxy?url=${encodeURIComponent(val)}`
  if (val.startsWith('http')) return val
  return `${BASE_URL}/uploads/${val}`
}

const PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา',
  'ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก',
  'นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน',
  'บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา',
  'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต',
  'มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง',
  'ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล',
  'สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย',
  'สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ',
  'อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี'
]

function parseLicensePlate(lp) {
  if (!lp) return { prefix: '', number: '', province: '' }
  const parts = lp.trim().split(/\s+/)
  if (parts.length >= 3) return { prefix: parts[0], number: parts[1], province: parts.slice(2).join(' ') }
  if (parts.length === 2) {
    const m = parts[0].match(/^([ก-ฮA-Za-z]+)(\d+)$/)
    if (m) return { prefix: m[1], number: m[2], province: parts[1] }
    return { prefix: parts[0], number: '', province: parts[1] }
  }
  return { prefix: lp, number: '', province: '' }
}

function expiryStatus(dateStr) {
  if (!dateStr) return 'none'
  const days = Math.floor((new Date(dateStr) - new Date()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 30) return 'warning'
  return 'ok'
}

function expiryChip(dateStr) {
  return {
    none:    'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500',
    expired: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    ok:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
  }[expiryStatus(dateStr)]
}

function expiryShortLabel(dateStr, prefix) {
  const s = expiryStatus(dateStr)
  if (s === 'none') return `${prefix} -`
  const days = Math.floor((new Date(dateStr) - new Date()) / 86400000)
  if (s === 'expired') return `${prefix} หมดแล้ว`
  if (s === 'warning') return `${prefix} ${days}ว.`
  return `${prefix} ✓`
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
const currentPage = ref(1)
const pageSize = 10

const expandedId = ref(null)

const photoFile = ref(null)
const photoPreview = ref(null)

function onVehiclePhotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function clearVehiclePhoto() {
  photoFile.value = null
  photoPreview.value = null
}

const docFiles = ref({ prb: null, tax: null, ins: null, gas: null })
const docClear = ref({ prb: false, tax: false, ins: false, gas: false })

function onDocChange(key, e) {
  const file = e.target.files[0]
  if (!file) return
  docFiles.value[key] = file
  docClear.value[key] = false
}

function clearDocNew(key) {
  docFiles.value[key] = null
  const input = document.querySelector(`[data-doc-input="${key}"]`)
  if (input) input.value = ''
}

function removeExistingDoc(key) {
  docClear.value[key] = true
  docFiles.value[key] = null
}

function openDoc(url) {
  window.open(resolveUrl(url), '_blank')
}

// --- QR ---
const showQrModal = ref(false)
const qrVehicle = ref(null)
const qrDataUrl = ref('')

async function openQr(v) {
  qrVehicle.value = v
  qrDataUrl.value = ''
  showQrModal.value = true
  const url = `${window.location.origin}/inspection?vehicleId=${v.id}`
  qrDataUrl.value = await QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
}

function downloadQr() {
  if (!qrDataUrl.value || !qrVehicle.value) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `QR_${qrVehicle.value.licensePlate.replace(/\s/g, '_')}.png`
  link.click()
}

function printQr() {
  if (!qrDataUrl.value || !qrVehicle.value) return
  const v = qrVehicle.value
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head><title>QR - ${v.licensePlate}</title>
    <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:sans-serif}
    .card{border:2px solid #e2e8f0;border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;gap:12px;width:260px}
    .plate{font-size:22px;font-weight:bold;color:#1e293b}.type{font-size:13px;color:#94a3b8}
    .hint{font-size:11px;color:#94a3b8;text-align:center}
    @media print{@page{size:auto;margin:10mm}}</style></head>
    <body><div class="card">
    <div class="plate">${v.licensePlate}</div><div class="type">${v.type}</div>
    <img src="${qrDataUrl.value}" width="200" height="200"/>
    <div class="hint">สแกนเพื่อบันทึกการตรวจเช็ค</div>
    </div><script>window.onload=()=>window.print()<\/script></body></html>`)
  win.document.close()
}

async function printAllQR() {
  const items = []
  for (const v of vehicles.value) {
    const url = `${window.location.origin}/inspection?vehicleId=${v.id}`
    const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
    items.push({ v, dataUrl })
  }
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head><title>QR Codes - ยานพาหนะ</title>
    <style>body{font-family:sans-serif;margin:0;padding:20px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .card{border:2px solid #e2e8f0;border-radius:12px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:8px;page-break-inside:avoid}
    .plate{font-size:16px;font-weight:bold;color:#1e293b}.type{font-size:11px;color:#94a3b8}
    .hint{font-size:10px;color:#94a3b8;text-align:center}
    @media print{@page{size:A4;margin:15mm}}</style></head>
    <body><div class="grid">
    ${items.map(({ v, dataUrl }) => `<div class="card">
      <div class="plate">${v.licensePlate}</div><div class="type">${v.type}</div>
      <img src="${dataUrl}" width="160" height="160"/>
      <div class="hint">สแกนเพื่อบันทึกการตรวจเช็ค</div>
    </div>`).join('')}
    </div><script>window.onload=()=>window.print()<\/script></body></html>`)
  win.document.close()
}

const defaultForm = () => ({
  type: '', lpPrefix: '', lpNumber: '', lpProvince: '',
  registrationBookNumber: '', chassisNumber: '', engineNumber: '',
  currentMileage: '', nextMileage: '', overMileage: '', status: 'ACTIVE', note: '',
  prbDate: '', prbLmg: false, prbViriya: false, prbAkney: false, prbThewet: false, prbInsurance: false, prbBangkokInsurance: false, prbTaxDate: '', prbThirdParty: false, prbExpiry: '', prbContact: '',
  insLmg: false, insViriya: false, insThaiInsurance: false, insInsurance: false, insAkney: false, insThewet: false, insBangkokInsurance: false, insDate: '', insTaxDate: '', insExpiry: '', insContact: '',
  taxRenewalDate: '',
  gasNgv: false, gasLpg: false, gasExpiry: '', gasContact: '',
  prbDocUrl: '', taxDocUrl: '', insDocUrl: '', gasDocUrl: ''
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
      (v.engineNumber && v.engineNumber.toLowerCase().includes(q)) ||
      (v.registrationBookNumber && v.registrationBookNumber.toLowerCase().includes(q))
    )
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredVehicles.value.length / pageSize))
const paginatedVehicles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredVehicles.value.slice(start, start + pageSize)
})

watch(filteredVehicles, () => { currentPage.value = 1 })

function statusLabel(s) {
  return { ACTIVE: 'พร้อมใช้งาน', IN_USE: 'กำลังใช้งาน', MAINTENANCE: 'ซ่อมบำรุง', INACTIVE: 'ปลดระวาง' }[s] || s
}
function statusColor(s) {
  return {
    ACTIVE: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500',
    IN_USE: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    MAINTENANCE: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
    INACTIVE: 'bg-slate-100 dark:bg-slate-700 text-slate-400'
  }[s]
}
function statusBadge(s) {
  return {
    ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-700/50',
    IN_USE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-700/50',
    MAINTENANCE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-700/50',
    INACTIVE: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-600'
  }[s]
}
function fmtDate(d) { return fmtDateTh(d) }
function num(n) { return n != null ? Number(n).toLocaleString() : '-' }

function openDetail(v) { detailVehicle.value = v }

function openForm(v) {
  photoFile.value = null
  docFiles.value = { prb: null, tax: null, ins: null, gas: null }
  docClear.value = { prb: false, tax: false, ins: false, gas: false }
  if (v) {
    editingVehicle.value = v
    photoPreview.value = v.photo ? resolveUrl(v.photo) : null
    const f = defaultForm()
    for (const key of Object.keys(f)) {
      if (v[key] !== undefined && v[key] !== null) {
        if ((key.endsWith('Date') || key.endsWith('Expiry')) && key !== 'note') {
          f[key] = toLocalDateStr(v[key])
        } else {
          f[key] = v[key]
        }
      }
    }
    const parsed = parseLicensePlate(v.licensePlate)
    f.lpPrefix = parsed.prefix
    f.lpNumber = parsed.number
    f.lpProvince = parsed.province
    f.prbDocUrl = v.prbDoc || ''
    f.taxDocUrl = v.taxDoc || ''
    f.insDocUrl = v.insDoc || ''
    f.gasDocUrl = v.gasDoc || ''
    form.value = f
  } else {
    editingVehicle.value = null
    photoPreview.value = null
    form.value = defaultForm()
  }
  showFormModal.value = true
}

async function loadVehicles() { vehicles.value = (await api.get('/vehicles')).data }

async function saveVehicle() {
  const lp = [form.value.lpPrefix, form.value.lpNumber, form.value.lpProvince].filter(Boolean).join(' ')
  if (!form.value.type || !lp) return swalError('กรุณากรอกประเภทรถและเลขทะเบียนให้ครบ')
  saving.value = true
  try {
    const fd = new FormData()
    const skipKeys = new Set(['lpPrefix', 'lpNumber', 'lpProvince', 'prbDocUrl', 'taxDocUrl', 'insDocUrl', 'gasDocUrl'])
    for (const [key, val] of Object.entries(form.value)) {
      if (skipKeys.has(key)) continue
      if (val !== null && val !== undefined && val !== '') fd.append(key, val)
    }
    fd.append('licensePlate', lp)
    fd.append('userId', auth.user.id)
    if (photoFile.value) {
      fd.append('photo', photoFile.value)
    } else if (editingVehicle.value && !photoPreview.value && editingVehicle.value.photo) {
      fd.append('clearPhoto', 'true')
    }

    // Document files
    const docMap = { prb: 'prbDoc', tax: 'taxDoc', ins: 'insDoc', gas: 'gasDoc' }
    for (const [key, field] of Object.entries(docMap)) {
      if (docFiles.value[key]) {
        fd.append(field, docFiles.value[key])
      } else if (docClear.value[key]) {
        fd.append('clear' + field.charAt(0).toUpperCase() + field.slice(1), 'true')
      }
    }

    if (editingVehicle.value) {
      await api.put(`/vehicles/${editingVehicle.value.id}`, fd)
      swalSuccess('อัพเดทสำเร็จ', 'แก้ไขยานพาหนะเรียบร้อยแล้ว')
    } else {
      await api.post('/vehicles', fd)
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
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `vehicles_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    swalSuccess('Export สำเร็จ', 'ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว')
  } catch (err) {
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text().catch(() => '')
      const msg = (() => { try { return JSON.parse(text).error } catch { return text || 'ไม่สามารถ export ข้อมูลได้' } })()
      swalError('Export ไม่สำเร็จ', msg)
    } else {
      swalError('Export ไม่สำเร็จ', err.response?.data?.error || 'ไม่สามารถเชื่อมต่อ Backend')
    }
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
