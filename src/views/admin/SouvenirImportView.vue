<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Header -->
      <div class="mb-8 animate-fade-in-up">
        <div class="flex items-center gap-3 mb-2">
          <router-link to="/admin/souvenirs" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
            紀念品批量匯入
          </h1>
        </div>
        <p class="text-gray-500 ml-8 mt-1">上傳歷史資料檔案，系統將自動解析並寫入紀念品庫</p>
      </div>

      <!-- Upload Zone -->
      <div class="glass-card mb-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="upload-zone" :class="{ 'drag-active': isDragging }" @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
          <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileChange" />

          <div v-if="!file" class="pointer-events-none text-center">
            <svg class="mx-auto h-16 w-16 text-cyan-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-lg font-bold text-gray-900 mb-1">拖曳檔案至此或點擊上傳</p>
            <p class="text-sm text-gray-500">支援 .xlsx, .csv 檔案</p>
          </div>

          <div v-else class="pointer-events-none text-center">
            <svg class="mx-auto h-16 w-16 text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-lg font-bold text-gray-900">{{ file.name }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ (file.size / 1024).toFixed(1) }} KB</p>
            <button @click.stop="clearFile"
              class="mt-4 text-red-500 hover:text-red-700 text-sm font-bold pointer-events-auto">
              移除檔案
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="mappedData.length > 0">
        <div class="flex items-center justify-between mb-6 animate-fade-in-up" style="animation-delay: 0.2s">
          <div>
            <h2 class="text-xl font-bold text-gray-900">資料預覽</h2>
            <p class="text-sm text-gray-500">共 {{ mappedData.length }} 筆有效資料</p>
          </div>
          <button @click="handleUpload" :disabled="uploading"
            class="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
            <svg v-if="uploading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ uploading ? `匯入中 ${progress}%` : '確認匯入資料' }}
          </button>
        </div>

        <div class="glass-card overflow-hidden animate-fade-in-up" style="animation-delay: 0.3s">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50/80">
                <tr class="border-b border-gray-100">
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">代號</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">名稱</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">開會日期</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">紀念品</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">股價</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in previewRows" :key="idx" 
                  class="hover:bg-cyan-50/30 transition-colors"
                  :class="{ 'bg-red-50/50': !item.isValid }">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                       <span v-if="!item.isValid" class="text-red-500" title="此列資料不完整 (缺代號或日期)">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                       </span>
                       <span class="text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded">{{ item.code || '-' }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium" :class="item.isValid ? 'text-gray-900' : 'text-gray-400'">{{ item.name || '-' }}</td>
                  <td class="px-4 py-3 text-sm font-mono" :class="item.meeting_date ? 'text-gray-500' : 'text-red-500 font-bold'">
                    {{ item.meeting_date || '日期格式錯誤' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ item.souvenir_item || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ item.price || '-' }}</td>
                </tr>
                <tr v-if="mappedData.length > 20">
                  <td colspan="5" class="px-4 py-3 text-center text-xs text-gray-400 bg-gray-50/50">
                    ... 還有 {{ mappedData.length - 20 }} 筆資料
                  </td>
                </tr>
              </tbody>
            </table>
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
    console.log('[View] Raw data summary:', rawData.slice(0, 2).map(r => JSON.stringify(r)))
    if (!rawData || rawData.length === 0) {
      throw new Error('檔案是空的或解析不到任何橫列資料')
    }
    const result = mapData(rawData)
    if (!result || result.length === 0) {
      const headers = Object.keys(rawData[0] || {}).join(', ')
      throw new Error(`找不到有效資料 (需包含股票代號與日期)。偵測到的欄位有：${headers || '無'}`)
    }
    mappedData.value = result
    showToast(`成功解析 ${result.length} 筆資料`, 'success')
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
    showToast(`成功匯入 ${result.count} 筆資料`, 'success')
    router.push('/admin/souvenirs')
  } else {
    showToast(`匯入失敗: ${result.error}`, 'error')
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.upload-zone {
  border: 2px dashed #e5e7eb;
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%);
}

.upload-zone:hover {
  border-color: #0891b2;
  background: linear-gradient(135deg, rgba(236, 254, 255, 0.9) 0%, rgba(207, 250, 254, 0.9) 100%);
  transform: translateY(-2px);
}

.upload-zone.drag-active {
  border-color: #0891b2;
  background: rgba(207, 250, 254, 1);
  box-shadow: 0 0 0 4px rgba(8, 145, 178, 0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out backwards;
}
</style>
