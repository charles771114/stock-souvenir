<template>
  <div class="w-full">
    <div v-if="loading" class="py-12 flex flex-col items-center gap-4">
      <div class="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-indigo-300 uppercase tracking-widest animate-pulse">載入記錄中...</p>
    </div>

    <div v-else-if="logs.length === 0" class="py-12 text-center">
      <div
        class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 italic">
        <svg class="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">目前尚無執行紀錄</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-separate border-spacing-0">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">執行時間</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">狀態</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">處理筆數</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">異動摘要</th>
            <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">完整日誌</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
            <tr v-for="log in logs" :key="log.id" class="group hover:bg-slate-50/50 transition-all duration-300">
                <td class="px-6 py-5 whitespace-nowrap text-[11px] text-slate-400 font-black font-mono">
                    {{ formatDate(log.executed_at || log.created_at) }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border"
                        :class="getStatusClass(log.status)">
                        {{ getStatusText(log.status) }}
                    </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                    <div class="text-xs font-black text-slate-700">
                        {{ log.items_scraped || log.items_processed || 0 }} <span class="text-[10px] text-slate-400 font-bold">筆</span>
                    </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <span v-if="log.items_added > 0" class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">+{{ log.items_added }}</span>
                        <span v-if="log.items_updated > 0" class="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">~{{ log.items_updated }}</span>
                        <span v-if="!(log.items_added > 0 || log.items_updated > 0)" class="text-[10px] font-bold text-slate-300 tracking-widest italic">無異動</span>
                    </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-right">
                    <button @click="selectedLog = log" 
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 hover:shadow-sm transition-all shadow-sm active:scale-95 group-hover:border-slate-200">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        查看詳情
                    </button>
                </td>
            </tr>
        </tbody>
      </table>
    </div>

    <!-- Terminal Style Modal -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="selectedLog" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md" @click.self="selectedLog = null">
                <div class="w-full max-w-4xl bg-[#1e1e1e] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-modal-in">
                    <!-- Terminal Header -->
                    <div class="flex items-center justify-between px-6 py-4 bg-[#252526] border-b border-white/5">
                        <div class="flex items-center gap-3">
                            <div class="flex gap-1.5">
                                <div class="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner shadow-black/20"></div>
                                <div class="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner shadow-black/20"></div>
                                <div class="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner shadow-black/20"></div>
                            </div>
                            <div class="h-4 w-px bg-white/10 mx-1"></div>
                            <span class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-mono">gooddie-scraper.log</span>
                        </div>
                        <button @click="selectedLog = null" class="text-white/30 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Terminal Body -->
                    <div class="flex-1 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed custom-scrollbar bg-[#1e1e1e]">
                        <div v-for="(line, idx) in formattedMessage" :key="idx" class="flex gap-4 group hover:bg-white/5 transition-colors">
                            <span class="text-white/10 select-none w-8 text-right shrink-0 font-bold">{{ idx + 1 }}</span>
                            <span :class="getLineColor(line)" class="break-all whitespace-pre-wrap flex-1">{{ line }}</span>
                        </div>
                    </div>

                    <!-- Terminal Footer -->
                    <div class="px-6 py-3 bg-[#252526] border-t border-white/5 flex items-center justify-between">
                        <div class="flex items-center gap-4 text-[10px] font-bold text-white/20 tracking-wider">
                            <span class="hover:text-white/40 cursor-default transition-colors">UTF-8</span>
                            <span class="hover:text-white/40 cursor-default transition-colors">GOODDIE_SYNC</span>
                        </div>
                        <div class="text-[10px] font-bold text-white/20 tracking-wider uppercase flex items-center gap-2">
                             <div class="w-2 h-2 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                                <div class="w-1 h-1 rounded-full bg-emerald-500"></div>
                             </div>
                             Lines: {{ formattedMessage.length }}
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const selectedLog = ref(null)

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

const formattedMessage = computed(() => {
    if (!selectedLog.value || !selectedLog.value.message) return []
    return selectedLog.value.message.split('\n')
})

const getLineColor = (line) => {
    if (line.includes('[Error]') || line.toLowerCase().includes('failed') || line.includes('error')) return 'text-[#ff5f56]'
    if (line.includes('[New]') || line.toLowerCase().includes('success')) return 'text-[#27c93f]'
    if (line.includes('[Updated]')) return 'text-indigo-400'
    if (line.toLowerCase().includes('step')) return 'text-[#ffbd2e]'
    if (line.includes('http')) return 'text-[#3794ff] opacity-80'
    return 'text-white/70'
}

const getStatusClass = (status) => {
  const classes = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    failed: 'bg-rose-50 text-rose-600 border-rose-100',
    error: 'bg-rose-50 text-rose-600 border-rose-100',
    running: 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse',
  }
  return classes[status] || 'bg-slate-50 text-slate-400 border-slate-100'
}

const getStatusText = (status) => {
  const texts = {
    success: 'SUCCESS',
    failed: 'FAILED',
    error: 'FAILED',
    running: 'RUNNING',
  }
  return texts[status] || status?.toUpperCase() || 'UNKNOWN'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes modal-in {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.animate-modal-in {
    animation: modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
