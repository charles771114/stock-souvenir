<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1
            class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            紀念品分類管理
          </h1>
          <p class="text-slate-400 font-bold text-sm uppercase tracking-wider">
            定義紀念品類別與關鍵字自動匹配規則
          </p>
        </div>
        <button @click="openModal()"
          class="h-12 px-8 bg-brand-primary text-white rounded-2xl shadow-xl shadow-amber-200 hover:bg-brand-primary/95 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新增分類規則
        </button>
      </div>

      <!-- Category Table -->
      <div class="glass-card overflow-hidden p-0 animate-fade-in-up delay-100">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0">
            <thead>
              <tr class="bg-amber-50 border-b border-amber-100">
                <th
                  class="px-8 py-5 text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  分類名稱
                </th>
                <th
                  class="px-6 py-5 text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  系統標籤色
                </th>
                <th
                  class="px-6 py-5 text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  自動匹配關鍵字 (Rule Engine)
                </th>
                <th
                  class="px-8 py-5 text-right text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  管理操作
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="cat in categories" :key="cat.id" class="group hover:bg-slate-50/50 transition-all">
                <td class="px-8 py-6 whitespace-nowrap text-lg font-black text-slate-800 tracking-tighter">
                  {{ cat.name }}
                </td>
                <td class="px-6 py-6 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div :class="`w-3 h-3 rounded-full shadow-sm ${getColorClass(cat.color)}`"></div>
                    <span class="status-badge status-badge-neutral border-none !p-0">
                      {{ cat.color }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-6 max-w-lg">
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="k in cat.keywords" :key="k"
                      class="status-badge status-badge-neutral !px-2.5 !py-1.5 !rounded-lg hover:border-amber-200">
                      {{ k }}
                    </span>
                    <span v-if="!cat.keywords || cat.keywords.length === 0"
                      class="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">目前無規則</span>
                  </div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openModal(cat)"
                      class="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-brand-primary transition-all border border-slate-100">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button @click="handleDelete(cat.id)"
                      class="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="categories.length === 0 && !loading">
                <td colspan="4" class="px-8 py-20 text-center">
                  <div class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">庫存結構為空</div>
                  <p class="text-sm font-bold text-slate-400">尚無分類規則，請點擊右上角按鈕「新增分類規則」。</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" @click="closeModal"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative overflow-hidden animate-bounce-in">
          <!-- Top Accent -->
          <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-slate-900 via-brand-primary to-slate-700"></div>

          <div class="p-8 sm:p-10">
            <div class="flex items-center justify-between mb-8">
              <div>
                <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1 block">Rule
                  分類引擎配置</span>
                <h2 class="text-3xl font-black text-slate-800 tracking-tighter">{{ isEditing ? '編輯分類規則' : '對齊新規則' }}</h2>
              </div>
              <button @click="closeModal"
                class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-6">
              <!-- Name -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">分類呈現名稱</label>
                <input v-model="form.name" type="text" placeholder="例如：生活五金、股東特供..."
                  class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />
              </div>

              <!-- Color -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">系統識別顏色</label>
                <select v-model="form.color"
                  class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none appearance-none cursor-pointer">
                  <option value="gray">灰色 (Gray)</option>
                  <option value="red">紅色 (Red)</option>
                  <option value="yellow">黃色 (Yellow)</option>
                  <option value="green">綠色 (Green)</option>
                  <option value="blue">藍色 (Blue)</option>
                  <option value="indigo">靛藍色 (Indigo)</option>
                  <option value="purple">紫色 (Purple)</option>
                  <option value="pink">粉紅色 (Pink)</option>
                </select>
              </div>

              <!-- Keywords -->
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  自動匹配關鍵字 (Entry Rules)
                </label>
                <div class="flex gap-2">
                  <input v-model="keywordInput" @keydown.enter.prevent="addKeyword" type="text" placeholder="輸入規則字串..."
                    class="flex-1 h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-amber-200 outline-none transition-all">
                  <button @click="addKeyword"
                    class="px-6 h-14 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all">
                    注入規則
                  </button>
                </div>
                <div
                  class="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100 border-dashed">
                  <div v-for="(k, idx) in form.keywords" :key="idx"
                    class="status-badge status-badge-primary !px-4 !py-2 !rounded-xl border-amber-100">
                    {{ k }}
                    <button @click="removeKeyword(idx)"
                      class="ml-2 w-4 h-4 rounded-full bg-amber-100 text-brand-primary hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-[8px] font-bold">×</button>
                  </div>
                  <div v-if="form.keywords.length === 0"
                    class="flex-1 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    等待注入關鍵字規則</div>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button @click="closeModal"
                  class="flex-1 h-14 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                  取消
                </button>
                <button @click="save" :disabled="saving"
                  class="flex-[2] h-14 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-brand-primary/95 transition-all disabled:opacity-50">
                  {{ saving ? '正在同步數據...' : '確認完成配置' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { useCategories, type Category } from '@/composables/useCategories'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()

// Color Map matching ClassificationCenter
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

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.25rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
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

.delay-100 {
  animation-delay: 0.1s;
}
</style>
