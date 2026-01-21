<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog"
        aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="close"></div>

        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <Transition name="modal">
            <div v-if="isOpen"
              class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">

              <!-- Header -->
              <div
                class="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
                <h3 class="text-lg font-bold leading-6 text-gray-900" id="modal-title">新增庫存</h3>
                <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="px-4 py-5 sm:p-6 space-y-4">

                <!-- Search Box -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">搜尋紀念品</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input v-model="searchQuery" @input="handleSearch" type="text"
                      class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                      placeholder="輸入公司名稱、股票代號或紀念品名稱..." />
                  </div>
                </div>

                <!-- Search Results -->
                <div v-if="loadingSearch" class="flex justify-center py-4">
                  <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>

                <div v-else-if="searchResults.length > 0"
                  class="max-h-60 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100 bg-gray-50">
                  <div v-for="item in searchResults" :key="item.id" @click="selectItem(item)"
                    class="p-3 hover:bg-indigo-50 cursor-pointer transition-colors flex justify-between items-center group"
                    :class="{ 'bg-indigo-50 ring-1 ring-indigo-500': selectedItem?.id === item.id }">
                    <div>
                      <div class="font-bold text-gray-900 text-sm">
                        <span
                          class="inline-block px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs text-gray-600 mr-2">{{
                            item.code }}</span>
                        {{ item.name }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ item.souvenir_item }} ({{ item.meeting_date ? new Date(item.meeting_date).getFullYear() : '?'
                        }})
                      </div>
                    </div>
                    <div v-if="selectedItem?.id === item.id" class="text-indigo-600">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div v-else-if="searchQuery && !loadingSearch" class="text-center py-4 text-gray-500 text-sm">
                  找不到相關紀念品
                </div>

                <!-- Input Fields (Only show if item selected) -->
                <div v-if="selectedItem" class="pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                  <div class="flex gap-4">
                    <div class="w-1/3">
                      <label class="block text-sm font-medium text-gray-700 mb-1">數量</label>
                      <input v-model.number="form.quantity" type="number" min="1"
                        class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 bg-gray-50" />
                    </div>
                    <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-700 mb-1">備註 (選填)</label>
                      <input v-model="form.note" type="text"
                        class="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 bg-gray-50 bg-white"
                        placeholder="購買於..." />
                    </div>
                  </div>
                </div>

              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" @click="handleSubmit" :disabled="!selectedItem || submitting"
                  class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed items-center">
                  <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  加入庫存
                </button>
                <button type="button" @click="close"
                  class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  取消
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useCollection } from '@/composables/useCollection'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const { addToCollection } = useCollection()
const { showToast } = useToast()

const searchQuery = ref('')
const searchResults = ref([])
const loadingSearch = ref(false)
const selectedItem = ref(null)
const submitting = ref(false)

const form = ref({
  quantity: 1,
  note: ''
})

// Debounced search
let debounceTimer
const handleSearch = () => {
  clearTimeout(debounceTimer)
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  loadingSearch.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const { data, error } = await supabase
        .from('souvenirs')
        .select('id, name, souvenir_item, code, meeting_date')
        .or(`name.ilike.%${searchQuery.value}%,code.ilike.%${searchQuery.value}%,souvenir_item.ilike.%${searchQuery.value}%`)
        .limit(10)

      if (error) throw error
      searchResults.value = data
    } catch (e) {
      console.error(e)
    } finally {
      loadingSearch.value = false
    }
  }, 500)
}

const selectItem = (item) => {
  selectedItem.value = item
}

const close = () => {
  emit('close', false) // false means no refresh needed if just closed
  // Reset
  setTimeout(() => {
    searchQuery.value = ''
    searchResults.value = []
    selectedItem.value = null
    form.value = { quantity: 1, note: '' }
  }, 300)
}

const handleSubmit = async () => {
  if (!selectedItem.value) return

  submitting.value = true

  try {
    const { success, error } = await addToCollection(
      selectedItem.value.id,
      form.value.quantity,
      form.value.note
    )

    if (!success) throw new Error(error)

    showToast('已加入庫存', 'success')
    emit('close', true) // true means data updated, please refresh
  } catch (e) {
    showToast(e.message || '加入失敗', 'error')
  } finally {
    submitting.value = false
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    // Focus input?
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
