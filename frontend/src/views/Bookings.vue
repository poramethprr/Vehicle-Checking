<template>
  <div>
    <!-- Header -->
    <div class="relative bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-emerald-200">
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
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm shadow-emerald-200 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.available }}</div>
        <div class="text-xs text-emerald-100 mt-1">รถพร้อมใช้งาน</div>
      </div>
      <div class="bg-linear-to-br from-amber-400 to-orange-500 rounded-xl shadow-sm shadow-amber-200 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.checkedOut }}</div>
        <div class="text-xs text-amber-100 mt-1">กำลังใช้งาน</div>
      </div>
      <div class="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm shadow-blue-200 p-4 text-center">
        <div class="text-2xl font-bold text-white">{{ stats.returned }}</div>
        <div class="text-xs text-blue-100 mt-1">คืนแล้ววันนี้</div>
      </div>
    </div>

    <!-- Tabs -->
    <TabGroup :selected-index="selectedTab" @change="selectedTab = $event">
      <TabList class="flex gap-1 bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 p-1.5 mb-4">
        <Tab v-slot="{ selected }" as="template">
          <button :class="[selected ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50', 'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all']">
            <CheckCircleIcon class="w-4 h-4" />
            <span class="hidden sm:inline">รถพร้อมใช้งาน</span>
            <span class="sm:hidden">พร้อม</span>
            <span :class="selected ? 'bg-emerald-400/50' : 'bg-slate-100'" class="text-xs px-1.5 py-0.5 rounded-full">{{ stats.available }}</span>
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button :class="[selected ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50', 'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all']">
            <TruckIcon class="w-4 h-4" />
            <span class="hidden sm:inline">กำลังใช้งาน</span>
            <span class="sm:hidden">กำลังใช้</span>
            <span :class="selected ? 'bg-amber-400/50' : 'bg-slate-100'" class="text-xs px-1.5 py-0.5 rounded-full">{{ stats.checkedOut }}</span>
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button :class="[selected ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50', 'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all']">
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
              class="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition hover:border-emerald-400" />
            <button v-if="searchAvailable" @click="searchAvailable = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XCircleIcon class="w-4 h-4" />
            </button>
          </div>

          <div v-if="filteredAvailable.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="v in filteredAvailable" :key="v.id"
              class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <TruckIcon class="w-5 h-5 text-emerald-500" />
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">พร้อมใช้งาน</span>
              </div>
              <div class="mb-1">
                <div class="font-bold text-slate-800">{{ v.licensePlate }}</div>
                <div class="text-sm text-slate-500">{{ v.type }}</div>
              </div>
              <div class="text-xs text-slate-400 mb-3 space-y-0.5">
                <div v-if="v.currentMileage">ไมล์ปัจจุบัน: <span class="text-slate-600 font-medium">{{ num(v.currentMileage) }} กม.</span></div>
                <div v-if="v.chassisNumber" class="truncate">ตัวถัง: {{ v.chassisNumber }}</div>
              </div>
              <button @click="openCheckoutFor(v)"
                class="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5">
                <ArrowUpTrayIcon class="w-4 h-4" /> เบิกรถ
              </button>
            </div>
          </div>
          <div v-else class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 py-16 flex flex-col items-center gap-2 text-slate-400">
            <TruckIcon class="w-10 h-10 opacity-30" />
            <p class="text-sm font-medium">{{ searchAvailable ? 'ไม่พบรถที่ค้นหา' : 'ไม่มีรถที่พร้อมใช้งาน' }}</p>
            <p v-if="!searchAvailable" class="text-xs">รถทั้งหมดอาจกำลังใช้งานหรืออยู่ระหว่างซ่อมบำรุง</p>
          </div>
        </TabPanel>

        <!-- Tab 2: กำลังใช้งาน -->
        <TabPanel>
          <!-- Search bar -->
          <div class="relative mb-4">
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input v-model="searchActive" placeholder="ค้นหาทะเบียน, คนขับ, สถานที่..."
              class="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm transition hover:border-amber-400" />
            <button v-if="searchActive" @click="searchActive = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XCircleIcon class="w-4 h-4" />
            </button>
          </div>

          <div v-if="filteredActive.length" class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 overflow-hidden">
            <div class="divide-y divide-gray-100">
              <div v-for="b in filteredActive" :key="b.id" class="px-5 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <TruckIcon class="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div class="font-semibold text-sm text-slate-800">
                        {{ b.vehicle.licensePlate }}
                        <span class="text-slate-400 font-normal ml-1">{{ b.vehicle.type }}</span>
                        <span class="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">กำลังใช้งาน</span>
                      </div>
                      <div class="text-xs text-slate-400 mt-1 space-y-0.5">
                        <div><MapPinIcon class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ b.destination }}{{ b.purpose ? ` · ${b.purpose}` : '' }}</div>
                        <div>ผู้เบิก: <span class="text-slate-600">{{ b.requester.username }}</span> · คนขับ: <span class="text-slate-600">{{ b.driver.username }}</span></div>
                        <div>เบิกเมื่อ: {{ fmtDateTime(b.checkoutDate) }} · ไมล์ออก: {{ num(b.mileageOut) }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 self-start sm:self-center shrink-0">
                    <button @click="openReturn(b)"
                      class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5">
                      <ArrowDownTrayIcon class="w-3.5 h-3.5" /> คืนรถ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 py-16 flex flex-col items-center gap-2 text-slate-400">
            <CheckCircleIcon class="w-10 h-10 opacity-30" />
            <p class="text-sm font-medium">{{ searchActive ? 'ไม่พบรถที่ค้นหา' : 'ไม่มีรถที่กำลังใช้งาน' }}</p>
          </div>
        </TabPanel>

        <!-- Tab 3: ประวัติ -->
        <TabPanel>
          <div class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <ClockIcon class="w-5 h-5 text-blue-500" /> ประวัติการเบิก/คืน
              </h3>
              <div class="relative w-full sm:w-56">
                <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input v-model="searchText" placeholder="ค้นหาทะเบียน, คนขับ, สถานที่..."
                  class="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition hover:border-blue-400" />
              </div>
            </div>

            <!-- Mobile -->
            <div class="sm:hidden divide-y divide-gray-100" v-if="filteredHistory.length">
              <div v-for="b in filteredHistory" :key="b.id" class="px-4 py-3.5">
                <div class="flex justify-between items-start mb-1">
                  <span class="font-semibold text-sm text-slate-800">{{ b.vehicle.licensePlate }}</span>
                  <span :class="statusBadge(b.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ statusLabel(b.status) }}</span>
                </div>
                <div class="text-xs text-slate-400 mb-1">
                  {{ b.destination }} · {{ b.requester.username }} · {{ b.driver.username }} · {{ fmtDate(b.checkoutDate) }}
                </div>
                <div class="text-xs text-slate-500">
                  ไมล์ออก: {{ num(b.mileageOut) }}
                  <template v-if="b.mileageIn"> → เข้า: {{ num(b.mileageIn) }} (<span class="text-blue-600 font-semibold">{{ num(b.distance) }} กม.</span>)</template>
                </div>
              </div>
            </div>

            <!-- Desktop -->
            <div class="hidden sm:block overflow-x-auto" v-if="filteredHistory.length">
              <table class="w-full">
                <thead><tr class="bg-slate-50/50">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">วันที่เบิก</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ยานพาหนะ</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">สถานที่</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">คนขับ</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ไมล์ออก</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ไมล์เข้า</th>
                  <th class="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">ระยะทาง</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">สถานะ</th>
                  <th class="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase"></th>
                </tr></thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="b in filteredHistory" :key="b.id" class="hover:bg-slate-50/50 transition">
                    <td class="py-3 px-4 text-sm text-slate-500 whitespace-nowrap">{{ fmtDateTime(b.checkoutDate) }}</td>
                    <td class="py-3 px-4 text-sm font-semibold text-slate-700">{{ b.vehicle.licensePlate }}</td>
                    <td class="py-3 px-4 text-sm text-slate-600 max-w-32 truncate">{{ b.destination }}</td>
                    <td class="py-3 px-4 text-sm text-slate-600">{{ b.driver.username }}</td>
                    <td class="py-3 px-4 text-sm text-right text-slate-600">{{ num(b.mileageOut) }}</td>
                    <td class="py-3 px-4 text-sm text-right text-slate-600">{{ b.mileageIn ? num(b.mileageIn) : '-' }}</td>
                    <td class="py-3 px-4 text-sm text-right font-semibold" :class="b.distance ? 'text-blue-600' : 'text-slate-300'">{{ b.distance ? num(b.distance) + ' กม.' : '-' }}</td>
                    <td class="py-3 px-4 text-center">
                      <span :class="statusBadge(b.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ statusLabel(b.status) }}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button @click="viewDetail(b)" class="text-blue-600 hover:bg-blue-50 text-xs font-semibold px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1">
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
            <DialogPanel class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 flex items-center gap-2">
                  <ArrowUpTrayIcon class="w-5 h-5 text-emerald-500" /> เบิกรถ
                </DialogTitle>
                <button @click="showCheckout = false" class="p-1 hover:bg-slate-100 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4">
                <!-- Selected vehicle info -->
                <div v-if="selectedVehicle" class="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                  <div class="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <TruckIcon class="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div class="font-semibold text-emerald-800 text-sm">{{ selectedVehicle.licensePlate }}</div>
                    <div class="text-xs text-emerald-600">{{ selectedVehicle.type }}</div>
                  </div>
                </div>

                <div v-if="!selectedVehicle">
                  <label class="block text-xs font-semibold text-slate-500 mb-1">ยานพาหนะ <span class="text-red-500">*</span></label>
                  <AppSelect v-model="coForm.vehicleId" :options="availableVehicleOptions" placeholder="เลือกรถ" :icon="TruckIcon" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">สถานที่ปลายทาง <span class="text-red-500">*</span></label>
                  <input v-model="coForm.destination" placeholder="เช่น โรงพยาบาลศิริราช"
                    class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">วัตถุประสงค์</label>
                  <input v-model="coForm.purpose" placeholder="เช่น ส่งผู้ป่วย, ประชุม"
                    class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">คนทำเรื่องเบิก <span class="text-red-500">*</span></label>
                  <AppSelect v-model="coForm.requesterId" :options="requesterOptions" placeholder="เลือกผู้เบิก" :icon="UserIcon" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">คนขับ <span class="text-red-500">*</span></label>
                  <AppSelect v-model="coForm.driverId" :options="driverOptions" placeholder="เลือกคนขับ" :icon="UserIcon" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">เลขไมล์ตอนออก <span class="text-red-500">*</span></label>
                  <input v-model="coForm.mileageOut" type="number" placeholder="เลขไมล์"
                    class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">รูปเลขไมล์ (ตอนออก)</label>
                  <input type="file" accept="image/*" capture="environment" @change="coForm.photo = $event.target.files[0]"
                    class="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100" />
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
    <TransitionRoot :show="!!detailBooking" as="template">
      <Dialog @close="detailBooking = null" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200" leave-from="opacity-100 sm:scale-100" leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto" v-if="detailBooking">
              <div class="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 flex items-center gap-2">
                  <ClockIcon class="w-5 h-5 text-blue-500" /> รายละเอียดการใช้งาน
                </DialogTitle>
                <button @click="detailBooking = null" class="p-1 hover:bg-slate-100 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4">
                <!-- Info -->
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 mb-0.5">ยานพาหนะ</p>
                    <p class="font-semibold text-slate-800">{{ detailBooking.vehicle.licensePlate }}</p>
                    <p class="text-xs text-slate-400">{{ detailBooking.vehicle.type }}</p>
                  </div>
                  <div class="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 mb-0.5">สถานะ</p>
                    <span :class="statusBadge(detailBooking.status)" class="text-xs font-semibold px-2 py-0.5 rounded-full ring-1">{{ statusLabel(detailBooking.status) }}</span>
                  </div>
                  <div class="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 mb-0.5">ผู้ขับขี่</p>
                    <p class="font-semibold text-slate-800">{{ detailBooking.driver.username }}</p>
                  </div>
                  <div class="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p class="text-xs text-slate-400 mb-0.5">ปลายทาง</p>
                    <p class="font-semibold text-slate-800">{{ detailBooking.destination }}</p>
                  </div>
                </div>

                <!-- Mileage -->
                <div class="bg-blue-50 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="text-[10px] text-blue-400 uppercase font-semibold mb-1">ไมล์ออก</p>
                    <p class="font-bold text-blue-700 text-lg">{{ num(detailBooking.mileageOut) }}</p>
                    <p class="text-[10px] text-blue-400">กม.</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-emerald-400 uppercase font-semibold mb-1">ไมล์เข้า</p>
                    <p class="font-bold text-emerald-700 text-lg">{{ detailBooking.mileageIn ? num(detailBooking.mileageIn) : '-' }}</p>
                    <p class="text-[10px] text-emerald-400">กม.</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-400 uppercase font-semibold mb-1">ระยะทาง</p>
                    <p class="font-bold text-slate-800 text-lg">{{ detailBooking.distance ? num(detailBooking.distance) : '-' }}</p>
                    <p class="text-[10px] text-slate-400">กม.</p>
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

                <div v-if="detailBooking.returnNote" class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">
                  <span class="font-semibold">หมายเหตุ:</span> {{ detailBooking.returnNote }}
                </div>
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
            <DialogPanel class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <div class="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
                <DialogTitle class="font-bold text-slate-800 flex items-center gap-2">
                  <ArrowDownTrayIcon class="w-5 h-5 text-blue-500" /> คืนรถ
                </DialogTitle>
                <button @click="showReturn = false" class="p-1 hover:bg-slate-100 rounded-lg"><XMarkIcon class="w-5 h-5 text-slate-400" /></button>
              </div>
              <div class="p-5 space-y-4" v-if="returnBooking">
                <div class="bg-slate-50 rounded-xl p-3 text-sm">
                  <div class="font-semibold text-slate-800">{{ returnBooking.vehicle.licensePlate }} <span class="font-normal text-slate-500">{{ returnBooking.vehicle.type }}</span></div>
                  <div class="text-xs text-slate-400 mt-1">
                    <MapPinIcon class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ returnBooking.destination }} · คนขับ: {{ returnBooking.driver.username }} · ไมล์ออก: {{ num(returnBooking.mileageOut) }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">เลขไมล์ตอนกลับ <span class="text-red-500">*</span></label>
                  <input v-model="rtForm.mileageIn" type="number" placeholder="เลขไมล์"
                    class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400" />
                  <div v-if="rtForm.mileageIn && returnBooking" class="text-xs text-blue-600 mt-1 font-medium">
                    ระยะทาง: {{ num(Number(rtForm.mileageIn) - returnBooking.mileageOut) }} กม.
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">รูปเลขไมล์ (ตอนกลับ)</label>
                  <input type="file" accept="image/*" capture="environment" @change="rtForm.photo = $event.target.files[0]"
                    class="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">หมายเหตุ</label>
                  <textarea v-model="rtForm.note" rows="2" placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                    class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400"></textarea>
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
  XMarkIcon, XCircleIcon, EyeIcon, MapPinIcon, CheckCircleIcon, UserIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import AppEmpty from '../components/AppEmpty.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError } from '../stores/swal'

const bookings = ref([])
const availableVehicles = ref([])
const users = ref([])
const searchText = ref('')
const searchAvailable = ref('')
const searchActive = ref('')
const selectedTab = ref(0)
const selectedVehicle = ref(null)

const showCheckout = ref(false)
const showReturn = ref(false)
const returnBooking = ref(null)
const savingCO = ref(false)
const savingRT = ref(false)
const lightboxPhoto = ref(null)

function photoUrl(filename) {
  if (!filename) return null
  if (filename.startsWith('http')) return filename
  return api.defaults.baseURL.replace('/api', '') + '/uploads/' + filename
}

const coForm = ref({ vehicleId: '', requesterId: '', driverId: '', destination: '', purpose: '', mileageOut: '', photo: null })
const rtForm = ref({ mileageIn: '', photo: null, note: '' })

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
    b.driver.username.toLowerCase().includes(q) ||
    b.requester.username.toLowerCase().includes(q) ||
    b.destination.toLowerCase().includes(q)
  )
})

