<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/admin/panel"
              class="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest leading-none">
              <div
                class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 shadow-sm transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              管理主頁
            </router-link>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter mb-2">
            爬蟲管理中心
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            監控並執行自動化數據抓取任務
          </p>
        </div>
      </div>

      <!-- Scraper Sources Grid -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6 px-2">
          <h2 class="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            使用中來源
          </h2>
          <div class="h-px flex-1 bg-indigo-50/50"></div>
          <span
            class="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">總計:
            1</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-100">
           <!-- Gooddie Scraper Card (Hardcoded) -->
          <div class="glass-card p-6 flex flex-col group hover:border-indigo-200 transition-all active:scale-[0.98]">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center gap-4">
                <div
                  class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  G
                </div>
                <div>
                  <h3 class="text-lg font-black text-slate-800 tracking-tight">股代 (Gooddie)</h3>
                  <div
                    class="text-[10px] text-indigo-400 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-lg inline-block w-fit truncate max-w-[150px]"
                    title="https://www.gooddie.tw">
                    https://www.gooddie.tw
                  </div>
                </div>
              </div>
              <span class="px-3 py-1 text-[10px] font-black rounded-xl border flex items-center gap-1.5 transition-all bg-emerald-50 text-emerald-600 border-emerald-100">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                啟用中
              </span>
            </div>

            <div class="space-y-4 mb-6">
              <div
                class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>最後更新時間</span>
                <span class="text-slate-600 font-mono">{{ lastRunTime }}</span>
              </div>
              <div class="h-1 bg-slate-50 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 rounded-full w-full opacity-20"></div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-auto">
              <button @click="handleTriggerScraper" :disabled="running"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50">
                <svg class="w-5 h-5" :class="{ 'animate-spin': running }" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="text-[8px] font-black mt-1 uppercase tracking-tighter">{{ running ? '執行中...' : '執行爬蟲' }}</span>
              </button>
              
              <!-- Real-time Status Indicator -->
              <div v-if="running && currentStatus" 
                class="col-span-2 mt-4 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 animate-pulse">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">目前進度</span>
                </div>
                <p class="text-[11px] font-bold text-slate-600 leading-snug">{{ currentStatus }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scraper Logs -->
      <div>
        <div class="flex items-center gap-3 mb-6 px-2">
          <h2 class="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            執行紀錄
          </h2>
          <div class="h-px flex-1 bg-indigo-50/50"></div>
          <button @click="fetchLogs"
            class="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline hover:scale-105 transition-all">重新整理日誌</button>
        </div>

        <div class="glass-card overflow-hidden animate-fade-in-up delay-200 p-0">
          <ScraperLogTable :logs="mappedLogs" :loading="loading" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import ScraperLogTable from '@/components/ScraperLogTable.vue'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import { useGifts } from '@/composables/useGifts'
import { onMounted, ref, computed } from 'vue'
import Swal from 'sweetalert2'

const { showToast } = useToast()
const { clearGiftsCache } = useGifts()
const running = ref(false)
const loading = ref(false)
const logs = ref([])
const currentStatus = ref('')
let pollInterval = null

const startPolling = () => {
    if (pollInterval) return
    pollInterval = setInterval(async () => {
        await fetchLogs(true) // Pass silent flag to not show loading spinner
        if (logs.value.length > 0 && logs.value[0].status === 'running') {
            currentStatus.value = logs.value[0].message?.split('\n').pop() || '處理中...'
        } else {
            stopPolling()
        }
    }, 3000)
}

const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
    }
}

const lastRunTime = computed(() => {
    // Look for the last successful or failed (not running) log
    const completedLog = logs.value.find(l => l.status !== 'running')
    if (completedLog) {
        return new Date(completedLog.created_at).toLocaleString('zh-TW', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        })
    }
    return '從未執行'
})

const mappedLogs = computed(() => {
    return logs.value.map(log => ({
        id: log.id,
        executed_at: log.created_at,
        status: log.status === 'error' ? 'failed' : log.status,
        items_scraped: log.items_processed,
        items_added: log.items_added,
        items_updated: log.items_updated,
        message: log.message
    }))
})

const fetchLogs = async (silent = false) => {
    if (!silent) loading.value = true
    const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
    
    if (error) {
        console.error('Error fetching logs:', error)
    } else {
        logs.value = data
    }
    if (!silent) loading.value = false
}

const handleTriggerScraper = async () => {
    const result = await Swal.fire({
        title: '確定要啟動爬蟲嗎？',
        text: '這將會模擬登入並從 Gooddie 抓取 2026 年的紀念品資料，過程約需數分鐘。',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '立即執行',
        cancelButtonText: '暫時不要',
        reverseButtons: true,
        confirmButtonColor: '#4f46e5',
        customClass: {
            popup: 'rounded-[2rem] border-none shadow-2xl',
            confirmButton: 'rounded-xl font-black px-6 py-3',
            cancelButton: 'rounded-xl font-black px-6 py-3'
        }
    })

    if (!result.isConfirmed) return

    running.value = true
    currentStatus.value = '正在啟動爬蟲函數...'
    startPolling()
    
    try {
        const { data, error } = await supabase.functions.invoke('gooddie-scraper', {
            method: 'POST'
        })
        
        if (error) throw error
        
        // 爬蟲結束後清除快取
        clearGiftsCache('2026')
        clearGiftsCache('2025')
        
        Swal.fire({
            title: '執行成功',
            text: `爬蟲已成功抓取並更新資料。`,
            icon: 'success',
            confirmButtonText: '太棒了',
            confirmButtonColor: '#059669',
            customClass: {
                popup: 'rounded-[2rem] border-none shadow-2xl',
                confirmButton: 'rounded-xl font-black px-6 py-3'
            }
        })
    } catch (e) {
        console.error(e)
        Swal.fire({
            title: '執行失敗',
            text: '爬蟲執行過程中發生錯誤：' + e.message,
            icon: 'error',
            confirmButtonText: '瞭解',
            confirmButtonColor: '#e11d48',
            customClass: {
                popup: 'rounded-[2rem] border-none shadow-2xl',
                confirmButton: 'rounded-xl font-black px-6 py-3'
            }
        })
    } finally {
        running.value = false
        stopPolling()
        fetchLogs()
    }
}

onMounted(() => {
    fetchLogs()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.5rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
