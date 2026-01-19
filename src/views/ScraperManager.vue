<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">爬蟲管理中心</h1>
          <p class="text-gray-500">監控與執行資料擷取任務</p>
        </div>
        <button
          @click="showAddForm = true"
          class="mt-4 md:mt-0 px-5 py-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all flex items-center justify-center space-x-2 font-medium"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新增來源</span>
        </button>
      </div>

      <!-- Scraper Sources Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div class="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
             <span class="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
             爬蟲來源配置
          </h2>
          <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">Total: {{ sources.length }}</span>
        </div>

        <div v-if="loading" class="p-12 flex justify-center">
          <LoadingSpinner />
        </div>

        <div v-else-if="sources.length === 0" class="p-12 text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            </div>
          <p class="text-gray-500 font-medium">尚無設定任何爬蟲來源</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pl-8">名稱 / 來源</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">最近更新</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">狀態</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pr-8">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="source in sources" :key="source.id" class="group hover:bg-gray-50/80 transition-colors">
                <td class="px-6 py-4 pl-8">
                  <div class="flex items-center">
                      <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mr-4 font-bold text-xl">
                          {{ source.source_name.charAt(0) }}
                      </div>
                    <div>
                        <div class="text-sm font-bold text-gray-900 mb-0.5">{{ source.source_name }}</div>
                        <div class="text-xs text-blue-500 font-mono bg-blue-50 px-1.5 py-0.5 rounded inline-block max-w-[200px] truncate" :title="source.source_url">
                            {{ source.source_url }}
                        </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                         <span class="text-sm text-gray-700 font-medium">{{ formatDate(source.last_scraped_at).split(' ')[0] }}</span>
                         <span class="text-xs text-gray-400">{{ formatDate(source.last_scraped_at).split(' ')[1] || '' }}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-3 py-1 text-xs font-bold rounded-full border',
                      source.is_active
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-gray-50 text-gray-500 border-gray-100'
                    ]"
                  >
                    <span v-if="source.is_active" class="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1.5 mb-0.5"></span>
                    {{ source.is_active ? '運作中' : '已停用' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right pr-8">
                    <div class="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                            @click="handleTriggerScraper(source.id)"
                            :disabled="triggeringId === source.id"
                            class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="立即執行"
                        >
                            <svg class="w-5 h-5" :class="{ 'animate-spin': triggeringId === source.id }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            @click="editSource(source)"
                            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="編輯設定"
                        >
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <button
                            @click="confirmDelete(source)"
                            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="刪除"
                        >
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scraper Logs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
              <span class="w-1.5 h-6 bg-gray-400 rounded-full mr-3"></span>
              執行日誌
          </h2>
        </div>
        <ScraperLogTable :logs="logs" :loading="logsLoading" />
      </div>
    </div>

    <!-- Add/Edit Form Modal -->
    <ScraperSourceForm
      v-if="showAddForm || editingSource"
      :source="editingSource"
      @close="closeForm"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useScraper } from '@/composables/useScraper'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import Navbar from '@/components/Navbar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ScraperLogTable from '@/components/ScraperLogTable.vue'
import ScraperSourceForm from '@/components/ScraperSourceForm.vue'

const { sources, logs, loading, fetchScraperSources, deleteScraperSource, triggerScraper, fetchScraperLogs } = useScraper()
const { confirm } = useDialog()
const { showToast } = useToast()

const showAddForm = ref(false)
const editingSource = ref(null)
const triggeringId = ref(null)
const logsLoading = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return '尚未執行'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleTriggerScraper = async (sourceId) => {
  const isConfirmed = await confirm('確定要立即手動觸發此爬蟲嗎？', '執行爬蟲')
  if (!isConfirmed) return
  
  triggeringId.value = sourceId
  try {
    const result = await triggerScraper(sourceId)
    showToast('爬蟲任務已啟動！', 'success')
    // Refresh logs after a short delay
    setTimeout(() => fetchScraperLogs(), 2000)
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
  const isConfirmed = await confirm(`您確定要刪除「${source.source_name}」嗎？這將無法復原。`, '刪除確認', { type: 'danger', confirmText: '刪除' })
  if (!isConfirmed) return
  
  try {
    await deleteScraperSource(source.id)
    showToast('刪除成功', 'success')
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
  showToast('設定已儲存', 'success')
}

onMounted(async () => {
  await fetchScraperSources()
  logsLoading.value = true
  await fetchScraperLogs(null, 20)
  logsLoading.value = false
})
</script>
