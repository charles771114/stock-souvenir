<template>
  <div class="min-h-screen bg-gray-50 relative pb-20">
    <Navbar />

    <!-- Pull to Refresh Indicator -->
    <div
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-75 pointer-events-none"
      :style="{
        transform: `translateY(${pullDistance - 60}px)`,
        opacity: pullDistance > 20 ? 1 : 0
      }">
      <div
        class="bg-white/90 backdrop-blur-xl rounded-full p-3 shadow-2xl border border-white/60 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-4 border-slate-100 border-t-brand-primary transition-none"
          :class="{ 'animate-spin': isRefreshing }"
          :style="{ transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg)` }"></div>
        <div v-if="!isRefreshing"
          class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
          下拉重整</div>
        <div v-else
          class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-black text-brand-primary uppercase tracking-[0.2em] whitespace-nowrap animate-pulse">
          更新中...</div>
      </div>
    </div>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 w-full animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 stagger-item-1">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight mb-2">
            我的庫存清單
          </h1>
          <p class="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            管理持股庫存與自動化 PDF 抓取
          </p>
        </div>

        <div class="flex gap-3">
          <button v-if="inventoryItems.length > 0" @click="handleClearAll"
            class="h-12 px-6 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-rose-50 hover:text-red-500 hover:border-red-100 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <i class="fas fa-trash-alt text-sm"></i>
            全部清除
          </button>
          <button @click="isImportModalOpen = true"
            class="h-12 px-8 bg-brand-primary text-white rounded-2xl shadow-xl shadow-amber-200 hover:shadow-2xl hover:bg-amber-600 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <i class="fas fa-plus text-sm"></i>
            手動新增
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- PDF Scraper Section (Left) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="glass-card p-10 stagger-item-2 relative overflow-hidden">
            <!-- Subtle Gold Accent -->
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl"></div>
            
            <h2 class="text-xl font-black text-slate-800 mb-8 flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                <i class="fas fa-file-pdf text-xl"></i>
              </div>
              PDF 自動抓取
            </h2>

            <!-- Uploader Area -->
            <div class="relative group cursor-pointer mb-6" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
              <div class="border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300" :class="[
                isDragging ? 'border-brand-primary bg-amber-50 scale-102' : 'border-slate-200 group-hover:border-brand-primary group-hover:bg-amber-50'
              ]">
                <input type="file" ref="fileInput" class="hidden" accept="application/pdf" @change="handleFileChange" />
                <div
                  class="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg class="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p class="text-[15px] font-bold text-slate-700">
                  {{ selectedFile ? selectedFile.name : '將 PDF 拖曳至此' }}
                </p>
                <p class="text-sm text-slate-500 mt-2">自動擷取代號與名稱</p>
              </div>
            </div>

            <!-- Password Field (Conditional) -->
            <div v-if="scraperError === 'PASSWORD_REQUIRED'" class="mb-6 space-y-2 animate-bounce-in">
              <label class="text-sm font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 ml-1">
                此檔案受密碼保護
              </label>
              <div class="flex gap-2">
                <input v-model="pdfPassword" type="password" placeholder="輸入密碼"
                  class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  @keyup.enter="runScraper" />
                <button @click="runScraper"
                  class="px-6 py-3 bg-amber-500 text-white rounded-2xl text-sm font-bold hover:bg-amber-600 transition-all">
                  解鎖
                </button>
              </div>
            </div>

            <button v-if="selectedFile && scraperError !== 'PASSWORD_REQUIRED'" @click="runScraper"
              :disabled="scraperLoading"
              class="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              <div v-if="scraperLoading"
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ scraperLoading ? '解析中...' : '開始抓取' }}
            </button>
          </div>

          <!-- Quick Tips (Enhanced with User Steps) -->
          <div class="glass-card p-8 border-amber-100 stagger-item-3">
            <h3 class="text-sm font-black text-brand-primary uppercase tracking-[0.3em] mb-6">匯出教學</h3>

            <div class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-brand-primary font-mono text-sm font-black">
                    01</div>
                  <p class="text-sm text-slate-600 leading-relaxed font-bold">登入 **「集保e手掌握」** App</p>
                </div>
                <div class="flex items-start gap-4">
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-brand-primary font-mono text-sm font-black">
                    02</div>
                  <p class="text-sm text-slate-600 leading-relaxed font-bold">於首頁下方點擊 **「匯出證券交易明細」**</p>
                </div>
                <div class="flex items-start gap-4">
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-brand-primary font-mono text-sm font-black">
                    03</div>
                  <p class="text-sm text-slate-600 leading-relaxed font-bold">選擇您的證券帳戶，日期區間可設定為 **短天數**</p>
                </div>
                <div class="flex items-start gap-4">
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-brand-primary font-mono text-sm font-black">
                    04</div>
                  <p class="text-sm text-slate-600 leading-relaxed font-bold">至右上方 **「通知中心」** 點擊明細匯出通知</p>
                </div>
                <div class="flex items-start gap-4">
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-brand-primary font-mono text-sm font-black">
                    05</div>
                  <p class="text-sm text-slate-600 leading-relaxed font-bold">下載 **「庫存明細」** PDF 並上傳至本系統</p>
                </div>
              </div>

              <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 space-y-2">
                <div class="flex items-center gap-2 text-amber-600">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span class="text-sm font-black uppercase tracking-widest">密碼提醒</span>
                </div>
                <p class="text-sm text-amber-700 font-bold">PDF 預設解碼密碼為您的身分證字號。</p>
              </div>

              <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                <div class="flex items-center gap-2 text-brand-primary">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-black uppercase tracking-widest">庫存管理</span>
                </div>
                <p class="text-sm text-brand-primary font-bold leading-relaxed">建議先 「全部清除」 舊有年度資料再匯入。系統會自動過濾重複項目，確保資料精確。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory List (Right) -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Scraper Results (if any) -->
          <div v-if="scraperResults.length > 0" class="glass-card overflow-hidden animate-fade-in-up">
            <div class="px-8 py-5 bg-brand-primary flex items-center justify-between">
              <h3 class="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                抓取結果 ({{ scraperResults.length }})
              </h3>
              <div class="flex gap-2">
                <button @click="addAllToInventory"
                  class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-black uppercase tracking-widest transition-all">
                  全部新增至庫存
                </button>
                <button @click="scraperResults = []"
                  class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-black uppercase tracking-widest transition-all">
                  清除
                </button>
              </div>
            </div>
            <div class="max-h-[300px] overflow-auto custom-scrollbar">
              <table v-if="scraperResults.length > 0" class="w-full">
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(item, idx) in scraperResults" :key="idx" class="hover:bg-amber-50 transition-colors">
                    <td class="px-8 py-4">
                      <span class="text-sm font-bold px-2 py-1 rounded bg-slate-50 text-slate-600 font-mono">{{
                        item.code }}</span>
                    </td>
                    <td class="px-8 py-4 text-sm font-bold text-slate-700">{{ item.name }}</td>
                    <td class="px-8 py-4 text-right">
                      <button @click="scraperResults.splice(idx, 1)"
                        class="text-slate-300 hover:text-status-error transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Main Inventory Table -->
          <div class="glass-card overflow-hidden stagger-item-4">
            <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">歸戶庫存清單</h3>
                <p class="text-sm text-slate-500 mt-1">目前共歸戶 {{ inventoryItems.length }} 筆持有證券</p>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="py-20 flex flex-col items-center gap-4">
              <div class="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin"></div>
              <p class="text-sm font-black text-slate-500 uppercase tracking-widest">載入目錄中...</p>
            </div>

            <!-- List Content -->
            <div v-else-if="inventoryItems.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest text-left">證券代號</th>
                    <th class="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest text-left">公司名稱</th>
                    <th class="px-8 py-5 text-right text-sm font-black text-slate-500 uppercase tracking-widest">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="item in inventoryItems" :key="item.id" class="group hover:bg-amber-50 transition-all">
                    <td class="px-8 py-6">
                      <span
                        class="text-sm font-black px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-600 font-mono shadow-sm group-hover:border-brand-primary group-hover:text-brand-primary transition-colors">
                        {{ item.souvenir?.code || '-' }}
                      </span>
                    </td>
                    <td class="px-8 py-6">
                      <div class="flex items-center gap-2">
                        <div class="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-colors">
                          {{ item.souvenir?.name || '未知公司' }}
                        </div>
                        <!-- Portfolio Badge -->
                        <span v-if="isCombinedView"
                          class="text-sm font-bold px-1.5 py-0.5 rounded-lg bg-amber-50 text-brand-primary border border-amber-100">
                          {{ getPortfolioName(item.portfolio_id) }}
                        </span>
                      </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <button @click.stop="handleDeleteItem(item)"
                        class="p-2.5 rounded-xl transition-all flex items-center justify-center ml-auto"
                        :class="[
                          confirmingId === item.id 
                            ? 'bg-status-error text-white shadow-lg shadow-status-error/20 animate-pulse' 
                            : 'text-slate-300 hover:text-status-error hover:bg-rose-50'
                        ]"
                        :title="confirmingId === item.id ? '點擊確認移除' : '移除持股'">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-else class="py-32 flex flex-col items-center justify-center text-center px-8">
              <div
                class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 class="text-lg font-bold text-slate-900 mb-2">庫存清單尚無資料</h4>
              <p class="text-sm text-slate-400 max-w-xs mb-8">您可以手動新增或是從左側 PDF 檔案抓取您的持股資料。</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <InventoryImportModal :is-open="isImportModalOpen" @close="closeImportModal" />
  </div>
