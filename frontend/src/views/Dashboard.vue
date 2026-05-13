<template>
  <div class="space-y-4">

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
      <div class="relative rounded-2xl p-3 sm:p-4 overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 shadow-sm shadow-blue-200 dark:shadow-black/20 hover:-translate-y-0.5 transition-transform">
        <div class="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full"></div>
        <div class="relative z-10">
          <div class="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center mb-2">
            <TruckIcon class="w-4 h-4 text-white" />
          </div>
          <div class="text-2xl font-bold text-white">{{ stats.total }}</div>
          <div class="text-[11px] text-white/75 mt-0.5 leading-tight">ทั้งหมด</div>
        </div>
      </div>

      <div class="relative rounded-2xl p-3 sm:p-4 overflow-hidden bg-linear-to-br from-emerald-500 to-teal-600 dark:from-emerald-900 dark:to-teal-900 shadow-sm shadow-emerald-200 dark:shadow-black/20 hover:-translate-y-0.5 transition-transform">
        <div class="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full"></div>
        <div class="relative z-10">
          <div class="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center mb-2">
            <CheckCircleIcon class="w-4 h-4 text-white" />
          </div>
          <div class="text-2xl font-bold text-white">{{ stats.available }}</div>
          <div class="text-[11px] text-white/75 mt-0.5 leading-tight">พร้อมใช้งาน</div>
        </div>
      </div>

      <div class="relative rounded-2xl p-3 sm:p-4 overflow-hidden bg-linear-to-br from-amber-400 to-orange-500 dark:from-amber-900 dark:to-orange-900 shadow-sm shadow-amber-200 dark:shadow-black/20 hover:-translate-y-0.5 transition-transform">
        <div class="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full"></div>
        <div class="relative z-10">
          <div class="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center mb-2">
            <ArrowsRightLeftIcon class="w-4 h-4 text-white" />
          </div>
          <div class="text-2xl font-bold text-white">{{ stats.inUse }}</div>
          <div class="text-[11px] text-white/75 mt-0.5 leading-tight">กำลังใช้งาน</div>
        </div>
      </div>

      <div class="relative rounded-2xl p-3 sm:p-4 overflow-hidden bg-linear-to-br from-orange-400 to-amber-500 dark:from-orange-900 dark:to-amber-900 shadow-sm shadow-orange-200 dark:shadow-black/20 hover:-translate-y-0.5 transition-transform">
        <div class="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full"></div>
        <div class="relative z-10">
          <div class="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center mb-2">
            <WrenchScrewdriverIcon class="w-4 h-4 text-white" />
          </div>
          <div class="text-2xl font-bold text-white">{{ stats.maintenance }}</div>
          <div class="text-[11px] text-white/75 mt-0.5 leading-tight">ซ่อมบำรุง</div>
        </div>
      </div>

      <div class="relative rounded-2xl p-3 sm:p-4 overflow-hidden bg-linear-to-br from-slate-400 to-slate-600 dark:from-slate-700 dark:to-slate-800 shadow-sm shadow-slate-200 dark:shadow-black/20 hover:-translate-y-0.5 transition-transform">
        <div class="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full"></div>
        <div class="relative z-10">
          <div class="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center mb-2">
            <MinusCircleIcon class="w-4 h-4 text-white" />
          </div>
          <div class="text-2xl font-bold text-white">{{ stats.inactive }}</div>
          <div class="text-[11px] text-white/75 mt-0.5 leading-tight">ไม่ใช้งาน</div>
        </div>
      </div>

      <div class="relative rounded-2xl p-3 sm:p-4 overflow-hidden bg-linear-to-br from-rose-500 to-red-600 dark:from-rose-900 dark:to-red-900 shadow-sm shadow-rose-200 dark:shadow-black/20 hover:-translate-y-0.5 transition-transform">
        <div class="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full"></div>
        <div class="relative z-10">
          <div class="w-8 h-8 bg-white/25 rounded-xl flex items-center justify-center mb-2">
            <ExclamationTriangleIcon class="w-4 h-4 text-white" />
          </div>
          <div class="text-2xl font-bold text-white">{{ stats.pendingRepairs }}</div>
          <div class="text-[11px] text-white/75 mt-0.5 leading-tight">แจ้งซ่อมค้าง</div>
        </div>
      </div>
    </div>

    <!-- Expiry Alert Bar -->
    <div v-if="expiryAlerts.length" @click="showAlertModal = true"
      class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
      <div class="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
        <BellAlertIcon class="w-4 h-4 text-white" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-amber-800 dark:text-amber-300">พบเอกสารหมดอายุหรือใกล้หมด {{ expiryAlerts.length }} รายการ <span class="text-xs font-normal text-amber-600 dark:text-amber-400">(เตือนล่วงหน้า 30 วัน)</span></p>
        <p class="text-xs text-amber-600 dark:text-amber-400 truncate">{{ expiryAlerts.slice(0, 2).map(a => a.vehicleName + ' – ' + a.label).join(' · ') }}</p>
      </div>
      <ChevronRightIcon class="w-4 h-4 text-amber-500 shrink-0" />
    </div>

    <!-- Quick Navigation -->
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
      <router-link v-for="s in shortcuts" :key="s.to" :to="s.to"
        class="group flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-[0.96] hover:-translate-y-0.5"
        :class="s.cls">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="s.iconBg">
          <component :is="s.icon" class="w-5 h-5" :class="s.iconColor" />
        </div>
        <span class="text-xs font-semibold text-center leading-tight" :class="s.textColor">{{ s.label }}</span>
      </router-link>
    </div>

    <!-- Vehicle Status -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
          <span class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <TruckIcon class="w-3.5 h-3.5 text-blue-600" />
          </span>
          สถานะยานพาหนะ
          <span class="text-xs text-slate-400 dark:text-slate-500 font-normal">{{ allVehicles.length }} คัน</span>
        </h3>
        <router-link to="/vehicles" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">จัดการ →</router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-gray-100 dark:divide-slate-700">
        <router-link v-for="v in pagedVehicles" :key="v.id" to="/vehicles"
          class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
            <img v-if="v.photo" :src="`http://${hostname}:8099/uploads/${v.photo}`" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <TruckIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ v.licensePlate }}</div>
            <div class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ v.type }}</div>
            <div class="flex flex-wrap gap-1 mt-0.5">
              <span :class="vStatusBadge(v.status)" class="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                {{ vStatusLabel(v.status) }}
              </span>
              <span v-if="pendingRepairVehicleIds.has(v.id)" class="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                รอซ่อม
              </span>
            </div>
          </div>
        </router-link>
      </div>
      <div v-if="!allVehicles.length" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">ยังไม่มีข้อมูลยานพาหนะ</div>
      <div v-if="vTotalPages > 1" class="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ allVehicles.length }} คัน · หน้า {{ vPage }}/{{ vTotalPages }}</span>
        <div class="flex items-center gap-1">
          <button @click="vPage--" :disabled="vPage <= 1" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
            <ChevronLeftIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button @click="vPage++" :disabled="vPage >= vTotalPages" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
            <ChevronRightIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Active Bookings -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <span class="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
              <ArrowsRightLeftIcon class="w-3.5 h-3.5 text-amber-600" />
            </span>
            รถที่กำลังใช้งาน
            <span v-if="bk.total" class="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">{{ bk.total }}</span>
          </h3>
          <router-link to="/bookings" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">ดูทั้งหมด →</router-link>
        </div>
        <div class="flex-1 relative">
          <div v-if="bk.loading" class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 z-10">
            <div class="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-if="bk.items.length" class="divide-y divide-gray-50 dark:divide-slate-700">
            <div v-for="b in bk.items" :key="b.id" class="flex items-center gap-3 px-4 py-3">
              <div class="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                <img v-if="b.vehicle.photo" :src="`http://${hostname}:8099/uploads/${b.vehicle.photo}`" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center"><TruckIcon class="w-4 h-4 text-slate-400 dark:text-slate-500" /></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ b.vehicle.licensePlate }}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ b.driver.displayName || b.driver.username }} · {{ b.destination }}</div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-[10px] text-slate-400 dark:text-slate-500">{{ fmtD(b.checkoutDate) }}</div>
                <div class="text-xs font-semibold text-amber-600">{{ num(b.mileageOut) }} กม.</div>
              </div>
            </div>
          </div>
          <div v-else-if="!bk.loading" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">ไม่มีรถที่กำลังใช้งาน</div>
        </div>
        <div v-if="totalPages(bk) > 1" class="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ bk.total }} รายการ · หน้า {{ bk.page }}/{{ totalPages(bk) }}</span>
          <div class="flex items-center gap-1">
            <button @click="loadBookings(bk.page - 1)" :disabled="bk.page <= 1 || bk.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronLeftIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button @click="loadBookings(bk.page + 1)" :disabled="bk.page >= totalPages(bk) || bk.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronRightIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Inspections -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <span class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentCheckIcon class="w-3.5 h-3.5 text-blue-600" />
            </span>
            การตรวจเช็คล่าสุด
            <span v-if="ins.total" class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">{{ ins.total }}</span>
          </h3>
          <router-link to="/reports" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">ดูทั้งหมด →</router-link>
        </div>
        <div class="flex-1 relative">
          <div v-if="ins.loading" class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 z-10">
            <div class="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-if="ins.items.length" class="divide-y divide-gray-50 dark:divide-slate-700">
            <div v-for="item in ins.items" :key="item.id" class="flex items-center gap-3 px-4 py-3">
              <div :class="hasAbnormal(item) ? 'bg-red-100' : 'bg-emerald-100'" class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <component :is="hasAbnormal(item) ? ExclamationTriangleIcon : CheckCircleIcon"
                  :class="hasAbnormal(item) ? 'text-red-500' : 'text-emerald-600'" class="w-4.5 h-4.5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ item.vehicle.licensePlate }}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500">{{ item.user.displayName || item.user.username }} · {{ fmtD(item.inspectionDate) }}</div>
              </div>
              <span :class="hasAbnormal(item) ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'"
                class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                {{ hasAbnormal(item) ? `ผิดปกติ ${countAbnormal(item)}` : 'ปกติ' }}
              </span>
            </div>
          </div>
          <div v-else-if="!ins.loading" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">ยังไม่มีข้อมูลเดือนนี้</div>
        </div>
        <div v-if="totalPages(ins) > 1" class="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ ins.total }} รายการ · หน้า {{ ins.page }}/{{ totalPages(ins) }}</span>
          <div class="flex items-center gap-1">
            <button @click="loadInspections(ins.page - 1)" :disabled="ins.page <= 1 || ins.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronLeftIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button @click="loadInspections(ins.page + 1)" :disabled="ins.page >= totalPages(ins) || ins.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronRightIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pending Repairs -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <span class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon class="w-3.5 h-3.5 text-orange-600" />
            </span>
            แจ้งซ่อมล่าสุด
            <span v-if="rp.total" class="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold px-2 py-0.5 rounded-full">{{ rp.total }}</span>
          </h3>
          <router-link to="/repairs" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">ดูทั้งหมด →</router-link>
        </div>
        <div class="flex-1 relative">
          <div v-if="rp.loading" class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 z-10">
            <div class="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-if="rp.items.length" class="divide-y divide-gray-50 dark:divide-slate-700">
            <div v-for="r in rp.items" :key="r.id" class="flex items-center gap-3 px-4 py-3">
              <div class="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <WrenchScrewdriverIcon class="w-4 h-4 text-orange-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ r.title }}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ r.vehicle.licensePlate }} · {{ r.user.displayName || r.user.username }}</div>
              </div>
              <div class="text-right shrink-0">
                <span :class="rpBadge(r.status)" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ rpLabel(r.status) }}</span>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{{ fmtD(r.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="!rp.loading" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">ยังไม่มีข้อมูลการแจ้งซ่อม</div>
        </div>
        <div v-if="totalPages(rp) > 1" class="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ rp.total }} รายการ · หน้า {{ rp.page }}/{{ totalPages(rp) }}</span>
          <div class="flex items-center gap-1">
            <button @click="loadRepairs(rp.page - 1)" :disabled="rp.page <= 1 || rp.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronLeftIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button @click="loadRepairs(rp.page + 1)" :disabled="rp.page >= totalPages(rp) || rp.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronRightIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Fuel Logs -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <span class="w-6 h-6 bg-cyan-100 rounded-lg flex items-center justify-center">
              <BeakerIcon class="w-3.5 h-3.5 text-cyan-600" />
            </span>
            เติมน้ำมันล่าสุด
            <span v-if="fu.total" class="text-xs bg-cyan-100 text-cyan-700 font-bold px-2 py-0.5 rounded-full">{{ fu.total }}</span>
          </h3>
          <router-link to="/report-fuels" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">ดูทั้งหมด →</router-link>
        </div>
        <div class="flex-1 relative">
          <div v-if="fu.loading" class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 z-10">
            <div class="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-if="fu.items.length" class="divide-y divide-gray-50 dark:divide-slate-700">
            <div v-for="f in fu.items" :key="f.id" class="flex items-center gap-3 px-4 py-3">
              <div class="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                <BeakerIcon class="w-4 h-4 text-cyan-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ f.vehicle.licensePlate }}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ f.user.displayName || f.user.username }} · {{ fmtD(f.createdAt) }}</div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-xs font-bold text-cyan-600">{{ numDec(f.liters) }} ล.</div>
                <div class="text-xs text-emerald-600 font-semibold">{{ num(f.amount) }} บ.</div>
              </div>
            </div>
          </div>
          <div v-else-if="!fu.loading" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">ยังไม่มีข้อมูลเดือนนี้</div>
        </div>
        <div v-if="totalPages(fu) > 1" class="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ fu.total }} รายการ · หน้า {{ fu.page }}/{{ totalPages(fu) }}</span>
          <div class="flex items-center gap-1">
            <button @click="loadFuels(fu.page - 1)" :disabled="fu.page <= 1 || fu.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronLeftIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <button @click="loadFuels(fu.page + 1)" :disabled="fu.page >= totalPages(fu) || fu.loading"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition">
              <ChevronRightIcon class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Expiry Alert Modal -->
    <TransitionRoot :show="showAlertModal" as="template">
      <Dialog @close="dismissModal" class="relative z-50">
        <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <TransitionChild as="template" enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-full sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 sm:scale-100"
            leave-to="opacity-0 translate-y-full sm:scale-95">
            <DialogPanel class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col">
              <div class="flex items-center justify-between px-5 py-4 border-b dark:border-slate-700 shrink-0">
                <DialogTitle class="flex items-center gap-2.5 font-bold text-slate-800 dark:text-white">
                  <div class="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                    <BellAlertIcon class="w-4 h-4 text-amber-600" />
                  </div>
                  แจ้งเตือนเอกสารยานพาหนะ
                  <span class="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{{ expiryAlerts.length }}</span>
                </DialogTitle>
                <button @click="dismissModal" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                  <XMarkIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              <div class="px-5 pt-3 pb-1 shrink-0">
                <p class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <BellAlertIcon class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ระบบแจ้งเตือนล่วงหน้า <span class="font-semibold text-amber-600">30 วัน</span> ก่อนเอกสารหมดอายุ
                </p>
              </div>
              <div class="overflow-y-auto flex-1 px-5 py-3 space-y-2">
                <div v-for="a in expiryAlerts" :key="a.key"
                  :class="a.urgent ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20' : 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20'"
                  class="flex items-center gap-3 border rounded-xl px-4 py-3">
                  <div :class="a.urgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'"
                    class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <ExclamationTriangleIcon class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ a.vehicleName }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ a.label }}</p>
                  </div>
                  <span :class="a.urgent ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'"
                    class="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                    {{ a.urgent ? 'หมดแล้ว!' : `อีก ${a.daysLeft} วัน` }}
                  </span>
                </div>
              </div>
              <div class="px-5 py-4 border-t dark:border-slate-700 flex gap-3 shrink-0">
                <button @click="dismissToday"
                  class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm transition">
                  ไม่แสดงอีกวันนี้
                </button>
                <button @click="dismissModal"
                  class="flex-1 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-sm transition shadow-sm">
                  รับทราบ
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
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  TruckIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon, CheckCircleIcon,
  ArrowsRightLeftIcon, WrenchScrewdriverIcon, BeakerIcon, BellAlertIcon,
  XMarkIcon, ChevronRightIcon, ChevronLeftIcon, DocumentTextIcon,
  ClipboardDocumentListIcon, MinusCircleIcon
} from '@heroicons/vue/24/outline'
import api from '../stores/api'
import { fmtDateTh } from '../stores/date'

