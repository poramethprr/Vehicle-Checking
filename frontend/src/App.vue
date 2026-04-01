<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
    <!-- Navbar -->
    <nav v-if="auth.user" class="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">

          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2 shrink-0" @click="closeMobile">
            <div class="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span class="font-bold text-slate-800 text-sm hidden sm:block">SEMed Vehicle</span>
          </router-link>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-0.5">

            <!-- หน้าหลัก -->
            <router-link to="/"
              class="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              active-class="text-blue-600! bg-blue-50!" exact>
              <HomeIcon class="w-4 h-4" />
              หน้าหลัก
            </router-link>

            <!-- ปฏิบัติงาน -->
            <Popover class="relative" v-slot="{ open, close }">
              <PopoverButton
                :class="[isGroupActive(['/inspection', '/bookings']) ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                <ClipboardDocumentCheckIcon class="w-4 h-4" />
                ปฏิบัติงาน
                <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1.5 z-50">
                  <div class="px-3 pb-1.5 mb-1 border-b border-gray-100">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ปฏิบัติงาน</span>
                  </div>
                  <router-link to="/inspection" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <ClipboardDocumentCheckIcon class="w-4 h-4" />
                    บันทึกการตรวจ
                  </router-link>
                  <router-link to="/bookings" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <ArrowsRightLeftIcon class="w-4 h-4" />
                    เบิก/คืนรถ
                  </router-link>
                </PopoverPanel>
              </transition>
            </Popover>

            <!-- รายงาน -->
            <Popover class="relative" v-slot="{ open, close }">
              <PopoverButton
                :class="[isGroupActive(['/reports', '/export']) ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                <ChartBarIcon class="w-4 h-4" />
                รายงาน
                <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1.5 z-50">
                  <div class="px-3 pb-1.5 mb-1 border-b border-gray-100">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">รายงาน & ข้อมูล</span>
                  </div>
                  <router-link to="/reports" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <ChartBarIcon class="w-4 h-4" />
                    รายงานการตรวจ
                  </router-link>
                  <router-link to="/export" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <ArrowDownTrayIcon class="w-4 h-4" />
                    Export Excel/PDF
                  </router-link>
                </PopoverPanel>
              </transition>
            </Popover>

            <!-- จัดการระบบ -->
            <Popover v-if="auth.canManageVehicles" class="relative" v-slot="{ open, close }">
              <PopoverButton
                :class="[isGroupActive(['/vehicles', '/users', '/logs']) ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100', 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none']">
                <Cog6ToothIcon class="w-4 h-4" />
                จัดการ
                <ChevronDownIcon :class="['w-3.5 h-3.5 transition-transform duration-150', open && 'rotate-180']" />
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1.5 z-50">
                  <div class="px-3 pb-1.5 mb-1 border-b border-gray-100">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">จัดการระบบ</span>
                  </div>
                  <router-link to="/vehicles" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <TruckIcon class="w-4 h-4" />
                    ยานพาหนะ
                  </router-link>
                  <router-link v-if="auth.isAdmin" to="/users" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <UsersIcon class="w-4 h-4" />
                    ผู้ใช้งาน
                  </router-link>
                  <router-link v-if="auth.isAdmin" to="/logs" @click="close"
                    class="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition mx-1 rounded-lg"
                    active-class="text-blue-600! bg-blue-50!">
                    <ClockIcon class="w-4 h-4" />
                    บันทึก Activity
                  </router-link>
                </PopoverPanel>
              </transition>
            </Popover>

          </div>

          <!-- Right side: Bell + User menu -->
          <div class="hidden md:flex items-center gap-2">

            <!-- Bell notification -->
            <Popover v-if="alerts.length" class="relative" v-slot="{ open }">
              <PopoverButton class="relative p-2 rounded-lg hover:bg-slate-100 transition-colors outline-none">
                <BellIcon class="w-5 h-5 text-slate-600" />
                <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {{ alerts.length }}
                </span>
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
                  <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span class="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
                      แจ้งเตือนเอกสาร
                    </span>
                    <span class="text-xs text-slate-400">{{ alerts.length }} รายการ</span>
                  </div>
                  <div class="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    <div v-for="doc in alerts" :key="doc.key"
                      class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <div :class="doc.urgent ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'"
                        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <ExclamationTriangleIcon class="w-4 h-4" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-700 truncate">{{ doc.vehicleName }}</p>
                        <p class="text-xs text-slate-400">{{ doc.label }}</p>
                        <p :class="doc.urgent ? 'text-red-600' : 'text-amber-600'" class="text-xs font-semibold mt-0.5">
                          {{ doc.urgent ? 'หมดอายุแล้ว!' : `อีก ${doc.daysLeft} วัน (${doc.dateStr})` }}
                        </p>
                      </div>
                      <button @click.stop="dismissAlert(doc.key)"
                        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-md transition-all shrink-0 mt-0.5">
                        <XMarkIcon class="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div class="px-4 py-2 border-t border-gray-100 text-right">
                    <button @click="dismissAll" class="text-xs text-slate-400 hover:text-slate-600 transition">ปิดทั้งหมด</button>
                  </div>
                </PopoverPanel>
              </transition>
            </Popover>

            <!-- User menu -->
            <Menu as="div" class="relative">
              <MenuButton class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-full pl-3 pr-2 py-1.5 transition-colors">
                <div class="w-6 h-6 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ auth.user.username.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-slate-700 max-w-24 truncate">{{ auth.user.username }}</span>
                <ChevronDownIcon class="w-4 h-4 text-slate-400" />
              </MenuButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <MenuItems class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1 z-50">
                  <MenuItem disabled>
                    <div class="px-4 py-2.5 text-sm text-slate-500 border-b border-gray-100">
                      <div class="font-medium text-slate-800">{{ auth.user.username }}</div>
                      <div class="text-xs">{{ auth.user.phone }}</div>
                      <div class="text-xs mt-0.5">
                        <span :class="auth.isAdmin ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'" class="px-1.5 py-0.5 rounded font-semibold">
                          {{ auth.isAdmin ? 'ADMIN' : 'STAFF' }}
                        </span>
                      </div>
                    </div>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button @click="handleLogout"
                      :class="[active ? 'bg-red-50 text-red-600' : 'text-slate-600', 'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2']">
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
              <PopoverButton class="relative p-2 rounded-lg hover:bg-slate-100 transition-colors outline-none">
                <BellIcon class="w-5 h-5 text-slate-600" />
                <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {{ alerts.length }}
                </span>
              </PopoverButton>
              <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <PopoverPanel class="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
                  <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span class="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
                      แจ้งเตือนเอกสาร
                    </span>
                    <span class="text-xs text-slate-400">{{ alerts.length }} รายการ</span>
                  </div>
                  <div class="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    <div v-for="doc in alerts" :key="doc.key"
                      class="flex items-start gap-3 px-4 py-3">
                      <div :class="doc.urgent ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'"
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-700 truncate">{{ doc.vehicleName }}</p>
                        <p class="text-xs text-slate-400">{{ doc.label }}</p>
                        <p :class="doc.urgent ? 'text-red-600' : 'text-amber-600'" class="text-xs font-semibold mt-0.5">
                          {{ doc.urgent ? 'หมดอายุแล้ว!' : `อีก ${doc.daysLeft} วัน (${doc.dateStr})` }}
                        </p>
                      </div>
                      <button @click.stop="dismissAlert(doc.key)" class="p-1 hover:bg-slate-100 rounded-md shrink-0 mt-0.5">
                        <XMarkIcon class="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div class="px-4 py-2 border-t border-gray-100 text-right">
                    <button @click="dismissAll" class="text-xs text-slate-400 hover:text-slate-600 transition">ปิดทั้งหมด</button>
                  </div>
                </PopoverPanel>
              </transition>
            </Popover>

            <button @click="mobileMenu = !mobileMenu" class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bars3Icon v-if="!mobileMenu" class="w-6 h-6 text-slate-600" />
              <XMarkIcon v-else class="w-6 h-6 text-slate-600" />
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
          <div class="relative bg-white shadow-2xl rounded-b-2xl max-h-[82vh] overflow-y-auto">

            <div class="p-2 pb-0">
              <router-link to="/" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!" exact>
                <HomeIcon class="w-5 h-5" />
                หน้าหลัก
              </router-link>
            </div>

            <div class="p-2 pb-0">
              <div class="px-4 pt-3 pb-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ปฏิบัติงาน</span>
              </div>
              <router-link to="/inspection" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <ClipboardDocumentCheckIcon class="w-5 h-5" />
                บันทึกการตรวจ
              </router-link>
              <router-link to="/bookings" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <ArrowsRightLeftIcon class="w-5 h-5" />
                เบิก/คืนรถ
              </router-link>
            </div>

            <div class="p-2 pb-0">
              <div class="px-4 pt-3 pb-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">รายงาน & ข้อมูล</span>
              </div>
              <router-link to="/reports" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <ChartBarIcon class="w-5 h-5" />
                รายงานการตรวจ
              </router-link>
              <router-link to="/export" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <ArrowDownTrayIcon class="w-5 h-5" />
                Export Excel/PDF
              </router-link>
            </div>

            <div v-if="auth.canManageVehicles" class="p-2 pb-0">
              <div class="px-4 pt-3 pb-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">จัดการระบบ</span>
              </div>
              <router-link to="/vehicles" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <TruckIcon class="w-5 h-5" />
                ยานพาหนะ
              </router-link>
              <router-link v-if="auth.isAdmin" to="/users" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <UsersIcon class="w-5 h-5" />
                ผู้ใช้งาน
              </router-link>
              <router-link v-if="auth.isAdmin" to="/logs" @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="text-blue-600! bg-blue-50!">
                <ClockIcon class="w-5 h-5" />
                บันทึก Activity
              </router-link>
            </div>

            <div class="border-t border-gray-100 p-3 mt-2">
              <div class="flex items-center justify-between px-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {{ auth.user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-slate-800 truncate">{{ auth.user.username }}</div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs text-slate-400">{{ auth.user.phone }}</span>
                      <span :class="auth.isAdmin ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'" class="text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {{ auth.isAdmin ? 'ADMIN' : 'STAFF' }}
                      </span>
                    </div>
                  </div>
                </div>
                <button @click="handleLogout"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm shrink-0 flex items-center gap-1.5">
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
  HomeIcon, ClipboardDocumentCheckIcon, ChartBarIcon, ArrowDownTrayIcon,
  TruckIcon, UsersIcon, ClockIcon, ArrowsRightLeftIcon, Cog6ToothIcon,
  BellIcon, ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import api from './stores/api'

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