</template>

<script setup>
import InventoryImportModal from '@/components/InventoryImportModal.vue'
import Navbar from '@/components/Navbar.vue'
import { useAuth } from '@/composables/useAuth'
import { useCollection } from '@/composables/useCollection'
import { useDialog } from '@/composables/useDialog'
import { usePDFScraper } from '@/composables/usePDFScraper'
import { usePortfolio } from '@/composables/usePortfolio'
import { usePullRefresh } from '@/composables/usePullRefresh'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { onMounted, ref, watch } from 'vue'

const { portfolios, currentPortfolioId, isCombinedView } = usePortfolio() // Modified line

// Composables
const { collection, loading, fetchAllInventory, removeFromCollection, clearAllCollections, addToCollection, addToInventory } = useCollection()
const { loading: scraperLoading, results: scraperResults, error: scraperError, processPDF } = usePDFScraper()
const { confirm } = useDialog()
const { showToast } = useToast()
const { user } = useAuth()

// Pull to Refresh
const { pullDistance, isRefreshing } = usePullRefresh(async () => {
  await fetchAllInventory(true)
})

// Watch for user auth state to fetch data
watch(user, async (val) => {
  if (val) {
    await fetchAllInventory()
  }
}, { immediate: true })

// Watch for portfolio changes to refresh view
watch(currentPortfolioId, async () => {
  await fetchAllInventory()
})

