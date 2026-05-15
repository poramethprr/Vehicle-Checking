<template>
  <div>
    <div class="relative bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-950 dark:to-indigo-950 rounded-2xl px-6 py-5 mb-6 overflow-hidden shadow-md shadow-violet-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <UsersIcon class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-white">จัดการผู้ใช้</h1>
            <p class="text-violet-200 text-xs mt-0.5">ดูและจัดการบัญชีผู้ใช้งานในระบบ</p>
          </div>
        </div>
        <button @click="openAdd"
          class="shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm active:scale-[0.98] ring-1 ring-white/30">
          <UserPlusIcon class="w-4 h-4" /> เพิ่มผู้ใช้
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
      <button @click="activeTab = 'vehicle'"
        :class="activeTab === 'vehicle' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
        <TruckIcon class="w-4 h-4" />
        ยานพาหนะ
        <span class="text-xs px-1.5 py-0.5 rounded-full" :class="activeTab === 'vehicle' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'">
          {{ vehicleUsers.length }}
        </span>
      </button>
      <button @click="activeTab = 'maid'"
        :class="activeTab === 'maid' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
        <SparklesIcon class="w-4 h-4" />
        แม่บ้าน
        <span class="text-xs px-1.5 py-0.5 rounded-full" :class="activeTab === 'maid' ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'">
          {{ maidUsers.length }}
        </span>
      </button>
    </div>

    <!-- ===== VEHICLE TAB ===== -->
    <div v-if="activeTab === 'vehicle'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TruckIcon class="w-5 h-5 text-violet-500" /> ผู้ใช้งานยานพาหนะ
          <span class="text-sm font-normal text-slate-400 dark:text-slate-500">{{ vehicleUsers.length }} คน</span>
        </h3>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="vehicleUsers.length">
        <div v-for="u in vehicleUsers" :key="u.id" class="px-4 py-4">
          <div class="flex items-center gap-3 mb-3">
            <div :class="avatarClass(u.role)"
              class="w-10 h-10 bg-linear-to-br rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
              {{ (u.displayName || u.username).charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800 dark:text-white truncate">{{ u.displayName || u.username }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500">@{{ u.username }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><PhoneIcon class="w-3 h-3" /> {{ u.phone }}</div>
            </div>
            <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-2.5 py-1 rounded-full ring-1 inline-flex items-center gap-1 shrink-0">
              <ShieldCheckIcon v-if="u.role === 'ADMIN'" class="w-3 h-3" />
              <UserIcon v-else class="w-3 h-3" />
              {{ u.role === 'ADMIN' ? 'Admin' : u.role === 'MANAGER' ? 'Manager' : 'Staff' }}
            </span>
          </div>
          <div v-if="u.licenseNumber" class="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2">
            <IdentificationIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="font-medium">{{ u.licenseNumber }}</span>
            <span v-if="u.licenseExpiry" :class="licenseExpiryBadgeClass(u.licenseExpiry)"
              class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full">
              {{ licenseExpiryLabel(u.licenseExpiry) }}
            </span>
          </div>
          <div class="flex gap-2">
            <button @click="openEdit(u)" class="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-amber-200 dark:ring-amber-800/50">
              <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id"
              class="flex-1 flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-30 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-red-200 dark:ring-red-800/50">
              <TrashIcon class="w-3.5 h-3.5" /> ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block" v-if="vehicleUsers.length">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ผู้ใช้</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">เบอร์โทร</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">บทบาท</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ใบขับขี่</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">สมัครเมื่อ</th>
            <th class="text-right py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">จัดการ</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="u in vehicleUsers" :key="u.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-3">
                  <div :class="avatarClass(u.role)" class="w-8 h-8 bg-linear-to-br rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {{ (u.displayName || u.username).charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-slate-800 dark:text-white">{{ u.displayName || u.username }}</div>
                    <div class="text-xs text-slate-400 dark:text-slate-500">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-6">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <PhoneIcon class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />{{ u.phone }}
                </span>
              </td>
              <td class="py-3.5 px-6">
                <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-3 py-1 rounded-full ring-1 inline-flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheckIcon v-if="u.role === 'ADMIN'" class="w-3.5 h-3.5" />
                  <UserIcon v-else class="w-3.5 h-3.5" />
                  {{ u.role === 'ADMIN' ? 'Admin (ผู้ดูแล)' : u.role === 'MANAGER' ? 'Manager (หัวหน้า)' : 'Staff (เจ้าหน้าที่)' }}
                </span>
              </td>
              <td class="py-3.5 px-6">
                <div v-if="u.licenseNumber" class="flex flex-col gap-1">
                  <div class="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
                    <IdentificationIcon class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span class="font-medium">{{ u.licenseNumber }}</span>
                    <button v-if="u.licensePhoto" @click="openLicensePhoto(u)"
                      class="text-blue-500 hover:text-blue-700 transition" title="ดูรูปใบขับขี่">
                      <PhotoIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div v-if="u.licenseExpiry" class="flex items-center gap-1">
                    <span :class="licenseExpiryBadgeClass(u.licenseExpiry)"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {{ licenseExpiryLabel(u.licenseExpiry) }}
                    </span>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ formatDate(u.licenseExpiry) }}</span>
                  </div>
                </div>
                <span v-else class="text-xs text-slate-300">—</span>
              </td>
              <td class="py-3.5 px-6 text-sm text-slate-400 dark:text-slate-500">{{ formatDate(u.createdAt) }}</td>
              <td class="py-3.5 px-6 text-right whitespace-nowrap">
                <button @click="openEdit(u)" class="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition mr-1 inline-flex items-center gap-1">
                  <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
                </button>
                <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id" class="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                  <TrashIcon class="w-3.5 h-3.5" /> ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!vehicleUsers.length" class="py-16 flex flex-col items-center gap-2 text-slate-400">
        <UsersIcon class="w-10 h-10 opacity-30" />
        <p class="text-sm">ยังไม่มีผู้ใช้ยานพาหนะในระบบ</p>
      </div>
    </div>

    <!-- ===== MAID TAB ===== -->
    <div v-if="activeTab === 'maid'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-500/25 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <SparklesIcon class="w-5 h-5 text-pink-500" /> ผู้ใช้งานแม่บ้าน
          <span class="text-sm font-normal text-slate-400 dark:text-slate-500">{{ maidUsers.length }} คน</span>
        </h3>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100 dark:divide-slate-700" v-if="maidUsers.length">
        <div v-for="u in maidUsers" :key="u.id" class="px-4 py-4">
          <div class="flex items-center gap-3 mb-3">
            <div :class="avatarClass(u.role)"
              class="w-10 h-10 bg-linear-to-br rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
              {{ (u.displayName || u.username).charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800 dark:text-white truncate">{{ u.displayName || u.username }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500">@{{ u.username }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><PhoneIcon class="w-3 h-3" /> {{ u.phone }}</div>
            </div>
            <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-2.5 py-1 rounded-full ring-1 inline-flex items-center gap-1 shrink-0">
              <SparklesIcon class="w-3 h-3" />
              Maid
            </span>
          </div>
          <div class="flex gap-2">
            <button @click="openEdit(u)" class="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-amber-200 dark:ring-amber-800/50">
              <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id"
              class="flex-1 flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-30 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-red-200 dark:ring-red-800/50">
              <TrashIcon class="w-3.5 h-3.5" /> ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block" v-if="maidUsers.length">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50 dark:bg-slate-700/30">
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ผู้ใช้</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">เบอร์โทร</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">บทบาท</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">สมัครเมื่อ</th>
            <th class="text-right py-3 px-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">จัดการ</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="u in maidUsers" :key="u.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-3">
                  <div :class="avatarClass(u.role)" class="w-8 h-8 bg-linear-to-br rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {{ (u.displayName || u.username).charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-slate-800 dark:text-white">{{ u.displayName || u.username }}</div>
                    <div class="text-xs text-slate-400 dark:text-slate-500">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-6">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <PhoneIcon class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />{{ u.phone }}
                </span>
              </td>
              <td class="py-3.5 px-6">
                <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-3 py-1 rounded-full ring-1 inline-flex items-center gap-1.5 whitespace-nowrap">
                  <SparklesIcon class="w-3.5 h-3.5" />
                  Maid (แม่บ้าน)
                </span>
              </td>
              <td class="py-3.5 px-6 text-sm text-slate-400 dark:text-slate-500">{{ formatDate(u.createdAt) }}</td>
              <td class="py-3.5 px-6 text-right whitespace-nowrap">
                <button @click="openEdit(u)" class="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition mr-1 inline-flex items-center gap-1">
                  <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
                </button>
                <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id" class="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                  <TrashIcon class="w-3.5 h-3.5" /> ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!maidUsers.length" class="py-16 flex flex-col items-center gap-2 text-slate-400">
        <SparklesIcon class="w-10 h-10 opacity-30" />
        <p class="text-sm">ยังไม่มีผู้ใช้งานแม่บ้านในระบบ</p>
      </div>
    </div>

    <!-- Add User Modal -->
    <TransitionRoot :show="showAddModal" as="template">
      <Dialog @close="showAddModal = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <UserPlusIcon class="w-5 h-5 text-violet-500" /> เพิ่มผู้ใช้ใหม่
                  </DialogTitle>
                  <button @click="showAddModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-400 dark:text-slate-500">
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <form @submit.prevent="createUser" class="p-6 space-y-4 overflow-y-auto max-h-[80vh]" novalidate>
                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ชื่อในระบบ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.displayName" placeholder="ชื่อ-นามสกุล หรือชื่อเรียก (จะแสดงผล)"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ชื่อผู้ใช้ (Login) <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.username" required placeholder="ชื่อที่ใช้เข้าสู่ระบบ (ห้ามซ้ำ)"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.phone" required type="tel" placeholder="0xx-xxx-xxxx"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">บทบาท <span class="text-red-500">*</span></label>
                    <AppSelect v-model="addForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">รหัสผ่าน <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <LockClosedIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.password" :type="showAddPwd ? 'text' : 'password'" required placeholder="อย่างน้อย 6 ตัวอักษร"
                        class="w-full pl-10 pr-11 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400 dark:text-white dark:placeholder-slate-400" />
                      <button type="button" @click="showAddPwd = !showAddPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        <EyeSlashIcon v-if="showAddPwd" class="w-4 h-4" />
                        <EyeIcon v-else class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ยืนยันรหัสผ่าน <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <LockClosedIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                        :class="addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'text-red-400' : 'text-slate-400'" />
                      <input v-model="addForm.confirmPassword" :type="showAddPwd ? 'text' : 'password'" required placeholder="กรอกรหัสผ่านอีกครั้ง"
                        :class="addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-violet-500 focus:ring-violet-500/20'"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 rounded-xl text-sm shadow-sm focus:ring-2 outline-none transition border hover:border-violet-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                    <p v-if="addForm.confirmPassword && addForm.password !== addForm.confirmPassword" class="text-xs text-red-500 mt-1 pl-1">รหัสผ่านไม่ตรงกัน</p>
                  </div>

                  <!-- License section (vehicle roles only) -->
                  <div v-if="addForm.role !== 'MAID'" class="pt-1 border-t border-gray-100 dark:border-slate-700">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                      <IdentificationIcon class="w-3.5 h-3.5" /> ข้อมูลใบขับขี่ (ไม่บังคับ)
                    </p>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">เลขใบขับขี่</label>
                        <div class="relative">
                          <IdentificationIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input v-model="addForm.licenseNumber" placeholder="เช่น 12-1234567890"
                            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400 dark:text-white dark:placeholder-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">วันหมดอายุใบขับขี่</label>
                        <div class="relative">
                          <CalendarIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input v-model="addForm.licenseExpiry" type="date"
                            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400 dark:text-white dark:placeholder-slate-400 dark:[color-scheme:dark]" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">รูปใบขับขี่</label>
                        <label class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-slate-700 transition">
                          <PhotoIcon class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span class="text-sm text-slate-400 dark:text-slate-500">{{ addForm.licensePhotoFile ? addForm.licensePhotoFile.name : 'เลือกรูปภาพ (jpg, png)' }}</span>
                          <input type="file" accept="image/*" class="hidden" @change="onAddPhotoChange" />
                        </label>
                        <div v-if="addPhotoPreview" class="mt-2">
                          <img :src="addPhotoPreview" class="w-full max-h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button type="button" @click="showAddModal = false"
                      class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition text-sm">
                      ยกเลิก
                    </button>
                    <button type="submit" :disabled="addLoading || !!(addForm.confirmPassword && addForm.password !== addForm.confirmPassword)"
                      class="flex-1 py-3 bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition text-sm shadow-sm">
                      <span v-if="addLoading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        กำลังบันทึก...
                      </span>
                      <span v-else class="flex items-center justify-center gap-1.5"><UserPlusIcon class="w-4 h-4" /> เพิ่มผู้ใช้</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Edit User Modal -->
    <TransitionRoot :show="showEditModal" as="template">
      <Dialog @close="showEditModal = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <DialogTitle class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <PencilSquareIcon class="w-5 h-5 text-amber-500" /> แก้ไขผู้ใช้
                  </DialogTitle>
                  <button @click="showEditModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-400 dark:text-slate-500">
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <form @submit.prevent="saveUser" class="p-6 space-y-4 overflow-y-auto max-h-[80vh]" novalidate>
                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ชื่อในระบบ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="editForm.displayName" placeholder="ชื่อ-นามสกุล หรือชื่อเรียก (จะแสดงผล)"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ชื่อผู้ใช้ (Login) <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="editForm.username" required placeholder="ชื่อที่ใช้เข้าสู่ระบบ"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="editForm.phone" required type="tel" placeholder="0xx-xxx-xxxx"
                        class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">บทบาท <span class="text-red-500">*</span></label>
                    <AppSelect v-model="editForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" />
                  </div>

                  <!-- License section (vehicle roles only) -->
                  <div v-if="editForm.role !== 'MAID'" class="pt-1 border-t border-gray-100 dark:border-slate-700">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                      <IdentificationIcon class="w-3.5 h-3.5" /> ข้อมูลใบขับขี่
                    </p>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">เลขใบขับขี่</label>
                        <div class="relative">
                          <IdentificationIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input v-model="editForm.licenseNumber" placeholder="เช่น 12-1234567890"
                            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">วันหมดอายุใบขับขี่</label>
                        <div class="relative">
                          <CalendarIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input v-model="editForm.licenseExpiry" type="date"
                            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400 dark:[color-scheme:dark]" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">รูปใบขับขี่</label>
                        <div v-if="editForm.existingLicensePhoto && !editForm.removeLicensePhoto && !editPhotoPreview" class="mb-2 relative">
                          <img :src="photoUrl(editForm.existingLicensePhoto)" class="w-full max-h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-600" />
                          <button type="button" @click="editForm.removeLicensePhoto = true"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition shadow">
                            <XMarkIcon class="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div v-if="editForm.removeLicensePhoto && !editPhotoPreview" class="mb-2 flex items-center gap-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                          <XMarkIcon class="w-3.5 h-3.5" /> รูปจะถูกลบออก
                          <button type="button" @click="editForm.removeLicensePhoto = false" class="ml-auto text-slate-500 hover:text-slate-700 underline">ยกเลิก</button>
                        </div>
                        <div v-if="editPhotoPreview" class="mb-2 relative">
                          <img :src="editPhotoPreview" class="w-full max-h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-600" />
                          <button type="button" @click="clearEditPhoto"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition shadow">
                            <XMarkIcon class="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <label class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-slate-700 transition">
                          <PhotoIcon class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span class="text-sm text-slate-400 dark:text-slate-500">{{ editForm.licensePhotoFile ? editForm.licensePhotoFile.name : 'เลือกรูปภาพใหม่ (jpg, png)' }}</span>
                          <input type="file" accept="image/*" class="hidden" @change="onEditPhotoChange" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="pt-1 border-t border-gray-100 dark:border-slate-700">
                    <p class="text-xs text-slate-400 dark:text-slate-500 mb-3">เปลี่ยนรหัสผ่าน (เว้นว่างถ้าไม่ต้องการเปลี่ยน)</p>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">รหัสผ่านใหม่</label>
                        <div class="relative">
                          <LockClosedIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input v-model="editForm.password" :type="showEditPwd ? 'text' : 'password'" placeholder="อย่างน้อย 6 ตัวอักษร"
                            class="w-full pl-10 pr-11 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
                          <button type="button" @click="showEditPwd = !showEditPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                            <EyeSlashIcon v-if="showEditPwd" class="w-4 h-4" />
                            <EyeIcon v-else class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div v-if="editForm.password">
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                        <div class="relative">
                          <LockClosedIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                            :class="editForm.confirmPassword && editForm.password !== editForm.confirmPassword ? 'text-red-400' : 'text-slate-400'" />
                          <input v-model="editForm.confirmPassword" :type="showEditPwd ? 'text' : 'password'" placeholder="กรอกรหัสผ่านอีกครั้ง"
                            :class="editForm.confirmPassword && editForm.password !== editForm.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'"
                            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 rounded-xl text-sm shadow-sm focus:ring-2 outline-none transition border hover:border-amber-400 dark:text-white dark:placeholder-slate-400" />
                        </div>
                        <p v-if="editForm.confirmPassword && editForm.password !== editForm.confirmPassword" class="text-xs text-red-500 mt-1 pl-1">รหัสผ่านไม่ตรงกัน</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button type="button" @click="showEditModal = false"
                      class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition text-sm">
                      ยกเลิก
                    </button>
                    <button type="submit" :disabled="editLoading || (!!editForm.password && editForm.password !== editForm.confirmPassword)"
                      class="flex-1 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition text-sm shadow-sm">
                      <span v-if="editLoading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        กำลังบันทึก...
                      </span>
                      <span v-else class="flex items-center justify-center gap-1.5"><CheckCircleIcon class="w-4 h-4" /> บันทึกการแก้ไข</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- License Photo Lightbox -->
    <TransitionRoot :show="!!licensePhotoUser" as="template">
      <Dialog @close="licensePhotoUser = null" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-center justify-center p-4" @click.self="licensePhotoUser = null">
          <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full">
              <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <DialogTitle class="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                  <IdentificationIcon class="w-4 h-4 text-blue-500" />
                  ใบขับขี่ — {{ licensePhotoUser?.displayName || licensePhotoUser?.username }}
                </DialogTitle>
                <button @click="licensePhotoUser = null"
                  class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-400">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
              <div class="p-4">
                <img v-if="licensePhotoUser"
                  :src="photoUrl(licensePhotoUser.licensePhoto)"
                  :alt="`ใบขับขี่ ${licensePhotoUser.displayName || licensePhotoUser.username}`"
                  class="w-full rounded-xl object-contain max-h-[70vh]" />
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
  UsersIcon, PencilSquareIcon, TrashIcon, UserIcon, UserPlusIcon, PhoneIcon,
  ShieldCheckIcon, CheckCircleIcon, XMarkIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  IdentificationIcon, CalendarIcon, PhotoIcon, TruckIcon, SparklesIcon
} from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import api from '../stores/api'
import { fmtDateTh, toLocalDateStr } from '../stores/date'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

const users = ref([])
const activeTab = ref('vehicle')

const vehicleUsers = computed(() => users.value.filter(u => u.role !== 'MAID'))
const maidUsers = computed(() => users.value.filter(u => u.role === 'MAID'))

const showAddModal = ref(false)
const addLoading = ref(false)
const addForm = ref({ displayName: '', username: '', phone: '', role: 'STAFF', password: '', confirmPassword: '', licenseNumber: '', licenseExpiry: '', licensePhotoFile: null })
const showAddPwd = ref(false)
const addPhotoPreview = ref(null)

const licensePhotoUser = ref(null)
function openLicensePhoto(u) { licensePhotoUser.value = u }

const showEditModal = ref(false)
const editLoading = ref(false)
const editingUser = ref(null)
const editForm = ref({ displayName: '', username: '', phone: '', role: '', password: '', confirmPassword: '', licenseNumber: '', licenseExpiry: '', licensePhotoFile: null, existingLicensePhoto: null, removeLicensePhoto: false })
const showEditPwd = ref(false)
const editPhotoPreview = ref(null)

const roleOptions = [
  { value: 'STAFF', label: 'Staff (เจ้าหน้าที่)' },
  { value: 'MANAGER', label: 'Manager (หัวหน้ายานพาหนะ)' },
  { value: 'MAID', label: 'Maid (แม่บ้าน)' },
  { value: 'ADMIN', label: 'Admin (ผู้ดูแล)' }
]

const BASE_URL = ``

function photoUrl(filename) {
  if (!filename) return null
  if (filename.startsWith('https://')) return `${BASE_URL}/api/media/proxy?url=${encodeURIComponent(filename)}`
  if (filename.startsWith('http')) return filename
  return `${BASE_URL}/uploads/${filename}`
}

function avatarClass(role) {
  if (role === 'ADMIN') return 'from-violet-500 to-purple-500'
  if (role === 'MANAGER') return 'from-indigo-500 to-blue-500'
  if (role === 'MAID') return 'from-pink-500 to-fuchsia-500'
  return 'from-emerald-500 to-teal-500'
}

function roleBadgeClass(role) {
  if (role === 'ADMIN') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 ring-violet-200 dark:ring-violet-700/50'
  if (role === 'MANAGER') return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-indigo-200 dark:ring-indigo-700/50'
  if (role === 'MAID') return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 ring-pink-200 dark:ring-pink-700/50'
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-700/50'
}

function licenseExpiryBadgeClass(expiry) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exp = new Date(expiry); exp.setHours(0, 0, 0, 0)
  const diffDays = Math.round((exp - today) / 86400000)
  if (diffDays < 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  if (diffDays <= 30) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
}

function licenseExpiryLabel(expiry) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exp = new Date(expiry); exp.setHours(0, 0, 0, 0)
  const diffDays = Math.round((exp - today) / 86400000)
  if (diffDays < 0) return 'หมดอายุแล้ว'
  if (diffDays === 0) return 'หมดอายุวันนี้'
  if (diffDays <= 30) return `อีก ${diffDays} วัน`
  return 'ยังไม่หมดอายุ'
}

function formatDate(date) { return fmtDateTh(date) }

function onAddPhotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  addForm.value.licensePhotoFile = file
  addPhotoPreview.value = URL.createObjectURL(file)
}

function onEditPhotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  editForm.value.licensePhotoFile = file
  editForm.value.removeLicensePhoto = false
  editPhotoPreview.value = URL.createObjectURL(file)
}

