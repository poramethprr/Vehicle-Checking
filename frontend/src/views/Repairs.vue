<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="relative bg-linear-to-r from-orange-500 to-rose-500 dark:from-orange-950 dark:to-rose-950 rounded-2xl px-6 py-5 overflow-hidden shadow-md shadow-orange-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <WrenchScrewdriverIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">แจ้งซ่อมยานพาหนะ</h1>
            <p class="text-orange-100 text-xs mt-0.5">แจ้งซ่อมและติดตามสถานะการอนุมัติ</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-3 shrink-0">
          <div v-if="auth.isAdmin && pendingCount > 0" class="bg-white/20 ring-1 ring-white/30 rounded-xl px-4 py-2 text-center">
            <div class="text-2xl font-bold text-white">{{ pendingCount }}</div>
            <div class="text-[10px] text-orange-100 font-semibold">รอการอนุมัติ</div>
          </div>
          <div class="bg-white/15 rounded-xl px-4 py-2 text-center">
            <div class="text-2xl font-bold text-white">{{ histTotal }}</div>
            <div class="text-[10px] text-orange-100 font-semibold">รายการทั้งหมด</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <TabGroup :selected-index="activeTab" @change="activeTab = $event">
      <TabList class="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
        <Tab v-for="tab in visibleTabs" :key="tab.id" as="template" v-slot="{ selected }">
          <button :class="[
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all',
            selected
              ? 'bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-400 shadow-sm ring-1 ring-orange-100 dark:ring-orange-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60'
          ]">
            <component :is="tab.icon" class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <span class="sm:hidden">{{ tab.shortLabel }}</span>
            <span v-if="tab.id === 'pending' && pendingCount > 0"
              class="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
              {{ pendingCount }}
            </span>
          </button>
        </Tab>
      </TabList>

      <TabPanels>

        <!-- Tab: แจ้งซ่อมใหม่ -->
        <TabPanel>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0">

            <!-- ฟอร์ม -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-orange-50 to-rose-50 dark:from-slate-800 dark:to-slate-800">
                <h2 class="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-2 text-sm">
                  <PlusCircleIcon class="w-4 h-4" /> กรอกข้อมูลการแจ้งซ่อม
                </h2>
              </div>

              <form @submit.prevent="submitRepair" class="p-6 space-y-5">

                <!-- ยานพาหนะ -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    ยานพาหนะ <span class="text-red-500">*</span>
                  </label>
                  <AppSelect v-model="form.vehicleId" :options="vehicleOptions" :icon="TruckIcon" placeholder="เลือกยานพาหนะ" />
                </div>

                <!-- หัวข้อ -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    หัวข้อ / รายการซ่อม <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <WrenchScrewdriverIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input v-model="form.title" required placeholder="เช่น เปลี่ยนยาง, ซ่อมเบรก, เปลี่ยนน้ำมัน"
                      class="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition hover:border-orange-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                  </div>
                </div>

                <!-- รายละเอียด -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    รายละเอียด <span class="text-red-500">*</span>
                  </label>
                  <textarea v-model="form.detail" required rows="4"
                    placeholder="อธิบายอาการเสียหายหรือสิ่งที่ต้องการซ่อมให้ละเอียด..."
                    class="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition resize-none hover:border-orange-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                </div>

                <!-- วงเงินประมาณการ -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">วงเงินประมาณการ (บาท)</label>
                  <div class="relative">
                    <BanknotesIcon class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input v-model="form.estimatedCost" type="number" min="0" step="0.01" placeholder="0.00"
                      class="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition hover:border-orange-300 shadow-sm dark:text-white dark:placeholder-slate-400" />
                  </div>
                </div>

                <!-- ใบเสนอราคา -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">ใบเสนอราคา / เอกสารประกอบ</label>
                  <label class="group flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-slate-700/30 transition">
                    <div class="w-8 h-8 bg-slate-100 dark:bg-slate-700 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 rounded-lg flex items-center justify-center transition shrink-0">
                      <PaperClipIcon class="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-orange-700 transition truncate">
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

                <button type="submit" :disabled="submitting || !form.vehicleId || !form.title || !form.detail"
                  class="w-full py-3.5 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2">
                  <span v-if="submitting" class="flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    กำลังส่ง...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <PaperAirplaneIcon class="w-4 h-4" /> ส่งคำขอแจ้งซ่อม
                  </span>
                </button>
              </form>
            </div>

            <!-- Info panel -->
            <div class="space-y-4">
              <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center">
                  <WrenchScrewdriverIcon class="w-7 h-7 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <p class="font-bold text-orange-800 dark:text-orange-300">ขั้นตอนการแจ้งซ่อม</p>
                  <ol class="text-orange-700 dark:text-orange-400 text-xs mt-2 space-y-1.5 text-left list-none">
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      กรอกรายละเอียดการซ่อมและยานพาหนะ
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      แนบใบเสนอราคา (ถ้ามี)
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                      ส่งคำขอรอ Admin อนุมัติ
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="w-5 h-5 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                      Admin อนุมัติ/ไม่อนุมัติพร้อมหมายเหตุ
                    </li>
                  </ol>
                </div>
              </div>

              <!-- สถิติของฉัน (Staff) -->
              <div v-if="!auth.isAdmin" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
                <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm">คำขอของฉัน</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="s in myStats" :key="s.label" :class="s.bg" class="rounded-xl p-3 text-center">
                    <div :class="s.text" class="text-xl font-bold">{{ s.count }}</div>
                    <div :class="s.sub" class="text-[10px] font-semibold mt-0.5">{{ s.label }}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </TabPanel>

        <!-- Tab: รอการอนุมัติ (Admin only) -->
        <TabPanel v-if="auth.isAdmin">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden mt-0">
            <div class="px-5 py-4 border-b border-orange-100 dark:border-slate-700 bg-orange-50/50 dark:bg-slate-700/30 flex items-center gap-2">
              <ClockIcon class="w-5 h-5 text-orange-500" />
              <span class="font-bold text-orange-800 dark:text-orange-300">รายการรอการอนุมัติ</span>
              <span v-if="pendingCount > 0" class="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full ml-1">
                {{ pendingCount }}
              </span>
            </div>

            <div v-if="pendingRepairs.length" class="divide-y divide-gray-100 dark:divide-slate-700">
              <div v-for="r in pendingRepairs" :key="r.id" class="p-3 sm:p-5 hover:bg-orange-50/20 transition">

                <!-- Top row -->
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <WrenchScrewdriverIcon class="w-4 h-4 text-amber-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <span class="font-bold text-sm text-slate-800 dark:text-white leading-snug">{{ r.title }}</span>
                      <span class="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">รอการอนุมัติ</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      <TruckIcon class="w-3 h-3 shrink-0" />
                      <span>{{ r.vehicle?.licensePlate }} — {{ r.vehicle?.type }}</span>
                      <span class="text-slate-300">·</span>
                      <UserCircleIcon class="w-3 h-3 shrink-0" />
                      <span>{{ r.user?.displayName || r.user?.username }}</span>
                      <span class="text-slate-300">·</span>
                      <span>{{ fmtDateTime(r.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Content indented -->
                <div class="ml-12 space-y-2 mt-2">
                  <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ r.detail }}</p>

                  <div v-if="r.estimatedCost || r.documentPath" class="flex items-center gap-2 flex-wrap">
                    <div v-if="r.estimatedCost"
                      class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                      <BanknotesIcon class="w-3.5 h-3.5" />
                      วงเงิน: {{ Number(r.estimatedCost).toLocaleString('th-TH') }} บาท
                    </div>
                    <a v-if="r.documentPath" :href="resolveUrl(r.documentPath)" target="_blank"
                      class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2.5 py-1 rounded-lg transition">
                      <component :is="r.documentPath.endsWith('.pdf') ? DocumentTextIcon : PhotoIcon" class="w-3.5 h-3.5" />
                      ดูเอกสาร
                    </a>
                  </div>

                  <div class="flex gap-2">
                    <button @click="openApproveModal(r, 'APPROVED')"
                      class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition shadow-sm">
                      <CheckCircleIcon class="w-4 h-4" /> อนุมัติ
                    </button>
                    <button @click="openApproveModal(r, 'REJECTED')"
                      class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition shadow-sm">
                      <XCircleIcon class="w-4 h-4" /> ไม่อนุมัติ
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div v-else class="py-16 flex flex-col items-center gap-3 text-slate-400">
              <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                <CheckCircleIcon class="w-8 h-8 text-emerald-400" />
              </div>
              <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">ไม่มีรายการรอการอนุมัติ</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">ทุกคำขอได้รับการพิจารณาแล้ว</p>
            </div>
          </div>
        </TabPanel>

        <!-- Tab: ประวัติทั้งหมด -->
        <TabPanel>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden mt-0">
            <div class="px-4 sm:px-5 py-4 border-b border-gray-200 dark:border-slate-700">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2 shrink-0">
                  <ClipboardDocumentListIcon class="w-5 h-5 text-slate-500" />
                  {{ auth.isAdmin ? 'ประวัติทั้งหมด' : 'คำขอของฉัน' }}
                  <span class="text-sm font-normal text-slate-400 dark:text-slate-500">{{ histTotal }} รายการ</span>
                </h2>
                <div class="flex flex-wrap items-center gap-2">
                  <AppDateFilter default-mode="all" @change="onDateChange" />
                  <div v-if="auth.isAdmin" class="w-44">
                    <AppSelect v-model="filterVehicleId" :options="vehicleFilterOptions" :icon="TruckIcon" placeholder="ยานพาหนะทั้งหมด" />
                  </div>
                  <div class="w-40">
                    <AppSelect v-model="filterStatus" :options="statusFilterOptions" :icon="AdjustmentsHorizontalIcon" placeholder="ทุกสถานะ" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredHistory.length" class="divide-y divide-gray-100 dark:divide-slate-700">
              <div v-for="r in filteredHistory" :key="r.id" class="p-3 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition group">

                <!-- Top row: status icon + title/badge + delete -->
                <div class="flex items-start gap-3">
                  <div :class="statusIconClass(r.status)" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <component :is="statusIcon(r.status)" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <span class="font-bold text-sm text-slate-800 dark:text-white leading-snug">{{ r.title }}</span>
                      <div class="flex items-center gap-1 shrink-0">
                        <span :class="statusBadgeClass(r.status)" class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {{ statusLabel(r.status) }}
                        </span>
                        <button @click="deleteRepair(r)"
                          class="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                          <TrashIcon class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Content indented under icon -->
                <div class="ml-11 sm:ml-12 space-y-2 mt-1.5">

                  <!-- Vehicle + date -->
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <TruckIcon class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ r.vehicle?.licensePlate }} — {{ r.vehicle?.type }}</span>
                    <span class="text-slate-300 dark:text-slate-600">·</span>
                    <span>{{ fmtDateTime(r.createdAt) }}</span>
                  </div>

                  <!-- Detail -->
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{{ r.detail }}</p>

                  <!-- Estimated cost + document -->
                  <div v-if="r.estimatedCost || r.documentPath" class="flex items-center gap-2 flex-wrap">
                    <div v-if="r.estimatedCost"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">
                      <BanknotesIcon class="w-3 h-3" />
                      {{ Number(r.estimatedCost).toLocaleString('th-TH') }} บาท
                    </div>
                    <a v-if="r.documentPath" :href="resolveUrl(r.documentPath)" target="_blank"
                      class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-0.5 rounded-lg transition font-medium">
                      <component :is="r.documentPath.endsWith('.pdf') ? DocumentTextIcon : PhotoIcon" class="w-3 h-3" />
                      ดูเอกสาร
                    </a>
                  </div>

                  <!-- People trail -->
                  <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2 space-y-1.5 text-xs">
                    <div class="flex items-baseline gap-2">
                      <span class="text-slate-400 dark:text-slate-500 shrink-0 min-w-[4.5rem]">แจ้งโดย</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-200">{{ r.user?.displayName || r.user?.username }}</span>
                    </div>
                    <div v-if="r.approvedBy && r.status !== 'PENDING'" class="flex items-baseline gap-2">
                      <span :class="r.status === 'REJECTED' ? 'text-red-500' : 'text-blue-500'" class="shrink-0 min-w-[4.5rem]">
                        {{ r.status === 'REJECTED' ? 'ไม่อนุมัติโดย' : 'อนุมัติโดย' }}
                      </span>
                      <span :class="r.status === 'REJECTED' ? 'text-red-700' : 'text-blue-700'" class="font-semibold">{{ r.approvedBy.displayName || r.approvedBy.username }}</span>
                      <span class="text-slate-400 hidden sm:inline">{{ fmtDateTime(r.approvedAt) }}</span>
                    </div>
                    <div v-if="r.approvedBy && r.status !== 'PENDING'" class="sm:hidden text-slate-400 pl-[4.5rem]">{{ fmtDateTime(r.approvedAt) }}</div>
                    <div v-if="r.status === 'COMPLETED' && r.completedAt" class="flex items-baseline gap-2">
                      <span class="text-emerald-600 shrink-0 min-w-[4.5rem]">ซ่อมเสร็จเมื่อ</span>
                      <span class="font-semibold text-emerald-700">{{ fmtDateTime(r.completedAt) }}</span>
                    </div>
                    <div v-if="r.approverNote" class="flex items-baseline gap-2">
                      <span class="text-slate-400 shrink-0 min-w-[4.5rem]">หมายเหตุ</span>
                      <span :class="r.status === 'REJECTED' ? 'text-red-600' : r.status === 'COMPLETED' ? 'text-emerald-600' : 'text-blue-600'" class="italic">{{ r.approverNote }}</span>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div v-if="auth.isAdmin && (r.status === 'PENDING' || r.status === 'APPROVED')" class="flex items-center gap-2 flex-wrap">
                    <template v-if="r.status === 'PENDING'">
                      <button @click="openApproveModal(r, 'APPROVED')"
                        class="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition">
                        <CheckCircleIcon class="w-3.5 h-3.5" /> อนุมัติ
                      </button>
                      <button @click="openApproveModal(r, 'REJECTED')"
                        class="inline-flex items-center gap-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition">
                        <XCircleIcon class="w-3.5 h-3.5" /> ไม่อนุมัติ
                      </button>
                    </template>
                    <button v-if="r.status === 'APPROVED'" @click="openCompleteModal(r)"
                      class="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition">
                      <CheckCircleIcon class="w-3.5 h-3.5" /> ซ่อมเสร็จแล้ว
                    </button>
                  </div>

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

            <div v-if="!filteredHistory.length" class="py-16 flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
              <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <WrenchScrewdriverIcon class="w-8 h-8 opacity-40" />
              </div>
              <p class="text-sm font-medium">ยังไม่มีประวัติการแจ้งซ่อม</p>
              <button @click="activeTab = 0"
                class="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-semibold bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl transition">
                + แจ้งซ่อมใหม่
              </button>
            </div>
          </div>
        </TabPanel>

      </TabPanels>
    </TabGroup>

    <!-- Approve/Reject Modal -->
    <TransitionRoot :show="showApproveModal" as="template">
      <Dialog @close="showApproveModal = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div class="px-6 py-4 border-b flex items-center justify-between"
                :class="approveAction === 'APPROVED' ? 'border-emerald-100 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-900/20' : 'border-red-100 dark:border-red-900 bg-red-50/60 dark:bg-red-900/20'">
                <DialogTitle class="font-bold flex items-center gap-2"
                  :class="approveAction === 'APPROVED' ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'">
                  <component :is="approveAction === 'APPROVED' ? CheckCircleIcon : XCircleIcon" class="w-5 h-5" />
                  {{ approveAction === 'APPROVED' ? 'อนุมัติคำขอแจ้งซ่อม' : 'ไม่อนุมัติคำขอแจ้งซ่อม' }}
                </DialogTitle>
                <button @click="showApproveModal = false" class="p-1.5 rounded-lg hover:bg-black/5 transition text-slate-400">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
              <div class="p-6 space-y-4">
                <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-1.5">
                  <div class="font-bold text-slate-800 dark:text-white">{{ activeRepair?.title }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TruckIcon class="w-3.5 h-3.5" />
                    {{ activeRepair?.vehicle?.licensePlate }} — {{ activeRepair?.vehicle?.type }}
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">โดย {{ activeRepair?.user?.displayName || activeRepair?.user?.username }}</div>
                  <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">{{ activeRepair?.detail }}</p>
                  <div v-if="activeRepair?.estimatedCost" class="text-xs font-semibold text-emerald-700">
                    วงเงิน: {{ Number(activeRepair.estimatedCost).toLocaleString('th-TH') }} บาท
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    {{ approveAction === 'APPROVED' ? 'หมายเหตุ (ไม่บังคับ)' : 'เหตุผลที่ไม่อนุมัติ (ไม่บังคับ)' }}
                  </label>
                  <textarea v-model="approverNote" rows="3"
                    :placeholder="approveAction === 'APPROVED' ? 'เพิ่มหมายเหตุ...' : 'ระบุเหตุผลที่ไม่อนุมัติ...'"
                    class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition resize-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-400" />
                </div>
                <div class="flex gap-3">
                  <button type="button" @click="showApproveModal = false"
                    class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-semibold rounded-xl transition text-sm">
                    ยกเลิก
                  </button>
                  <button type="button" @click="confirmApprove" :disabled="approveLoading"
                    :class="approveAction === 'APPROVED'
                      ? 'bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                      : 'bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'"
                    class="flex-1 py-3 text-white font-semibold rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-2 disabled:from-slate-300 disabled:to-slate-300">
                    <span v-if="approveLoading" class="flex items-center gap-2">
                      <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      กำลังดำเนินการ...
                    </span>
                    <span v-else class="flex items-center gap-1.5">
                      <component :is="approveAction === 'APPROVED' ? CheckCircleIcon : XCircleIcon" class="w-4 h-4" />
                      {{ approveAction === 'APPROVED' ? 'ยืนยันอนุมัติ' : 'ยืนยันไม่อนุมัติ' }}
                    </span>
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Complete Modal -->
    <TransitionRoot :show="showCompleteModal" as="template">
      <Dialog @close="showCompleteModal = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div class="px-6 py-4 border-b border-emerald-100 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-900/20 flex items-center justify-between">
                <DialogTitle class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircleIcon class="w-5 h-5" /> ยืนยันซ่อมเสร็จแล้ว
                </DialogTitle>
                <button @click="showCompleteModal = false" class="p-1.5 rounded-lg hover:bg-black/5 transition text-slate-400">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
              <div class="p-6 space-y-4">
                <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-1.5">
                  <div class="font-bold text-slate-800 dark:text-white">{{ completeRepair?.title }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TruckIcon class="w-3.5 h-3.5" />
                    {{ completeRepair?.vehicle?.licensePlate }} — {{ completeRepair?.vehicle?.type }}
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <UserCircleIcon class="w-3 h-3" /> แจ้งโดย: {{ completeRepair?.user?.displayName || completeRepair?.user?.username }}
                  </div>
                  <div class="text-xs text-blue-600 flex items-center gap-1">
                    <CheckCircleIcon class="w-3 h-3" /> อนุมัติโดย: {{ completeRepair?.approvedBy?.displayName || completeRepair?.approvedBy?.username }}
                  </div>
                </div>
                <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                  <WrenchScrewdriverIcon class="w-4 h-4 shrink-0 mt-0.5" />
                  การยืนยันนี้จะเปลี่ยนสถานะรถกลับเป็น <strong>พร้อมใช้งาน</strong>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">บันทึกการซ่อม (ไม่บังคับ)</label>
                  <textarea v-model="completeNote" rows="2"
                    placeholder="รายละเอียดการซ่อม, ค่าใช้จ่ายจริง ฯลฯ"
                    class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition resize-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-400" />
                </div>
                <div class="flex gap-3">
                  <button @click="showCompleteModal = false"
                    class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-semibold rounded-xl transition text-sm">
                    ยกเลิก
                  </button>
                  <button @click="confirmComplete" :disabled="completeLoading"
                    class="flex-1 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-2">
                    <span v-if="completeLoading" class="flex items-center gap-2">
                      <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      กำลังบันทึก...
                    </span>
                    <span v-else class="flex items-center gap-1.5">
                      <CheckCircleIcon class="w-4 h-4" /> ยืนยันซ่อมเสร็จ
                    </span>
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
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import {
  WrenchScrewdriverIcon, PlusCircleIcon, TruckIcon, ClockIcon, PaperClipIcon,
  DocumentTextIcon, XMarkIcon, CheckCircleIcon, XCircleIcon, BanknotesIcon,
  PaperAirplaneIcon, ClipboardDocumentListIcon, PhotoIcon, TrashIcon, AdjustmentsHorizontalIcon,
  UserCircleIcon
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

const vehicles = ref([])
const pendingRepairs = ref([])
const histRepairs = ref([])
const submitting = ref(false)
const activeTab = ref(0)
const filterStatus = ref('')
const filterVehicleId = ref('')
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

const form = ref({ vehicleId: '', title: '', detail: '', estimatedCost: '', documentFile: null })
const docPreview = ref(null)

const showApproveModal = ref(false)
const approveAction = ref('APPROVED')
const approverNote = ref('')
const activeRepair = ref(null)
const approveLoading = ref(false)

const showCompleteModal = ref(false)
const completeRepair = ref(null)
const completeNote = ref('')
const completeLoading = ref(false)

// Tabs: Admin sees 3 tabs, Staff sees 2 tabs (no pending tab)
const allTabs = [
  { id: 'form', label: 'แจ้งซ่อมใหม่', shortLabel: 'แจ้งซ่อม', icon: PlusCircleIcon, adminOnly: false },
  { id: 'pending', label: 'รอการอนุมัติ', shortLabel: 'รออนุมัติ', icon: ClockIcon, adminOnly: true },
  { id: 'history', label: 'ประวัติทั้งหมด', shortLabel: 'ประวัติ', icon: ClipboardDocumentListIcon, adminOnly: false }
]
const visibleTabs = computed(() => allTabs.filter(t => !t.adminOnly || auth.isAdmin))

const vehicleOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} — ${v.type}` }))
)

const vehicleFilterOptions = computed(() =>
  vehicles.value.map(v => ({ value: v.id, label: v.licensePlate }))
)

const statusFilterOptions = [
  { value: 'PENDING', label: 'รอการอนุมัติ', icon: ClockIcon },
  { value: 'APPROVED', label: 'อนุมัติ/กำลังซ่อม', icon: WrenchScrewdriverIcon },
  { value: 'COMPLETED', label: 'ซ่อมเสร็จแล้ว', icon: CheckCircleIcon },
  { value: 'REJECTED', label: 'ไม่อนุมัติ', icon: XCircleIcon }
]

const pendingCount = computed(() => pendingRepairs.value.length)
const filteredHistory = computed(() => histRepairs.value)

const myStats = ref([
  { label: 'รอการอนุมัติ', count: 0, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', sub: 'text-amber-500 dark:text-amber-500' },
  { label: 'กำลังซ่อม', count: 0, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', sub: 'text-blue-500 dark:text-blue-500' },
  { label: 'ซ่อมเสร็จ', count: 0, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', sub: 'text-emerald-500 dark:text-emerald-500' },
  { label: 'ไม่อนุมัติ', count: 0, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', sub: 'text-red-500 dark:text-red-500' }
])

function statusLabel(s) { return { PENDING: 'รอการอนุมัติ', APPROVED: 'อนุมัติ/กำลังซ่อม', REJECTED: 'ไม่อนุมัติ', COMPLETED: 'ซ่อมเสร็จแล้ว' }[s] }
function statusBadgeClass(s) {
  return { PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }[s]
}
function statusIconClass(s) {
  return { PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' }[s]
}
function statusIcon(s) { return { PENDING: ClockIcon, APPROVED: WrenchScrewdriverIcon, REJECTED: XCircleIcon, COMPLETED: CheckCircleIcon }[s] }
function fmtDateTime(d) { return fmtDateTimeTh(d) }

function onFileChange(e) {
  const file = e.target.files[0]; if (!file) return
  form.value.documentFile = file
  docPreview.value = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
}
function clearFile() { form.value.documentFile = null; docPreview.value = null }

async function loadPending() {
  if (!auth.isAdmin) return
  const res = await api.get('/repairs', { params: { status: 'PENDING', limit: 100 } })
  pendingRepairs.value = res.data.requests
}

async function loadHistory() {
  const params = { page: histPage.value, limit: PAGE_SIZE }
  if (filterStatus.value) params.status = filterStatus.value
  if (filterVehicleId.value) params.vehicleId = filterVehicleId.value
  if (filterStart.value) params.startDate = filterStart.value
  if (filterEnd.value) params.endDate = filterEnd.value
  if (!auth.isAdmin) params.userId = auth.user.id
  const res = await api.get('/repairs', { params })
  histRepairs.value = res.data.requests
  histTotal.value = res.data.total
  histTotalPages.value = Math.ceil(res.data.total / PAGE_SIZE)
}

async function loadMyStats() {
  if (auth.isAdmin) return
  const [p, a, c, r] = await Promise.all([
    api.get('/repairs', { params: { userId: auth.user.id, status: 'PENDING', limit: 1 } }),
    api.get('/repairs', { params: { userId: auth.user.id, status: 'APPROVED', limit: 1 } }),
    api.get('/repairs', { params: { userId: auth.user.id, status: 'COMPLETED', limit: 1 } }),
    api.get('/repairs', { params: { userId: auth.user.id, status: 'REJECTED', limit: 1 } })
  ])
  myStats.value[0].count = p.data.total
  myStats.value[1].count = a.data.total
  myStats.value[2].count = c.data.total
  myStats.value[3].count = r.data.total
}

async function loadData() {
  const vRes = await api.get('/vehicles')
  vehicles.value = vRes.data
  await Promise.all([loadPending(), loadHistory(), loadMyStats()])
}

async function submitRepair() {
  if (!form.value.vehicleId || !form.value.title.trim() || !form.value.detail.trim()) return
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('vehicleId', form.value.vehicleId)
    fd.append('userId', auth.user.id)
    fd.append('title', form.value.title.trim())
    fd.append('detail', form.value.detail.trim())
    if (form.value.estimatedCost) fd.append('estimatedCost', form.value.estimatedCost)
    if (form.value.documentFile) fd.append('document', form.value.documentFile)

    await api.post('/repairs', fd)
    swalSuccess('ส่งคำขอสำเร็จ', 'คำขอแจ้งซ่อมถูกส่งไปยัง Admin แล้ว รอการอนุมัติ')
    form.value = { vehicleId: '', title: '', detail: '', estimatedCost: '', documentFile: null }
    docPreview.value = null
    histPage.value = 1
    await Promise.all([loadPending(), loadHistory(), loadMyStats()])
    activeTab.value = auth.isAdmin ? 2 : 1
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถส่งคำขอได้')
  } finally {
    submitting.value = false
  }
}

function openApproveModal(repair, action) {
  activeRepair.value = repair
  approveAction.value = action
  approverNote.value = ''
  showApproveModal.value = true
}

async function confirmApprove() {
  if (!activeRepair.value) return
  approveLoading.value = true
  try {
    const endpoint = approveAction.value === 'APPROVED' ? 'approve' : 'reject'
    await api.put(`/repairs/${activeRepair.value.id}/${endpoint}`, {
      adminId: auth.user.id,
      approverNote: approverNote.value || undefined
    })
    const label = approveAction.value === 'APPROVED' ? 'อนุมัติ' : 'ไม่อนุมัติ'
    swalSuccess(`${label}สำเร็จ`, `${label}คำขอ "${activeRepair.value.title}" เรียบร้อยแล้ว`)
    showApproveModal.value = false
    await Promise.all([loadPending(), loadHistory(), loadMyStats()])
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถดำเนินการได้')
  } finally {
    approveLoading.value = false
  }
}

function openCompleteModal(repair) {
  completeRepair.value = repair
  completeNote.value = ''
  showCompleteModal.value = true
}

async function confirmComplete() {
  if (!completeRepair.value) return
  completeLoading.value = true
  try {
    await api.put(`/repairs/${completeRepair.value.id}/complete`, {
      adminId: auth.user.id,
      completedNote: completeNote.value || undefined
    })
    swalSuccess('บันทึกสำเร็จ', `ซ่อมเสร็จ "${completeRepair.value.title}" รถพร้อมใช้งานแล้ว`)
    showCompleteModal.value = false
    await Promise.all([loadPending(), loadHistory(), loadMyStats()])
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถดำเนินการได้')
  } finally {
    completeLoading.value = false
  }
}

async function deleteRepair(r) {
  const result = await swalConfirm('ลบคำขอ', `ต้องการลบคำขอแจ้งซ่อม "${r.title}" ?`, 'ลบ', true)
  if (!result.isConfirmed) return
  try {
    await api.delete(`/repairs/${r.id}`, { data: { actionUserId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', 'ลบคำขอแจ้งซ่อมเรียบร้อยแล้ว')
    if (histRepairs.value.length === 1 && histPage.value > 1) histPage.value--
    await Promise.all([loadPending(), loadHistory(), loadMyStats()])
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถลบได้')
  }
}

watch(filterStatus, () => { histPage.value = 1; loadHistory() })
watch(filterVehicleId, () => { histPage.value = 1; loadHistory() })
watch(histPage, loadHistory)

onMounted(loadData)
</script>
