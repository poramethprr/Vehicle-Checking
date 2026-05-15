<template>
  <div class="min-h-screen">
    <!-- Navbar -->
    <nav v-if="auth.user" :class="isMaidSection ? 'bg-linear-to-r from-purple-400 via-fuchsia-300 to-pink-300 dark:from-purple-950 dark:via-fuchsia-950 dark:to-slate-900' : 'bg-linear-to-r from-sky-300 via-teal-300 to-emerald-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'" class="sticky top-0 z-50 shadow-lg shadow-teal-900/15 dark:shadow-black/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">

          <!-- Logo -->
          <router-link :to="isMaidSection ? '/maid' : '/'" class="flex items-center gap-2 shrink-0" @click="closeMobile">
            <div class="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-900/30">
              <img src="./assets/logo-icon.png" alt="SEMed" class="w-full h-full object-cover" />
            </div>
            <span :class="isMaidSection ? 'text-purple-900 dark:text-purple-300' : 'text-teal-900 dark:text-teal-300'" class="font-bold text-sm hidden sm:block">{{ isMaidSection ? 'SEMed Maid' : 'SEMed Vehicle' }}</span>
          </router-link>

          <!-- Section toggle (Admin only) -->
          <div v-if="auth.isAdmin" class="flex rounded-lg overflow-hidden border border-white/40 dark:border-white/20 text-xs shrink-0">
            <button @click="setSection('vehicle')" :class="!isMaidSection ? 'bg-white/40 dark:bg-white/20 font-bold' : 'hover:bg-white/20 dark:hover:bg-white/10'" class="px-2.5 py-1.5 transition flex items-center gap-1 text-teal-900 dark:text-white">
              🚗 ยานพาหนะ
            </button>
            <div class="w-px bg-white/30"></div>
            <button @click="setSection('maid')" :class="isMaidSection ? 'bg-white/40 dark:bg-white/20 font-bold' : 'hover:bg-white/20 dark:hover:bg-white/10'" class="px-2.5 py-1.5 transition flex items-center gap-1 text-teal-900 dark:text-white">
              🧹 แม่บ้าน
            </button>
          </div>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-0.5">

            <!-- ===== MAID SECTION NAV ===== -->
            <template v-if="isMaidSection">
              <router-link to="/maid"
                class="flex items-center gap-1.5 text-purple-900/75 dark:text-purple-300/80 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-white/30 dark:hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                active-class="text-purple-900! dark:text-purple-200! bg-white/40! dark:bg-white/15! font-semibold!" exact>
                <HomeIcon class="w-4 h-4" />
                หน้าหลัก
              </router-link>

              <Popover class="relative" v-slot="{ open, close }">
                <PopoverButton :class="[isGroupActive(['/maid/logs', '/maid/issues', '/maid/scan']) ? 'text-purple-900 dark:text-purple-200 bg-white/40 dark:bg-white/15 font-semibold' : 'text-purple-900/75 dark:text-purple-300/80 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-white/30 dark:hover:bg-white/10', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                  <ClipboardDocumentCheckIcon class="w-4 h-4" />
                  ปฏิบัติงาน
                  <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
                </PopoverButton>
                <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <PopoverPanel class="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                    <div class="px-3 pb-1.5 mb-1 border-b border-gray-200 dark:border-slate-700">
                      <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ปฏิบัติงาน</span>
                    </div>
                    <router-link to="/maid/scan" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <QrCodeIcon class="w-4 h-4" />
                      สแกน QR Code
                    </router-link>
                    <router-link to="/maid/logs" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <ClipboardDocumentCheckIcon class="w-4 h-4" />
                      ประวัติการทำความสะอาด
                    </router-link>
                    <router-link to="/maid/issues" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <ExclamationTriangleIcon class="w-4 h-4" />
                      แจ้งปัญหา
                    </router-link>
                  </PopoverPanel>
                </transition>
              </Popover>

              <Popover class="relative" v-slot="{ open, close }">
                <PopoverButton :class="[isGroupActive(['/maid/reports', '/maid/report-logs', '/maid/report-issues']) ? 'text-purple-900 dark:text-purple-200 bg-white/40 dark:bg-white/15 font-semibold' : 'text-purple-900/75 dark:text-purple-300/80 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-white/30 dark:hover:bg-white/10', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                  <ChartBarIcon class="w-4 h-4" />
                  รายงาน
                  <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
                </PopoverButton>
                <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <PopoverPanel class="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                    <div class="px-3 pb-1.5 mb-1 border-b border-gray-200 dark:border-slate-700">
                      <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">รายงาน & ข้อมูล</span>
                    </div>
                    <router-link to="/maid/reports" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <ChartBarIcon class="w-4 h-4" />
                      สรุปรายพื้นที่
                    </router-link>
                    <router-link to="/maid/report-logs" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <ClipboardDocumentListIcon class="w-4 h-4" />
                      บันทึกทำความสะอาด
                    </router-link>
                    <router-link to="/maid/report-issues" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <ExclamationTriangleIcon class="w-4 h-4" />
                      รายงานปัญหา
                    </router-link>
                  </PopoverPanel>
                </transition>
              </Popover>

              <Popover v-if="auth.isAdmin" class="relative" v-slot="{ open, close }">
                <PopoverButton :class="[isGroupActive(['/maid/areas', '/users', '/logs']) ? 'text-purple-900 dark:text-purple-200 bg-white/40 dark:bg-white/15 font-semibold' : 'text-purple-900/75 dark:text-purple-300/80 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-white/30 dark:hover:bg-white/10', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                  <Cog6ToothIcon class="w-4 h-4" />
                  จัดการ
                  <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
                </PopoverButton>
                <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <PopoverPanel class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                    <div class="px-3 pb-1.5 mb-1 border-b border-gray-200 dark:border-slate-700">
                      <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">จัดการระบบแม่บ้าน</span>
                    </div>
                    <router-link to="/maid/areas" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <MapPinIcon class="w-4 h-4" />
                      จัดการพื้นที่
                    </router-link>
                    <router-link to="/users" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <UsersIcon class="w-4 h-4" />
                      ผู้ใช้งาน
                    </router-link>
                    <router-link to="/logs" @click="close" class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg" active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                      <ClockIcon class="w-4 h-4" />
                      บันทึก Activity
                    </router-link>
                  </PopoverPanel>
                </transition>
              </Popover>
            </template>

            <!-- ===== VEHICLE SECTION NAV ===== -->
            <template v-else>
            <!-- หน้าหลัก -->
            <router-link to="/"
              class="flex items-center gap-1.5 text-teal-900/75 dark:text-teal-300/80 hover:text-teal-900 dark:hover:text-teal-200 hover:bg-white/30 dark:hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              active-class="text-teal-900! dark:text-teal-200! bg-white/40! dark:bg-white/15! font-semibold!" exact>
              <HomeIcon class="w-4 h-4" />
              หน้าหลัก
            </router-link>

            <!-- ปฏิบัติงาน -->
            <Popover class="relative" v-slot="{ open, close }">
              <PopoverButton
                :class="[isGroupActive(['/inspection', '/bookings', '/renewals', '/repairs', '/fuels', '/accidents']) ? 'text-teal-900 dark:text-teal-200 bg-white/40 dark:bg-white/15 font-semibold' : 'text-teal-900/75 dark:text-teal-300/80 hover:text-teal-900 dark:hover:text-teal-200 hover:bg-white/30 dark:hover:bg-white/10', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                <ClipboardDocumentCheckIcon class="w-4 h-4" />
                ปฏิบัติงาน
                <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                  <div class="px-3 pb-1.5 mb-1 border-b border-gray-200 dark:border-slate-700">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ปฏิบัติงาน</span>
                  </div>
                  <router-link to="/inspection" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ClipboardDocumentCheckIcon class="w-4 h-4" />
                    บันทึกการตรวจ
                  </router-link>
                  <router-link to="/bookings" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ArrowsRightLeftIcon class="w-4 h-4" />
                    เบิก/คืนรถ
                  </router-link>
                  <router-link to="/renewals" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <DocumentTextIcon class="w-4 h-4" />
                    ต่อ พ.ร.บ./ภาษี/ประกัน
                  </router-link>
                  <router-link to="/repairs" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <WrenchScrewdriverIcon class="w-4 h-4" />
                    แจ้งซ่อม
                  </router-link>
                  <router-link to="/fuels" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <FireIcon class="w-4 h-4" />
                    เติมน้ำมัน
                  </router-link>
                  <router-link to="/accidents" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ExclamationTriangleIcon class="w-4 h-4" />
                    รายงานอุบัติเหตุ
                  </router-link>
                </PopoverPanel>
              </transition>
            </Popover>

            <!-- รายงาน -->
            <Popover class="relative" v-slot="{ open, close }">
              <PopoverButton
                :class="[isGroupActive(['/reports', '/report-bookings', '/report-fuels', '/report-repairs', '/report-docs', '/export']) ? 'text-teal-900 dark:text-teal-200 bg-white/40 dark:bg-white/15 font-semibold' : 'text-teal-900/75 dark:text-teal-300/80 hover:text-teal-900 dark:hover:text-teal-200 hover:bg-white/30 dark:hover:bg-white/10', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                <ChartBarIcon class="w-4 h-4" />
                รายงาน
                <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                  <div class="px-3 pb-1.5 mb-1 border-b border-gray-200 dark:border-slate-700">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">รายงาน & ข้อมูล</span>
                  </div>
                  <router-link to="/reports" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ClipboardDocumentListIcon class="w-4 h-4" />
                    การตรวจเช็ค
                  </router-link>
                  <router-link to="/report-bookings" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ArrowsRightLeftIcon class="w-4 h-4" />
                    การเบิก/คืนรถ
                  </router-link>
                  <router-link to="/report-fuels" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <BeakerIcon class="w-4 h-4" />
                    เติมน้ำมัน
                  </router-link>
                  <router-link to="/report-repairs" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <WrenchScrewdriverIcon class="w-4 h-4" />
                    แจ้งซ่อม
                  </router-link>
                  <router-link to="/report-docs" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <DocumentTextIcon class="w-4 h-4" />
                    เอกสารยานพาหนะ
                  </router-link>
                  <div class="mx-2 my-1 border-t border-gray-100 dark:border-slate-700"></div>
                  <router-link to="/export" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ArrowDownTrayIcon class="w-4 h-4" />
                    Export ใบตรวจเช็ค
                  </router-link>
                </PopoverPanel>
              </transition>
            </Popover>

            <!-- จัดการระบบ -->
            <Popover v-if="auth.canManageVehicles" class="relative" v-slot="{ open, close }">
              <PopoverButton
                :class="[isGroupActive(['/vehicles', '/users', '/logs']) ? 'text-teal-900 dark:text-teal-200 bg-white/40 dark:bg-white/15 font-semibold' : 'text-teal-900/75 dark:text-teal-300/80 hover:text-teal-900 dark:hover:text-teal-200 hover:bg-white/30 dark:hover:bg-white/10', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                <Cog6ToothIcon class="w-4 h-4" />
                จัดการ
                <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                  <div class="px-3 pb-1.5 mb-1 border-b border-gray-200 dark:border-slate-700">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">จัดการระบบ</span>
                  </div>
                  <router-link to="/vehicles" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <TruckIcon class="w-4 h-4" />
                    ยานพาหนะ
                  </router-link>
                  <router-link v-if="auth.isAdminOrManager" to="/users" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <UsersIcon class="w-4 h-4" />
                    ผู้ใช้งาน
                  </router-link>
                  <router-link v-if="auth.isAdminOrManager" to="/logs" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition mx-1 rounded-lg"
                    active-class="text-blue-600! dark:text-blue-400! bg-blue-50! dark:bg-blue-900/30!">
                    <ClockIcon class="w-4 h-4" />
                    บันทึก Activity
                  </router-link>
                </PopoverPanel>
              </transition>
            </Popover>

            </template>
            <!-- ===== END VEHICLE SECTION NAV ===== -->

          </div>

          <!-- Right side: Bell + User menu -->
          <div class="hidden md:flex items-center gap-2">

            <!-- Dark mode toggle -->
            <button @click="toggleDark" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors" :title="isDark ? 'โหมดสว่าง' : 'โหมดมืด'">
              <SunIcon v-if="isDark" class="w-5 h-5 text-amber-400" />
              <MoonIcon v-else class="w-5 h-5 text-teal-900/80 dark:text-slate-300" />
            </button>

            <!-- Bell notification -->
            <Popover v-if="alerts.length" class="relative" v-slot="{ open }">
              <PopoverButton class="relative p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors outline-none">
                <BellIcon class="w-5 h-5 text-teal-900/80 dark:text-teal-300" />
                <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {{ alerts.length }}
                </span>
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden">
                  <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <span class="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
                      แจ้งเตือนเอกสาร
                    </span>
                    <span class="text-xs text-slate-400">{{ alerts.length }} รายการ</span>
                  </div>
                  <div class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                    <div v-for="doc in alerts" :key="doc.key"
                      class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                      <div :class="doc.urgent ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'"
                        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <ExclamationTriangleIcon class="w-4 h-4" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{{ doc.vehicleName }}</p>
                        <p class="text-xs text-slate-400">{{ doc.label }}</p>
                        <p :class="doc.urgent ? 'text-red-600' : 'text-amber-600'" class="text-xs font-semibold mt-0.5">
                          {{ doc.urgent ? 'หมดอายุแล้ว!' : `อีก ${doc.daysLeft} วัน (${doc.dateStr})` }}
                        </p>
                      </div>
                      <button @click.stop="dismissAlert(doc.key)"
                        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-all shrink-0 mt-0.5">
                        <XMarkIcon class="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div class="px-4 py-2 border-t border-gray-200 dark:border-slate-700 text-right">
                    <button @click="dismissAll" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">ปิดทั้งหมด</button>
                  </div>
                </PopoverPanel>
              </transition>
            </Popover>

            <!-- User menu -->
            <Menu as="div" class="relative">
              <MenuButton class="flex items-center gap-2 bg-white/20 hover:bg-white/35 dark:hover:bg-white/15 rounded-full pl-1.5 pr-3 py-1 transition-colors">
                <div class="w-7 h-7 bg-teal-700 dark:bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ (auth.user.displayName || auth.user.username).charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-semibold text-teal-900 dark:text-teal-200 max-w-24 truncate hidden lg:block">{{ auth.user.displayName || auth.user.username }}</span>
                <ChevronDownIcon class="w-4 h-4 text-teal-700 dark:text-teal-400" />
              </MenuButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <MenuItems class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 z-50">
                  <MenuItem disabled>
                    <div class="px-4 py-2.5 text-sm text-slate-500 border-b border-gray-200 dark:border-slate-700">
                      <div class="font-medium text-slate-800 dark:text-slate-200">{{ auth.user.displayName || auth.user.username }}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-400">@{{ auth.user.username }} · {{ auth.user.phone }}</div>
                      <div class="text-xs mt-0.5">
                        <span :class="auth.isAdmin ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' : auth.isManager ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : auth.isMaid ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'" class="px-1.5 py-0.5 rounded font-semibold">
                          {{ auth.isAdmin ? 'ADMIN' : auth.isManager ? 'MANAGER' : auth.isMaid ? 'MAID' : 'STAFF' }}
                        </span>
                      </div>
                    </div>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button @click="handleLogout"
                      :class="[active ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300', 'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2']">
                      <ArrowLeftStartOnRectangleIcon class="w-4 h-4" /> ออกจากระบบ
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Mobile right: Bell + Hamburger -->
          <div class="md:hidden flex items-center gap-1">
            <Popover v-if="alerts.length" class="relative" v-slot="{ open }">
              <PopoverButton class="relative p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors outline-none">
                <BellIcon class="w-5 h-5 text-teal-900/80 dark:text-teal-300" />
                <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {{ alerts.length }}
                </span>
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden">
                  <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <span class="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
                      แจ้งเตือนเอกสาร
                    </span>
                    <span class="text-xs text-slate-400">{{ alerts.length }} รายการ</span>
                  </div>
                  <div class="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                    <div v-for="doc in alerts" :key="doc.key"
                      class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <div :class="doc.urgent ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'"
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{{ doc.vehicleName }}</p>
                        <p class="text-xs text-slate-400">{{ doc.label }}</p>
                        <p :class="doc.urgent ? 'text-red-600' : 'text-amber-600'" class="text-xs font-semibold mt-0.5">
                          {{ doc.urgent ? 'หมดอายุแล้ว!' : `อีก ${doc.daysLeft} วัน (${doc.dateStr})` }}
                        </p>
                      </div>
                      <button @click.stop="dismissAlert(doc.key)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md shrink-0 mt-0.5">
                        <XMarkIcon class="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div class="px-4 py-2 border-t border-gray-200 dark:border-slate-700 text-right">
                    <button @click="dismissAll" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">ปิดทั้งหมด</button>
                  </div>
                </PopoverPanel>
              </transition>
            </Popover>

            <button @click="toggleDark" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
              <SunIcon v-if="isDark" class="w-5 h-5 text-amber-400" />
              <MoonIcon v-else class="w-5 h-5 text-teal-900/80 dark:text-slate-300" />
            </button>
            <button @click="mobileMenu = !mobileMenu" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
              <Bars3Icon v-if="!mobileMenu" class="w-6 h-6 text-teal-900/80 dark:text-teal-300" />
              <XMarkIcon v-else class="w-6 h-6 text-teal-900/80 dark:text-teal-300" />
            </button>
          </div>

        </div>
      </div>
    </nav>

    <!-- Mobile menu panel -->
    <teleport to="body">
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="mobileMenu && auth.user" class="md:hidden fixed top-14 inset-x-0 bottom-0 z-50">
          <div class="absolute inset-0 bg-black/40" @click="closeMobile"></div>
          <div :class="isMaidSection ? 'bg-linear-to-b from-purple-300 via-fuchsia-200 to-pink-200 dark:from-purple-950 dark:via-fuchsia-950 dark:to-slate-900' : 'bg-linear-to-b from-sky-300 via-teal-200 to-emerald-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'" class="relative shadow-2xl rounded-b-2xl max-h-[82vh] overflow-y-auto">

            <!-- ===== MAID SECTION MOBILE NAV ===== -->
            <template v-if="isMaidSection">
              <div class="p-3 pb-0">
                <router-link to="/maid" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!" exact>
                  <div class="w-8 h-8 bg-purple-700/30 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <HomeIcon class="w-4 h-4 text-purple-900 dark:text-purple-300" />
                  </div>
                  หน้าหลัก
                </router-link>
              </div>
              <div class="p-3 pb-0">
                <div class="px-4 pt-2 pb-1.5 flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-purple-800/40 dark:bg-purple-500/30 rounded-full"></div>
                  <span class="text-[10px] font-bold text-purple-900/60 dark:text-purple-400/70 uppercase tracking-widest">ปฏิบัติงาน</span>
                </div>
                <router-link to="/maid/scan" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-purple-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <QrCodeIcon class="w-4 h-4 text-purple-900 dark:text-purple-400" />
                  </div>
                  สแกน QR Code
                </router-link>
                <router-link to="/maid/logs" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-emerald-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <ClipboardDocumentCheckIcon class="w-4 h-4 text-emerald-900 dark:text-emerald-400" />
                  </div>
                  ประวัติการทำความสะอาด
                </router-link>
                <router-link to="/maid/issues" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-amber-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <ExclamationTriangleIcon class="w-4 h-4 text-amber-900 dark:text-amber-400" />
                  </div>
                  แจ้งปัญหา
                </router-link>
              </div>
              <div class="p-3 pb-0">
                <div class="px-4 pt-2 pb-1.5 flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-purple-800/40 dark:bg-purple-500/30 rounded-full"></div>
                  <span class="text-[10px] font-bold text-purple-900/60 dark:text-purple-400/70 uppercase tracking-widest">รายงาน & ข้อมูล</span>
                </div>
                <router-link to="/maid/reports" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-violet-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <ChartBarIcon class="w-4 h-4 text-violet-900 dark:text-violet-400" />
                  </div>
                  สรุปรายพื้นที่
                </router-link>
                <router-link to="/maid/report-logs" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-emerald-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <ClipboardDocumentListIcon class="w-4 h-4 text-emerald-900 dark:text-emerald-400" />
                  </div>
                  บันทึกทำความสะอาด
                </router-link>
                <router-link to="/maid/report-issues" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-amber-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <ExclamationTriangleIcon class="w-4 h-4 text-amber-900 dark:text-amber-400" />
                  </div>
                  รายงานปัญหา
                </router-link>
              </div>
              <div v-if="auth.isAdmin" class="p-3 pb-0">
                <div class="px-4 pt-2 pb-1.5 flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-purple-800/40 dark:bg-purple-500/30 rounded-full"></div>
                  <span class="text-[10px] font-bold text-purple-900/60 dark:text-purple-400/70 uppercase tracking-widest">จัดการระบบแม่บ้าน</span>
                </div>
                <router-link to="/maid/areas" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-pink-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <MapPinIcon class="w-4 h-4 text-pink-900 dark:text-pink-400" />
                  </div>
                  จัดการพื้นที่
                </router-link>
                <router-link to="/users" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-cyan-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <UsersIcon class="w-4 h-4 text-cyan-900 dark:text-cyan-400" />
                  </div>
                  ผู้ใช้งาน
                </router-link>
                <router-link to="/logs" @click="closeMobile"
                  class="flex items-center gap-3 text-purple-900/80 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                  active-class="text-purple-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                  <div class="w-8 h-8 bg-slate-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                    <ClockIcon class="w-4 h-4 text-slate-900 dark:text-slate-400" />
                  </div>
                  บันทึก Activity
                </router-link>
              </div>
            </template>

            <!-- ===== VEHICLE SECTION MOBILE NAV ===== -->
            <template v-else>
            <!-- หน้าหลัก -->
            <div class="p-3 pb-0">
              <router-link to="/" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!" exact>
                <div class="w-8 h-8 bg-teal-700/30 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <HomeIcon class="w-4 h-4 text-teal-900 dark:text-teal-300" />
                </div>
                หน้าหลัก
              </router-link>
            </div>

            <!-- ปฏิบัติงาน -->
            <div class="p-3 pb-0">
              <div class="px-4 pt-2 pb-1.5 flex items-center gap-2">
                <div class="w-4 h-0.5 bg-teal-800/40 dark:bg-teal-500/30 rounded-full"></div>
                <span class="text-[10px] font-bold text-teal-900/60 dark:text-teal-400/70 uppercase tracking-widest">ปฏิบัติงาน</span>
              </div>
              <router-link to="/inspection" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-blue-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ClipboardDocumentCheckIcon class="w-4 h-4 text-blue-900 dark:text-blue-400" />
                </div>
                บันทึกการตรวจ
              </router-link>
              <router-link to="/bookings" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-emerald-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ArrowsRightLeftIcon class="w-4 h-4 text-emerald-900 dark:text-emerald-400" />
                </div>
                เบิก/คืนรถ
              </router-link>
              <router-link to="/renewals" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-teal-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <DocumentTextIcon class="w-4 h-4 text-teal-900 dark:text-teal-400" />
                </div>
                ต่อ พ.ร.บ./ภาษี/ประกัน
              </router-link>
              <router-link to="/repairs" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-orange-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <WrenchScrewdriverIcon class="w-4 h-4 text-orange-900 dark:text-orange-400" />
                </div>
                แจ้งซ่อม
              </router-link>
              <router-link to="/fuels" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-amber-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <FireIcon class="w-4 h-4 text-amber-900 dark:text-amber-400" />
                </div>
                เติมน้ำมัน
              </router-link>
              <router-link to="/accidents" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-rose-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ExclamationTriangleIcon class="w-4 h-4 text-rose-900 dark:text-rose-400" />
                </div>
                รายงานอุบัติเหตุ
              </router-link>
            </div>

            <!-- รายงาน -->
            <div class="p-3 pb-0">
              <div class="px-4 pt-2 pb-1.5 flex items-center gap-2">
                <div class="w-4 h-0.5 bg-teal-800/40 dark:bg-teal-500/30 rounded-full"></div>
                <span class="text-[10px] font-bold text-teal-900/60 dark:text-teal-400/70 uppercase tracking-widest">รายงาน & ข้อมูล</span>
              </div>
              <router-link to="/reports" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-violet-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ClipboardDocumentListIcon class="w-4 h-4 text-violet-900 dark:text-violet-400" />
                </div>
                การตรวจเช็ค
              </router-link>
              <router-link to="/report-bookings" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-amber-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ArrowsRightLeftIcon class="w-4 h-4 text-amber-900 dark:text-amber-400" />
                </div>
                การเบิก/คืนรถ
              </router-link>
              <router-link to="/report-fuels" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-blue-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <BeakerIcon class="w-4 h-4 text-blue-900 dark:text-blue-400" />
                </div>
                เติมน้ำมัน
              </router-link>
              <router-link to="/report-repairs" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-orange-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <WrenchScrewdriverIcon class="w-4 h-4 text-orange-900 dark:text-orange-400" />
                </div>
                แจ้งซ่อม
              </router-link>
              <router-link to="/report-docs" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-emerald-500/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <DocumentTextIcon class="w-4 h-4 text-emerald-900 dark:text-emerald-400" />
                </div>
                เอกสารยานพาหนะ
              </router-link>
              <router-link to="/export" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-rose-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ArrowDownTrayIcon class="w-4 h-4 text-rose-900 dark:text-rose-400" />
                </div>
                Export ใบตรวจเช็ค
              </router-link>
            </div>

            <!-- จัดการ -->
            <div v-if="auth.canManageVehicles" class="p-3 pb-0">
              <div class="px-4 pt-2 pb-1.5 flex items-center gap-2">
                <div class="w-4 h-0.5 bg-teal-800/40 dark:bg-teal-500/30 rounded-full"></div>
                <span class="text-[10px] font-bold text-teal-900/60 dark:text-teal-400/70 uppercase tracking-widest">จัดการระบบ</span>
              </div>
              <router-link to="/vehicles" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-amber-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <TruckIcon class="w-4 h-4 text-amber-900 dark:text-amber-400" />
                </div>
                ยานพาหนะ
              </router-link>
              <router-link v-if="auth.isAdminOrManager" to="/users" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-cyan-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <UsersIcon class="w-4 h-4 text-cyan-900 dark:text-cyan-400" />
                </div>
                ผู้ใช้งาน
              </router-link>
              <router-link v-if="auth.isAdminOrManager" to="/logs" @click="closeMobile"
                class="flex items-center gap-3 text-teal-900/80 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-teal-900! dark:text-white! bg-white/40! dark:bg-white/15! font-semibold!">
                <div class="w-8 h-8 bg-slate-600/25 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/40">
                  <ClockIcon class="w-4 h-4 text-slate-900 dark:text-slate-400" />
                </div>
                บันทึก Activity
              </router-link>
            </div>
            </template>
            <!-- ===== END VEHICLE SECTION MOBILE NAV ===== -->

            <!-- User footer -->
            <div class="bg-white/30 dark:bg-white/5 m-3 mt-3 rounded-2xl p-3 ring-1 ring-white/50 dark:ring-white/10">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-9 h-9 bg-teal-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {{ (auth.user.displayName || auth.user.username).charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ auth.user.displayName || auth.user.username }}</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400">@{{ auth.user.username }}</div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs text-slate-700 dark:text-slate-300">{{ auth.user.phone }}</span>
                      <span :class="auth.isAdmin ? 'bg-violet-200 text-violet-800' : auth.isManager ? 'bg-indigo-200 text-indigo-800' : auth.isMaid ? 'bg-pink-200 text-pink-800' : 'bg-sky-200 text-sky-800'" class="text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {{ auth.isAdmin ? 'ADMIN' : auth.isManager ? 'MANAGER' : auth.isMaid ? 'MAID' : 'STAFF' }}
                      </span>
                    </div>
                  </div>
                </div>
                <button @click="handleLogout"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-sm">
                  <ArrowLeftStartOnRectangleIcon class="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            </div>

          </div>
        </div>
      </transition>
    </teleport>

    <main :class="auth.user ? 'max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8' : ''">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { auth } from './stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem, Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import {
  Bars3Icon, XMarkIcon, ChevronDownIcon, ArrowLeftStartOnRectangleIcon,
  HomeIcon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, ChartBarIcon, ArrowDownTrayIcon,
  TruckIcon, UsersIcon, ClockIcon, ArrowsRightLeftIcon, Cog6ToothIcon,
  BellIcon, ExclamationTriangleIcon, DocumentTextIcon, WrenchScrewdriverIcon, FireIcon, BeakerIcon,
  SunIcon, MoonIcon, MapPinIcon, SparklesIcon, QrCodeIcon
} from '@heroicons/vue/24/outline'
import api from './stores/api'
import { useDark } from './stores/dark'
import { sectionStore } from './stores/section'
const { isDark, toggle: toggleDark } = useDark()