const stats = computed(() => ({
  available: availableVehicles.value.length,
  checkedOut: activeBookings.value.length,
  returned: bookings.value.filter(b => b.status === 'RETURNED' && isToday(b.returnDate)).length
}))

const availableVehicleOptions = computed(() =>
  availableVehicles.value.map(v => ({ value: v.id, label: `${v.licensePlate} - ${v.type}` }))
)
const driverOptions = computed(() =>
  users.value.filter(u => ['ADMIN', 'STAFF'].includes(u.role)).map(u => ({ value: u.id, label: `${u.username} (${u.role})` }))
)
const requesterOptions = computed(() =>
  users.value.map(u => ({ value: u.id, label: `${u.username} (${u.role})` }))
)

const filteredHistory = computed(() => {
  if (!searchText.value) return historyBookings.value
  const q = searchText.value.toLowerCase()
  return historyBookings.value.filter(b =>
    b.vehicle.licensePlate.toLowerCase().includes(q) ||
    b.destination.toLowerCase().includes(q) ||
    b.driver.username.toLowerCase().includes(q) ||
    b.requester.username.toLowerCase().includes(q)
  )
})

function isToday(d) { if (!d) return false; return new Date(d).toDateString() === new Date().toDateString() }
function fmtDate(d) { return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) }
function fmtDateTime(d) { return new Date(d).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
function num(n) { return n != null ? Number(n).toLocaleString() : '-' }
function statusLabel(s) { return { CHECKED_OUT: 'กำลังใช้งาน', RETURNED: 'คืนแล้ว', CANCELLED: 'ยกเลิก' }[s] ?? s }
function statusBadge(s) {
  return {
    CHECKED_OUT: 'bg-amber-100 text-amber-700 ring-amber-200',
    RETURNED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-500 ring-slate-200'
  }[s] ?? 'bg-slate-100 text-slate-500 ring-slate-200'
}

async function loadData() {
  const [bRes, avRes, uRes] = await Promise.all([
    api.get('/bookings'),
    api.get('/bookings/available/vehicles'),
    api.get('/users')
  ])
  bookings.value = bRes.data.bookings || bRes.data
  availableVehicles.value = avRes.data
  users.value = uRes.data
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

const detailBooking = ref(null)
function viewDetail(b) { detailBooking.value = b }

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
