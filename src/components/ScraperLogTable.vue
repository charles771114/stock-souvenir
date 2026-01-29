<template>
  <div class="w-full">
    <div v-if="loading" class="py-12 flex flex-col items-center gap-4">
      <div class="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-indigo-300 uppercase tracking-widest">載入記錄中...</p>
    </div>

    <div v-else-if="logs.length === 0" class="py-12 text-center">
      <div
        class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
        <svg class="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">尚無執行記錄</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full border-separate border-spacing-0">
          <thead>
            <tr class="bg-slate-50/50">
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                執行時間</th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                來源來源</th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                狀態</th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                抓取筆數</th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                訊息</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="log in logs" :key="log.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-600 font-mono">
                {{ formatDate(log.executed_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-xs font-black text-slate-700">{{ log.source?.source_name || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="['px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-widest', getStatusClass(log.status)]">
                  {{ getStatusText(log.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-xs font-black text-slate-700">{{ log.items_scraped || 0 }}</span>
              </td>
              <td class="px-6 py-4 max-w-xs">
                <div class="text-[10px] font-bold text-slate-400 truncate group-hover:text-slate-600 transition-colors"
                  :title="log.error_message">
                  {{ log.error_message || '-' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="md:hidden space-y-3">
        <div v-for="log in logs" :key="log.id" class="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
              {{ formatDate(log.executed_at) }}
            </div>
            <span
              :class="['px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-widest', getStatusClass(log.status)]">
              {{ getStatusText(log.status) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-xs font-black text-slate-700">{{ log.source?.source_name || '-' }}</div>
            <div class="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{{ log.items_scraped ||
              0 }} 筆資料</div>
          </div>
          <div v-if="log.error_message"
            class="mt-2 text-[10px] font-bold text-rose-400 bg-rose-50/50 p-2 rounded-xl italic">
            {{ log.error_message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const getStatusClass = (status) => {
  const classes = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    failed: 'bg-rose-50 text-rose-600 border-rose-100',
    running: 'bg-sky-50 text-sky-600 border-sky-100',
  }
  return classes[status] || 'bg-slate-50 text-slate-400 border-slate-100'
}

const getStatusText = (status) => {
  const texts = {
    success: '成功 (SUCCESS)',
    failed: '失敗 (FAILED)',
    running: '執行中 (RUNNING)',
  }
  return texts[status] || status.toUpperCase()
}
</script>
