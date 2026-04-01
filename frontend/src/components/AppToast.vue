<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-8 scale-95">
        <div v-for="toast in toasts" :key="toast.id"
          :class="[
            'rounded-xl shadow-lg border px-4 py-3.5 flex items-start gap-3 backdrop-blur-sm cursor-pointer',
            toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : '',
            toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' : '',
            toast.type === 'info' ? 'bg-blue-50/95 border-blue-200 text-blue-800' : '',
            toast.type === 'warning' ? 'bg-amber-50/95 border-amber-200 text-amber-800' : ''
          ]"
          @click="removeToast(toast.id)">
          <div :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            toast.type === 'success' ? 'bg-emerald-500' : '',
            toast.type === 'error' ? 'bg-red-500' : '',
            toast.type === 'info' ? 'bg-blue-500' : '',
            toast.type === 'warning' ? 'bg-amber-500' : ''
          ]">
            <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5 text-white" />
            <ExclamationCircleIcon v-if="toast.type === 'error'" class="w-5 h-5 text-white" />
            <InformationCircleIcon v-if="toast.type === 'info'" class="w-5 h-5 text-white" />
            <ExclamationTriangleIcon v-if="toast.type === 'warning'" class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs mt-0.5 opacity-80">{{ toast.message }}</p>
          </div>
          <button class="text-current opacity-40 hover:opacity-100 transition shrink-0 mt-0.5">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<script setup>
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { toasts, removeToast } from '../stores/toast'
</script>
