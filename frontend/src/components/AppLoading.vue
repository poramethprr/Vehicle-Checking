<template>
  <div class="flex flex-col items-center justify-center py-16">
    <div class="relative">
      <div class="w-12 h-12 rounded-full border-4 border-slate-200"></div>
      <div class="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin absolute inset-0"></div>
    </div>
    <p class="text-sm text-slate-400 mt-4">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({ text: { type: String, default: 'กำลังโหลด...' } })
</script>
