<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <component :is="icon" class="w-10 h-10 text-slate-300" />
    </div>
    <p class="text-slate-500 font-medium text-sm mb-1">{{ title }}</p>
    <p v-if="subtitle" class="text-slate-400 text-xs text-center max-w-xs">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<script setup>
import { InboxIcon } from '@heroicons/vue/24/outline'
defineProps({
  icon: { type: Object, default: () => InboxIcon },
  title: { type: String, default: 'ไม่พบข้อมูล' },
  subtitle: { type: String, default: '' }
})
</script>
