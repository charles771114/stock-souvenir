<template>
  <div class="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              代號
            </th>
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              名稱
            </th>
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              分類
            </th>
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/3">
              紀念品
            </th>
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
              最後買進日
            </th>
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
              開會日期
            </th>
            <th class="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr 
            v-for="item in items" 
            :key="item.id"
            class="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-200"
            :class="{ 'bg-green-50/40': item.isInInventory }"
          >
            <!-- 代號 (Code) -->
            <td class="py-4 px-6">
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                  {{ item.code }}
                </span>
                <!-- Inventory Badge -->
                <span v-if="item.isInInventory"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd" />
                  </svg>
                  已入庫
                </span>
              </div>
            </td>
            
            <!-- 名稱 (Name) -->
            <td class="py-4 px-6">
              <div class="text-sm font-bold text-slate-900 dark:text-slate-100">
                {{ item.name }}
              </div>
            </td>

            <!-- 分類 -->
            <td class="py-4 px-6">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                :class="getCategoryColor(item.categoryColor)"
              >
                {{ item.category }}
              </span>
            </td>

            <!-- 紀念品 -->
            <td class="py-4 px-6">
              <div class="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2" :title="item.souvenir">
                {{ item.souvenir }}
              </div>
            </td>

            <!-- 最後買進日 -->
            <td class="py-4 px-6 text-right">
              <div class="inline-flex flex-col items-end">
                <span 
                  class="font-mono text-sm font-bold"
                  :class="isExpired(item.lastBuy) ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'"
                >
                  {{ item.lastBuy || '尚未公布' }}
                </span>
                <span v-if="isExpired(item.lastBuy)" class="text-[10px] text-rose-500 font-medium">
                  已截止
                </span>
              </div>
            </td>

            <!-- 開會日期 (Added) -->
            <td class="py-4 px-6 text-right">
              <span class="font-mono text-sm text-slate-600 dark:text-slate-400">
                {{ item.meeting || '-' }}
              </span>
            </td>

            <!-- 操作 -->
            <td class="py-4 px-6 text-center">
              <router-link v-if="item.isInInventory" to="/inventory"
                class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                管理
              </router-link>
              <FavoriteButton v-else
                :gift="item" 
                :is-active="item.isCollected"
                @toggle="$emit('toggle-collection', item)"
              />
            </td>
          </tr>
        </tbody>
      </table>
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
