<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/admin/souvenirs"
              class="group flex items-center gap-2 text-slate-400 hover:text-cyan-600 transition-all font-bold text-xs uppercase tracking-widest leading-none">
              <div
                class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-cyan-50 group-hover:border-cyan-100 shadow-sm transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              管理主頁
            </router-link>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 tracking-tighter mb-2">
            紀念品批量匯入
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            透過批次處理功能匯入主紀念品資料
          </p>
        </div>

        <div v-if="mappedData.length > 0" class="flex items-center gap-3">
          <button @click="handleUpload" :disabled="uploading"
            class="h-12 px-8 bg-cyan-600 text-white rounded-2xl shadow-xl shadow-cyan-100 hover:shadow-2xl hover:bg-cyan-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <svg v-if="uploading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ uploading ? `處理中 ${progress}%` : '執行匯入' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-4 space-y-6">
          <div class="glass-card p-6">
            <h2 class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">匯入狀態</h2>
            <div class="space-y-6">
              <div v-for="(step, idx) in ['上傳檔案數據', '結構分析中', '匯入映射對齊']" :key="idx"
                class="flex items-center gap-4 group">
                <div :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all',
                  idx === 0 && !file ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' :
                    idx === 1 && file ? 'bg-blue-600 text-white shadow-lg' :
                      'bg-slate-50 text-slate-200'
                ]">
                  {{ idx + 1 }}
                </div>
                <span :class="[
                  'text-[10px] font-black uppercase tracking-widest transition-colors',
                  idx === 0 && !file ? 'text-cyan-600' :
                    idx === 1 && file ? 'text-blue-600' :
                      'text-slate-300'
                ]">{{ step }}</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 bg-cyan-50/20 border-cyan-100/30">
            <h2
              class="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 leading-none">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              數據規則說明
            </h2>
            <ul class="space-y-3">
              <li v-for="req in ['必須包含公司代碼 (ID)', '必須包含股東會日期', '建議包含紀念品內容名稱']" :key="req"
                class="flex items-start gap-2 text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                <span class="text-cyan-500">•</span>
                {{ req }}
              </li>
            </ul>
            <router-link to="/admin/souvenirs"
              class="mt-6 block p-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-cyan-600 tracking-widest uppercase hover:bg-slate-50 transition-all text-center shadow-sm">
              返回主清單 →
            </router-link>
          </div>
        </div>

        <!-- Workspace -->
        <div class="lg:col-span-8 space-y-8">
          <div class="glass-card p-6 sm:p-10 animate-fade-in-up delay-100">
            <div v-if="file" class="flex justify-end mb-4">
              <button @click="clearFile"
                class="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors italic underline">清空工作區</button>
            </div>

            <div class="upload-zone relative group overflow-hidden" :class="{ 'drag-active': isDragging }"
              @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()">
              <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileChange" />

              <div v-if="!file" class="py-16 flex flex-col items-center">
                <div
                  class="w-20 h-20 rounded-[2.2rem] bg-cyan-50 text-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-100 transition-all duration-500 shadow-xl shadow-cyan-50">
                  <svg class="h-10 w-10 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 class="text-xl font-black text-slate-800 tracking-tighter mb-2">將紀念品主資料 CSV/XLSX 拖放到此處</h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">或從本機選取檔案進行上傳</p>
              </div>

              <div v-else class="py-16 flex flex-col items-center animate-bounce-in">
                <div
                  class="w-20 h-20 rounded-[2.2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
                  <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-black text-slate-800 tracking-tighter mb-1 truncate max-w-[300px]">{{ file.name
                }}</h3>
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">{{ (file.size /
                  1024).toFixed(1) }} KB • 數據已驗證</p>
              </div>
            </div>
          </div>

          <!-- Preview Section -->
          <div v-if="mappedData.length > 0" class="space-y-8 animate-fade-in-up delay-200">
            <div class="flex items-center justify-between px-2">
              <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                數據對齊預覽
              </h2>
              <span
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-lg">{{
                  mappedData.length }} 筆總數</span>
            </div>

            <div class="glass-card p-0 overflow-hidden border-none border-slate-100">
              <div class="hidden lg:block overflow-x-auto">
                <table class="w-full border-separate border-spacing-0">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                      <th
                        class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        公司代碼</th>
                      <th
                        class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        公司名稱</th>
                      <th
                        class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        目標日期</th>
                      <th
                        class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        紀念品項目</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr v-for="(item, idx) in previewRows" :key="idx"
                      class="hover:bg-cyan-50/20 transition-all transition-duration-300"
                      :class="{ 'opacity-50 grayscale': !item.isValid }">
                      <td class="px-8 py-5">
                        <div class="flex items-center gap-2">
                          <span v-if="!item.isValid" class="text-rose-500" title="數據異常">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                            </svg>
                          </span>
                          <span
                            class="px-2 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-black font-mono shadow-sm">{{
                              item.code || 'NULL' }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-5 text-sm font-black text-slate-800 tracking-tighter">{{ item.name || '-' }}
                      </td>
                      <td class="px-6 py-5">
                        <span class="text-[10px] font-bold font-mono tracking-tight"
                          :class="item.meeting_date ? 'text-slate-500' : 'text-rose-500 underline'">{{ item.meeting_date
                            || '日期無效' }}</span>
                      </td>
                      <td class="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{
                        item.souvenir_item || '-' }}</td>
                    </tr>
                    <tr v-if="mappedData.length > 20">
                      <td colspan="4"
                        class="px-8 py-4 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-slate-50/50 italic">
                        + 還有 {{ mappedData.length - 20 }} 筆未顯示於預覽
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Preview -->
              <div class="lg:hidden p-6 space-y-3">
                <div v-for="(item, idx) in previewRows" :key="idx"
                  class="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between"
                  :class="{ 'border-rose-100 bg-rose-50/30': !item.isValid }">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-[9px] font-black font-mono">{{ item.code ||
                        '?' }}</span>
                      <span class="text-sm font-black text-slate-800 tracking-tighter">{{ item.name || 'Unknown Corp'
                      }}</span>
                    </div>
                    <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ item.souvenir_item ||
                      '未指定項目' }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[9px] font-mono font-bold leading-none"
                      :class="item.meeting_date ? 'text-slate-400' : 'text-rose-500'">{{ item.meeting_date || '異常' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useSouvenirBulkImport } from '@/composables/useSouvenirBulkImport'
import { useToast } from '@/composables/useToast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { showToast } = useToast()
const { uploading, progress, parseFile, mapData, uploadToSouvenirs } = useSouvenirBulkImport()

const isDragging = ref(false)
const file = ref(null)
const mappedData = ref([])

const previewRows = computed(() => mappedData.value.slice(0, 20))

const handleFileChange = async (e) => {
  const selectedFile = e.target.files[0]
  if (selectedFile) await processFile(selectedFile)
}

const handleDrop = async (e) => {
  isDragging.value = false
  const droppedFile = e.dataTransfer.files[0]
  if (droppedFile) await processFile(droppedFile)
}

const processFile = async (f) => {
  file.value = f
  try {
    const rawData = await parseFile(f)
    if (!rawData || rawData.length === 0) throw new Error('Empty payload detected')
    const result = mapData(rawData)
    if (!result || result.length === 0) throw new Error('No valid alignment keys found (Stock ID/Date)')
    mappedData.value = result
    showToast(`Aligned ${result.length} master records`, 'success')
  } catch (err) {
    showToast(err.message, 'error')
    file.value = null
    mappedData.value = []
  }
}

const clearFile = () => {
  file.value = null
  mappedData.value = []
}

const handleUpload = async () => {
  if (mappedData.value.length === 0) return
  const result = await uploadToSouvenirs(mappedData.value)
  if (result.success) {
    showToast(`Committed ${result.count} alignment records`, 'success')
    router.push('/admin/souvenirs')
  } else {
    showToast(`Commit failure: ${result.error}`, 'error')
  }
}
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

.upload-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 2.2rem;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #06b6d4;
  background: rgba(236, 254, 255, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -20px rgba(6, 182, 212, 0.2);
}

.upload-zone.drag-active {
  border-color: #06b6d4;
  background: rgba(236, 254, 255, 0.2);
  scale: 1.02;
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

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
