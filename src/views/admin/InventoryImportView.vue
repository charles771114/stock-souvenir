<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
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
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 tracking-tighter mb-2">
            庫存批量匯入
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            多使用者庫存數據的批量匯入引擎
          </p>
        </div>

        <div v-if="groupedByOwner.length > 0" class="flex items-center gap-3">
          <button @click="handleUpload" :disabled="uploading"
            class="h-12 px-8 bg-amber-600 text-white rounded-2xl shadow-xl shadow-amber-200 hover:shadow-2xl hover:bg-amber-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
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
        <!-- Sidebar: Steps & Instructions -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Step Indicator -->
          <div class="glass-card p-6">
            <h2 class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">工作流程步驟</h2>
            <div class="space-y-6">
              <div v-for="(step, idx) in ['分析上傳檔案', '預覽數據內容', '選擇目標年度']" :key="idx"
                class="flex items-center gap-4 group">
                <div :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all',
                  idx === 0 && !file ? 'bg-indigo-600 text-white' :
                    idx === 1 && file ? 'bg-amber-600 text-white shadow-lg' :
                      'bg-slate-100 text-slate-300'
                ]">
                  {{ idx + 1 }}
                </div>
                <span :class="[
                  'text-xs font-black uppercase tracking-widest transition-colors',
                  idx === 0 && !file ? 'text-indigo-600' :
                    idx === 1 && file ? 'text-amber-600' :
                      'text-slate-300'
                ]">{{ step }}</span>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="glass-card p-6 bg-amber-50/20 border-amber-100/30">
            <h2 class="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              匯入規範說明
            </h2>
            <ul class="space-y-3">
              <li v-for="req in ['僅支援 .xlsx 或 .csv 檔案', '必須包含「姓名」欄位', '建議包含公司代碼或名稱']" :key="req"
                class="flex items-start gap-2 text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                <span class="text-amber-500">•</span>
                {{ req }}
              </li>
            </ul>
            <router-link to="/admin/staging"
              class="mt-6 block p-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-indigo-600 tracking-widest uppercase hover:bg-slate-50 transition-all text-center shadow-sm">
              前往歸戶管理頁面 →
            </router-link>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Selection & Dropzone -->
          <div class="glass-card p-6 sm:p-10 animate-fade-in-up delay-100">
            <div class="flex flex-col sm:flex-row gap-6 items-end mb-8">
              <div class="flex-1 w-full">
                <label
                  class="block text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-2 ml-2">目標匯入年度</label>
                <select v-model="selectedYear"
                  class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 transition-all">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}年度</option>
                </select>
              </div>
              <div v-if="file" class="w-full sm:w-auto">
                <button @click="clearFile"
                  class="h-14 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2 border border-rose-100 leading-none">
                  重設選擇
                </button>
              </div>
            </div>

            <div class="upload-zone relative group overflow-hidden" :class="{ 'drag-active': isDragging }"
              @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()">
              <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileChange" />

              <div v-if="!file" class="py-12 flex flex-col items-center">
                <div
                  class="w-20 h-20 rounded-[2rem] bg-amber-50 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 shadow-xl shadow-amber-50">
                  <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 class="text-xl font-black text-slate-800 tracking-tight mb-2">將數據檔案拖放到此處</h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">點擊選取檔案進行上傳 (.xlsx 或
                  .csv)</p>
              </div>

              <div v-else class="py-12 flex flex-col items-center animate-bounce-in">
                <div
                  class="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
                  <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-black text-slate-800 tracking-tight mb-1 truncate max-w-[250px]">{{ file.name }}
                </h3>
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">{{ (file.size /
                  1024).toFixed(1) }} KB • 準備進行處理</p>
              </div>
            </div>
          </div>

          <!-- Parsed Results -->
          <div v-if="parsedData.length > 0" class="space-y-8 animate-fade-in-up delay-200">
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="glass-card p-6 border-slate-100">
                <span
                  class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block leading-none">Target
                  目標紀錄筆數</span>
                <span class="text-2xl font-black text-slate-800 tracking-tighter">{{ totalRows }}</span>
              </div>
              <div class="glass-card p-6 border-amber-100/30">
                <span
                  class="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 block leading-none">Impact
                  影響人數</span>
                <span class="text-2xl font-black text-slate-800 tracking-tighter">{{ groupedByOwner.length }}</span>
              </div>
              <div class="glass-card p-6 border-indigo-100/30 hidden md:block">
                <span
                  class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block leading-none">Fiscal
                  目標年度</span>
                <span class="text-2xl font-black text-slate-800 tracking-tighter">{{ selectedYear }}</span>
              </div>
            </div>

            <!-- Owners List -->
            <div>
              <h2
                class="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 px-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                權屬分析預覽
              </h2>

              <div class="glass-card p-0 overflow-hidden">
                <div class="hidden sm:block">
                  <table class="w-full border-separate border-spacing-0">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          權屬單位 (姓名)</th>
                        <th
                          class="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          紀錄筆數</th>
                        <th
                          class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8">
                          狀態</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                      <tr v-for="owner in groupedByOwner" :key="owner.name" class="hover:bg-amber-50/20 transition-all">
                        <td class="px-8 py-4">
                          <div class="flex items-center gap-3">
                            <div
                              class="w-10 h-10 rounded-[0.8rem] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                              {{ owner.name.charAt(0) }}
                            </div>
                            <span class="font-black text-slate-800 text-sm tracking-tight">{{ owner.name }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <span class="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{{
                            owner.count }}</span>
                        </td>
                        <td class="px-6 py-4 text-right pr-8">
                          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">待處理</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Mobile Owner List -->
                <div class="sm:hidden p-4 space-y-3">
                  <div v-for="owner in groupedByOwner" :key="owner.name"
                    class="p-4 bg-white border border-slate-50 rounded-2xl flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                        {{ owner.name.charAt(0) }}</div>
                      <div class="font-black text-slate-800 text-xs tracking-tight">{{ owner.name }}</div>
                    </div>
                    <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ owner.count }}
                      個項目</span>
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
import { useInventoryImport } from '@/composables/useInventoryImport'
import { useToast } from '@/composables/useToast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { uploading, error, progress, parseFile, uploadToStaging } = useInventoryImport()
const { showToast } = useToast()