// State
const isImportModalOpen = ref(false)
const selectedFile = ref(null)
const isDragging = ref(false)
const pdfPassword = ref('')
const confirmingId = ref(null)
let confirmTimer = null

// Aliases
const inventoryItems = collection

const getPortfolioName = (id) => {
  const p = portfolios.value.find(p => p.id === id)
  return p ? p.name : '未知帳戶'
}

// Methods - Scraper
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    pdfPassword.value = ''
  } else {
    showToast('請上傳有效的 PDF 檔案', 'error')
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    pdfPassword.value = ''
  } else {
    showToast('請上傳有效的 PDF 檔案', 'error')
  }
}

const runScraper = async () => {
  if (!selectedFile.value) return

  try {
    const data = await processPDF(selectedFile.value, pdfPassword.value)

    // Log to Supabase
    await logExtraction(selectedFile.value.name, data.length, 'success')

    if (data.length === 0) {
      showToast('解析完成，但未發現證券資料', 'info')
    } else {
      showToast(`成功抓取 ${data.length} 筆資料`, 'success')
    }
  } catch (err) {
    if (err.name === 'PasswordException') {
      showToast('此檔案需要密碼', 'warning')
    } else {
      await logExtraction(selectedFile.value.name, 0, 'failed')
      showToast(err.message || '抓取失敗', 'error')
    }
  }
}

