<template>
  <button
    @click.stop="$emit('toggle')"
    class="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
    :class="[
      isActive 
        ? 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100 focus:ring-pink-200' 
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-200'
    ]"
    :title="isActive ? '從清單移除' : '加入清單'"
  >
    <!-- Icon -->
    <svg 
      v-if="isActive"
      class="w-3.5 h-3.5 flex-shrink-0" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    
    <svg 
      v-else
      class="w-3.5 h-3.5 flex-shrink-0" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2.5" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>

    <!-- Text -->
    <span>{{ isActive ? '已收藏' : '加入清單' }}</span>
  </button>
</template>

<script setup>
defineProps({
  gift: Object,
  isActive: Boolean
})

defineEmits(['toggle'])
</script>
