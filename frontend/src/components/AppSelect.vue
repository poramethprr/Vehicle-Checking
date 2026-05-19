<template>
  <div ref="wrapperRef" class="relative">
    <button
      type="button"
      @click="toggle"
      class="relative w-full cursor-pointer rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-left text-sm shadow-sm transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      :class="compact ? 'py-2 pl-3 pr-8' : 'py-2.5 pl-3.5 pr-10'">
      <span class="flex items-center gap-2.5 truncate">
        <component v-if="selectedOption?.icon" :is="selectedOption.icon" class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        <component v-else-if="icon" :is="icon" class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span :class="modelValue !== '' && modelValue !== null ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'">
          {{ selectedOption?.label || placeholder }}
        </span>
      </span>
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center" :class="compact ? 'pr-2' : 'pr-3'">
        <ChevronUpDownIcon class="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </span>
    </button>

    <Teleport to="body">
      <Transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100">
        <div
          v-if="isOpen"
          :style="dropdownStyle"
          class="fixed max-h-60 overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-sm shadow-2xl ring-1 ring-black/5 dark:ring-white/10 outline-none">
          <div
            v-if="placeholder && allowEmpty"
            @click="select(emptyValue)"
            class="flex items-center gap-2.5 py-2.5 px-4 cursor-pointer text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            <span class="w-5 h-5 shrink-0"></span>
            {{ placeholder }}
          </div>
          <div
            v-for="opt in options"
            :key="opt.value"
            @click="select(opt.value)"
            class="flex items-center gap-2.5 py-2.5 px-4 cursor-pointer transition-colors"
            :class="[
              opt.value === modelValue ? 'bg-blue-50/50 dark:bg-blue-900/20 font-semibold' : '',
              'hover:bg-blue-50 dark:hover:bg-blue-900/30'
            ]">
            <component
              v-if="opt.icon || icon"
              :is="opt.icon || icon"
              :class="opt.value === modelValue ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'"
              class="w-5 h-5 shrink-0" />
            <span :class="opt.value === modelValue ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'">
              {{ opt.label }}
            </span>
            <CheckIcon v-if="opt.value === modelValue" class="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto shrink-0" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'เลือก...' },
  icon: { type: [Object, null], default: null },
  allowEmpty: { type: Boolean, default: true },
  emptyValue: { type: [String, Number], default: '' },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const wrapperRef = ref(null)
const isOpen = ref(false)
const dropdownStyle = ref({})

const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue))

function computePos() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    zIndex: 9999,
    minWidth: rect.width + 'px',
    left: rect.left + 'px',
    top: (rect.bottom + 4) + 'px'
  }
}

function toggle() {
  if (isOpen.value) {
    isOpen.value = false
  } else {
    computePos()
    isOpen.value = true
  }
}

function select(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function onClickOutside(e) {
  if (!wrapperRef.value?.contains(e.target)) isOpen.value = false
}

function onScroll() {
  if (isOpen.value) isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('scroll', onScroll, { capture: true })
})
</script>