const isMaidSection = computed(() => {
  if (auth.isMaid) return true
  if (auth.isAdmin) return sectionStore.current === 'maid'
  return false
})

function setSection(s) {
  sectionStore.setSection(s)
  router.push(s === 'maid' ? '/maid' : '/')
}

const router = useRouter()
const route = useRoute()
const mobileMenu = ref(false)

watch(() => route.path, () => { mobileMenu.value = false })

function isGroupActive(paths) {
  return paths.some(p => route.path.startsWith(p))
}
function closeMobile() { mobileMenu.value = false }
function handleLogout() {
  auth.logout()
  closeMobile()
  router.push('/login')
}

// --- Expiry alerts ---
const allAlerts = ref([])
const dismissedKeys = ref(new Set())

const alerts = computed(() =>
  allAlerts.value.filter(a => !dismissedKeys.value.has(a.key))
)

function dismissAlert(key) {
  dismissedKeys.value = new Set([...dismissedKeys.value, key])
}
function dismissAll() {
  dismissedKeys.value = new Set(allAlerts.value.map(a => a.key))
}

async function loadAlerts() {
  if (!auth.user) return
  try {
    const res = await api.get('/vehicles')
    const result = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const warnDate = new Date(today)
    warnDate.setDate(warnDate.getDate() + 30)

    for (const v of res.data) {
      const name = `${v.type} (${v.licensePlate})`
      const checks = [
        { key: `${v.id}-prb`, field: v.prbExpiry, label: 'พ.ร.บ. หมดอายุ' },
        { key: `${v.id}-ins`, field: v.insExpiry, label: 'ประกันภัย หมดอายุ' },
        { key: `${v.id}-tax`, field: v.taxRenewalDate, label: 'ต่อภาษีรถ ครบกำหนด' },
      ]
      for (const c of checks) {
        if (!c.field) continue
        const d = new Date(c.field)
        d.setHours(0, 0, 0, 0)
        if (d <= warnDate) {
          const daysLeft = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
          result.push({
            key: c.key,
            vehicleName: name,
            label: c.label,
            daysLeft,
            urgent: daysLeft <= 0,
            dateStr: d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
          })
        }
      }
    }
    allAlerts.value = result.sort((a, b) => a.daysLeft - b.daysLeft)
  } catch {}
}

watch(() => auth.user, (u) => { if (u) loadAlerts() }, { immediate: true })
</script>
