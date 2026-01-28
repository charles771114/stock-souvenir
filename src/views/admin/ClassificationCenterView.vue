<template>
  <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <!-- 1. Navbar -->
    <Navbar class="flex-none z-20 shadow-sm" />
    
    <!-- 2. Main Layout Wrapper -->
    <div class="flex-1 flex overflow-hidden relative">
      
      <!-- 2.1 Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-white border-r border-gray-200 relative z-10">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
              <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              待審核清單
              <span v-if="groupedQueue.length > 0" class="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200/50">
                {{ groupedQueue.length }} 組待辦
              </span>
            </h1>
            <p class="text-sm text-gray-500 mt-1 ml-8">針對「紀念品名稱」進行批次分類</p>
          </div>
          <button 
            @click="fetchQueue" 
            :disabled="loading"
            class="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
            title="重新整理"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Queue List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 relative">
          <div v-if="loading" class="flex justify-center py-12">
             <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="groupedQueue.length === 0" class="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
               <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">太棒了！</h3>
            <p class="mt-1">所有紀念品都已完成分類。</p>
          </div>

          <div v-else v-for="group in groupedQueue" :key="group.name" 
               class="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ group.name }}</h3>
                <div class="flex items-center mt-2 space-x-2">
                   <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                     出現於 {{ group.count }} 筆資料
                   </span>
                   <span class="text-xs text-gray-400">
                     (例如: {{ group.examples.join(', ') }})
                   </span>
                </div>
              </div>
              
              <!-- Quick Assign Dropdown -->
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <select 
                    @change="e => assignCategory(group.name, (e.target as HTMLSelectElement).value)"
                    class="block w-48 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <option value="">選擇分類...</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
                
                <button @click="openRuleModal(group.name)" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                  + 新增規則
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2.2 Sidebar -->
      <div class="w-96 bg-gray-50/80 backdrop-blur-xl flex flex-col border-l border-gray-200">
        <div class="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-md">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              分類規則
            </h2>
            <button @click="openCategoryModal()" class="text-xs flex items-center justify-center px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新增
            </button>
          </div>

          <!-- Category List -->
          <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 custom-scrollbar">
            <div v-for="cat in categories" :key="cat.id" 
                 class="bg-white rounded-lg border border-gray-200 p-3 hover:border-indigo-300 transition-all group relative cursor-pointer"
                 @click="openCategoryModal(cat)"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div :class="`w-3 h-3 rounded-full ${getColorClass(cat.color)}`"></div>
                  <span class="font-medium text-gray-900 text-sm">{{ cat.name }}</span>
                </div>
                <svg class="w-4 h-4 text-gray-300 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              
              <div class="flex flex-wrap gap-1">
                <span v-for="k in (cat.keywords || []).slice(0, 5)" :key="k" class="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">
                  {{ k }}
                </span>
                <span v-if="cat.keywords?.length > 5" class="text-[10px] text-gray-400 px-1">+{{ cat.keywords.length - 5 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </div> <!-- Close 2. Main Layout Wrapper -->

    <!-- Category Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div class="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-6 pt-6 pb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span class="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
              {{ isEditing ? '編輯分類規則' : '新增分類' }}
            </h3>
            
            <div class="space-y-5">
              <!-- Name -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">分類名稱</label>
                <input v-model="form.name" type="text" class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5">
              </div>

              <!-- Color -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">標籤顏色</label>
                <div class="grid grid-cols-4 gap-3">
                  <button v-for="(bgClass, colorName) in colorMap" :key="colorName"
                    @click="form.color = colorName"
                    :class="[
                      'h-8 rounded-lg border-2 transition-all',
                      bgClass,
                      form.color === colorName ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                    ]"
                  ></button>
                </div>
              </div>

              <!-- Keywords -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  關鍵字規則
                  <span class="text-xs text-gray-400 font-normal ml-1">(符合任一即歸類)</span>
                </label>
                <div class="flex rounded-lg shadow-sm mb-3">
                  <input v-model="keywordInput" @keydown.enter.prevent="addKeyword" type="text" 
                    placeholder="輸入關鍵字..."
                    class="flex-1 block w-full border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5">
                  <button @click="addKeyword" class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium text-sm">
                    新增
                  </button>
                </div>
                <div class="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <span v-for="(k, idx) in form.keywords" :key="idx" 
                        class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-200 shadow-sm">
                    {{ k }}
                    <button @click="removeKeyword(idx)" class="ml-1.5 text-gray-400 hover:text-red-500">×</button>
                  </span>
                  <span v-if="form.keywords.length === 0" class="text-sm text-gray-400 self-center">暫無關鍵字</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
            <button @click="save" :disabled="saving" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70">
              {{ saving ? '儲存中...' : '儲存變更' }}
            </button>
            <button @click="closeModal" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              取消
            </button>
            <button v-if="isEditing" @click="handleDelete(editingId!)" class="mt-3 sm:mt-0 mr-auto text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2">
              刪除分類
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { useCategories, type Category } from '@/composables/useCategories'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()

// Color Map (Tailwind Safelist equivalent)
const colorMap: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
}

