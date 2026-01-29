<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- Compact Trigger Button -->
    <button @click="isOpen = !isOpen" type="button"
      class="group flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-indigo-50 hover:border-indigo-200"
      :class="[
        isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100',
        isCombinedView ? 'bg-indigo-50/30' : ''
      ]">
      <div class="flex flex-col items-start">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
          {{ isCombinedView ? '匯總模式' : '切換帳戶' }}
        </span>
        <span
          class="text-xs font-black text-slate-700 tracking-tight leading-none group-hover:text-indigo-700 transition-colors">
          {{ activeLabel }}
        </span>
      </div>

      <!-- Chevron -->
      <svg class="w-3.5 h-3.5 ml-0.5 text-slate-300 transition-transform duration-300"
        :class="{ 'rotate-180 text-indigo-400': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <div v-if="isOpen"
        class="absolute right-0 z-[100] mt-2 w-64 origin-top-right bg-white rounded-[1.5rem] shadow-2xl ring-1 ring-slate-100 focus:outline-none overflow-hidden">
        <!-- Combined View Section -->
        <div class="p-1.5 border-b border-slate-50 bg-slate-50/30">
          <button @click="handleSelect('combined')" class="flex items-center w-full p-3 rounded-xl transition-all"
            :class="[
              isCombinedView
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'text-slate-600 hover:bg-white'
            ]">
            <div class="text-left">
              <div class="text-[13px] font-black tracking-tight">資產全覽 (所有分身)</div>
              <div class="text-[8px] font-black uppercase tracking-widest opacity-60">Combined Overview</div>
            </div>
          </button>
        </div>

        <!-- Portfolios Section -->
        <div class="px-1.5 py-1.5">
          <div class="px-3 py-1.5">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">個人帳戶</span>
          </div>

          <div class="space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
            <div v-for="p in portfolios" :key="p.id" @click="handleSelect(p.id)"
              class="group flex items-center justify-between w-full p-3 rounded-xl transition-all cursor-pointer"
              :class="[
                currentPortfolioId === p.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              ]">
              <div class="flex flex-col text-left">
                <div class="text-[13px] font-black tracking-tight"
                  :class="currentPortfolioId === p.id ? 'text-indigo-900' : 'group-hover:text-indigo-600'">
                  {{ p.name }}
                </div>
                <div v-if="p.is_default"
                  class="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mt-0.5">
                  Default
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-0.5">
                <button @click.stop="handleRename(p)"
                  class="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors rounded-lg hover:bg-white shadow-sm"
                  title="重新命名">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button v-if="!p.is_default" @click.stop="handleDelete(p)"
                  class="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-white shadow-sm"
                  title="移除">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Button -->
        <div class="p-1.5 bg-slate-50/50">
          <button @click="showAddModal = true; isOpen = false"
            class="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-white border border-slate-100 text-indigo-600 transition-all hover:border-indigo-200 hover:shadow-sm">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">新增帳戶</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modals -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in" @click="showAddModal = false">
        </div>
        <div
          class="relative bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in border border-white/50">
          <div class="text-center mb-6">
            <h3 class="text-xl font-black text-slate-900 tracking-tight">新增分身</h3>
          </div>
          <div class="space-y-4">
            <input v-model="newName" type="text" placeholder="輸入名稱..."
              class="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none transition-all focus:bg-white focus:border-indigo-500 text-sm font-black"
              @keyup.enter="handleAdd" />
            <div class="flex gap-3">
              <button @click="showAddModal = false"
                class="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">取消</button>
              <button @click="handleAdd" :disabled="!newName.trim()"
                class="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50">確認新增</button>
            </div>
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

const {
  portfolios,
  currentPortfolioId,
  currentPortfolio,
  isCombinedView,
  selectPortfolio,
  addPortfolio,
  deletePortfolio,
  updatePortfolio
} = usePortfolio()

const { showToast } = useToast()

const isOpen = ref(false)
const dropdownRef = ref(null)
const showAddModal = ref(false)
const newName = ref('')

const handleRename = async (portfolio) => {
  const name = prompt('請輸入新的帳戶名稱：', portfolio.name)
  if (name && name.trim() && name !== portfolio.name) {
    const { error } = await updatePortfolio(portfolio.id, name.trim())
    if (error) {
      showToast('修改名稱失敗: ' + error.message, 'error')
    } else {
      showToast('名稱已更新', 'success')
      isOpen.value = false
    }
  }
}

const handleDelete = async (portfolio) => {
  if (confirm(`確定要移除「${portfolio.name}」帳戶及其所有關聯資料嗎？`)) {
    const { error } = await deletePortfolio(portfolio.id)
    if (error) {
      showToast('移除失敗: ' + error.message, 'error')
    } else {
      showToast('帳戶已移除', 'success')
      isOpen.value = false
    }
  }
}

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
  if (isCombinedView.value) return '資產全覽'
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
</style>
