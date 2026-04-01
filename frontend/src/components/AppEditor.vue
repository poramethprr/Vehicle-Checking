<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :style="{ height }"
    @input="$emit('update:modelValue', $event.target.value)"
    class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-vertical min-h-[120px]"
  ></textarea>
</template>

<script setup>
defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: 'พิมพ์ข้อความ...'
  },
  height: {
    type: String,
    default: '120px'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
</style>