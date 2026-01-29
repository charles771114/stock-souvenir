<template>
  <div
    class="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl shadow-indigo-100/20 p-8 mb-8 relative overflow-hidden">
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
    <div class="relative z-10">
      <h3 class="text-lg font-semibold text-gray-900">匯入歷史資料</h3>
      <p class="text-sm text-gray-600 mt-1">
        支援拖曳或點擊上傳 CSV / Excel (.xlsx, .xls) 檔案。系統將自動解析並寫入資料庫。
      </p>
    </div>

    <!-- Controls Row -->
    <div class="flex items-end gap-6 mb-6">
      <!-- Year Selection -->
      <div class="w-48">
        <label for="year" class="block text-sm font-medium text-gray-700 mb-1">目標年份</label>
        <select id="year" v-model="selectedYear"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option value="">自動偵測 (不強制)</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">若檔案日期缺少年份，將使用此設定。</p>
      </div>

      <!-- Encoding Selection -->
      <div class="w-48">
        <label for="encoding" class="block text-sm font-medium text-gray-700 mb-1">CSV 編碼</label>
        <select id="encoding" v-model="selectedEncoding"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option value="UTF-8">UTF-8 (預設)</option>
          <option value="Big5">Big5 (繁體中文)</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">若 CSV 顯示亂碼請切換此選項。</p>
      </div>
    </div>

    <!-- File Upload Zone -->
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
      @dragover.prevent @drop.prevent="handleDrop" @click="triggerFileInput">
      <input type="file" ref="fileInput" class="hidden" accept=".csv,.xlsx,.xls" @change="handleFileSelect" />

      <div v-if="!file && !processing" class="space-y-3">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="text-sm text-gray-600">
          <span class="font-medium text-indigo-600 hover:text-indigo-500">點擊上傳</span>
          或拖曳檔案至此
        </div>
        <p class="text-xs text-gray-500">CSV, XLSX, XLS (最大 10MB)</p>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-4">
        <div v-if="processing" class="flex items-center space-x-2 text-indigo-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <span>解析中...</span>
        </div>
        <div v-else class="text-left w-full max-w-sm">
          <div class="flex items-center justify-between bg-indigo-50 p-3 rounded-md">
            <div class="flex items-center">
              <svg class="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="font-medium text-sm text-indigo-900 truncate">{{ file.name }}</span>
            </div>
            <button @click.stop="reset" class="text-sm text-red-500 hover:text-red-700">移除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="parsedData.length > 0" class="mt-8 border-t border-gray-200 pt-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-medium text-gray-900">資料預覽 (共 {{ parsedData.length }} 筆)</h4>
        <div class="space-x-3">
          <button @click="reset"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            取消
          </button>
          <button @click="handleImport" :disabled="uploading"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="uploading">匯入中... ({{ progress }}%)</span>
            <span v-else>確認匯入</span>
          </button>
        </div>
      </div>

      <!-- Preview Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代號
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                公司名稱</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分類 (Auto)</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                開會日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">紀念品
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股價
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in previewRows" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span v-if="item.classification_status === 'system_matched'"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{categories.find(c => c.id === item.category_id)?.name || '已匹配'}}
                </span>
                <span v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  需審核
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.meeting_date }}
                <span v-if="selectedYear && item.meeting_date.startsWith(selectedYear)"
                  class="text-green-600 text-xs ml-1">(符合)</span>
                <span v-else-if="selectedYear" class="text-amber-500 text-xs ml-1">(不符)</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.souvenir_item }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.price }}</td>
            </tr>
            <tr v-if="parsedData.length > 5">
              <td colspan="6" class="px-6 py-3 text-center text-sm text-gray-500 bg-gray-50">
                ... 還有 {{ parsedData.length - 5 }} 筆資料
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategories } from '@/composables/useCategories';
import { useDialog } from '@/composables/useDialog'; // Added import
import { useToast } from '@/composables/useToast';
import { supabase } from '@/lib/supabase';
import { parseFile, type ParsedSouvenir } from '@/utils/fileParser';
import { computed, onMounted, ref } from 'vue';

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog() // Added declaration
const { categories, fetchCategories, matchCategory } = useCategories()

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const processing = ref(false)
const parsedData = ref<ParsedSouvenir[]>([])
const uploading = ref(false)

onMounted(() => {
  fetchCategories()
})
const progress = ref(0)
const selectedYear = ref('')
const selectedEncoding = ref('UTF-8')

const previewRows = computed(() => {
  return parsedData.value.slice(0, 5)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDrop = (e: DragEvent) => {
  const droppedFile = e.dataTransfer?.files[0]
  if (droppedFile) processFile(droppedFile)
}

const handleFileSelect = (e: Event) => {
  const selectedFile = (e.target as HTMLInputElement).files?.[0]
  if (selectedFile) processFile(selectedFile)
}

const processFile = async (f: File) => {
  if (!f) return

  processing.value = true
  file.value = f
  parsedData.value = []
  progress.value = 0

  try {
    const result = await parseFile(f, selectedYear.value, selectedEncoding.value)

    if (result.errors.length > 0) {
      showToast(`解析完成但有 ${result.errors.length} 筆錯誤`, 'warning')
    }

    if (result.data.length === 0) {
      showToast('檔案中沒有可用的有效資料', 'error')
      if (result.errors.length === 0) reset()
    } else {
      // Apply classification logic
      result.data.forEach(item => {
        const match = matchCategory(item.souvenir_item)
        item.category_id = match.id || undefined
        item.classification_status = match.status
      })

      parsedData.value = result.data
    }
  } catch (err) {
    showToast('解析失敗: ' + (err as Error).message, 'error')
    reset()
  } finally {
    processing.value = false
  }
}

const reset = () => {
  file.value = null
  parsedData.value = []
  processing.value = false
  uploading.value = false
  progress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

const handleImport = async () => {
  if (parsedData.value.length === 0) return
  const ok = await openConfirm(`確定要匯入 ${parsedData.value.length} 筆資料嗎？重複的項目將被更新。`)
  if (!ok) return

  uploading.value = true
  progress.value = 0

  const total = parsedData.value.length
  const batchSize = 100
  let uploaded = 0
  let errors = 0

  for (let i = 0; i < total; i += batchSize) {
    const chunk = parsedData.value.slice(i, i + batchSize)

    const { error } = await supabase
      .from('souvenirs')
      .upsert(chunk, { onConflict: 'doc_id' })

    if (error) {
      errors += chunk.length
    } else {
      uploaded += chunk.length
    }

    progress.value = Math.round(((i + chunk.length) / total) * 100)
  }

  uploading.value = false
  if (errors > 0) {
    showToast(`匯入完成，但有 ${errors} 筆資料失敗`, 'warning')
  } else {
    showToast(`成功匯入 ${uploaded} 筆資料！`, 'success')
    reset()
  }
}
</script>