const hostname = window.location.hostname
const PER_PAGE = 5

// ─── State ───────────────────────────────────────────────────────────────────
const stats        = ref({ total: 0, available: 0, inUse: 0, maintenance: 0, inactive: 0, pendingRepairs: 0 })
const allVehicles  = ref([])
const pendingRepairVehicleIds = ref(new Set())
const showAlertModal = ref(false)
const expiryAlerts = ref([])

// ─── Vehicle pagination ───────────────────────────────────────────────────────
const V_PER_PAGE  = 6
const vPage       = ref(1)
const vTotalPages = computed(() => Math.max(1, Math.ceil(allVehicles.value.length / V_PER_PAGE)))
const pagedVehicles = computed(() => allVehicles.value.slice((vPage.value - 1) * V_PER_PAGE, vPage.value * V_PER_PAGE))

const bk  = ref({ items: [], page: 1, total: 0, loading: false })
const ins = ref({ items: [], page: 1, total: 0, loading: false })
const rp  = ref({ items: [], page: 1, total: 0, loading: false })
const fu  = ref({ items: [], page: 1, total: 0, loading: false })

function totalPages(panel) { return Math.max(1, Math.ceil(panel.total / PER_PAGE)) }

// ─── Quick nav ───────────────────────────────────────────────────────────────
const shortcuts = [
  { to: '/inspection',  label: 'บันทึกการตรวจ',    icon: ClipboardDocumentCheckIcon, cls: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-600',     iconBg: 'bg-blue-100 dark:bg-blue-900/40',    iconColor: 'text-blue-600 dark:text-blue-400',    textColor: 'text-blue-700 dark:text-blue-300' },
  { to: '/bookings',    label: 'เบิก/คืนรถ',       icon: ArrowsRightLeftIcon,        cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-600',   iconBg: 'bg-amber-100 dark:bg-amber-900/40',   iconColor: 'text-amber-600 dark:text-amber-400',   textColor: 'text-amber-700 dark:text-amber-300' },
  { to: '/fuels',       label: 'เติมน้ำมัน',        icon: BeakerIcon,                 cls: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/50 hover:border-cyan-300 dark:hover:border-cyan-600',       iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',    iconColor: 'text-cyan-600 dark:text-cyan-400',    textColor: 'text-cyan-700 dark:text-cyan-300' },
  { to: '/repairs',     label: 'แจ้งซ่อม',          icon: WrenchScrewdriverIcon,      cls: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-600', iconBg: 'bg-orange-100 dark:bg-orange-900/40',  iconColor: 'text-orange-600 dark:text-orange-400',  textColor: 'text-orange-700 dark:text-orange-300' },
  { to: '/renewals',    label: 'ต่อ พ.ร.บ./ประกัน', icon: DocumentTextIcon,           cls: 'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/50 hover:border-teal-300 dark:hover:border-teal-600',       iconBg: 'bg-teal-100 dark:bg-teal-900/40',    iconColor: 'text-teal-600 dark:text-teal-400',    textColor: 'text-teal-700 dark:text-teal-300' },
  { to: '/accidents',   label: 'รายงานอุบัติเหตุ',  icon: ExclamationTriangleIcon,     cls: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-600',       iconBg: 'bg-rose-100 dark:bg-rose-900/40',    iconColor: 'text-rose-600 dark:text-rose-400',    textColor: 'text-rose-700 dark:text-rose-300' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtD(d)   { return fmtDateTh(d) }
function num(n)    { return n != null ? Number(n).toLocaleString() : '-' }
function numDec(n) { return n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0.0' }
function hasAbnormal(item)   { return item.details.some(d => d.status === 'ABNORMAL') }
function countAbnormal(item) { return item.details.filter(d => d.status === 'ABNORMAL').length }
function rpLabel(s) { return { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ', COMPLETED: 'เสร็จสิ้น' }[s] ?? s }
function rpBadge(s) { return { PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', APPROVED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', COMPLETED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' }[s] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' }
function vStatusLabel(s) { return { ACTIVE: 'พร้อมใช้', IN_USE: 'กำลังใช้', MAINTENANCE: 'ซ่อมบำรุง', INACTIVE: 'ไม่ใช้งาน' }[s] ?? s }
function vStatusBadge(s) { return { ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', IN_USE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', MAINTENANCE: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', INACTIVE: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' }[s] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500' }

// ─── Alert dismiss ───────────────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function dismissModal() {
  // รับทราบ — ไม่แสดงอีกใน login session นี้
  sessionStorage.setItem('vehicle_alert_hidden', '1')
  showAlertModal.value = false
}

function dismissToday() {
  // ไม่แสดงอีกวันนี้ — คงอยู่ข้าม login แต่รีเซ็ตทุกวัน
  localStorage.setItem('vehicle_alert_hidden_date', todayStr())
  sessionStorage.setItem('vehicle_alert_hidden', '1')
  showAlertModal.value = false
}

// ─── Per-panel fetch ─────────────────────────────────────────────────────────
async function loadBookings(page = 1) {
  bk.value.loading = true
  try {
    const res = await api.get('/bookings', { params: { status: 'CHECKED_OUT', page, limit: PER_PAGE } })
    bk.value.items = res.data.bookings || res.data || []
    bk.value.total = res.data.total || 0
    bk.value.page  = page
  } finally { bk.value.loading = false }
}

async function loadInspections(page = 1) {
  const now = new Date()
  ins.value.loading = true
  try {
    const res = await api.get('/inspections', { params: { month: now.getMonth() + 1, year: now.getFullYear(), page, limit: PER_PAGE } })
    ins.value.items = res.data.inspections || (Array.isArray(res.data) ? res.data : [])
    ins.value.total = res.data.total || ins.value.items.length
    ins.value.page  = page
  } finally { ins.value.loading = false }
}

async function loadRepairs(page = 1) {
  rp.value.loading = true
  try {
    const res = await api.get('/repairs', { params: { page, limit: PER_PAGE } })
    rp.value.items = res.data.requests || res.data || []
    rp.value.total = res.data.total || 0
    rp.value.page  = page
  } finally { rp.value.loading = false }
}

async function loadFuels(page = 1) {
  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  fu.value.loading = true
  try {
    const res = await api.get('/fuels', { params: { startDate: firstOfMonth, endDate: today, page, limit: PER_PAGE } })
    fu.value.items = res.data.logs || res.data || []
    fu.value.total = res.data.total || 0
    fu.value.page  = page
  } finally { fu.value.loading = false }
}

// ─── Initial load ────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const vehiclesRes = await api.get('/vehicles')
    const vehicles = vehiclesRes.data
    allVehicles.value     = vehicles
    stats.value.total       = vehicles.length
    stats.value.available   = vehicles.filter(v => v.status === 'ACTIVE').length
    stats.value.inUse       = vehicles.filter(v => v.status === 'IN_USE').length
    stats.value.maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length
    stats.value.inactive    = vehicles.filter(v => v.status === 'INACTIVE').length

    const [,,rpAllRes] = await Promise.all([
      loadBookings(), loadInspections(),
      api.get('/repairs', { params: { status: 'PENDING', limit: 500 } }),
      loadRepairs(), loadFuels()
    ])
    const rpAll = rpAllRes.data.requests || rpAllRes.data || []
    pendingRepairVehicleIds.value = new Set(rpAll.map(r => r.vehicleId))

    stats.value.pendingRepairs = rpAll.filter(r => r.status === 'PENDING').length

    // Expiry alerts
    const alerts = []
    const warnDate = new Date(); warnDate.setDate(warnDate.getDate() + 30)
    for (const v of vehicles) {
      const name = `${v.type} (${v.licensePlate})`
      const checks = [
        { key: `${v.id}-prb`, field: v.prbExpiry,     label: 'พ.ร.บ. หมดอายุ' },
        { key: `${v.id}-ins`, field: v.insExpiry,      label: 'ประกันภัย หมดอายุ' },
        { key: `${v.id}-tax`, field: v.taxRenewalDate, label: 'ต่อภาษีรถ ครบกำหนด' },
      ]
      for (const c of checks) {
        if (!c.field) continue
        const d = new Date(c.field); d.setHours(0,0,0,0)
        const todayD = new Date(); todayD.setHours(0,0,0,0)
        if (d <= warnDate) {
          const daysLeft = Math.ceil((d - todayD) / 86400000)
          alerts.push({ key: c.key, vehicleName: name, label: c.label, daysLeft, urgent: daysLeft <= 0 })
        }
      }
    }
    expiryAlerts.value = alerts.sort((a, b) => a.daysLeft - b.daysLeft)
    const hiddenToday = localStorage.getItem('vehicle_alert_hidden_date') === todayStr()
    if (alerts.length && !sessionStorage.getItem('vehicle_alert_hidden') && !hiddenToday) {
      showAlertModal.value = true
    }
    if (hiddenToday) sessionStorage.setItem('vehicle_alert_hidden', '1')
  } catch (err) { console.error(err) }
})
</script>
