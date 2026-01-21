<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/admin/panel" class="text-gray-500 hover:text-gray-700 mr-4">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-700">
              庫存批量匯入
            </h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">

      <!-- Instructions -->
      <div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-amber-100 mb-8">
        <h2 class="text-lg font-bold text-gray-900 mb-2">使用說明</h2>
        <ul class="list-disc list-inside text-gray-600 space-y-1 text-sm">
          <li>請上傳 Excel (.xlsx) 或 CSV 檔案。</li>
          <li>必須包含欄位：<strong>「姓名」</strong> (Owner Name)。</li>
          <li>建議包含欄位：<strong>「股票代號」</strong> 或 <strong>「股票名稱」</strong> 以供識別。</li>
          <li>匯入後資料會進入「暫存區 (Staging)」，請至「歸戶管理」進行連結作業。</li>
        </ul>
      </div>

      <!-- Upload Area -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div class="p-8">

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">選擇年度</label>
            <select v-model="selectedYear"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-lg">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div
            class="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-amber-400 transition-all cursor-pointer relative"
            :class="{ 'bg-amber-50 border-amber-500': isDragging }" @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
            <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls, .csv" @change="handleFileChange" />

            <div v-if="!file" class="pointer-events-none">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-lg font-medium text-gray-900">拖曳檔案至此或點擊上傳</p>
              <p class="text-sm text-gray-500 mt-1">支援 .xlsx, .csv 檔案</p>
            </div>

            <div v-else class="pointer-events-none">
              <svg class="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-lg font-bold text-gray-900">{{ file.name }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ (file.size / 1024).toFixed(1) }} KB</p>
              <button @click.stop="file = null; parsedData = []"
                class="mt-4 text-red-500 hover:text-red-700 text-sm font-medium z-10 pointer-events-auto">移除檔案</button>
            </div>
          </div>
        </div>

        <!-- Preview & Action -->
        <div v-if="parsedData.length > 0" class="border-t border-gray-100 p-6 bg-gray-50">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900">預覽資料 ({{ parsedData.length }} 筆)</h3>
            <span class="text-xs text-gray-500">僅顯示前 5 筆</span>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票代號</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票名稱</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(row, idx) in previewRows" :key="idx">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ row['姓名'] || row['Owner'] ||
                    row['owner_name'] }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ row['股票代號'] || row['代號'] ||
                    row['Code'] }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ row['股票名稱'] || row['名稱'] ||
                    row['Name'] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-end gap-4">
            <button @click="handleUpload" :disabled="uploading"
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all">
              <svg v-if="uploading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ uploading ? `匯入中 ${progress}%` : '確認匯入' }}
            </button>
          </div>

          <p v-if="error" class="mt-4 text-red-600 text-sm text-center font-medium">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

const previewRows = computed(() => parsedData.value.slice(0, 5))

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
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

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
</style>
