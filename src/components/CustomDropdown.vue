<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- Trigger -->
    <button @click="isOpen = !isOpen" type="button"
      class="group flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-indigo-50"
      :class="[
        isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100',
        customClass
      ]">
      <div class="flex items-center gap-2">
        <i v-if="icon" :class="icon" class="text-brand-primary text-base"></i>
        <span class="text-sm font-black text-slate-700 whitespace-nowrap">
          {{ selectedLabel }}
        </span>
      </div>
      
      <!-- Chevron -->
      <i class="ri-arrow-down-s-line text-slate-300 transition-transform duration-300"
        :class="{ 'rotate-180 text-indigo-400': isOpen }"></i>
    </button>

    <!-- Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div v-if="isOpen"
        class="absolute left-0 lg:right-0 lg:left-auto z-[100] mt-2 w-48 origin-top-right bg-white rounded-2xl shadow-2xl ring-1 ring-slate-100 focus:outline-none overflow-hidden p-1.5"
        :style="{ zIndex: 100 }">
        <div class="max-h-60 overflow-y-auto no-scrollbar">
          <button v-for="option in options" :key="option.value"
            @click="handleSelect(option)"
            class="flex items-center w-full px-4 py-3 rounded-xl transition-all text-left group/opt"
            :class="modelValue === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'">
            <span class="text-sm font-black tracking-tight"
              :class="modelValue === option.value ? 'text-indigo-900' : 'group-hover/opt:text-indigo-600'">
              {{ option.label }}
            </span>
            <i v-if="modelValue === option.value" class="ri-check-line ml-auto text-indigo-500 font-bold"></i>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    required: true // [{ label: string, value: any }]
  },
  icon: String,
  placeholder: String,
  customClass: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? selected.label : props.placeholder || '請選擇'
})

const handleSelect = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
