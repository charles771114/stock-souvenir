<template>
  <div class="min-h-screen bg-gray-50 relative overflow-hidden">
    <!-- Animated Background Mesh -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div
        class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob">
      </div>
      <div
        class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000">
      </div>
      <div
        class="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000">
      </div>
    </div>

    <Navbar class="relative z-10" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 animate-fade-in">
        <div>
          <h1 class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tighter mb-2">
            我的庫存
          </h1>
          <p class="text-lg text-gray-400 font-black uppercase tracking-widest">
            Personal Inventory Assets
          </p>
        </div>

        <div class="flex gap-4">
          <button v-if="inventoryItems.length > 0" @click="handleClearAll"
            class="h-12 px-6 bg-white/50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-50 transition-all text-xs font-black uppercase tracking-widest">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              全部清除
            </span>
          </button>
          <button @click="isImportModalOpen = true"
            class="h-12 px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-xs font-black uppercase tracking-widest">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              新增庫存
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="relative w-16 h-16">
          <div class="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full opacity-25"></div>
          <div
            class="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin">
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="inventoryItems.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm mx-auto max-w-2xl text-center">
        <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">您的庫存是空的</h3>
        <p class="text-gray-500 max-w-sm mb-8">您可以點擊右上角的「新增庫存」手動加入紀念品，或是在紀念品目錄中收藏。</p>
        <button @click="isImportModalOpen = true"
          class="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm font-medium">
          立即新增
        </button>
      </div>

      <!-- Inventory List -->
      <div v-else class="space-y-6">
        <!-- Stats Cards (Pro Max) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div class="glass-card p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-indigo-100/20">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">持有品項 / Total Assets</div>
            <div class="text-3xl font-black text-indigo-600 tracking-tighter">{{ inventoryItems.length }}</div>
          </div>
          <div class="glass-card p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-indigo-100/20">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">投資公司 / Companies</div>
            <div class="text-3xl font-black text-purple-600 tracking-tighter">{{ uniqueCompanies }}</div>
          </div>
          <div class="glass-card p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-indigo-100/20">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">年份分佈 / In Years</div>
            <div class="text-3xl font-black text-pink-600 tracking-tighter">{{ uniqueYears }}</div>
          </div>
        </div>

        <!-- Inventory Table (Pro Max) -->
        <div class="w-full">
          <!-- Mobile Cards -->
          <div class="sm:hidden space-y-4">
            <div v-for="item in inventoryItems" :key="item.id" 
              class="glass-card p-5 rounded-[1.5rem] border border-white/60 shadow-lg animate-fade-in-up">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 font-mono tracking-tighter">
                    {{ item.souvenir?.code }}
                  </span>
                  <div class="text-sm font-black text-gray-900">{{ item.souvenir?.name }}</div>
                </div>
                <button @click="deleteItem(item)" class="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div class="text-xs font-black text-gray-500 tracking-widest uppercase mb-1">紀念品</div>
              <div class="text-sm font-medium text-gray-800 mb-4">{{ item.souvenir?.souvenir_item }}</div>
              <div class="flex justify-between items-center pt-4 border-t border-gray-100/50">
                <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {{ new Date(item.created_at).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="hidden sm:block overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl bg-white/40 backdrop-blur-xl">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/30">
                  <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">代號</th>
                  <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">公司名稱</th>
                  <th class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/2">紀念品項目</th>
                  <th class="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100/50">
                <tr v-for="item in inventoryItems" :key="item.id"
                  class="hover:bg-indigo-50/20 transition-all group">
                  <td class="px-8 py-6">
                    <span class="text-xs font-black px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-mono tracking-tighter">
                      {{ item.souvenir?.code }}
                    </span>
                  </td>
                  <td class="px-8 py-6">
                    <div class="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{{ item.souvenir?.name }}</div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="text-sm font-medium text-gray-700 leading-relaxed">{{ item.souvenir?.souvenir_item }}</div>
                  </td>
                  <td class="px-8 py-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                       <button @click="deleteItem(item)"
                        class="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="移除此項">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <InventoryImportModal :is-open="isImportModalOpen" @close="closeImportModal" />

    <!-- Edit Modal (Simple Note/Quantity) -->
    <!-- Could reuse ImportModal or create a small specific one. For MVP, reusing logic or separate small edit is fine. -->

  </div>
</template>

<script setup>
import InventoryImportModal from '@/components/InventoryImportModal.vue'
import Navbar from '@/components/Navbar.vue'
import { useCollection } from '@/composables/useCollection'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref } from 'vue'

const { collection, loading, fetchAllInventory, removeFromCollection, clearAllCollections } = useCollection()
const { confirm } = useDialog()
const { showToast } = useToast()

const isImportModalOpen = ref(false)

// Alias for clarity
const inventoryItems = collection

const uniqueCompanies = computed(() => {
  const codes = new Set(inventoryItems.value.map(i => i.souvenir?.code).filter(Boolean))
  return codes.size
})

const uniqueYears = computed(() => {
  const years = new Set(inventoryItems.value.map(i => i.souvenir?.meeting_date ? new Date(i.souvenir.meeting_date).getFullYear() : '未知'))
  return years.size
})

// Group by Year
const groupedInventory = computed(() => {
  const groups = {}
  inventoryItems.value.forEach(item => {
    const year = item.souvenir?.meeting_date
      ? new Date(item.souvenir.meeting_date).getFullYear()
      : '未知年份'

    if (!groups[year]) groups[year] = []
    groups[year].push(item)
  })

  // Sort years descending
  return Object.keys(groups)
    .sort((a, b) => b - a)
    .reduce((obj, key) => {
      obj[key] = groups[key]
      return obj
    }, {})
})

const closeImportModal = async (shouldRefresh) => {
  isImportModalOpen.value = false
  if (shouldRefresh) {
    await fetchAllInventory()
  }
}

const deleteItem = async (item) => {
  if (await confirm(`確定要刪除「${item.souvenir?.name}」嗎？`, '刪除庫存')) {
    const { success, error } = await removeFromCollection(item.id)
    if (success) {
      showToast('已刪除', 'success')
    } else {
      showToast(error, 'error')
    }
  }
}

const editItem = (item) => {
  // For now, maybe just open import modal pre-filled? or separate edit.
  // MVP: Just show toast "Editing coming soon" or allow delete/re-add
  showToast('編輯功能開發中，請先刪除後重新加入', 'info')
}

const handleClearAll = async () => {
  const confirmed = await confirm(
    `確定要清空所有庫存嗎？此操作無法復原。\n目前共有 ${inventoryItems.value.length} 筆資料。`,
    '確認清空庫存'
  )
  
  if (!confirmed) return
  
  const { success, error } = await clearAllCollections()
  if (success) {
    showToast('已清空所有庫存', 'success')
  } else {
    showToast(error || '清空失敗', 'error')
  }
}

onMounted(() => {
  fetchAllInventory()
})
</script>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
</style>