function clearEditPhoto() {
  editForm.value.licensePhotoFile = null
  editPhotoPreview.value = null
}

async function loadUsers() {
  users.value = (await api.get('/users')).data
}

function openAdd() {
  const defaultRole = activeTab.value === 'maid' ? 'MAID' : 'STAFF'
  addForm.value = { displayName: '', username: '', phone: '', role: defaultRole, password: '', confirmPassword: '', licenseNumber: '', licenseExpiry: '', licensePhotoFile: null }
  addPhotoPreview.value = null
  showAddPwd.value = false
  showAddModal.value = true
}

async function createUser() {
  if (!addForm.value.username.trim()) { swalError('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อผู้ใช้'); return }
  if (!addForm.value.phone.trim()) { swalError('กรุณากรอกข้อมูล', 'กรุณาระบุเบอร์โทรศัพท์'); return }
  if (addForm.value.password !== addForm.value.confirmPassword) return
  if (addForm.value.password.length < 6) { swalError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
  addLoading.value = true
  try {
    const fd = new FormData()
    fd.append('displayName', addForm.value.displayName)
    fd.append('username', addForm.value.username)
    fd.append('phone', addForm.value.phone)
    fd.append('role', addForm.value.role)
    fd.append('password', addForm.value.password)
    fd.append('actionUserId', auth.user.id)
    if (addForm.value.role !== 'MAID') {
      if (addForm.value.licenseNumber) fd.append('licenseNumber', addForm.value.licenseNumber)
      if (addForm.value.licenseExpiry) fd.append('licenseExpiry', addForm.value.licenseExpiry)
      if (addForm.value.licensePhotoFile) fd.append('licensePhoto', addForm.value.licensePhotoFile)
    }
    await api.post('/users', fd)
    swalSuccess('เพิ่มผู้ใช้สำเร็จ', `เพิ่ม ${addForm.value.username} เข้าระบบแล้ว`)
    showAddModal.value = false
    await loadUsers()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถเพิ่มผู้ใช้ได้')
  } finally {
    addLoading.value = false
  }
}

function openEdit(u) {
  editingUser.value = u
  editForm.value = {
    displayName: u.displayName || '',
    username: u.username,
    phone: u.phone,
    role: u.role,
    password: '',
    confirmPassword: '',
    licenseNumber: u.licenseNumber || '',
    licenseExpiry: u.licenseExpiry ? toLocalDateStr(u.licenseExpiry) : '',
    licensePhotoFile: null,
    existingLicensePhoto: u.licensePhoto || null,
    removeLicensePhoto: false
  }
  editPhotoPreview.value = null
  showEditPwd.value = false
  showEditModal.value = true
}

async function saveUser() {
  if (!editForm.value.username.trim()) { swalError('กรุณากรอกข้อมูล', 'กรุณาระบุชื่อผู้ใช้'); return }
  if (!editForm.value.phone.trim()) { swalError('กรุณากรอกข้อมูล', 'กรุณาระบุเบอร์โทรศัพท์'); return }
  if (editForm.value.password && editForm.value.password !== editForm.value.confirmPassword) return
  if (editForm.value.password && editForm.value.password.length < 6) { swalError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
  editLoading.value = true
  try {
    const fd = new FormData()
    fd.append('displayName', editForm.value.displayName)
    fd.append('username', editForm.value.username)
    fd.append('phone', editForm.value.phone)
    fd.append('role', editForm.value.role)
    fd.append('actionUserId', auth.user.id)
    if (editForm.value.role !== 'MAID') {
      fd.append('licenseNumber', editForm.value.licenseNumber || '')
      fd.append('licenseExpiry', editForm.value.licenseExpiry || '')
      fd.append('removeLicensePhoto', editForm.value.removeLicensePhoto ? 'true' : 'false')
      if (editForm.value.licensePhotoFile) fd.append('licensePhoto', editForm.value.licensePhotoFile)
    } else {
      fd.append('licenseNumber', '')
      fd.append('licenseExpiry', '')
      fd.append('removeLicensePhoto', 'true')
    }
    if (editForm.value.password) fd.append('password', editForm.value.password)
    await api.put(`/users/${editingUser.value.id}`, fd)
    swalSuccess('อัพเดทสำเร็จ', 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว')
    showEditModal.value = false
    await loadUsers()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
  } finally {
    editLoading.value = false
  }
}

async function confirmDelete(u) {
  const result = await swalConfirm('ลบผู้ใช้', `ต้องการลบผู้ใช้ ${u.username} ?`, 'ลบ', true)
  if (!result.isConfirmed) return
  try {
    await api.delete(`/users/${u.id}`, { data: { actionUserId: auth.user.id } })
    swalSuccess('ลบสำเร็จ', `ลบผู้ใช้ ${u.username} แล้ว`)
    await loadUsers()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถลบได้')
  }
}

onMounted(loadUsers)
</script>
