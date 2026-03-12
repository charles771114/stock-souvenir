<template>
  <div class="group relative bg-white rounded-card border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full"
    :class="{ 'bg-status-success/5 border-status-success/10': gift.isInInventory }">
    <!-- Category Indicator (Left Border) -->
    <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="getCategoryBorderClass(gift.categoryColor)"></div>


    <!-- Card Content -->
    <div class="p-4 sm:p-6 flex-1 flex flex-col relative z-20">
      <!-- Top Identifier Row -->
      <div class="flex flex-col gap-3 mb-4">
        <div class="flex items-start justify-between gap-4">
          <div class="text-[12px] sm:text-sm font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border uppercase tracking-widest shadow-sm shrink-0"
            :class="getCategoryStyles(gift.categoryColor).badge"
            aria-label="紀念品分類">
            <i :class="getCategoryIcon(gift.category)" class="mr-1.5 sm:mr-2 text-sm sm:text-base"></i>
            {{ gift.category }}
          </div>
          
          <div class="flex flex-col items-end gap-1.5 min-w-0">
            <span class="font-mono text-sm sm:text-base font-black text-slate-400 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl uppercase tracking-widest border border-slate-100/50 whitespace-nowrap">
              {{ gift.code }}
            </span>
            <!-- Integrated Inventory Badge -->
            <div v-if="gift.isInInventory"
              class="px-2.5 py-1 bg-emerald-600 text-white text-[11px] sm:text-xs font-black rounded-lg shadow-md flex items-center gap-1 border border-emerald-400/30 whitespace-nowrap">
              <i class="ri-checkbox-circle-fill text-xs"></i>
              在庫存中
            </div>
          </div>
        </div>
        
        <div v-if="gift.isCollected && !gift.isInInventory" 
              class="w-fit text-[11px] sm:text-sm font-black text-white bg-[#B8860B] px-2.5 sm:px-3 py-1 rounded-full shadow-lg shadow-amber-100 flex items-center gap-1.5 uppercase tracking-widest">
          <i class="ri-heart-fill text-xs sm:text-sm"></i>
          已在追蹤清單
        </div>
      </div>

      <!-- Portfolio Badges (Refined) -->
      <div v-if="gift.collectedPortfolios && gift.collectedPortfolios.length > 0" 
        class="flex flex-wrap gap-2 mb-4">
        <div v-for="port in gift.collectedPortfolios" :key="port.id"
          class="px-2 py-1 rounded-lg text-xs sm:text-sm font-black border transition-all hover:scale-105 cursor-help uppercase tracking-widest shadow-sm"
          :class="port.status === 'holding' ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-100' : 'bg-brand-primary text-white border-brand-primary/20 shadow-brand-primary/10'"
          :title="`${port.name} (${port.status === 'holding' ? '在庫存中' : '追蹤中'})`"
        >
          {{ port.initial }}
        </div>
      </div>

      <!-- Main Text Area -->
      <div class="mb-5 sm:mb-6">
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2 sm:mb-3 truncate" :title="gift.name">
          {{ gift.name }}
        </h3>
        <p class="text-sm sm:text-base text-slate-600 font-bold line-clamp-2 leading-relaxed h-[2.8rem] sm:h-[3rem]" :title="gift.souvenir">
          {{ gift.souvenir || '尚未公布' }}
        </p>
        <!-- Previous Year -->
        <p v-if="gift.previousYearSouvenir" 
          class="text-base text-slate-400 italic mt-3 flex items-center gap-2 font-medium"
          :title="`去年紀念品：${gift.previousYearSouvenir}`">
          <i class="ri-history-line text-base opacity-70"></i>
          <span class="truncate">去年：{{ gift.previousYearSouvenir }}</span>
        </p>
      </div>

      <!-- Action Row -->
      <div class="mt-auto pt-5 sm:pt-6 border-t border-slate-50 flex flex-col gap-5 sm:gap-6">
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div class="flex flex-col">
            <p class="text-[10px] sm:text-sm uppercase tracking-widest text-slate-400 font-black mb-1 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
              <i class="ri-calendar-event-line opacity-60"></i>最後買進
            </p>
            <div class="flex items-center">
              <span class="font-mono text-sm sm:text-base font-black"
                :class="isExpired(gift.lastBuy) ? 'text-slate-300 line-through' : 'text-emerald-700'">
                {{ gift.lastBuy || '-' }}
              </span>
              <span v-if="!isExpired(gift.lastBuy) && isUrgent(gift.lastBuy)" class="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative ml-1.5 sm:ml-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-500"></span>
              </span>
            </div>
          </div>

          <div class="flex flex-col text-right items-end">
            <p class="text-[10px] sm:text-sm uppercase tracking-widest text-slate-400 font-black mb-1 sm:mb-2 flex items-center gap-1 sm:gap-1.5 justify-end">
              股東會<i class="ri-community-line opacity-60"></i>
            </p>
            <span class="font-mono text-sm sm:text-base text-slate-600 font-black">
              {{ gift.meeting || '-' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <FavoriteButton 
            :gift="gift" 
            :is-active="gift.isCollected" 
            :is-in-inventory="gift.isInInventory"
            :disabled="disabled"
            :loading="processingIds.has(gift.id)"
            :inventory-loading="inventoryProcessingIds.has(gift.id)"
            @toggle="$emit('toggle-collection', gift)"
            @toggle-inventory="$emit('toggle-inventory', gift)"
            class="flex-1 py-3 text-base"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { getCategoryIcon, getCategoryStyles } from '@/utils/categoryUtils'
import FavoriteButton from './FavoriteButton.vue'

// Helper to check urgency (within 7 days)
function isUrgent(dateString) {
  if (!dateString) return false
  const target = new Date(dateString)
  const now = new Date()
  const diffTime = target - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

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
  },
  processingIds: {
    type: Object, // Set
    default: () => new Set()
  },
  inventoryProcessingIds: {
    type: Object, // Set
    default: () => new Set()
  }
})

defineEmits(['toggle-collection', 'toggle-inventory'])

// Helpers for Category Border - Use Centralized Utility
const getCategoryBorderClass = (color) => {
    return getCategoryStyles(color).border
}
</script>
