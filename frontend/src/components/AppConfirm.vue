<template>
  <TransitionRoot :show="open" as="template">
    <Dialog @close="$emit('cancel')" class="relative z-50">
      <TransitionChild as="template"
        enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      </TransitionChild>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild as="template"
          enter="ease-out duration-200" enter-from="opacity-0 scale-90" enter-to="opacity-100 scale-100"
          leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-90">
          <DialogPanel class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div class="p-6 text-center">
              <div :class="[dangerMode ? 'bg-red-100' : 'bg-amber-100', 'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4']">
                <ExclamationTriangleIcon :class="[dangerMode ? 'text-red-500' : 'text-amber-500', 'w-7 h-7']" />
              </div>
              <DialogTitle class="text-lg font-bold text-slate-800 mb-1">{{ title }}</DialogTitle>
              <p class="text-sm text-slate-500">{{ message }}</p>
            </div>
            <div class="flex border-t border-gray-100">
              <button @click="$emit('cancel')"
                class="flex-1 py-3.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
                ยกเลิก
              </button>
              <button @click="$emit('confirm')"
                :class="[dangerMode ? 'text-red-600 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50', 'flex-1 py-3.5 text-sm font-semibold border-l border-gray-100 transition']">
                {{ confirmText }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps({
  open: Boolean,
  title: { type: String, default: 'ยืนยันการดำเนินการ' },
  message: { type: String, default: 'คุณต้องการดำเนินการต่อหรือไม่?' },
  confirmText: { type: String, default: 'ยืนยัน' },
  dangerMode: { type: Boolean, default: false }
})

defineEmits(['confirm', 'cancel'])
</script>
