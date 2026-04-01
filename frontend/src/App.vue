<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
    <!-- Navbar -->
    <nav v-if="auth.user" class="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <router-link to="/" class="flex items-center gap-2 shrink-0" @click="closeMobile">
            <div class="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span class="font-bold text-slate-800 text-sm hidden sm:block">SEMed Vehicle</span>
          </router-link>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-1">
            <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
              class="relative text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-slate-100"
              active-class="!text-blue-600 !bg-blue-50">
              <component :is="link.icon" class="w-4 h-4 inline-block mr-1 -mt-0.5" />
              {{ link.label }}
            </router-link>
          </div>

          <!-- Desktop user menu -->
          <div class="hidden md:flex items-center">
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

          <!-- Mobile hamburger -->
          <button @click="mobileMenu = !mobileMenu" class="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Bars3Icon v-if="!mobileMenu" class="w-6 h-6 text-slate-600" />
            <XMarkIcon v-else class="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile menu overlay -->
    <teleport to="body">
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="mobileMenu && auth.user" class="md:hidden fixed top-14 inset-x-0 bottom-0 z-50">
          <!-- Backdrop: starts below navbar -->
          <div class="absolute inset-0 bg-black/40" @click="closeMobile"></div>
          <!-- Panel -->
          <div class="relative bg-white shadow-2xl rounded-b-2xl max-h-[80vh] overflow-y-auto">
            <div class="p-2 space-y-0.5">
              <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
                @click="closeMobile"
                class="flex items-center gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition"
                active-class="!text-blue-600 !bg-blue-50">
                <component :is="link.icon" class="w-5 h-5" />
                {{ link.label }}
              </router-link>
            </div>
            <div class="border-t border-gray-100 p-3">
              <div class="flex items-center justify-between px-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {{ auth.user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-slate-800 truncate">{{ auth.user.username }}</div>
                    <div class="text-xs text-slate-400">{{ auth.user.phone }}</div>
                  </div>
                </div>
                <button @click="handleLogout"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm shrink-0">
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
import { ref, computed, watch } from 'vue'
import { auth } from './stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  Bars3Icon, XMarkIcon, ChevronDownIcon, ArrowLeftStartOnRectangleIcon,
  HomeIcon, ClipboardDocumentCheckIcon, ChartBarIcon, ArrowDownTrayIcon,
  TruckIcon, UsersIcon, ClockIcon, ArrowsRightLeftIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const mobileMenu = ref(false)

// ปิด mobile menu เมื่อเปลี่ยนหน้า
watch(() => route.path, () => { mobileMenu.value = false })

const navLinks = computed(() => {
  const links = [
    { to: '/', label: 'หน้าหลัก', icon: HomeIcon },
    { to: '/inspection', label: 'บันทึกการตรวจ', icon: ClipboardDocumentCheckIcon },
    { to: '/bookings', label: 'เบิก/คืนรถ', icon: ArrowsRightLeftIcon },
    { to: '/reports', label: 'รายงาน', icon: ChartBarIcon },
    { to: '/export', label: 'Export', icon: ArrowDownTrayIcon },
    { to: '/vehicles', label: 'ยานพาหนะ', icon: TruckIcon },
    { to: '/logs', label: 'Log', icon: ClockIcon }
  ]
  if (auth.isAdmin) {
    links.splice(5, 0, { to: '/users', label: 'ผู้ใช้', icon: UsersIcon })
  }
  return links
})

function closeMobile() { mobileMenu.value = false }
function handleLogout() {
  auth.logout()
  closeMobile()
  router.push('/login')
}
</script>