const logExtraction = async (filename, count, status) => {
  try {
    const { error: dbError } = await supabase
      .from('scraper_logs')
      .insert({
        items_scraped: count,
        status: status === 'failed' ? 'failed' : 'success',
        error_message: status === 'failed' ? `解析失敗: ${filename}` : `PDF 抓取檔案: ${filename}`,
        completed_at: new Date().toISOString()
      })
    if (dbError) console.error('Logging failed:', dbError)
  } catch (e) {
    console.error('Logging failed:', e)
  }
}

const addAllToInventory = async () => {
  if (scraperResults.value.length === 0) return

  const confirmed = await confirm(`確定要將這 ${scraperResults.value.length} 筆資料新增至庫存嗎？`, '批次新增庫存')
  if (!confirmed) return

  loading.value = true
  let successCount = 0
  let skipCount = 0

  // Get existing codes to check for duplicates
  const existingCodes = new Set(inventoryItems.value.map(i => i.souvenir?.code).filter(Boolean))

  try {
    for (const item of scraperResults.value) {
      if (existingCodes.has(item.code)) {
        skipCount++
        continue
      }

      // 1. Directly add to user_inventory (consolidated portfolio)
      const { success } = await addToInventory(item.code, item.name)
      if (success) successCount++
      else skipCount++
    }

    showToast(`成功新增 ${successCount} 筆，${skipCount} 筆失敗`, successCount > 0 ? 'success' : 'error')
    if (successCount > 0) scraperResults.value = []
    await fetchAllInventory()
  } catch (err) {
    console.error('Batch add failed:', err)
    showToast('批次新增失敗', 'error')
  } finally {
    loading.value = false
  }
}

// Methods - Inventory
const closeImportModal = async (shouldRefresh) => {
  isImportModalOpen.value = false
  if (shouldRefresh) await fetchAllInventory()
}

const handleDeleteItem = async (item) => {
  if (!item) return
  
  if (confirmingId.value === item.id) {
    // Second click: Actual delete
    await deleteItem(item)
    confirmingId.value = null
    if (confirmTimer) clearTimeout(confirmTimer)
  } else {
    // First click: Confirm state
    confirmingId.value = item.id
    if (confirmTimer) clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => {
      confirmingId.value = null
    }, 3000)
  }
}

const deleteItem = async (item) => {
  const { success, error: deleteError } = await removeFromCollection(item.id, true)
  if (success) {
    showToast('已從庫存移除', 'success', 1000)
    await fetchAllInventory()
  } else {
    showToast(deleteError || '移除失敗', 'error')
  }
}

const handleClearAll = async () => {
  if (await confirm(`確定要清空所有庫存嗎？此操作無法復原。`, '清空庫存')) {
    const { success, error } = await clearAllCollections()
    if (success) {
      showToast('已清空', 'success')
      await fetchAllInventory()
    } else {
      showToast(error || '清空失敗', 'error')
    }
  }
}

onMounted(async () => {
  if (user.value) {
    await fetchAllInventory()
  }
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.5rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.08);
}

.glass-button {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.8);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.2);
}

.animate-blob {
  animation: blob 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {

  0%,
  100% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(40px, -60px) scale(1.1);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
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

.delay-300 {
  animation-delay: 0.3s;
}

.scale-102 {
  transform: scale(1.02);
}

@keyframes bounce-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  60% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
