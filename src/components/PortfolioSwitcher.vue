<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- Trigger Button -->
    <button @click="isOpen = !isOpen" type="button"
      class="group relative flex items-center gap-2.5 px-4 py-2 bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-indigo-100/50 hover:border-indigo-200"
      :class="[
        isOpen ? 'border-indigo-500 shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-100',
        isCombinedView ? 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50' : ''
      ]">
      <!-- Icon -->
      <div class="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 shadow-sm" :class="[
        isCombinedView
          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-200'
          : 'bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
      ]">
        <svg v-if="isCombinedView" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <!-- Label -->
      <div class="flex flex-col items-start translate-y-[-1px]">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
          {{ isCombinedView ? '合併計算中' : '目前檢視' }}
        </span>
        <span
          class="text-sm font-black text-slate-700 tracking-tight leading-none group-hover:text-indigo-700 transition-colors">
          {{ activeLabel }}
        </span>
      </div>

      <!-- Chevron -->
      <svg class="w-4 h-4 ml-1 text-slate-300 transition-transform duration-300"
        :class="{ 'rotate-180 text-indigo-400': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2">
      <div v-if="isOpen"
        class="absolute right-0 z-[100] mt-3 w-72 origin-top-right bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.15)] ring-1 ring-slate-100 focus:outline-none overflow-hidden">
        <!-- Combined View Section (Top Priority) -->
        <div class="p-2 border-b border-slate-50 bg-slate-50/30">
          <button @click="handleSelect('combined')"
            class="flex items-center w-full p-4 rounded-2xl transition-all group relative overflow-hidden" :class="[
              isCombinedView
                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-600 hover:bg-white hover:shadow-md'
            ]">
            <div class="flex items-center gap-3 relative z-10">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                :class="isCombinedView ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="text-left">
                <div class="text-sm font-black tracking-tight"
                  :class="isCombinedView ? 'text-white' : 'text-slate-700'">合併統計視角</div>
                <div class="text-[9px] font-black uppercase tracking-widest opacity-60"
                  :class="isCombinedView ? 'text-white/80' : 'text-slate-400'">
                  跨帳戶加總計算
                </div>
              </div>
            </div>
            <div v-if="isCombinedView" class="absolute -right-2 -bottom-2 opacity-10">
              <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </button>
        </div>

        <!-- Portfolios Section -->
        <div class="px-2 pt-2 pb-1 bg-white">
          <div class="px-4 py-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">分身帳戶列表</span>
          </div>

          <div class="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar px-1">
            <div v-for="p in portfolios" :key="p.id" @click="handleSelect(p.id)"
              class="group relative flex items-center justify-between w-full p-4 rounded-2xl transition-all cursor-pointer border-2"
              :class="[
                currentPortfolioId === p.id
                  ? 'border-indigo-500 bg-indigo-50/30'
                  : 'border-transparent hover:border-slate-50 hover:bg-slate-50/50'
              ]">
              <div class="flex items-center gap-3">
                <!-- Avatar-like Initial -->
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all shadow-sm"
                  :class="currentPortfolioId === p.id ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 group-hover:text-indigo-600 group-hover:border-indigo-100'">
                  {{ p.name.charAt(0) }}
                </div>

                <div class="text-left translate-y-[-1px]">
                  <div class="text-sm font-black tracking-tight"
                    :class="currentPortfolioId === p.id ? 'text-indigo-900' : 'text-slate-600 group-hover:text-indigo-700'">
                    {{ p.name }}
                  </div>
                  <div v-if="p.is_default"
                    class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">
                    預設主帳戶
                  </div>
                </div>
              </div>

              <!-- Actions (Hidden by default, shown on hover) -->
              <div class="flex items-center opacity-0 group-hover:opacity-100 transition-all gap-1 translate-x-2">
                <button @click.stop="handleRename(p)"
                  class="p-2 text-slate-300 hover:text-indigo-600 transition-colors rounded-xl hover:bg-white hover:shadow-sm"
                  title="修改名稱">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button v-if="!p.is_default" @click.stop="handleDelete(p)"
                  class="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-xl hover:bg-white hover:shadow-sm"
                  title="移除帳戶">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Management Section (Footer) -->
        <div class="px-3 py-3 bg-slate-50/50 flex flex-col gap-2">
          <button @click="showAddModal = true; isOpen = false"
            class="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white border-2 border-slate-100 text-indigo-600 transition-all hover:border-indigo-200 hover:shadow-sm group/btn">
            <div
              class="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center transition-colors group-hover/btn:bg-indigo-600 group-hover/btn:text-white">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span
              class="text-xs font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-indigo-600 transition-colors">新增分身帳戶</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal Portal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300"
          @click="showAddModal = false"></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/50">
          <div class="text-center mb-8">
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter mb-2">新增分身帳戶</h3>
            <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">擴展您的財富視角</p>
          </div>

          <div class="space-y-6">
            <div class="relative group">
              <label
                class="absolute -top-2 left-6 px-1.5 bg-white text-[9px] font-black text-indigo-500 uppercase tracking-widest transition-colors group-focus-within:text-indigo-600">
                帳戶名稱
              </label>
              <input v-model="newName" type="text" placeholder="例如: 小寶、或是配偶名稱"
                class="w-full px-7 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none transition-all focus:bg-white focus:border-indigo-500 text-slate-700 font-black placeholder:text-slate-300"
                @keyup.enter="handleAdd" />
            </div>

            <div class="flex gap-4">
              <button @click="showAddModal = false"
                class="flex-1 py-5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                取消
              </button>
              <button @click="handleAdd" :disabled="!newName.trim()"
                class="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0">
                確認新增
              </button>
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
  if (isCombinedView.value) return '合併視角'
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
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}
</style>
