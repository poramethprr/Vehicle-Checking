<template>
  <Listbox v-slot="{ open }" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" multiple>
    <div class="relative" ref="wrapperRef">

      <!-- Button -->
      <ListboxButton
        @click="computePos(open)"
        class="relative w-full cursor-pointer rounded-xl bg-white dark:bg-slate-800 border py-2.5 pl-3.5 pr-10 text-left text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="open ? 'border-blue-400 ring-2 ring-blue-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'">

        <span class="flex items-center gap-2 min-w-0">
          <component v-if="icon" :is="icon" class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />

          <!-- No selection -->
          <span v-if="modelValue.length === 0" class="text-slate-400 dark:text-slate-500 truncate">{{ placeholder }}</span>

          <!-- Single selection -->
          <span v-else-if="modelValue.length === 1" class="text-slate-800 dark:text-white truncate">{{ labelOf(modelValue[0]) }}</span>

          <!-- Multiple selections — show chips -->
          <span v-else class="flex items-center gap-1 flex-wrap min-w-0">
            <span v-for="val in modelValue.slice(0, 2)" :key="val"
              class="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-lg max-w-28 truncate">
              {{ labelOf(val) }}
            </span>
            <span v-if="modelValue.length > 2"
              class="inline-flex items-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-lg">
              +{{ modelValue.length - 2 }}
            </span>
          </span>
        </span>

        <!-- Clear button (when items selected) -->
        <span class="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1">
          <button v-if="modelValue.length > 0"
            @click.stop.prevent="$emit('update:modelValue', [])"
            class="p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition">
            <XMarkIcon class="w-3.5 h-3.5" />
          </button>
          <ChevronUpDownIcon class="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </span>
      </ListboxButton>

      <!-- Dropdown -->
      <Teleport to="body">
        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100">
          <ListboxOptions
            v-if="open"
            static
            class="fixed overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-sm shadow-2xl ring-1 ring-black/8 dark:ring-white/10 focus:outline-none"
            :style="dropdownStyle">

            <!-- Select all / Clear all header -->
            <div class="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-slate-700/50 mb-1">
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ modelValue.length }} / {{ options.length }} รายการ</span>
              <div class="flex gap-2">
                <button @mousedown.prevent="$emit('update:modelValue', options.map(o => o.value))"
                  class="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition">เลือกทั้งหมด</button>
                <span class="text-slate-200 dark:text-slate-600">|</span>
                <button @mousedown.prevent="$emit('update:modelValue', [])"
                  class="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition">ล้าง</button>
              </div>
            </div>

            <ListboxOption
              v-for="opt in options" :key="opt.value" :value="opt.value"
              v-slot="{ active, selected }"
              class="relative cursor-pointer select-none">
              <div :class="[
                active ? 'bg-blue-50 dark:bg-blue-900/30' : '',
                'flex items-center gap-3 py-2.5 px-3 transition-colors'
              ]">
                <!-- Checkbox visual -->
                <div :class="[
                  selected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500',
                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all'
                ]">
                  <CheckIcon v-if="selected" class="w-2.5 h-2.5 text-white stroke-3" />
                </div>
                <component v-if="icon" :is="icon" :class="[selected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500', 'w-4 h-4 shrink-0']" />
                <span :class="[selected ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-200']" class="truncate">{{ opt.label }}</span>
              </div>
            </ListboxOption>

          </ListboxOptions>
        </transition>
      </Teleport>

    </div>
  </Listbox>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options:    { type: Array, required: true },
  placeholder: { type: String, default: 'ทั้งหมด' },
  icon:       { type: [Object, null], default: null },
})

defineEmits(['update:modelValue'])

function labelOf(val) {
  return props.options.find(o => o.value === val)?.label ?? val
}

const wrapperRef = ref(null)
const dropdownStyle = ref({})

function computePos(isCurrentlyOpen) {
  if (isCurrentlyOpen) return
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const showAbove = spaceBelow < 260 && spaceAbove > spaceBelow
  dropdownStyle.value = {
    zIndex: 9999,
    minWidth: rect.width + 'px',
    maxHeight: '260px',
    left: rect.left + 'px',
    ...(showAbove
      ? { bottom: (window.innerHeight - rect.top + 4) + 'px' }
      : { top:    (rect.bottom + 4) + 'px' })
  }
}
</script>
