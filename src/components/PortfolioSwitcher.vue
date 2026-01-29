<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="inline-flex items-center justify-between px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
      :class="{ 'ring-2 ring-indigo-500 border-transparent': isOpen }"
    >
      <div class="flex items-center">
        <!-- Icon -->
        <div class="mr-2">
          <svg v-if="isCombinedView" class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <svg v-else class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <!-- Label -->
        <span class="truncate max-w-[60px] sm:max-w-[100px] hidden min-[400px]:block">
          {{ activeLabel }}
        </span>
      </div>
      <svg class="w-4 h-4 ml-2 -mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-[100] mt-2 w-56 origin-top-right bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 overflow-hidden"
      >
        <div class="px-3 py-2 bg-gray-50/50">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">切換帳戶</p>
        </div>
        
        <div class="py-1">
          <!-- Portfolios List -->
          <button
            v-for="p in portfolios"
            :key="p.id"
            @click="handleSelect(p.id)"
            class="flex items-center w-full px-4 py-2.5 text-sm transition-colors group"
            :class="[
              currentPortfolioId === p.id 
                ? 'text-indigo-700 bg-indigo-50 font-semibold' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            ]"
          >
            <div 
              class="w-2 h-2 rounded-full mr-3 transition-colors"
              :class="currentPortfolioId === p.id ? 'bg-indigo-600' : 'bg-transparent group-hover:bg-gray-300'"
            ></div>
            {{ p.name }}
            <span v-if="p.is_default" class="ml-2 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded border border-gray-200">
              預設
            </span>
          </button>
        </div>

        <!-- Combined View -->
        <div class="py-1">
          <button
            @click="handleSelect('combined')"
            class="flex items-center w-full px-4 py-2.5 text-sm transition-colors group"
            :class="[
              isCombinedView 
                ? 'text-purple-700 bg-purple-50 font-semibold' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
            ]"
          >
            <div class="p-1 mr-2 bg-purple-100 rounded text-purple-600 group-hover:bg-purple-200">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            歸戶總覽 (Combined)
          </button>
        </div>

        <!-- Management Actions -->
        <div class="py-1">
          <button
            @click="showAddModal = true; isOpen = false"
            class="flex items-center w-full px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增帳戶
          </button>
        </div>
      </div>
    </Transition>

    <!-- Simple Add Portfolio Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4">新增帳戶</h3>
          <input
            v-model="newName"
            type="text"
            placeholder="例如: 配偶、小孩 A"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-4"
            @keyup.enter="handleAdd"
          />
          <div class="flex space-x-3">
            <button
              @click="showAddModal = false"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="handleAdd"
              :disabled="!newName.trim()"
              class="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              新增
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { usePortfolio } from '@/composables/usePortfolio'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const { portfolios, currentPortfolioId, currentPortfolio, isCombinedView, selectPortfolio, addPortfolio } = usePortfolio()
const { showToast } = useToast()

const isOpen = ref(false)
const dropdownRef = ref(null)
const showAddModal = ref(false)
const newName = ref('')

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const activeLabel = computed(() => {
  if (isCombinedView.value) return '歸戶總覽'
  return currentPortfolio.value?.name || '選擇帳戶'
})

const handleSelect = (id) => {
  selectPortfolio(id)
  isOpen.value = false
}

const handleAdd = async () => {
  if (!newName.value.trim()) return
  
  const { data, error } = await addPortfolio(newName.value.trim())
  if (error) {
    showToast('新增帳戶失敗: ' + error.message, 'error')
  } else {
    showToast('帳戶已新增', 'success')
    showAddModal.value = false
    newName.value = ''
    selectPortfolio(data.id)
  }
}
</script>