const getColorClass = (colorName: string) => {
  return colorMap[colorName] || colorMap['gray']
}

// Composables
const { categories, fetchCategories, createCategory, updateCategory, loading: catLoading } = useCategories()

// State
const rawQueue = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const keywordInput = ref('')

const form = ref<{
  name: string
  color: string
  keywords: string[]
}>({
  name: '',
  color: 'gray',
  keywords: []
})

// Computed Grouped Queue
const groupedQueue = computed(() => {
  const groups: Record<string, { name: string, count: number, examples: string[] }> = {}
  
  for (const item of rawQueue.value) {
    const name = item.souvenir_item
    if (!groups[name]) {
      groups[name] = { name, count: 0, examples: [] }
    }
    groups[name].count++
    if (groups[name].examples.length < 2) { // Keep 2 examples (company names)
       // Use company name if available, else date
       const label = item.name || item.meeting_date || 'Unknown'
       if (!groups[name].examples.includes(label)) {
         groups[name].examples.push(label)
       }
    }
  }
  
  return Object.values(groups).sort((a, b) => b.count - a.count)
})

const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  fetchCategories()
  fetchQueue()
})

const fetchQueue = async () => {
  loading.value = true
  // Fetch unclassified items
  // Note: Fetching distinct names might be better on server, but client-side grouping is fine for MVP size
  const { data, error } = await supabase
    .from('souvenirs')
    .select('*')
    .eq('classification_status', 'unclassified')
    .order('id', { ascending: false })
    .limit(1000) // Limit to 1000 for safety
  
  if (data) {
    rawQueue.value = data
  }
  loading.value = false
}

// Batch Assignment Logic
const assignCategory = async (souvenirName: string, categoryIdStr: string) => {
  if (!categoryIdStr || !souvenirName) return
  const categoryId = parseInt(categoryIdStr)
  
  // Update ALL items with this name
  const { error } = await supabase
    .from('souvenirs')
    .update({ 
      category_id: categoryId,
      classification_status: 'verified' 
    })
    .eq('souvenir_item', souvenirName)
    .eq('classification_status', 'unclassified') // Only update unclassified ones for safety
  
  if (!error) {
    // Optimistic update locally
    rawQueue.value = rawQueue.value.filter(item => item.souvenir_item !== souvenirName)
    showToast('分類更新成功', 'success')
  } else {
    showToast('批量更新失敗: ' + error.message, 'error')
  }
}

// Modal Logic (Rules)
const openCategoryModal = (cat?: Category) => {
  if (cat) {
    editingId.value = cat.id
    form.value = {
      name: cat.name,
      color: cat.color || 'gray',
      keywords: [...(cat.keywords || [])]
    }
  } else {
    editingId.value = null
    form.value = {
      name: '',
      color: 'gray',
      keywords: []
    }
  }
  showModal.value = true
}

const openRuleModal = (souvenirName: string) => {
  // Suggest a new category name based on souvenir name? Or just empty
  editingId.value = null
  form.value = {
    name: '', // Let user type generic name
    color: 'gray',
    keywords: [souvenirName] // Pre-fill the souvenir name as a keyword!
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  keywordInput.value = ''
}

const addKeyword = () => {
  const val = keywordInput.value.trim()
  if (val && !form.value.keywords.includes(val)) {
    form.value.keywords.push(val)
  }
  keywordInput.value = ''
}

const removeKeyword = (index: number) => {
  form.value.keywords.splice(index, 1)
}

const save = async () => {
  if (!form.value.name) {
    showToast('請輸入分類名稱', 'warning')
    return
  }
  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      const { error } = await updateCategory(editingId.value, form.value)
      if (error) throw error
    } else {
      const { error } = await createCategory(form.value)
      if (error) throw error
    }
    // For now, let's keep it simple. User can now assign the new category from dropdown.
    closeModal()
  } catch (e: any) {
    showToast('儲存失敗: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  const ok = await openConfirm('確定要刪除此分類嗎？')
  if (!ok) return
  showToast('刪除功能暫未開放', 'info')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
