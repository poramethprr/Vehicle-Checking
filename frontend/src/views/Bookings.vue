<template>
  <div>
    <!-- Header -->
    <div class="relative bg-linear-to-r from-emerald-500 to-teal-600 dark:from-emerald-950 dark:to-teal-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-emerald-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <ArrowsRightLeftIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">เบิก/คืนรถ</h1>
            <p class="text-emerald-100 text-xs mt-0.5">ระบบเบิกและคืนยานพาหนะ พร้อมบันทึกเลขไมล์</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-3 mb-5">
      <div class="bg-linear-to-br from-emerald-500 to-teal-600 dark:from-emerald-800 dark:to-teal-900 rounded-xl shadow-sm shadow-emerald-200 dark:shadow-black/20 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.available }}</div>
        <div class="text-xs text-emerald-100 mt-1">รถพร้อมใช้</div>
      </div>
      <div class="bg-linear-to-br from-amber-400 to-orange-500 dark:from-amber-800 dark:to-orange-900 rounded-xl shadow-sm shadow-amber-200 dark:shadow-black/20 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.checkedOut }}</div>
        <div class="text-xs text-amber-100 mt-1">กำลังใช้งาน</div>
      </div>
      <div class="bg-linear-to-br from-orange-500 to-red-500 dark:from-orange-800 dark:to-red-900 rounded-xl shadow-sm shadow-orange-200 dark:shadow-black/20 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.maintenance }}</div>
        <div class="text-xs text-orange-100 mt-1">ซ่อมบำรุง</div>
      </div>
      <div class="bg-linear-to-br from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 rounded-xl shadow-sm shadow-blue-200 dark:shadow-black/20 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.returned }}</div>
        <div class="text-xs text-blue-100 mt-1">คืนแล้ววันนี้</div>
      </div>
    </div>

    <!-- Tabs -->
    <TabGroup :selected-index="selectedTab" @change="selectedTab = $event">
      <TabList class="flex gap-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-1.5 mb-4">
        <Tab v-slot="{ selected }" as="template">
          <button :class="[selected ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700', 'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all']">
            <CheckCircleIcon class="w-4 h-4" />
            <span class="hidden sm:inline">รถพร้อมใช้งาน</span>
            <span class="sm:hidden">พร้อม</span>
            <span :class="selected ? 'bg-emerald-400/50' : 'bg-slate-100 dark:bg-slate-700'" class="text-xs px-1.5 py-0.5 rounded-full">{{ stats.available }}</span>
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button :class="[selected ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700', 'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all']">
            <TruckIcon class="w-4 h-4" />
            <span class="hidden sm:inline">กำลังใช้งาน</span>
            <span class="sm:hidden">กำลังใช้</span>
            <span :class="selected ? 'bg-amber-400/50' : 'bg-slate-100 dark:bg-slate-700'" class="text-xs px-1.5 py-0.5 rounded-full">{{ stats.checkedOut }}</span>
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button :class="[selected ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700', 'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all']">
            <ClockIcon class="w-4 h-4" />
            <span>ประวัติ</span>
          </button>
        </Tab>
      </TabList>

      <TabPanels>
        <!-- Tab 1: รถพร้อมใช้งาน -->
        <TabPanel>
          <!-- Search bar -->
          <div class="relative mb-4">
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input v-model="searchAvailable" placeholder="ค้นหาทะเบียน, ประเภท, เลขตัวถัง..."
              class="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition hover:border-emerald-400 dark:text-white dark:placeholder-slate-400" />
            <button v-if="searchAvailable" @click="searchAvailable = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XCircleIcon class="w-4 h-4" />
            </button>
          </div>

          <div v-if="filteredAvailable.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="v in filteredAvailable" :key="v.id"
              class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all">
              <!-- Photo cover -->
              <div class="h-36 relative overflow-hidden bg-emerald-50 dark:bg-emerald-900/20">
                <img v-if="v.photo" :src="photoUrl(v.photo)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <TruckIcon class="w-12 h-12 text-emerald-200" />
                </div>
                <span class="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">พร้อมใช้งาน</span>
              </div>
              <div class="p-4">
                <div class="mb-1">
                  <div class="font-bold text-slate-800 dark:text-white">{{ v.licensePlate }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ v.type }}</div>
                </div>
                <div class="text-xs text-slate-400 dark:text-slate-500 mb-3 space-y-0.5">
                  <div v-if="v.currentMileage">ไมล์ปัจจุบัน: <span class="text-slate-600 dark:text-slate-300 font-medium">{{ num(v.currentMileage) }} กม.</span></div>
                  <div v-if="v.chassisNumber" class="truncate">ตัวถัง: {{ v.chassisNumber }}</div>
                </div>
                <button v-if="auth.isAdmin" @click="openCheckoutFor(v)"
                  class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5">
                  <ArrowUpTrayIcon class="w-4 h-4" /> เบิกรถ
                </button>
                <div v-else class="w-full bg-slate-100 dark:bg-slate-700 text-slate-400 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
                  <LockClosedIcon class="w-4 h-4" /> เฉพาะ Admin เท่านั้น
                </div>
              </div>
            </div>
          </div>
          <div v-if="!filteredAvailable.length && !maintenanceVehicles.length" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 py-16 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
            <TruckIcon class="w-10 h-10 opacity-30" />
            <p class="text-sm font-medium">{{ searchAvailable ? 'ไม่พบรถที่ค้นหา' : 'ไม่มีรถที่พร้อมใช้งาน' }}</p>
            <p v-if="!searchAvailable" class="text-xs">รถทั้งหมดอาจกำลังใช้งานหรืออยู่ระหว่างซ่อมบำรุง</p>
          </div>

          <!-- Maintenance vehicles section -->
          <div v-if="maintenanceVehicles.length" class="mt-5">
            <div class="flex items-center gap-2 mb-3">
              <WrenchScrewdriverIcon class="w-4 h-4 text-orange-500" />
              <span class="text-sm font-bold text-orange-700 dark:text-orange-400">อยู่ระหว่างซ่อมบำรุง</span>
              <span class="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold px-2 py-0.5 rounded-full">{{ maintenanceVehicles.length }}</span>
              <div class="flex-1 h-px bg-orange-100 dark:bg-orange-800/30"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="v in maintenanceVehicles" :key="v.id"
                class="bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800/50 overflow-hidden opacity-85">
                <!-- Photo cover -->
                <div class="h-36 relative overflow-hidden bg-orange-100 dark:bg-orange-900/30">
                  <img v-if="v.photo" :src="photoUrl(v.photo)" class="w-full h-full object-cover grayscale-[30%]" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <TruckIcon class="w-12 h-12 text-orange-200" />
                  </div>
                  <span class="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-sm">ซ่อมบำรุง</span>
                </div>
                <div class="p-4">
                  <div class="mb-1">
                    <div class="font-bold text-slate-700 dark:text-slate-200">{{ v.licensePlate }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">{{ v.type }}</div>
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 mb-3 space-y-0.5">
                    <div v-if="v.currentMileage">ไมล์ปัจจุบัน: <span class="text-slate-600 dark:text-slate-300 font-medium">{{ num(v.currentMileage) }} กม.</span></div>
                    <div v-if="v.note" class="truncate text-orange-600">หมายเหตุ: {{ v.note }}</div>
                  </div>
                  <div class="w-full bg-orange-200/60 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
                    <WrenchScrewdriverIcon class="w-4 h-4" /> ไม่สามารถเบิกได้
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Tab 2: กำลังใช้งาน -->
        <TabPanel>
          <!-- Search bar -->
          <div class="relative mb-4">
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input v-model="searchActive" placeholder="ค้นหาทะเบียน, คนขับ, สถานที่..."
              class="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
            <button v-if="searchActive" @click="searchActive = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XCircleIcon class="w-4 h-4" />
            </button>
          </div>

          <div v-if="filteredActive.length" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div class="divide-y divide-gray-100 dark:divide-slate-700">
              <div v-for="b in filteredActive" :key="b.id" class="px-5 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 mt-0.5 border border-slate-100 dark:border-slate-700/50">
                      <img v-if="b.vehicle.photo" :src="photoUrl(b.vehicle.photo)" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <TruckIcon class="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold text-sm text-slate-800 dark:text-white">
                        {{ b.vehicle.licensePlate }}
                        <span class="text-slate-400 dark:text-slate-500 font-normal ml-1">{{ b.vehicle.type }}</span>
                        <span v-if="b.pendingMileageIn" class="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-700/50">ขอคืนรถ</span>
                        <span v-else class="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-700/50">กำลังใช้งาน</span>
                      </div>
                      <div class="text-xs text-slate-400 dark:text-slate-500 mt-1 space-y-0.5">
                        <div><MapPinIcon class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ b.destination }}{{ b.purpose ? ` · ${b.purpose}` : '' }}</div>
                        <div>ผู้เบิก: <span class="text-slate-600 dark:text-slate-300">{{ b.requester.displayName || b.requester.username }}</span> · คนขับ: <span class="text-slate-600 dark:text-slate-300">{{ b.driver.displayName || b.driver.username }}</span></div>
                        <div>เบิกเมื่อ: {{ fmtDateTime(b.checkoutDate) }} · ไมล์ออก: {{ num(b.mileageOut) }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 self-start sm:self-center shrink-0 flex-wrap">
                    <!-- Has pending return request -->
                    <template v-if="b.pendingMileageIn">
                      <template v-if="auth.isAdmin">
                        <button @click="openApproveReturn(b)"
                          class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm flex items-center gap-1">
                          <CheckCircleIcon class="w-3.5 h-3.5" /> อนุมัติคืน
                        </button>
                        <button @click="doRejectReturn(b)"
                          class="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1">
                          <XMarkIcon class="w-3.5 h-3.5" /> ปฏิเสธ
                        </button>
                      </template>
                      <span v-else class="text-xs font-semibold px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-700/50 flex items-center gap-1">
                        <ClockIcon class="w-3.5 h-3.5" /> รออนุมัติคืน
                      </span>
                    </template>
                    <!-- No pending request -->
                    <template v-else>
                      <button v-if="auth.isAdmin" @click="openReturn(b)"
                        class="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5">
                        <ArrowDownTrayIcon class="w-3.5 h-3.5" /> คืนรถ
                      </button>
                      <button v-else @click="openReturnReq(b)"
                        class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5">
                        <ArrowDownTrayIcon class="w-3.5 h-3.5" /> ขอคืนรถ
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 py-16 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
            <CheckCircleIcon class="w-10 h-10 opacity-30" />
            <p class="text-sm font-medium">{{ searchActive ? 'ไม่พบรถที่ค้นหา' : 'ไม่มีรถที่กำลังใช้งาน' }}</p>
          </div>
        </TabPanel>

        <!-- Tab 3: ประวัติ -->
        <TabPanel>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-3">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-blue-500" /> ประวัติการเบิก/คืน
                </h3>
                <div class="relative w-full sm:w-56">
                  <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input v-model="searchText" placeholder="ค้นหาทะเบียน, คนขับ, สถานที่..."
                    class="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition hover:border-blue-400 dark:text-white dark:placeholder-slate-400" />
                </div>
              </div>
              <AppDateFilter default-mode="all" @change="onDateChange" />
            </div>

            <!-- Mobile -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="filteredHistory.length">
              <div v-for="b in filteredHistory" :key="b.id" class="px-4 py-3.5">
                <div class="flex justify-between items-start mb-1">
                  <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ b.vehicle.licensePlate }}</span>
                  <span :class="statusBadge(b.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ statusLabel(b.status) }}</span>
                </div>
                <div class="text-xs text-slate-400 dark:text-slate-500 mb-1">
                  {{ b.destination }} · {{ b.requester.displayName || b.requester.username }} · {{ b.driver.displayName || b.driver.username }} · {{ fmtDate(b.checkoutDate) }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  ไมล์ออก: {{ num(b.mileageOut) }}
                  <template v-if="b.mileageIn"> → เข้า: {{ num(b.mileageIn) }} (<span class="text-blue-600 font-semibold">{{ num(b.distance) }} กม.</span>)</template>
                </div>
              </div>
            </div>

            <!-- Desktop -->
            <div class="hidden sm:block overflow-x-auto" v-if="filteredHistory.length">
              <table class="w-full">
                <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">วันที่เบิก</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ยานพาหนะ</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">สถานที่</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">คนขับ</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ไมล์ออก</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ไมล์เข้า</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">ระยะทาง</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">สถานะ</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase"></th>
                </tr></thead>
                <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                  <tr v-for="b in filteredHistory" :key="b.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                    <td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ fmtDateTime(b.checkoutDate) }}</td>
                    <td class="py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{{ b.vehicle.licensePlate }}</td>
                    <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-32 truncate">{{ b.destination }}</td>
                    <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{{ b.driver.displayName || b.driver.username }}</td>
                    <td class="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-300">{{ num(b.mileageOut) }}</td>
                    <td class="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-300">{{ b.mileageIn ? num(b.mileageIn) : '-' }}</td>
                    <td class="py-3 px-4 text-sm text-right font-semibold" :class="b.distance ? 'text-blue-600' : 'text-slate-300'">{{ b.distance ? num(b.distance) + ' กม.' : '-' }}</td>
                    <td class="py-3 px-4 text-center">
                      <span :class="statusBadge(b.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ statusLabel(b.status) }}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button @click="viewDetail(b)" class="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                        <EyeIcon class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <AppEmpty v-if="!filteredHistory.length" :icon="ClockIcon" title="ยังไม่มีประวัติการเบิก/คืน" />
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>

    <!-- Checkout Modal -->
    <TransitionRoot :show="showCheckout" as="template">
      <Dialog @close="showCheckout = false" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ArrowUpTrayIcon class="w-5 h-5 text-emerald-500" /> เบิกรถ
                </DialogTitle>
                <button @click="showCheckout = false" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4">
                <!-- Selected vehicle info -->
                <div v-if="selectedVehicle" class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl overflow-hidden flex items-center gap-3">
                  <div class="w-16 h-16 shrink-0 overflow-hidden">
                    <img v-if="selectedVehicle.photo" :src="photoUrl(selectedVehicle.photo)" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <TruckIcon class="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div class="py-2 pr-3">
                    <div class="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">{{ selectedVehicle.licensePlate }}</div>
                    <div class="text-xs text-emerald-600 dark:text-emerald-400">{{ selectedVehicle.type }}</div>
                    <div v-if="selectedVehicle.currentMileage" class="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">ไมล์: {{ num(selectedVehicle.currentMileage) }} กม.</div>
                  </div>
                </div>

                <div v-if="!selectedVehicle">
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">ยานพาหนะ <span class="text-red-500">*</span></label>
                  <AppSelect v-model="coForm.vehicleId" :options="availableVehicleOptions" placeholder="เลือกรถ" :icon="TruckIcon" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">สถานที่ปลายทาง <span class="text-red-500">*</span></label>
                  <input v-model="coForm.destination" placeholder="เช่น โรงพยาบาลศิริราช"
                    class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400 dark:text-white dark:placeholder-slate-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">วัตถุประสงค์</label>
                  <input v-model="coForm.purpose" placeholder="เช่น ส่งผู้ป่วย, ประชุม"
                    class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400 dark:text-white dark:placeholder-slate-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">คนทำเรื่องเบิก <span class="text-red-500">*</span></label>
                  <AppSelect v-model="coForm.requesterId" :options="requesterOptions" placeholder="เลือกผู้เบิก" :icon="UserIcon" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">คนขับ <span class="text-red-500">*</span></label>
                  <AppSelect v-model="coForm.driverId" :options="driverOptions" placeholder="เลือกคนขับ" :icon="UserIcon" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">เลขไมล์ตอนออก <span class="text-red-500">*</span></label>
                  <input v-model="coForm.mileageOut" type="number" placeholder="เลขไมล์"
                    class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400 dark:text-white dark:placeholder-slate-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">รูปเลขไมล์ (ตอนออก)</label>
                  <input type="file" accept="image/*" capture="environment" @change="coForm.photo = $event.target.files[0]"
                    class="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 dark:hover:file:bg-emerald-900/40" />
                </div>
                <button @click="doCheckout" :disabled="savingCO"
                  class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg v-if="savingCO" class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ savingCO ? 'กำลังบันทึก...' : 'ยืนยันเบิกรถ' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Detail Modal -->
    <TransitionRoot :show="showDetail" as="template">
      <Dialog @close="closeDetail" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" v-if="detailBooking">
              <div class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-blue-500" /> รายละเอียดการใช้งาน
                </DialogTitle>
                <button @click="closeDetail" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4">
                <!-- Info -->
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-0.5">ยานพาหนะ</p>
                    <p class="font-semibold text-slate-800 dark:text-white">{{ detailBooking.vehicle.licensePlate }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500">{{ detailBooking.vehicle.type }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-0.5">สถานะ</p>
                    <span :class="statusBadge(detailBooking.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ statusLabel(detailBooking.status) }}</span>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-0.5">ผู้ขับขี่</p>
                    <p class="font-semibold text-slate-800 dark:text-white">{{ detailBooking.driver.displayName || detailBooking.driver.username }}</p>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-0.5">ปลายทาง</p>
                    <p class="font-semibold text-slate-800 dark:text-white">{{ detailBooking.destination }}</p>
                  </div>
                </div>

                <!-- Mileage -->
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="text-[10px] text-blue-400 uppercase font-semibold mb-1">ไมล์ออก</p>
                    <p class="font-bold text-blue-700 dark:text-blue-300 text-lg">{{ num(detailBooking.mileageOut) }}</p>
                    <p class="text-[10px] text-blue-400">กม.</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-emerald-400 uppercase font-semibold mb-1">ไมล์เข้า</p>
                    <p class="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{{ detailBooking.mileageIn ? num(detailBooking.mileageIn) : '-' }}</p>
                    <p class="text-[10px] text-emerald-400">กม.</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">ระยะทาง</p>
                    <p class="font-bold text-slate-800 dark:text-white text-lg">{{ detailBooking.distance ? num(detailBooking.distance) : '-' }}</p>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500">กม.</p>
                  </div>
                </div>

                <!-- Photos -->
                <div v-if="photoUrl(detailBooking.mileageOutPhoto) || photoUrl(detailBooking.mileageInPhoto)">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">รูปถ่ายเลขไมล์</p>
                  <div class="grid grid-cols-2 gap-3">
                    <div v-if="photoUrl(detailBooking.mileageOutPhoto)">
                      <p class="text-xs text-slate-400 mb-1 text-center">ไมล์ขาออก</p>
                      <img :src="photoUrl(detailBooking.mileageOutPhoto)" @click="lightboxPhoto = photoUrl(detailBooking.mileageOutPhoto)"
                        class="w-full h-32 object-cover rounded-xl cursor-zoom-in hover:opacity-90 transition" />
                    </div>
                    <div v-if="photoUrl(detailBooking.mileageInPhoto)">
                      <p class="text-xs text-slate-400 mb-1 text-center">ไมล์ขาเข้า</p>
                      <img :src="photoUrl(detailBooking.mileageInPhoto)" @click="lightboxPhoto = photoUrl(detailBooking.mileageInPhoto)"
                        class="w-full h-32 object-cover rounded-xl cursor-zoom-in hover:opacity-90 transition" />
                    </div>
                  </div>
                </div>

                <div v-if="detailBooking.returnNote" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                  <span class="font-semibold">หมายเหตุ:</span> {{ detailBooking.returnNote }}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Return Request Modal (Staff) -->
    <TransitionRoot :show="showReturnReq" as="template">
      <Dialog @close="showReturnReq = false" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ArrowDownTrayIcon class="w-5 h-5 text-emerald-500" /> ขอคืนรถ
                </DialogTitle>
                <button @click="showReturnReq = false" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4" v-if="returnReqBooking">
                <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3 text-sm">
                  <div class="font-semibold text-emerald-800 dark:text-emerald-300">{{ returnReqBooking.vehicle.licensePlate }} <span class="font-normal text-emerald-600 dark:text-emerald-400">{{ returnReqBooking.vehicle.type }}</span></div>
                  <div class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    <MapPinIcon class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ returnReqBooking.destination }} · คนขับ: {{ returnReqBooking.driver.displayName || returnReqBooking.driver.username }} · ไมล์ออก: {{ num(returnReqBooking.mileageOut) }}
                  </div>
                </div>
                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <ClockIcon class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>การขอคืนรถจะรอการอนุมัติจาก Admin ก่อนจึงจะสมบูรณ์</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">เลขไมล์ตอนกลับ <span class="text-red-500">*</span></label>
                  <input v-model="rrForm.mileageIn" type="number" placeholder="เลขไมล์"
                    class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400 dark:text-white dark:placeholder-slate-400" />
                  <div v-if="rrForm.mileageIn && returnReqBooking" class="text-xs text-emerald-600 mt-1 font-medium">
                    ระยะทาง: {{ num(Number(rrForm.mileageIn) - returnReqBooking.mileageOut) }} กม.
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">รูปเลขไมล์ (ตอนกลับ)</label>
                  <input type="file" accept="image/*" capture="environment" @change="rrForm.photo = $event.target.files[0]"
                    class="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 dark:hover:file:bg-emerald-900/40" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">หมายเหตุ</label>
                  <textarea v-model="rrForm.note" rows="2" placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400 dark:text-white dark:placeholder-slate-400"></textarea>
                </div>
                <button @click="doReturnReq" :disabled="savingRR"
                  class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg v-if="savingRR" class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ savingRR ? 'กำลังส่งคำขอ...' : 'ส่งคำขอคืนรถ' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Approve Return Modal (Admin) -->
    <TransitionRoot :show="showApprove" as="template">
      <Dialog @close="showApprove = false" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" v-if="approveBooking">
              <div class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CheckCircleIcon class="w-5 h-5 text-emerald-500" /> อนุมัติคืนรถ
                </DialogTitle>
                <button @click="showApprove = false" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4">
                <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 text-sm">
                  <div class="font-semibold text-slate-800 dark:text-white">{{ approveBooking.vehicle.licensePlate }} <span class="font-normal text-slate-500 dark:text-slate-400">{{ approveBooking.vehicle.type }}</span></div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <MapPinIcon class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ approveBooking.destination }} · คนขับ: {{ approveBooking.driver.displayName || approveBooking.driver.username }}
                  </div>
                </div>
                <!-- Pending data from staff -->
                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-xl p-4 space-y-3">
                  <p class="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">ข้อมูลที่ Staff ส่งมา</p>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p class="text-[10px] text-slate-400 uppercase font-semibold mb-1">ไมล์ออก</p>
                      <p class="font-bold text-slate-700 dark:text-slate-200">{{ num(approveBooking.mileageOut) }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-orange-400 uppercase font-semibold mb-1">ไมล์เข้า</p>
                      <p class="font-bold text-orange-700 dark:text-orange-400 text-lg">{{ num(approveBooking.pendingMileageIn) }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-emerald-400 uppercase font-semibold mb-1">ระยะทาง</p>
                      <p class="font-bold text-emerald-700 dark:text-emerald-400">{{ num(approveBooking.pendingMileageIn - approveBooking.mileageOut) }} กม.</p>
                    </div>
                  </div>
                  <div v-if="approveBooking.pendingReturnNote" class="text-xs text-slate-600 dark:text-slate-300">
                    <span class="font-semibold">หมายเหตุ:</span> {{ approveBooking.pendingReturnNote }}
                  </div>
                  <div v-if="approveBooking.pendingMileageInPhoto">
                    <p class="text-xs text-slate-400 mb-1">รูปไมล์ (ขาเข้า)</p>
                    <img :src="photoUrl(approveBooking.pendingMileageInPhoto)" @click="lightboxPhoto = photoUrl(approveBooking.pendingMileageInPhoto)"
                      class="w-full h-32 object-cover rounded-xl cursor-zoom-in hover:opacity-90 transition" />
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    ขอคืนโดย: <span class="text-slate-600 dark:text-slate-300 font-semibold">{{ approveBooking.returnRequester?.displayName || approveBooking.returnRequester?.username }}</span>
                    · {{ fmtDateTime(approveBooking.returnRequestedAt) }}
                  </div>
                </div>
                <button @click="doApproveReturn" :disabled="savingApprove"
                  class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg v-if="savingApprove" class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ savingApprove ? 'กำลังอนุมัติ...' : 'ยืนยันอนุมัติคืนรถ' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="lightboxPhoto" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" @click="lightboxPhoto = null">
          <img :src="lightboxPhoto" class="max-w-[92vw] max-h-[88vh] rounded-2xl shadow-2xl object-contain" @click.stop />
          <button @click="lightboxPhoto = null" class="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
            <XMarkIcon class="w-5 h-5 text-white" />
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Return Modal -->
    <TransitionRoot :show="showReturn" as="template">
      <Dialog @close="showReturn = false" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ArrowDownTrayIcon class="w-5 h-5 text-blue-500" /> คืนรถ
                </DialogTitle>
                <button @click="showReturn = false" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4" v-if="returnBooking">
                <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 text-sm">
                  <div class="font-semibold text-slate-800 dark:text-white">{{ returnBooking.vehicle.licensePlate }} <span class="font-normal text-slate-500 dark:text-slate-400">{{ returnBooking.vehicle.type }}</span></div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <MapPinIcon class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ returnBooking.destination }} · คนขับ: {{ returnBooking.driver.displayName || returnBooking.driver.username }} · ไมล์ออก: {{ num(returnBooking.mileageOut) }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">เลขไมล์ตอนกลับ <span class="text-red-500">*</span></label>
                  <input v-model="rtForm.mileageIn" type="number" placeholder="เลขไมล์"
                    class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400 dark:text-white dark:placeholder-slate-400" />
                  <div v-if="rtForm.mileageIn && returnBooking" class="text-xs text-blue-600 mt-1 font-medium">
                    ระยะทาง: {{ num(Number(rtForm.mileageIn) - returnBooking.mileageOut) }} กม.
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">รูปเลขไมล์ (ตอนกลับ)</label>
                  <input type="file" accept="image/*" capture="environment" @change="rtForm.photo = $event.target.files[0]"
                    class="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">หมายเหตุ</label>
                  <textarea v-model="rtForm.note" rows="2" placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    class="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400 dark:text-white dark:placeholder-slate-400"></textarea>
                </div>
                <button @click="doReturn" :disabled="savingRT"
                  class="w-full bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg v-if="savingRT" class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ savingRT ? 'กำลังบันทึก...' : 'ยืนยันคืนรถ' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { TabGroup, TabList, Tab, TabPanels, TabPanel, Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  TruckIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, ClockIcon, MagnifyingGlassIcon, ArrowsRightLeftIcon,
  XMarkIcon, XCircleIcon, EyeIcon, MapPinIcon, CheckCircleIcon, UserIcon, WrenchScrewdriverIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import AppDateFilter from '../components/AppDateFilter.vue'
import api from '../stores/api'
import { fmtDateTh, fmtDateTimeTh } from '../stores/date'
import { auth } from '../stores/auth'
import { swalSuccess, swalError } from '../stores/swal'

const BASE_URL = ``

const bookings = ref([])
const availableVehicles = ref([])
const maintenanceVehicles = ref([])
const users = ref([])
const searchText = ref('')
const searchAvailable = ref('')
const searchActive = ref('')
const selectedTab = ref(0)
const selectedVehicle = ref(null)

const showCheckout = ref(false)
const showReturn = ref(false)
const showReturnReq = ref(false)
const showApprove = ref(false)
const returnBooking = ref(null)
const returnReqBooking = ref(null)
const approveBooking = ref(null)
const savingCO = ref(false)
const savingRT = ref(false)
const savingRR = ref(false)
const savingApprove = ref(false)
const lightboxPhoto = ref(null)

function photoUrl(filename) {
  if (!filename) return null
  const base = api.defaults.baseURL.replace('/api', '')
  if (filename.startsWith('https://')) return `${base}/api/media/proxy?url=${encodeURIComponent(filename)}`
  if (filename.startsWith('http')) return filename
  if (filename.startsWith('/')) return base + filename
  return base + '/uploads/' + filename
}

const coForm = ref({ vehicleId: '', requesterId: '', driverId: '', destination: '', purpose: '', mileageOut: '', photo: null })
const rtForm = ref({ mileageIn: '', photo: null, note: '' })
const rrForm = ref({ mileageIn: '', photo: null, note: '' })

const activeBookings = computed(() => bookings.value.filter(b => b.status === 'CHECKED_OUT'))
const historyBookings = computed(() => bookings.value.filter(b => b.status !== 'CHECKED_OUT'))

const filteredAvailable = computed(() => {
  if (!searchAvailable.value) return availableVehicles.value
  const q = searchAvailable.value.toLowerCase()
  return availableVehicles.value.filter(v =>
    v.licensePlate.toLowerCase().includes(q) ||
    v.type.toLowerCase().includes(q) ||
    (v.chassisNumber || '').toLowerCase().includes(q) ||
    (v.engineNumber || '').toLowerCase().includes(q)
  )
})

const filteredActive = computed(() => {
  if (!searchActive.value) return activeBookings.value
  const q = searchActive.value.toLowerCase()
  return activeBookings.value.filter(b =>
    b.vehicle.licensePlate.toLowerCase().includes(q) ||
    b.vehicle.type.toLowerCase().includes(q) ||
    (b.driver.displayName || b.driver.username).toLowerCase().includes(q) ||
    (b.requester.displayName || b.requester.username).toLowerCase().includes(q) ||
    b.destination.toLowerCase().includes(q)
  )
})

const stats = computed(() => ({
  available: availableVehicles.value.length,
  checkedOut: activeBookings.value.length,
  maintenance: maintenanceVehicles.value.length,
  returned: bookings.value.filter(b => b.status === 'RETURNED' && isToday(b.returnDate)).length
}))

const availableVehicleOptions = computed(() =>
  availableVehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` }))
)
const driverOptions = computed(() =>
  users.value.filter(u => ['ADMIN', 'STAFF'].includes(u.role)).map(u => ({ value: u.id, label: `${u.displayName || u.username} (${u.role})` }))
)
const requesterOptions = computed(() =>
  users.value.map(u => ({ value: u.id, label: `${u.displayName || u.username} (${u.role})` }))
)

const filterStart = ref('')
const filterEnd = ref('')

function onDateChange({ startDate, endDate }) {
  filterStart.value = startDate
  filterEnd.value = endDate
}

const filteredHistory = computed(() => {
  let list = historyBookings.value
  if (filterStart.value) {
    const s = new Date(filterStart.value), e = new Date((filterEnd.value || filterStart.value) + 'T23:59:59')
    list = list.filter(b => { const d = new Date(b.checkoutDate); return d >= s && d <= e })
  }
  if (!searchText.value) return list
  const q = searchText.value.toLowerCase()
  return list.filter(b =>
    b.vehicle.licensePlate.toLowerCase().includes(q) ||
    b.destination.toLowerCase().includes(q) ||
    (b.driver.displayName || b.driver.username).toLowerCase().includes(q) ||
    (b.requester.displayName || b.requester.username).toLowerCase().includes(q)
  )
})

function isToday(d) { if (!d) return false; const v = new Date(d); const t = new Date(); return v.getFullYear()===t.getFullYear()&&v.getMonth()===t.getMonth()&&v.getDate()===t.getDate() }
function fmtDate(d) { return fmtDateTh(d) }
function fmtDateTime(d) { return fmtDateTimeTh(d) }
function num(n) { return n != null ? Number(n).toLocaleString() : '-' }
function statusLabel(s) { return { CHECKED_OUT: 'กำลังใช้งาน', RETURNED: 'คืนแล้ว', CANCELLED: 'ยกเลิก' }[s] ?? s }
function statusBadge(s) {
  return {
    CHECKED_OUT: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-700/50',
    RETURNED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-700/50',
    CANCELLED: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-600'
  }[s] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-600'
}

async function loadData() {
  const [bRes, avRes, uRes, vRes] = await Promise.all([
    api.get('/bookings'),
    api.get('/bookings/available/vehicles'),
    api.get('/users'),
    api.get('/vehicles')
  ])
  bookings.value = bRes.data.bookings || bRes.data
  availableVehicles.value = avRes.data
  users.value = uRes.data
  const allVehicles = vRes.data?.vehicles || vRes.data || []
  maintenanceVehicles.value = allVehicles.filter(v => v.status === 'MAINTENANCE')
}

function openCheckoutFor(vehicle) {
  selectedVehicle.value = vehicle
  coForm.value = {
    vehicleId: vehicle.id,
    requesterId: auth.user.id,
    driverId: '',
    destination: '',
    purpose: '',
    mileageOut: vehicle.currentMileage ? String(vehicle.currentMileage) : '',
    photo: null
  }
  showCheckout.value = true
}

function openReturn(b) {
  returnBooking.value = b
  rtForm.value = { mileageIn: '', photo: null, note: '' }
  showReturn.value = true
}

function openReturnReq(b) {
  returnReqBooking.value = b
  rrForm.value = { mileageIn: '', photo: null, note: '' }
  showReturnReq.value = true
}

function openApproveReturn(b) {
  approveBooking.value = b
  showApprove.value = true
}

const showDetail = ref(false)
const detailBooking = ref(null)
function viewDetail(b) { detailBooking.value = b; showDetail.value = true }
function closeDetail() { showDetail.value = false }

async function doCheckout() {
  const vid = selectedVehicle.value ? selectedVehicle.value.id : coForm.value.vehicleId
  if (!vid || !coForm.value.requesterId || !coForm.value.driverId || !coForm.value.destination || !coForm.value.mileageOut) {
    return swalError('กรุณากรอกข้อมูลให้ครบ')
  }
  savingCO.value = true
  try {
    const fd = new FormData()
    fd.append('vehicleId', vid)
    fd.append('requesterId', coForm.value.requesterId)
    fd.append('driverId', coForm.value.driverId)
    fd.append('destination', coForm.value.destination)
    if (coForm.value.purpose) fd.append('purpose', coForm.value.purpose)
    fd.append('mileageOut', coForm.value.mileageOut)
    if (coForm.value.photo) fd.append('mileageOutPhoto', coForm.value.photo)

    await api.post('/bookings/checkout', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    swalSuccess('เบิกรถสำเร็จ', 'บันทึกการเบิกรถเรียบร้อยแล้ว')
    showCheckout.value = false
    selectedVehicle.value = null
    selectedTab.value = 1  // Switch to "กำลังใช้งาน" tab
    await loadData()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถเบิกรถได้')
  } finally {
    savingCO.value = false
  }
}

async function doReturnReq() {
  if (!rrForm.value.mileageIn) return swalError('กรุณากรอกเลขไมล์ตอนกลับ')
  savingRR.value = true
  try {
    const fd = new FormData()
    fd.append('pendingMileageIn', rrForm.value.mileageIn)
    if (rrForm.value.note) fd.append('pendingReturnNote', rrForm.value.note)
    fd.append('userId', auth.user.id)
    if (rrForm.value.photo) fd.append('pendingMileageInPhoto', rrForm.value.photo)

    await api.put(`/bookings/return-request/${returnReqBooking.value.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    swalSuccess('ส่งคำขอสำเร็จ', 'Admin จะตรวจสอบและอนุมัติการคืนรถ')
    showReturnReq.value = false
    await loadData()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถส่งคำขอได้')
  } finally {
    savingRR.value = false
  }
}

async function doApproveReturn() {
  savingApprove.value = true
  try {
    await api.put(`/bookings/approve-return/${approveBooking.value.id}`, { userId: auth.user.id })
    swalSuccess('อนุมัติสำเร็จ', 'บันทึกการคืนรถเรียบร้อยแล้ว')
    showApprove.value = false
    selectedTab.value = 2
    await loadData()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถอนุมัติได้')
  } finally {
    savingApprove.value = false
  }
}

async function doRejectReturn(b) {
  try {
    await api.put(`/bookings/reject-return/${b.id}`, { userId: auth.user.id })
    swalSuccess('ปฏิเสธสำเร็จ', 'ยกเลิกคำขอคืนรถแล้ว')
    await loadData()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถปฏิเสธได้')
  }
}

async function doReturn() {
  if (!rtForm.value.mileageIn) return swalError('กรุณากรอกเลขไมล์ตอนกลับ')
  savingRT.value = true
  try {
    const fd = new FormData()
    fd.append('mileageIn', rtForm.value.mileageIn)
    if (rtForm.value.note) fd.append('returnNote', rtForm.value.note)
    fd.append('userId', auth.user.id)
    if (rtForm.value.photo) fd.append('mileageInPhoto', rtForm.value.photo)

    await api.put(`/bookings/return/${returnBooking.value.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    swalSuccess('คืนรถสำเร็จ', 'บันทึกการคืนรถเรียบร้อยแล้ว')
    showReturn.value = false
    selectedTab.value = 2  // Switch to ประวัติ tab
    await loadData()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถคืนรถได้')
  } finally {
    savingRT.value = false
  }
}

onMounted(loadData)
</script>
