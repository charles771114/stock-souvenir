<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- Compact Trigger Button -->
    <button @click="isOpen = !isOpen" type="button"
      class="group flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-indigo-50 hover:border-indigo-200 whitespace-nowrap min-w-max"
      :class="[
        isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100',
        isCombinedView ? 'bg-indigo-50/30' : ''
      ]">
      <div class="flex flex-col items-start leading-tight">
        <span class="hidden sm:block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
          {{ isCombinedView ? '匯總模式' : '切換帳戶' }}
        </span>
        <div class="flex items-center gap-1.5">
          <span class="text-sm font-black text-slate-700 tracking-tight leading-none group-hover:text-indigo-700 transition-colors">
            <!-- Simplified for small screens -->
            <span class="min-[360px]:inline hidden">{{ activeLabel }}</span>
            <span class="inline min-[360px]:hidden">{{ activeLabel.charAt(0) }}</span>
          </span>
        </div>
      </div>

      <!-- Chevron -->
      <i class="ri-arrow-down-s-line text-slate-300 transition-transform duration-300"
        :class="{ 'rotate-180 text-indigo-400': isOpen }"></i>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div v-if="isOpen"
        class="fixed inset-x-4 top-[100px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-64 z-[100] origin-top bg-white rounded-2xl shadow-2xl ring-1 ring-slate-100 focus:outline-none overflow-hidden p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
        <!-- Combined View Section -->
        <div class="mb-1">
          <button @click="handleSelect('combined')" 
            class="flex items-center w-full p-3.5 rounded-xl transition-all group/combined"
            :class="[
              isCombinedView
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-50'
            ]">
            <div class="text-left whitespace-nowrap flex-1 min-w-0">
              <div class="text-[13px] font-black tracking-tight truncate" :class="{ 'text-white': isCombinedView }">資產全覽 (所有分身)</div>
              <div class="text-[8px] font-black uppercase tracking-widest opacity-60 truncate" :class="{ 'text-indigo-100': isCombinedView }">Combined Overview</div>
            </div>
            <i v-if="isCombinedView" class="ri-check-line ml-auto text-white font-bold text-lg"></i>
          </button>
        </div>

        <!-- Portfolios Section -->
        <div class="space-y-1">
          <div class="px-3.5 py-2">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">個人帳戶</span>
          </div>

          <div class="space-y-1 max-h-[280px] overflow-y-auto no-scrollbar px-0.5">
            <div v-for="p in portfolios" :key="p.id" @click="handleSelect(p.id)"
              class="group flex items-center justify-between w-full p-3.5 rounded-xl transition-all cursor-pointer"
              :class="[
                currentPortfolioId === p.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              ]">
              <div class="flex flex-col text-left min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-nowrap min-w-0">
                  <span class="text-[14px] font-black tracking-tight truncate flex-1 min-w-0"
                    :class="currentPortfolioId === p.id ? 'text-indigo-900' : 'group-hover:text-indigo-600'">
                    {{ p.name }}
                  </span>
                  <span v-if="p.is_default"
                    class="text-[7px] font-black bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded-md uppercase tracking-tighter shrink-0 whitespace-nowrap">
                    Default
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-1 shrink-0 ml-3">
                <button @click.stop="handleRename(p)"
                  class="p-2 text-slate-300 hover:text-indigo-600 transition-colors rounded-lg hover:bg-white shadow-sm flex items-center justify-center bg-slate-50/50"
                  title="重新命名">
                  <i class="ri-edit-line text-xs font-bold"></i>
                </button>
                <button v-if="!p.is_default" @click.stop="handleDelete(p)"
                  class="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-white shadow-sm flex items-center justify-center bg-slate-50/50"
                  title="移除">
                  <i class="ri-delete-bin-line text-xs font-bold"></i>
                </button>
                <i v-if="currentPortfolioId === p.id" class="ri-check-line text-indigo-500 font-bold ml-1 text-lg"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Button -->
        <div class="mt-2 p-1.5 border-t border-slate-50">
          <button @click="showAddModal = true; isOpen = false"
            class="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-slate-50 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white hover:shadow-lg group shadow-sm overflow-hidden">
            <i class="ri-add-line text-base font-black group-hover:scale-110 transition-transform"></i>
            <span class="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">新增帳戶</span>
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
