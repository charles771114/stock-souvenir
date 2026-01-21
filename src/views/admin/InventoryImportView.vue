<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Header -->
      <div class="mb-8 animate-fade-in-up">
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
          庫存批量匯入
        </h1>
        <p class="text-gray-600 mt-2">上傳 Excel 或 CSV 檔案，系統將自動分析並顯示人員摘要</p>
      </div>

      <!-- Instructions Card -->
      <div class="glass-card mb-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          使用說明
        </h2>
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start">
            <span class="text-amber-500 mr-2">•</span>
            <span>支援 <strong>Excel (.xlsx)</strong> 或 <strong>CSV</strong> 格式</span>
          </li>
          <li class="flex items-start">
            <span class="text-amber-500 mr-2">•</span>
            <span>必須包含 <strong>「姓名」</strong> 欄位</span>
          </li>
          <li class="flex items-start">
            <span class="text-amber-500 mr-2">•</span>
            <span>建議包含「股票代號」或「股票名稱」以供識別</span>
          </li>
          <li class="flex items-start">
            <span class="text-amber-500 mr-2">•</span>
            <span>匯入後請至「歸戶管理」連結用戶</span>
          </li>
        </ul>
      </div>

      <!-- Year Selection & Upload -->
      <div class="glass-card mb-8 animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">選擇年度</label>
          <select v-model="selectedYear"
            class="block w-full max-w-xs px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
            <option v-for="year in years" :key="year" :value="year">{{ year }} 年</option>
          </select>
        </div>

        <!-- Upload Zone -->
        <div class="upload-zone" :class="{ 'drag-active': isDragging }" @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
          <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileChange" />

          <div v-if="!file" class="pointer-events-none text-center">
            <svg class="mx-auto h-16 w-16 text-amber-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-lg font-semibold text-gray-900 mb-1">拖曳檔案至此或點擊上傳</p>
            <p class="text-sm text-gray-500">支援 .xlsx, .csv 檔案</p>
          </div>

          <div v-else class="pointer-events-none text-center">
            <svg class="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-lg font-bold text-gray-900">{{ file.name }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ (file.size / 1024).toFixed(1) }} KB</p>
            <button @click.stop="clearFile"
              class="mt-4 text-red-500 hover:text-red-700 text-sm font-medium pointer-events-auto">
              移除檔案
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="groupedByOwner.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up"
        style="animation-delay: 0.3s">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ totalRows }}</div>
            <div class="text-sm text-gray-600">總筆數</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-amber-100 text-amber-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ groupedByOwner.length }}</div>
            <div class="text-sm text-gray-600">人員數</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ selectedYear }}</div>
            <div class="text-sm text-gray-600">匯入年度</div>
          </div>
        </div>
      </div>

      <!-- Owner Summary Cards -->
      <div v-if="groupedByOwner.length > 0">
        <div class="flex items-center justify-between mb-6 animate-fade-in-up" style="animation-delay: 0.4s">
          <h2 class="text-xl font-bold text-gray-900">人員清單摘要</h2>
          <button @click="handleUpload" :disabled="uploading"
            class="btn-primary">
            <svg v-if="uploading" class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ uploading ? `匯入中 ${progress}%` : '確認匯入全部資料' }}
          </button>
        </div>

        <!-- Owner Summary Table -->
        <div class="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden mb-6 animate-fade-in-up" 
             style="animation-delay: 0.5s">
          <table class="w-full">
            <thead class="bg-gray-50/80">
              <tr class="border-b border-gray-200">
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">姓名</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">資料筆數</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">狀態</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="owner in groupedByOwner" :key="owner.name" 
                  class="hover:bg-amber-50/30 transition-colors duration-200">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {{ owner.name.charAt(0) }}
                    </div>
                    <span class="font-bold text-gray-900">{{ owner.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                    {{ owner.count }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    待匯入
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="error" class="mt-6 text-red-600 text-sm text-center font-medium">{{ error }}</p>
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
@keyframes fadeInUp {
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
  animation: fadeInUp 0.6s ease-out backwards;
}

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
  padding: 3rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(251, 250, 249, 0.9) 100%);
}

.upload-zone:hover {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(254, 243, 199, 0.9) 100%);
  transform: translateY(-2px);
}

.upload-zone.drag-active {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(255, 251, 235, 1) 0%, rgba(254, 243, 199, 1) 100%);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.owner-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s ease-out backwards;
}

.owner-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}

.count-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-weight: 600;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