const selectedYear = ref(new Date().getFullYear())
const years = computed(() => {
  const current = new Date().getFullYear()
  return [current, current - 1, current - 2, current - 3]
})

const isDragging = ref(false)
const file = ref(null)
const parsedData = ref([])

const totalRows = computed(() => parsedData.value.length)

const groupedByOwner = computed(() => {
  const map = {}
  parsedData.value.forEach(row => {
    const name = row['姓名'] || row['Owner'] || row['owner_name'] || '未知'
    if (!map[name]) {
      map[name] = { name, count: 0 }
    }
    map[name].count++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
})

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
    parsedData.value = await parseFile(f)
    showToast(`成功讀取 ${parsedData.value.length} 筆資料`, 'success')
  } catch (err) {
    showToast(err.message, 'error')
    file.value = null
    parsedData.value = []
  }
}

const clearFile = () => {
  file.value = null
  parsedData.value = []
}

const handleUpload = async () => {
  const result = await uploadToStaging(parsedData.value, selectedYear.value)
  if (result.success) {
    showToast(`成功匯入 ${result.count} 筆資料`, 'success')
    router.push('/admin/staging')
  } else {
    showToast('匯入失敗', 'error')
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.25rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
}

.upload-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 2rem;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #fbbf24;
  background: rgba(255, 251, 235, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -20px rgba(251, 191, 36, 0.2);
}

.upload-zone.drag-active {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.05);
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 20px;
}
</style>
