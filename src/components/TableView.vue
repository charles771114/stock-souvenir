<template>
  <div class="w-full">
    <!-- Mobile List Layout (Visible on small screens) -->
    <div class="md:hidden space-y-4">
      <div v-for="item in items" :key="item.id" 
        class="glass-card rounded-[1.5rem] p-4 flex items-center justify-between gap-4 animate-fade-in-up"
        :class="{ 'bg-green-50/50 border-green-200': item.isInInventory }"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {{ item.code }}
            </span>
            <span v-if="item.isInInventory" class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              已入庫
            </span>
          </div>
          <h3 class="text-sm font-black text-slate-900 truncate mb-1">
            {{ item.name }}
          </h3>
          <p class="text-[11px] text-slate-600 font-medium line-clamp-1 mb-2">
            {{ item.souvenir }}
          </p>
          
          <!-- Dates Row (Mobile) -->
          <div class="flex items-center gap-3 mt-1 pt-2 border-t border-slate-100/50">
            <div class="flex flex-col">
              <span class="text-[8px] uppercase font-black text-slate-400 tracking-tighter">最後買進</span>
              <span class="text-[10px] font-black font-mono" :class="isExpired(item.lastBuy) ? 'text-rose-400 line-through' : 'text-emerald-600'">
                {{ item.lastBuy || '-' }}
              </span>
            </div>
            <div class="w-px h-4 bg-slate-200"></div>
            <div class="flex flex-col">
              <span class="text-[8px] uppercase font-black text-slate-400 tracking-tighter">開會日期</span>
              <span class="text-[10px] font-black font-mono text-slate-600">
                {{ item.meeting || '-' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-2 shrink-0">
          <span 
            class="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider"
            :class="getCategoryColor(item.categoryColor)"
          >
            {{ item.category }}
          </span>
          <FavoriteButton 
            v-if="!item.isInInventory"
            :gift="item" 
            :is-active="item.isCollected"
            @toggle="$emit('toggle-collection', item)"
          />
          <router-link v-else to="/inventory" class="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Desktop Table Layout (Visible on md and up) -->
    <div class="hidden md:block overflow-hidden rounded-[2rem] border border-slate-200 shadow-2xl bg-white/80 backdrop-blur-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-indigo-50/50 border-b border-indigo-100/50">
              <th class="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60">代號</th>
              <th class="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60">名稱</th>
              <th class="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60">分類</th>
              <th class="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60 w-1/3">紀念品</th>
              <th class="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60 text-right">最後買進</th>
              <th class="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/60 text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="item in items" 
              :key="item.id"
              class="group hover:bg-indigo-50/30 transition-colors duration-200"
              :class="{ 'bg-green-50/20': item.isInInventory }"
            >
              <td class="py-5 px-6">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    {{ item.code }}
                  </span>
                  <span v-if="item.isInInventory" class="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                </div>
              </td>
              <td class="py-5 px-6">
                <div class="text-sm font-black text-slate-800">{{ item.name }}</div>
              </td>
              <td class="py-5 px-6">
                <span class="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider" :class="getCategoryColor(item.categoryColor)">
                  {{ item.category }}
                </span>
              </td>
              <td class="py-5 px-6">
                <div class="text-sm text-slate-600 font-medium line-clamp-1" :title="item.souvenir">{{ item.souvenir }}</div>
              </td>
              <td class="py-5 px-6 text-right">
                <div class="flex flex-col items-end">
                  <span class="font-mono text-sm font-black" :class="isExpired(item.lastBuy) ? 'text-slate-400 line-through' : 'text-emerald-600'">
                    {{ item.lastBuy || '-' }}
                  </span>
                </div>
              </td>
              <td class="py-5 px-6 text-center">
                <router-link v-if="item.isInInventory" to="/inventory"
                  class="p-2 inline-flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </router-link>
                <FavoriteButton v-else :gift="item" :is-active="item.isCollected" @toggle="$emit('toggle-collection', item)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import FavoriteButton from './FavoriteButton.vue'

defineProps({
  items: Array,
  isExpired: Function,
})

defineEmits(['toggle-collection'])

const getCategoryColor = (color) => {
    const map = {
        gray: 'bg-gray-50 text-gray-600 border-gray-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        pink: 'bg-pink-50 text-pink-700 border-pink-200',
    }
    return map[color] || map['gray']
}
</script>
