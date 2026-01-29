<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">紀念品分類管理</h1>
      <button @click="openModal()"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        新增分類
      </button>
    </div>

    <!-- Category Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名稱</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標籤顏色</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">關鍵字規則</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="cat in categories" :key="cat.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ cat.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span
                :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${cat.color}-100 text-${cat.color}-800`">
                {{ cat.color }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-md break-words">
              <div class="flex flex-wrap gap-1">
                <span v-for="k in cat.keywords" :key="k" class="bg-gray-100 px-2 py-0.5 rounded text-xs">
                  {{ k }}
                </span>
                <span v-if="!cat.keywords || cat.keywords.length === 0" class="text-gray-400 italic">無關鍵字</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openModal(cat)" class="text-indigo-600 hover:text-indigo-900 mr-4">編輯</button>
              <button @click="handleDelete(cat.id)" class="text-red-600 hover:text-red-900">刪除</button>
            </td>
          </tr>
          <tr v-if="categories.length === 0 && !loading">
            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
              尚無分類，請點擊右上角新增。
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit/Create Modal -->
    <div v-if="showModal" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
      aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
          class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ isEditing ? '編輯分類' : '新增分類' }}</h3>

            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700">分類名稱</label>
                <input v-model="form.name" type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>

              <!-- Color -->
              <div>
                <label class="block text-sm font-medium text-gray-700">顏色代碼 (Tailwind Color Name)</label>
                <select v-model="form.color"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="gray">灰色</option>
                  <option value="red">紅色</option>
                  <option value="yellow">黃色</option>
                  <option value="green">綠色</option>
                  <option value="blue">藍色</option>
                  <option value="indigo">靛藍色</option>
                  <option value="purple">紫色</option>
                  <option value="pink">粉紅色</option>
                </select>
              </div>

              <!-- Keywords -->
              <div>
                <label class="block text-sm font-medium text-gray-700">關鍵字 (輸入後按 Enter 新增)</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <input v-model="keywordInput" @keydown.enter.prevent="addKeyword" type="text" placeholder="輸入關鍵字..."
                    class="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <button @click="addKeyword"
                    class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100">
                    新增
                  </button>
                </div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="(k, idx) in form.keywords" :key="idx"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                    {{ k }}
                    <button @click="removeKeyword(idx)" class="ml-1 text-indigo-400 hover:text-indigo-600">×</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="save" :disabled="saving"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
            <button @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategories, type Category } from '@/composables/useCategories'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()

const { categories, fetchCategories, createCategory, updateCategory, loading } = useCategories()

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

const isEditing = computed(() => editingId.value !== null)

onMounted(() => {
  fetchCategories()
})

const openModal = (cat?: Category) => {
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
  // Note: Delete logic is not in useCategories yet, need to implement or just ignore for now as per plan
  showToast('刪除功能尚待實作 (需處理關聯資料)', 'info')
}
</script>
