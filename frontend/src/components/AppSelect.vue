<template>
  <Listbox v-slot="{ open }" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div class="relative" ref="wrapperRef">
      <ListboxButton
        @click="computePos(open)"
        class="relative w-full cursor-pointer rounded-xl bg-white border border-slate-300 py-3 pl-4 pr-10 text-left text-sm shadow-sm transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :class="{ 'bg-slate-50!': !modelValue }">
        <span class="flex items-center gap-2.5 truncate">
          <component v-if="selectedOption?.icon" :is="selectedOption.icon" class="w-5 h-5 text-slate-400 shrink-0" />
          <span v-else-if="icon">
            <component :is="icon" class="w-5 h-5 text-slate-400 shrink-0" />
          </span>
          <span :class="modelValue !== '' && modelValue !== null ? 'text-slate-800' : 'text-slate-400'">
            {{ selectedOption?.label || placeholder }}
          </span>
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronUpDownIcon class="w-5 h-5 text-slate-400" />
        </span>
      </ListboxButton>

      <Teleport to="body">
        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100">
          <ListboxOptions
            v-if="open"
            static
            class="fixed max-h-60 overflow-auto rounded-xl bg-white py-1 text-sm shadow-2xl ring-1 ring-black/5 focus:outline-none"
            :style="dropdownStyle">
            <ListboxOption v-if="placeholder && allowEmpty"
              :value="emptyValue"
              v-slot="{ active }"
              class="relative cursor-pointer select-none">
              <div :class="[active ? 'bg-blue-50 text-blue-700' : 'text-slate-400', 'flex items-center gap-2.5 py-2.5 px-4']">
                <span class="w-5 h-5 shrink-0"></span>
                {{ placeholder }}
              </div>
            </ListboxOption>
            <ListboxOption
              v-for="opt in options" :key="opt.value" :value="opt.value"
              v-slot="{ active, selected }"
              class="relative cursor-pointer select-none">
              <div :class="[
                active ? 'bg-blue-50' : '',
                selected ? 'bg-blue-50/50 font-semibold' : '',
                'flex items-center gap-2.5 py-2.5 px-4 transition-colors'
              ]">
                <component v-if="opt.icon" :is="opt.icon" :class="[selected ? 'text-blue-600' : 'text-slate-400', 'w-5 h-5 shrink-0']" />
                <span v-else-if="icon">
                  <component :is="icon" :class="[selected ? 'text-blue-600' : 'text-slate-400', 'w-5 h-5 shrink-0']" />
                </span>
                <span :class="[selected ? 'text-blue-700' : 'text-slate-700']">{{ opt.label }}</span>
                <CheckIcon v-if="selected" class="w-4 h-4 text-blue-600 ml-auto shrink-0" />
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
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'เลือก...' },
  icon: { type: [Object, null], default: null },
  allowEmpty: { type: Boolean, default: true },
  emptyValue: { type: [String, Number], default: '' }
})

defineEmits(['update:modelValue'])

const wrapperRef = ref(null)
const dropdownStyle = ref({})

function computePos(isCurrentlyOpen) {
  // Called on click: open=false means it's about to open
  if (isCurrentlyOpen) return
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const dropdownMaxH = 240 // max-h-60

  const showAbove = spaceBelow < dropdownMaxH && spaceAbove > spaceBelow

  dropdownStyle.value = {
    zIndex: 9999,
    width: rect.width + 'px',
    left: rect.left + 'px',
    ...(showAbove
      ? { bottom: (window.innerHeight - rect.top + 4) + 'px' }
      : { top: (rect.bottom + 4) + 'px' })
  }
}

const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue))
</script>
