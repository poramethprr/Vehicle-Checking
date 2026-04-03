<template>
  <div>
    <div class="relative bg-linear-to-r from-violet-600 to-indigo-600 rounded-2xl px-6 py-5 mb-6 overflow-hidden shadow-md shadow-violet-200">
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

    <div class="bg-white rounded-2xl shadow-xl shadow-slate-500/25 border border-gray-200 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-200">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <UsersIcon class="w-5 h-5 text-violet-500" /> รายชื่อผู้ใช้
          <span class="text-sm font-normal text-slate-400">{{ users.length }} คน</span>
        </h3>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-100" v-if="users.length">
        <div v-for="u in users" :key="u.id" class="px-4 py-4">
          <div class="flex items-center gap-3 mb-3">
            <div :class="avatarClass(u.role)"
              class="w-10 h-10 bg-linear-to-br rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
              {{ u.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800 truncate">{{ u.username }}</div>
              <div class="text-xs text-slate-400 flex items-center gap-1"><PhoneIcon class="w-3 h-3" /> {{ u.phone }}</div>
            </div>
            <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-2.5 py-1 rounded-full ring-1 inline-flex items-center gap-1 shrink-0">
              <ShieldCheckIcon v-if="u.role === 'ADMIN'" class="w-3 h-3" />
              <UserIcon v-else class="w-3 h-3" />
              {{ u.role === 'ADMIN' ? 'Admin' : 'Staff' }}
            </span>
          </div>
          <div class="flex gap-2">
            <button @click="openEdit(u)" class="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-amber-200">
              <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id"
              class="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-30 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-red-200">
              <TrashIcon class="w-3.5 h-3.5" /> ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop -->
      <div class="hidden sm:block" v-if="users.length">
        <table class="w-full">
          <thead><tr class="bg-slate-50/50">
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">ผู้ใช้</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">เบอร์โทร</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">บทบาท</th>
            <th class="text-left py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">สมัครเมื่อ</th>
            <th class="text-right py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">จัดการ</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-3">
                  <div :class="avatarClass(u.role)" class="w-8 h-8 bg-linear-to-br rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {{ u.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-slate-800">{{ u.username }}</span>
                </div>
              </td>
              <td class="py-3.5 px-6">
                <span class="text-sm text-slate-500 flex items-center gap-1.5">
                  <PhoneIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />{{ u.phone }}
                </span>
              </td>
              <td class="py-3.5 px-6">
                <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-3 py-1 rounded-full ring-1 inline-flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheckIcon v-if="u.role === 'ADMIN'" class="w-3.5 h-3.5" />
                  <UserIcon v-else class="w-3.5 h-3.5" />
                  {{ u.role === 'ADMIN' ? 'Admin (ผู้ดูแล)' : 'Staff (เจ้าหน้าที่)' }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-sm text-slate-400">{{ formatDate(u.createdAt) }}</td>
              <td class="py-3.5 px-6 text-right whitespace-nowrap">
                <button @click="openEdit(u)" class="text-amber-600 hover:bg-amber-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition mr-1 inline-flex items-center gap-1">
                  <PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข
                </button>
                <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id" class="text-red-600 hover:bg-red-50 disabled:opacity-30 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1">
                  <TrashIcon class="w-3.5 h-3.5" /> ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!users.length" class="py-16 flex flex-col items-center gap-2 text-slate-400">
        <UsersIcon class="w-10 h-10 opacity-30" />
        <p class="text-sm">ยังไม่มีผู้ใช้ในระบบ</p>
      </div>
    </div>

    <!-- Add User Modal -->
    <TransitionRoot :show="showAddModal" as="template">
      <Dialog @close="showAddModal = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
          leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <DialogTitle class="font-bold text-slate-800 flex items-center gap-2">
                    <UserPlusIcon class="w-5 h-5 text-violet-500" /> เพิ่มผู้ใช้ใหม่
                  </DialogTitle>
                  <button @click="showAddModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400">
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <form @submit.prevent="createUser" class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">ชื่อผู้ใช้ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.username" required placeholder="กรอกชื่อ-นามสกุล หรือชื่อเรียก"
                        class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.phone" required type="tel" placeholder="0xx-xxx-xxxx"
                        class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">บทบาท <span class="text-red-500">*</span></label>
                    <AppSelect v-model="addForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">รหัสผ่าน <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <LockClosedIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.password" :type="showAddPwd ? 'text' : 'password'" required placeholder="อย่างน้อย 6 ตัวอักษร"
                        class="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition hover:border-violet-400" />
                      <button type="button" @click="showAddPwd = !showAddPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        <EyeSlashIcon v-if="showAddPwd" class="w-4 h-4" />
                        <EyeIcon v-else class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">ยืนยันรหัสผ่าน <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <LockClosedIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                        :class="addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'text-red-400' : 'text-slate-400'" />
                      <input v-model="addForm.confirmPassword" :type="showAddPwd ? 'text' : 'password'" required placeholder="กรอกรหัสผ่านอีกครั้ง"
                        :class="addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-violet-500 focus:ring-violet-500/20'"
                        class="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm shadow-sm focus:ring-2 outline-none transition border hover:border-violet-400" />
                    </div>
                    <p v-if="addForm.confirmPassword && addForm.password !== addForm.confirmPassword" class="text-xs text-red-500 mt-1 pl-1">รหัสผ่านไม่ตรงกัน</p>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button type="button" @click="showAddModal = false"
                      class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition text-sm">
                      ยกเลิก
                    </button>
                    <button type="submit" :disabled="addLoading || (addForm.confirmPassword && addForm.password !== addForm.confirmPassword)"
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
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100" leave="duration-150 ease-in" leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95">
              <DialogPanel class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <DialogTitle class="font-bold text-slate-800 flex items-center gap-2">
                    <PencilSquareIcon class="w-5 h-5 text-amber-500" /> แก้ไขผู้ใช้
                  </DialogTitle>
                  <button @click="showEditModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400">
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <form @submit.prevent="saveUser" class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">ชื่อผู้ใช้ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="editForm.username" required placeholder="กรอกชื่อ-นามสกุล หรือชื่อเรียก"
                        class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="editForm.phone" required type="tel" placeholder="0xx-xxx-xxxx"
                        class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">บทบาท <span class="text-red-500">*</span></label>
                    <AppSelect v-model="editForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" />
                  </div>

                  <div class="pt-1 border-t border-gray-100">
                    <p class="text-xs text-slate-400 mb-3">เปลี่ยนรหัสผ่าน (เว้นว่างถ้าไม่ต้องการเปลี่ยน)</p>

                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-semibold text-slate-600 mb-1.5">รหัสผ่านใหม่</label>
                        <div class="relative">
                          <LockClosedIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input v-model="editForm.password" :type="showEditPwd ? 'text' : 'password'" placeholder="อย่างน้อย 6 ตัวอักษร"
                            class="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition hover:border-amber-400" />
                          <button type="button" @click="showEditPwd = !showEditPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                            <EyeSlashIcon v-if="showEditPwd" class="w-4 h-4" />
                            <EyeIcon v-else class="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div v-if="editForm.password">
                        <label class="block text-sm font-semibold text-slate-600 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                        <div class="relative">
                          <LockClosedIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                            :class="editForm.confirmPassword && editForm.password !== editForm.confirmPassword ? 'text-red-400' : 'text-slate-400'" />
                          <input v-model="editForm.confirmPassword" :type="showEditPwd ? 'text' : 'password'" placeholder="กรอกรหัสผ่านอีกครั้ง"
                            :class="editForm.confirmPassword && editForm.password !== editForm.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'"
                            class="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm shadow-sm focus:ring-2 outline-none transition border hover:border-amber-400" />
                        </div>
                        <p v-if="editForm.confirmPassword && editForm.password !== editForm.confirmPassword" class="text-xs text-red-500 mt-1 pl-1">รหัสผ่านไม่ตรงกัน</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button type="button" @click="showEditModal = false"
                      class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition text-sm">
                      ยกเลิก
                    </button>
                    <button type="submit" :disabled="editLoading || (editForm.password && editForm.confirmPassword && editForm.password !== editForm.confirmPassword)"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { UsersIcon, PencilSquareIcon, TrashIcon, UserIcon, UserPlusIcon, PhoneIcon, ShieldCheckIcon, CheckCircleIcon, XMarkIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

const users = ref([])
const showAddModal = ref(false)
const addLoading = ref(false)
const addForm = ref({ username: '', phone: '', role: 'STAFF', password: '', confirmPassword: '' })
const showAddPwd = ref(false)

const showEditModal = ref(false)
const editLoading = ref(false)
const editingUser = ref(null)
const editForm = ref({ username: '', phone: '', role: '', password: '', confirmPassword: '' })
const showEditPwd = ref(false)

const roleOptions = [
  { value: 'STAFF', label: 'Staff (เจ้าหน้าที่)' },
  { value: 'ADMIN', label: 'Admin (ผู้ดูแล)' }
]

function avatarClass(role) {
  return role === 'ADMIN' ? 'from-violet-500 to-purple-500' : 'from-emerald-500 to-teal-500'
}

function roleBadgeClass(role) {
  return role === 'ADMIN' ? 'bg-violet-100 text-violet-700 ring-violet-200' : 'bg-emerald-100 text-emerald-700 ring-emerald-200'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

async function loadUsers() {
  users.value = (await api.get('/users')).data
}

function openAdd() {
  addForm.value = { username: '', phone: '', role: 'STAFF', password: '', confirmPassword: '' }
  showAddPwd.value = false
  showAddModal.value = true
}

async function createUser() {
  if (addForm.value.password !== addForm.value.confirmPassword) return
  if (addForm.value.password.length < 6) {
    swalError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    return
  }
  addLoading.value = true
  try {
    await api.post('/users', {
      username: addForm.value.username,
      phone: addForm.value.phone,
      role: addForm.value.role,
      password: addForm.value.password,
      actionUserId: auth.user.id
    })
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
  editForm.value = { username: u.username, phone: u.phone, role: u.role, password: '', confirmPassword: '' }
  showEditPwd.value = false
  showEditModal.value = true
}

async function saveUser() {
  if (editForm.value.password && editForm.value.password !== editForm.value.confirmPassword) return
  if (editForm.value.password && editForm.value.password.length < 6) {
    swalError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    return
  }
  editLoading.value = true
  try {
    const payload = {
      username: editForm.value.username,
      phone: editForm.value.phone,
      role: editForm.value.role,
      actionUserId: auth.user.id
    }
    if (editForm.value.password) payload.password = editForm.value.password
    await api.put(`/users/${editingUser.value.id}`, payload)
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
