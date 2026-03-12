<template>
  <div class="w-full">
    <!-- Mobile List Layout (Visible on small screens) -->
    <div class="md:hidden space-y-4">
      <div v-for="item in items" :key="item.id" 
        class="glass-card rounded-[1.5rem] p-4 flex flex-col gap-4 animate-fade-in-up"
      >
        <!-- Top Section: Category & Code & Action -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-mono text-sm font-black text-brand-primary bg-slate-50 px-2.5 py-1 rounded-lg shrink-0">
              {{ item.code }}
            </span>
            <span 
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black border uppercase tracking-widest shadow-sm whitespace-nowrap overflow-hidden"
              :class="getCategoryStyles(item.categoryColor).badge"
            >
              <i :class="getCategoryIcon(item.category)" class="text-base shrink-0"></i>
              <span class="truncate">{{ item.category }}</span>
            </span>
          </div>
          
          <!-- Quick Status Portfolios Initials -->
          <div v-if="item.collectedPortfolios && item.collectedPortfolios.length > 0" 
            class="flex items-center gap-1.5 shrink-0 ml-auto">
            <div v-for="port in item.collectedPortfolios" :key="port.id"
              class="w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-black border"
              :class="port.status === 'holding' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-brand-primary text-white border-brand-primary/20'"
              :title="port.name"
            >
              {{ port.initial }}
            </div>
          </div>
        </div>

        <!-- Middle Section: Name & Souvenir -->
        <div class="flex flex-col gap-2 min-w-0">
          <h3 class="text-xl font-black text-slate-900 truncate leading-tight">
            {{ item.name }}
          </h3>
          <p class="text-sm text-slate-600 font-bold line-clamp-2 leading-relaxed">
            {{ item.souvenir || '尚未公布' }}
          </p>
          <!-- Previous Year Reference -->
          <p v-if="item.previousYearSouvenir" 
            class="text-[13px] text-slate-400 italic flex items-center gap-1.5"
            :title="`去年紀念品：${item.previousYearSouvenir}`">
            <i class="ri-history-line text-sm opacity-60"></i>
            <span class="truncate">去年：{{ item.previousYearSouvenir }}</span>
          </p>
        </div>
        
        <!-- Bottom Section: Dates & Action Buttons -->
        <div class="mt-2 pt-4 border-t border-slate-100/50 flex flex-wrap items-end justify-between gap-4">
          <div class="flex items-center gap-5">
            <div class="flex flex-col">
              <span class="text-[11px] uppercase font-black text-slate-400 tracking-widest mb-1 flex items-center gap-1">
                最後買進
              </span>
              <span class="text-sm font-black font-mono tracking-tight" :class="isExpired(item.lastBuy) ? 'text-slate-300 line-through' : 'text-emerald-700'">
                {{ item.lastBuy || '-' }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] uppercase font-black text-slate-400 tracking-widest mb-1 flex items-center gap-1">
                開會日期
              </span>
              <span class="text-sm font-black font-mono text-slate-600 tracking-tight">
                {{ item.meeting || '-' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="shrink-0 scale-95 origin-right">
            <FavoriteButton 
              :gift="item" 
              :is-active="item.isCollected"
              :is-in-inventory="item.isInInventory"
              :disabled="disabled"
              :loading="processingIds.has(item.id)"
              :inventory-loading="inventoryProcessingIds.has(item.id)"
              @toggle="$emit('toggle-collection', item)"
              @toggle-inventory="$emit('toggle-inventory', item)"
              :class="{ 'opacity-30 grayscale pointer-events-none': disabled }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Table Layout (Visible on md and up) -->
    <div class="hidden md:block overflow-hidden rounded-[2rem] border border-slate-200 shadow-2xl bg-white/80 backdrop-blur-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-separate border-spacing-0">
          <thead class="sticky top-0 z-10 bg-slate-50 shadow-sm">
            <tr>
              <th @click="$emit('sort', 'code')" class="py-5 px-8 text-[13px] font-black uppercase tracking-widest text-slate-500 cursor-pointer group/th border-b border-slate-200 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  代號
                  <div class="flex flex-col transition-opacity" :class="sortBy.includes('code') ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'">
                    <i class="ri-arrow-up-s-line text-sm" :class="sortBy === 'code_asc' ? 'text-brand-primary' : 'text-slate-300'"></i>
                    <i class="ri-arrow-down-s-line text-sm" :class="sortBy === 'code_desc' ? 'text-brand-primary' : 'text-slate-300'"></i>
                  </div>
                </div>
              </th>
              <th class="py-5 px-8 text-[13px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 min-w-[120px]">名稱</th>
              <th class="py-5 px-8 text-[13px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">分類</th>
              <th class="py-5 px-8 text-[13px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 w-full min-w-[200px]">紀念品</th>
              <th @click="$emit('sort', 'date')" class="py-5 px-8 text-[13px] font-black uppercase tracking-widest text-slate-500 text-right cursor-pointer group/th border-b border-slate-200">
                <div class="flex items-center justify-end gap-2">
                  <div class="flex flex-col transition-opacity" :class="sortBy.includes('date') ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'">
                    <i class="ri-arrow-up-s-line text-sm" :class="sortBy === 'date_asc' ? 'text-brand-primary' : 'text-slate-300'"></i>
                    <i class="ri-arrow-down-s-line text-sm" :class="sortBy === 'date_desc' ? 'text-brand-primary' : 'text-slate-300'"></i>
                  </div>
                  最後買進
                </div>
              </th>
              <th class="py-5 px-8 text-[13px] font-black uppercase tracking-widest text-slate-500 text-center border-b border-slate-200">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="item in items" 
              :key="item.id"
              class="group hover:bg-indigo-50/30 transition-colors duration-200"
            >
              <td class="py-6 px-8">
                <div class="flex flex-col gap-2">
                  <span class="font-mono text-sm font-black text-slate-400">{{ item.code }}</span>
                </div>
              </td>
              <td class="py-6 px-8 whitespace-nowrap">
                <div class="text-base font-black text-slate-800">{{ item.name }}</div>
                <!-- Aggregate Status (Desktop Table) -->
                <div v-if="item.collectedPortfolios && item.collectedPortfolios.length > 0" 
                  class="flex flex-wrap gap-2 mt-2">
                  <div v-for="port in item.collectedPortfolios" :key="port.id"
                    class="px-2 py-0.5 rounded-lg text-sm font-black border cursor-help shadow-sm transition-all hover:scale-105"
                    :class="port.status === 'holding' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-brand-primary text-white border-brand-primary/20'"
                    :title="`${port.name} (${port.status === 'holding' ? '在庫存中' : '追蹤中'})`"
                  >
                    {{ port.initial }}
                  </div>
                </div>
              </td>
              <td class="py-6 px-8">
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black border uppercase tracking-widest shadow-sm whitespace-nowrap" :class="getCategoryStyles(item.categoryColor).badge">
                  <i :class="getCategoryIcon(item.category)" class="text-base"></i>
                  {{ item.category }}
                </span>
              </td>
              <td class="py-6 px-8">
                <div class="text-sm text-slate-800 font-bold line-clamp-1" :title="item.souvenir">
                  {{ item.souvenir || '尚未公布' }}
                </div>
                <!-- Previous Year Reference -->
                <div v-if="item.previousYearSouvenir" 
                  class="text-sm text-slate-400 italic mt-1.5 flex items-center gap-2"
                  :title="`去年紀念品：${item.previousYearSouvenir}`">
                  <i class="ri-history-line text-base opacity-60"></i>
                  <span class="truncate">去年：{{ item.previousYearSouvenir }}</span>
                </div>
              </td>
              <td class="py-6 px-8 text-right">
                <div class="flex flex-col items-end">
                  <span class="font-mono text-sm font-black whitespace-nowrap" :class="isExpired(item.lastBuy) ? 'text-slate-300 line-through' : 'text-emerald-700'">
                    {{ item.lastBuy || '-' }}
                  </span>
                </div>
              </td>
              <td class="py-6 px-8 text-center min-w-[240px] whitespace-nowrap">
                <FavoriteButton :gift="item" :is-active="item.isCollected" 
                  :is-in-inventory="item.isInInventory"
                  :disabled="disabled"
                  :loading="processingIds.has(item.id)"
                  :inventory-loading="inventoryProcessingIds.has(item.id)"
                  @toggle="$emit('toggle-collection', item)" 
                  @toggle-inventory="$emit('toggle-inventory', item)"
                  :class="{ 'opacity-30 grayscale pointer-events-none': disabled }"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCategoryIcon, getCategoryStyles } from '@/utils/categoryUtils'
import FavoriteButton from './FavoriteButton.vue'

defineProps({
  items: Array,
  isExpired: Function,
  disabled: Boolean,
  sortBy: String,
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

</script>
