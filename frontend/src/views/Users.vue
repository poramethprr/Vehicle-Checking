<template>
  <div>
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">จัดการผู้ใช้</h1>
        <p class="text-sm text-slate-400 mt-0.5">ดูและจัดการบัญชีผู้ใช้งานในระบบ</p>
      </div>
      <button @click="openAdd"
        class="shrink-0 flex items-center gap-1.5 bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]">
        <UserPlusIcon class="w-4 h-4" /> เพิ่มผู้ใช้
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-gray-100">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <UsersIcon class="w-5 h-5 text-violet-500" /> รายชื่อผู้ใช้
          <span class="text-sm font-normal text-slate-400">{{ users.length }} คน</span>
        </h3>
      </div>

      <!-- Mobile -->
      <div class="sm:hidden divide-y divide-gray-50" v-if="users.length">
        <div v-for="u in users" :key="u.id" class="px-4 py-4">
          <div class="flex items-center gap-3 mb-3">
            <div :class="avatarClass(u.role)"
              class="w-10 h-10 bg-linear-to-br rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {{ u.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm text-slate-800 truncate">{{ u.username }}</div>
              <div class="text-xs text-slate-400 flex items-center gap-1"><PhoneIcon class="w-3 h-3" /> {{ u.phone }}</div>
            </div>
            <span :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 flex items-center gap-1">
              <ShieldCheckIcon v-if="u.role === 'ADMIN'" class="w-3 h-3" />
              <UserIcon v-else class="w-3 h-3" />
              {{ u.role }}
            </span>
          </div>

          <div v-if="editingUser?.id === u.id" class="space-y-3 mt-3 pt-3 border-t border-gray-100">
            <div class="relative">
              <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input v-model="editForm.username" placeholder="ชื่อผู้ใช้" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div class="relative">
              <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input v-model="editForm.phone" placeholder="เบอร์โทร" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <AppSelect v-model="editForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" />
            <div class="flex gap-2">
              <button @click="saveUser" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-sm">บันทึก</button>
              <button @click="editingUser = null" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl transition">ยกเลิก</button>
            </div>
          </div>
          <div v-else class="flex gap-2">
            <button @click="startEdit(u)" class="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold py-2.5 rounded-xl transition ring-1 ring-amber-200">
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
          <tbody class="divide-y divide-gray-50">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3.5 px-6"><div class="flex items-center gap-3">
                <div :class="avatarClass(u.role)" class="w-8 h-8 bg-linear-to-br rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ u.username.charAt(0).toUpperCase() }}
                </div>
                <template v-if="editingUser?.id === u.id">
                  <input v-model="editForm.username" class="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-28 focus:ring-2 focus:ring-blue-500 outline-none" />
                </template>
                <span v-else class="text-sm font-medium text-slate-800">{{ u.username }}</span>
              </div></td>
              <td class="py-3.5 px-6">
                <template v-if="editingUser?.id === u.id">
                  <input v-model="editForm.phone" class="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-28 focus:ring-2 focus:ring-blue-500 outline-none" />
                </template>
                <span v-else class="text-sm text-slate-500 flex items-center gap-1.5"><PhoneIcon class="w-3.5 h-3.5 text-slate-400" />{{ u.phone }}</span>
              </td>
              <td class="py-3.5 px-6">
                <template v-if="editingUser?.id === u.id">
                  <div class="w-36"><AppSelect v-model="editForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" /></div>
                </template>
                <span v-else :class="roleBadgeClass(u.role)" class="text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 inline-flex items-center gap-1">
                  <ShieldCheckIcon v-if="u.role === 'ADMIN'" class="w-3 h-3" />
                  <TruckIcon v-else-if="u.role === 'DRIVER'" class="w-3 h-3" />
                  <UserIcon v-else class="w-3 h-3" />
                  {{ u.role }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-sm text-slate-400">{{ formatDate(u.createdAt) }}</td>
              <td class="py-3.5 px-6 text-right">
                <template v-if="editingUser?.id === u.id">
                  <button @click="saveUser" class="text-emerald-600 hover:bg-emerald-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition mr-1 inline-flex items-center gap-1"><CheckCircleIcon class="w-3.5 h-3.5" /> บันทึก</button>
                  <button @click="editingUser = null" class="text-slate-500 hover:bg-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition">ยกเลิก</button>
                </template>
                <template v-else>
                  <button @click="startEdit(u)" class="text-amber-600 hover:bg-amber-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition mr-1 inline-flex items-center gap-1"><PencilSquareIcon class="w-3.5 h-3.5" /> แก้ไข</button>
                  <button @click="confirmDelete(u)" :disabled="u.id === auth.user.id" class="text-red-600 hover:bg-red-50 disabled:opacity-30 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"><TrashIcon class="w-3.5 h-3.5" /> ลบ</button>
                </template>
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
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
                        class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <PhoneIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input v-model="addForm.phone" required type="tel" placeholder="0xx-xxx-xxxx"
                        class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-slate-600 mb-1.5">บทบาท <span class="text-red-500">*</span></label>
                    <AppSelect v-model="addForm.role" :options="roleOptions" :allow-empty="false" :icon="ShieldCheckIcon" />
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button type="button" @click="showAddModal = false"
                      class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition text-sm">
                      ยกเลิก
                    </button>
                    <button type="submit" :disabled="addLoading"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { UsersIcon, PencilSquareIcon, TrashIcon, UserIcon, UserPlusIcon, PhoneIcon, ShieldCheckIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import AppSelect from '../components/AppSelect.vue'
import api from '../stores/api'
import { auth } from '../stores/auth'
import { swalSuccess, swalError, swalConfirm } from '../stores/swal'

const users = ref([])
const editingUser = ref(null)
const editForm = ref({ username: '', phone: '', role: '' })
const showAddModal = ref(false)
const addLoading = ref(false)
const addForm = ref({ username: '', phone: '', role: 'USER' })

const roleOptions = [
  { value: 'STAFF', label: 'STAFF (เจ้าหน้าที่)' },
  { value: 'ADMIN', label: 'ADMIN (ผู้ดูแล)' }
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
  addForm.value = { username: '', phone: '', role: 'USER' }
  showAddModal.value = true
}

async function createUser() {
  addLoading.value = true
  try {
    await api.post('/users', { ...addForm.value, actionUserId: auth.user.id })
    swalSuccess('เพิ่มผู้ใช้สำเร็จ', `เพิ่ม ${addForm.value.username} เข้าระบบแล้ว`)
    showAddModal.value = false
    await loadUsers()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถเพิ่มผู้ใช้ได้')
  } finally {
    addLoading.value = false
  }
}

function startEdit(u) {
  editingUser.value = u
  editForm.value = { username: u.username, phone: u.phone, role: u.role }
}

async function saveUser() {
  try {
    await api.put(`/users/${editingUser.value.id}`, { ...editForm.value, actionUserId: auth.user.id })
    swalSuccess('อัพเดทสำเร็จ', 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว')
    editingUser.value = null
    await loadUsers()
  } catch (err) {
    swalError('เกิดข้อผิดพลาด', err.response?.data?.error || 'ไม่สามารถบันทึกได้')
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
