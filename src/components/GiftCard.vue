<template>
  <div class="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
    :class="{ 'bg-green-50/50 border-green-200': gift.isInInventory }">
    <!-- Category Indicator (Left Border) -->
    <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="getCategoryBorderClass(gift.categoryColor)"></div>

    <!-- Inventory Badge (Top Right) -->
    <div v-if="gift.isInInventory"
      class="absolute top-2 right-2 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 z-10">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd" />
      </svg>
      已入庫
    </div>

    <!-- Card Content -->
    <div class="p-5 flex-1 flex flex-col">

      <!-- Header: Code & Action -->
      <div class="flex justify-between items-start mb-3 pl-2">
        <div class="flex items-center space-x-2">
          <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {{ gift.code }}
          </span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full border"
            :class="getCategoryBadgeClass(gift.categoryColor)">
            {{ gift.category }}
          </span>
        </div>

        <!-- Favorite Button (Hidden for inventory items) -->
        <button v-if="!gift.isInInventory" @click.stop="$emit('toggle-collection', gift)"
          :disabled="disabled"
          class="relative p-2 rounded-full transition-colors hover:bg-gray-50 focus:outline-none group/btn disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-all duration-300"
            :class="gift.isCollected ? 'text-rose-500 fill-current transform scale-110' : 'text-gray-300 hover:text-rose-400 group-hover/btn:scale-110'"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <!-- Company Name -->
      <h3 class="text-base sm:text-lg font-black text-gray-900 mb-1 pl-2 truncate" :title="gift.name">
        {{ gift.name }}
      </h3>

      <!-- Souvenir Name (Main Focus) -->
      <div class="pl-2 mb-4 flex-1">
        <p class="text-sm text-gray-600 font-medium line-clamp-2 leading-relaxed" :title="gift.souvenir">
          {{ gift.souvenir || '尚未公布' }}
        </p>
        <!-- Previous Year Reference -->
        <p v-if="gift.previousYearSouvenir" 
          class="text-xs text-gray-400 italic mt-1 flex items-center gap-1"
          :title="`去年紀念品：${gift.previousYearSouvenir}`">
          <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate">去年：{{ gift.previousYearSouvenir }}</span>
        </p>
      </div>

      <!-- Dates Footer -->
      <div class="mt-auto pt-4 border-t border-gray-50 pl-2">
        <div class="grid grid-cols-2 gap-4">
          <!-- Last Buy Date -->
          <div>
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">最後買進日</p>
            <div class="flex items-center">
              <span class="font-mono text-sm font-bold"
                :class="isExpired(gift.lastBuy) ? 'text-gray-400 line-through decoration-gray-300' : 'text-emerald-600'">
                {{ gift.lastBuy || '尚未公布' }}
              </span>
              <!-- Urgent Indicator (if within 7 days and not expired) -->
              <span v-if="!isExpired(gift.lastBuy) && isUrgent(gift.lastBuy)" class="flex h-2 w-2 relative ml-1.5">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <span v-if="isExpired(gift.lastBuy)" class="text-[10px] text-rose-500 font-medium block mt-0.5">已截止</span>
          </div>

          <!-- Meeting Date -->
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">開會日期</p>
            <span class="font-mono text-sm text-gray-600">
              {{ gift.meeting || '-' }}
            </span>
          </div>
        </div>

        <!-- Action Button -->
        <router-link v-if="gift.isInInventory" to="/inventory"
          class="mt-4 w-full inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          管理庫存
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  gift: {
    type: Object,
    required: true
  },
  isExpired: {
    type: Function,
    default: () => false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-collection'])

// Helper to check urgency (within 7 days)
const isUrgent = (dateString) => {
  if (!dateString) return false
  const target = new Date(dateString)
  const now = new Date()
  const diffTime = target - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

// Helpers for Dynamic Colors (Keep in line with ClassificationCenter logic)
const getCategoryBorderClass = (color) => {
    const map = {
        gray: 'bg-gray-400',
        red: 'bg-red-400',
        yellow: 'bg-yellow-400',
        green: 'bg-emerald-400',
        blue: 'bg-blue-400',
        indigo: 'bg-indigo-400',
        purple: 'bg-purple-400',
        pink: 'bg-pink-400',
    }
    return map[color] || 'bg-gray-300'
}

const getCategoryBadgeClass = (color) => {
    const map = {
        gray: 'text-gray-600 bg-gray-50 border-gray-100',
        red: 'text-red-700 bg-red-50 border-red-100',
        yellow: 'text-yellow-700 bg-yellow-50 border-yellow-100',
        green: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        blue: 'text-blue-700 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100',
        purple: 'text-purple-700 bg-purple-50 border-purple-100',
        pink: 'text-pink-700 bg-pink-50 border-pink-100',
    }
    return map[color] || map['gray']
}
</script>
