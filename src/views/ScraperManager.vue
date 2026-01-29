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

        <button @click="showAddForm = true"
          class="h-12 px-8 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          新增來源
        </button>
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
            {{ sources.length }}</span>
        </div>

        <div v-if="loading" class="py-24 flex flex-col items-center gap-6">
          <div class="w-16 h-16 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-sm font-black text-indigo-300 uppercase tracking-[0.2em] animate-pulse">同步來源資料中...</p>
        </div>

        <div v-else-if="sources.length === 0" class="glass-card py-24 text-center">
          <div
            class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-200">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-sm font-black text-slate-300 uppercase tracking-widest">尚無設定任何爬蟲來源</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-100">
          <div v-for="source in sources" :key="source.id"
            class="glass-card p-6 flex flex-col group hover:border-indigo-200 transition-all active:scale-[0.98]">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center gap-4">
                <div
                  class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {{ source.source_name.charAt(0) }}
                </div>
                <div>
                  <h3 class="text-lg font-black text-slate-800 tracking-tight">{{ source.source_name }}</h3>
                  <div
                    class="text-[10px] text-indigo-400 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-lg inline-block w-fit truncate max-w-[150px]"
                    :title="source.source_url">
                    {{ source.source_url }}
                  </div>
                </div>
              </div>
              <span :class="[
                'px-3 py-1 text-[10px] font-black rounded-xl border flex items-center gap-1.5 transition-all',
                source.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
              ]">
                <div v-if="source.is_active" class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                {{ source.is_active ? '啟用中' : '已停用' }}
              </span>
            </div>

            <div class="space-y-4 mb-6">
              <div
                class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>最後更新時間</span>
                <span class="text-slate-600 font-mono">{{ formatDate(source.last_scraped_at) }}</span>
              </div>
              <div class="h-1 bg-slate-50 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 rounded-full w-full opacity-20"></div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 mt-auto">
              <button @click="handleTriggerScraper(source.id)" :disabled="triggeringId === source.id"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50">
                <svg class="w-5 h-5" :class="{ 'animate-spin': triggeringId === source.id }" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="text-[8px] font-black mt-1 uppercase tracking-tighter">執行爬蟲</span>
              </button>
              <button @click="editSource(source)"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-[8px] font-black mt-1 uppercase tracking-tighter">編輯設定</span>
              </button>
              <button @click="confirmDelete(source)"
                class="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="text-[8px] font-black mt-1 uppercase tracking-tighter">刪除來源</span>
              </button>
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
          <button @click="fetchScraperLogs(null, 20)"
            class="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline hover:scale-105 transition-all">重新整理日誌</button>
        </div>

        <div class="glass-card overflow-hidden animate-fade-in-up delay-200 p-0">
          <ScraperLogTable :logs="logs" :loading="logsLoading" />
        </div>
      </div>
    </main>

    <!-- Add/Edit Form Modal -->
    <ScraperSourceForm v-if="showAddForm || editingSource" :source="editingSource" @close="closeForm"
      @saved="handleSaved" />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import ScraperLogTable from '@/components/ScraperLogTable.vue'
import ScraperSourceForm from '@/components/ScraperSourceForm.vue'
import { useDialog } from '@/composables/useDialog'
import { useScraper } from '@/composables/useScraper'
import { useToast } from '@/composables/useToast'
import { onMounted, ref } from 'vue'

const { sources, logs, loading, fetchScraperSources, deleteScraperSource, triggerScraper, fetchScraperLogs } = useScraper()
const { confirm } = useDialog()
const { showToast } = useToast()

const showAddForm = ref(false)
const editingSource = ref(null)
const triggeringId = ref(null)
const logsLoading = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return '從未執行'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleTriggerScraper = async (sourceId) => {
  const isConfirmed = await confirm('確定要立即手動觸發此爬蟲嗎？', '執行爬蟲任務')
  if (!isConfirmed) return

  triggeringId.value = sourceId
  try {
    await triggerScraper(sourceId)
    showToast('爬蟲任務已啟動！', 'success')
    // Refresh logs after a short delay
    setTimeout(() => fetchScraperLogs(null, 20), 2000)
  } catch (e) {
    showToast('執行失敗: ' + e.message, 'error')
  } finally {
    triggeringId.value = null
  }
}

const editSource = (source) => {
  editingSource.value = source
}

const confirmDelete = async (source) => {
  const isConfirmed = await confirm(`您確定要刪除「${source.source_name}」嗎？這將無法復原。`, '危險操作', { type: 'danger', confirmText: '確定刪除' })
  if (!isConfirmed) return

  try {
    await deleteScraperSource(source.id)
    showToast('來源已移除', 'success')
  } catch (e) {
    showToast('刪除失敗: ' + e.message, 'error')
  }
}

const closeForm = () => {
  showAddForm.value = false
  editingSource.value = null
}

const handleSaved = () => {
  closeForm()
  fetchScraperSources()
  showToast('設定已更新', 'success')
}

onMounted(async () => {
  await fetchScraperSources()
  logsLoading.value = true
  await fetchScraperLogs(null, 20)
  logsLoading.value = false
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
