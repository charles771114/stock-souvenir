<template>
  <div class="h-screen bg-surface-50 flex flex-col overflow-hidden">
    <!-- Navbar -->
    <Navbar class="flex-none z-20 shadow-sm" />

    <!-- Main Content wrapper -->
    <div class="flex-1 flex overflow-hidden relative lg:px-8 max-w-[1600px] mx-auto w-full">

      <!-- Left: Queue Sidebar (Hidden on mobile by default or toggle) -->
      <div :class="[
        'lg:flex flex-col lg:w-96 bg-white lg:bg-transparent border-r lg:border-none border-slate-100 absolute lg:relative z-30 lg:z-10 h-full transition-transform duration-500 delay-75',
        isSidebarOpen ? 'translate-x-0 w-full' : '-translate-x-full lg:translate-x-0'
      ]">
        <div class="flex-1 flex flex-col min-h-0 bg-white lg:bg-transparent p-4 sm:p-6 lg:pl-0">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xs font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              分類規則
            </h2>
            <button @click="openCategoryModal()"
              class="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-amber-200 hover:scale-110 transition-all">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <!-- Category List -->
          <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <div v-for="cat in categories" :key="cat.id"
              class="glass-card-mini p-4 hover:border-amber-200 transition-all group relative cursor-pointer active:scale-95"
              @click="openCategoryModal(cat)">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div :class="`w-2.5 h-2.5 rounded-full ${getColorClass(cat.color)} shadow-sm`"></div>
                  <span class="font-black text-slate-700 text-sm tracking-tight">{{ cat.name }}</span>
                </div>
                <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-brand-primary">
                  編輯
                </div>
              </div>

              <div class="flex flex-wrap gap-1">
                <span v-for="k in (cat.keywords || []).slice(0, 4)" :key="k"
                  class="status-badge status-badge-neutral !px-1.5 !py-0.5 !rounded-lg border-none">
                  {{ k }}
                </span>
                <span v-if="cat.keywords?.length > 4" class="text-[10px] font-bold text-slate-300 px-1">+{{
                  cat.keywords.length - 4 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Area: Review Queue -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-surface-50">
        <!-- Page Header (Within Main) -->
        <div
          class="px-6 sm:px-10 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-fade-in-up">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <router-link to="/admin/panel"
                class="group flex items-center gap-2 text-slate-400 hover:text-brand-primary transition-all font-black text-[10px] uppercase tracking-[0.2em] leading-none">
                <div
                  class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-100 shadow-sm transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                管理主頁
              </router-link>
              <!-- Mobile Sidebar Toggle -->
              <button @click="isSidebarOpen = !isSidebarOpen"
                class="lg:hidden w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
            <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            分類中心
          </h1>
            <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
              核對並為待分類的紀念品標籤進行歸類
            </p>
          </div>

          <button @click="fetchQueue" :disabled="loading"
            class="h-12 px-6 bg-white border border-slate-100 text-brand-primary rounded-2xl shadow-sm hover:bg-amber-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
            <svg :class="['w-4 h-4 transition-transform duration-700', loading ? 'animate-spin' : '']" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            同步更新佇列
          </button>

          <button @click="autoClassify" :disabled="loading || autoClassifying || groupedQueue.length === 0"
            class="h-12 px-6 bg-brand-primary text-white rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none disabled:opacity-50 disabled:shadow-none">
            <svg :class="['w-4 h-4', autoClassifying ? 'animate-spin' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ autoClassifying ? '自動分類中...' : '智能自動分類' }}
          </button>
        </div>

        <!-- Queue List Content -->
        <div class="flex-1 overflow-y-auto px-6 sm:px-10 pb-10 space-y-4 sm:space-y-6">
          <div v-if="loading && rawQueue.length === 0" class="flex flex-col items-center justify-center py-24 gap-6">
            <div class="w-16 h-16 border-8 border-slate-50 border-t-brand-primary rounded-full animate-spin"></div>
            <p class="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">正在掃描資料庫...</p>
          </div>

          <div v-else-if="groupedQueue.length === 0"
            class="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div
              class="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100">
              <svg class="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-2xl font-black text-slate-800 tracking-tighter mb-2">清單已清空！</h3>
            <p class="text-sm font-bold text-slate-400">所有紀念品名稱都已經正確分類完成。</p>
          </div>

          <div v-else v-for="(group, idx) in groupedQueue" :key="group.name"
            class="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group hover:border-amber-200 transition-all animate-fade-in-up"
            :style="`animation-delay: ${idx * 0.05}s`">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl sm:text-2xl font-black text-slate-800 truncate tracking-tight">{{ group.name }}</h3>
                <span
                  class="status-badge status-badge-primary group-hover:bg-brand-primary group-hover:text-white whitespace-nowrap">
                  出現次數: {{ group.count }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">參考來源:</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="example in group.examples" :key="example"
                    class="status-badge status-badge-neutral !px-2 !py-0.5 !rounded-lg">
                    {{ example }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div class="relative flex-1 sm:flex-none min-w-[160px]">
                <select @change="e => assignCategory(group.name, (e.target as HTMLSelectElement).value)"
                  class="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none cursor-pointer appearance-none">
                  <option value="">快速指定分類...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
                <div class="absolute right-4 inset-y-0 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button @click="openRuleModal(group.name)"
                class="w-full sm:w-auto h-12 px-5 bg-white border border-amber-100 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                + 新增規則
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Category Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" @click="closeModal"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative overflow-hidden animate-bounce-in">
          <div class="p-8 sm:p-10">
            <div class="flex items-center justify-between mb-8">
              <div>
                <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 block">Rule
                  規則引擎</span>
                <h2 class="text-3xl font-black text-slate-800 tracking-tighter">{{ isEditing ? '編輯分類規則' : '新增分類' }}</h2>
              </div>
              <button @click="closeModal"
                class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-6">
              <!-- Name -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">分類名稱</label>
                <input v-model="form.name" type="text" placeholder="例如：生活用品、電器、股東大會..."
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />
              </div>

              <!-- Color -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">標籤顏色</label>
                <div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  <button v-for="(bgClass, colorName) in colorMap" :key="colorName" @click="form.color = colorName"
                    :class="[
                      'h-8 rounded-xl transition-all shadow-sm',
                      bgClass,
                      form.color === colorName ? 'ring-2 ring-offset-2 ring-brand-primary scale-110 shadow-lg' : 'hover:scale-105 opacity-60'
                    ]"></button>
                </div>
              </div>

              <!-- Keywords -->
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  關鍵字規則
                  <span class="normal-case opacity-40 ml-1">(符合其一即自動歸類)</span>
                </label>
                <div class="flex gap-2">
                  <input v-model="keywordInput" @keydown.enter.prevent="addKeyword" type="text" placeholder="輸入關鍵字..."
                    class="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 outline-none transition-all">
                  <button @click="addKeyword"
                    class="px-5 py-3 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all">
                    新增
                  </button>
                </div>
                <div
                  class="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 border-dashed">
                  <div v-for="(k, idx) in form.keywords" :key="idx"
                    class="status-badge status-badge-primary !px-4 !py-2 !rounded-xl border-amber-100 overflow-hidden relative">
                    {{ k }}
                    <button @click="removeKeyword(idx)"
                      class="ml-2 w-4 h-4 rounded-full bg-amber-100 text-brand-primary hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-[8px] font-bold">×</button>
                  </div>
                  <div v-if="form.keywords.length === 0"
                    class="flex-1 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    目前無規則</div>
                </div>
              </div>

              <div class="flex gap-4 pt-4">
                <button v-if="isEditing" @click="handleDelete(editingId!)"
                  class="w-12 h-12 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-red-50">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div class="flex flex-1 gap-3">
                  <button @click="closeModal"
                    class="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                    取消
                  </button>
                  <button @click="save" :disabled="saving"
                    class="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-50">
                    {{ saving ? '儲存中...' : (isEditing ? '更新分類規則' : '建立分類規則') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { useCategories, type Category } from '@/composables/useCategories'
import { useGifts } from '@/composables/useGifts'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()
const { clearGiftsCache } = useGifts()

// Color Map
const colorMap: Record<string, string> = {
  gray: 'bg-slate-200',
  red: 'bg-rose-500',
  yellow: 'bg-brand-secondary',
  green: 'bg-emerald-500',
  blue: 'bg-brand-primary',
  indigo: 'bg-indigo-600',
  purple: 'bg-violet-600',
  pink: 'bg-pink-600',
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
const isSidebarOpen = ref(false)
const autoClassifying = ref(false)

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
    if (!name) continue
    if (!groups[name]) {
      groups[name] = { name, count: 0, examples: [] }
    }
    groups[name].count++
    if (groups[name].examples.length < 3) {
      const label = item.name || item.code || 'N/A'
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
  const { data, error } = await supabase
    .from('souvenirs')
    .select('*')
    .eq('classification_status', 'unclassified')
    .order('id', { ascending: false })
    .limit(1000)

  if (data) {
    rawQueue.value = data
  }
  loading.value = false
}

const assignCategory = async (souvenirName: string, categoryIdStr: string) => {
  if (!categoryIdStr || !souvenirName) return
  const categoryId = parseInt(categoryIdStr)

  const { error } = await supabase
    .from('souvenirs')
    .update({
      category_id: categoryId,
      classification_status: 'verified'
    })
    .eq('souvenir_item', souvenirName)
    .eq('classification_status', 'unclassified')

  if (!error) {
    clearGiftsCache() // 清除所有年份快取，因為分類可能跨年份
    rawQueue.value = rawQueue.value.filter(item => item.souvenir_item !== souvenirName)
    showToast(`「${souvenirName}」已分類`, 'success')
  } else {
    showToast('分類失敗: ' + error.message, 'error')
  }
}

const autoClassify = async () => {
  if (groupedQueue.value.length === 0) return
  
  const ok = await openConfirm(`確定要對目前佇列中 ${groupedQueue.value.length} 組項目執行自動分類嗎？`)
  if (!ok) return

  autoClassifying.value = true
  let successCount = 0

  // 1. Prepare rules and static snapshot of current queue
  const rules = categories.value.map(cat => ({
    id: cat.id,
    name: cat.name,
    keywords: cat.keywords || []
  }))
  
  const groupsToProcess = [...groupedQueue.value]

  // 2. Process each group from the static snapshot
  for (const group of groupsToProcess) {
    let matchedId = null
    const name = group.name.toLowerCase()

    for (const rule of rules) {
      if (rule.keywords.some(k => name.includes(k.toLowerCase()))) {
        matchedId = rule.id
        break
      }
    }

    if (matchedId) {
      // Simulate selection
      await assignCategory(group.name, matchedId.toString())
      successCount++
    }
  }

  autoClassifying.value = false
  if (successCount > 0) {
    showToast(`自動分類完成，共歸類 ${successCount} 組項目`, 'success')
  } else {
    showToast('未找到匹配的分類規則', 'info')
  }
}

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
  editingId.value = null
    form.value = {
    name: souvenirName,
    color: 'brand-primary',
    keywords: [souvenirName]
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
  showToast('刪除功能暫不開放', 'info')
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.25rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
}

.glass-card-mini {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px -5px rgba(31, 38, 135, 0.03);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--brand-primary);
  opacity: 0.1;
  border-radius: 20px;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  60% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
