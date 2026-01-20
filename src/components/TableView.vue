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
            :key="item.code"
            class="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-200"
          >
            <!-- 代號 (Code) -->
            <td class="py-4 px-6">
              <span class="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                {{ item.code }}
              </span>
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
              <FavoriteButton 
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
