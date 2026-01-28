<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
    <Navbar />
    
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8 animate-fade-in-up">
        <div class="flex items-center gap-3 mb-2">
          <router-link to="/admin/panel" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-3xl font-black text-gray-900">紀念品資料管理</h1>
        </div>
        <p class="text-gray-500 ml-8">手動新增、編輯與管理各年度紀念品資料</p>
      </div>

      <!-- Filter Bar -->
      <div class="glass-card p-6 mb-6 animate-fade-in-up delay-100">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Year Filter -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500">年度：</span>
            <select v-model="selectedYear" @change="fetchSouvenirs"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <input v-model="searchQuery" type="text" placeholder="搜尋股票代號或公司名稱..."
              class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
          </div>

          <!-- Add Button -->
          <div class="flex items-center gap-2">
            <router-link to="/admin/import/souvenirs"
              class="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              批量匯入
            </router-link>
            <button @click="openAddModal"
              class="px-4 py-2 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新增紀念品
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up delay-150">
        <div class="glass-card p-4">
          <p class="text-sm text-gray-500 mb-1">總筆數</p>
          <p class="text-2xl font-black text-gray-900">{{ filteredSouvenirs.length }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-sm text-gray-500 mb-1">有紀念品名稱</p>
          <p class="text-2xl font-black text-emerald-600">{{ withSouvenirCount }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-sm text-gray-500 mb-1">待填寫</p>
          <p class="text-2xl font-black text-amber-600">{{ pendingCount }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner />
      </div>

      <!-- Table -->
      <div v-else class="glass-card overflow-hidden animate-fade-in-up delay-200">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">股票代號</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">公司名稱</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">紀念品</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">開會日期</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">最後買進日</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in paginatedSouvenirs" :key="item.id" 
                class="hover:bg-cyan-50/50 transition-colors">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{{ item.code }}</span>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3">
                  <span v-if="item.souvenir_item" class="text-sm text-gray-700">{{ item.souvenir_item }}</span>
                  <span v-else class="text-sm text-amber-500 italic">尚未填寫</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">{{ item.meeting_date || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">{{ item.last_buy_date || '-' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="openEditModal(item)" 
                      class="p-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors" title="編輯">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete(item)" 
                      class="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="刪除">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredSouvenirs.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>{{ selectedYear }} 年度尚無紀念品資料</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
          <p class="text-sm text-gray-500">共 {{ filteredSouvenirs.length }} 筆</p>
          <div class="flex items-center gap-2">
            <button @click="currentPage--" :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              上一頁
            </button>
            <span class="text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
              下一頁
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">{{ isEditing ? '編輯紀念品' : '新增紀念品' }}</h2>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="saveItem" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">股票代號 *</label>
                <input v-model="formData.code" type="text" required :disabled="isEditing"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">公司名稱</label>
                <input v-model="formData.name" type="text"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">紀念品名稱</label>
              <input v-model="formData.souvenir_item" type="text" placeholder="例如：咖啡禮盒、超商禮券..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">開會日期</label>
                <input v-model="formData.meeting_date" type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">最後買進日</label>
                <input v-model="formData.last_buy_date" type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">開會地點</label>
              <input v-model="formData.location" type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal"
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                取消
              </button>
              <button type="submit" :disabled="saving"
                class="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-bold disabled:opacity-50">
                {{ saving ? '儲存中...' : '儲存' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up p-6 text-center">
          <div class="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">確認刪除？</h3>
          <p class="text-sm text-gray-500 mb-2">確定要刪除 {{ itemToDelete?.name }} ({{ itemToDelete?.code }}) 的紀念品資料嗎？此操作無法復原。</p>
          <div class="px-3 py-2 bg-amber-50 rounded-xl mb-6">
            <p class="text-xs text-amber-700 flex items-start gap-2 text-left">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>注意：所有收藏此項目的用戶記錄也將同步刪除。此變更將在資料庫更新後生效。</span>
            </p>
          </div>
          <div class="flex justify-center gap-3">
            <button @click="showDeleteConfirm = false"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
              取消
            </button>
            <button @click="deleteItem" :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold disabled:opacity-50">
              {{ deleting ? '刪除中...' : '確認刪除' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref } from 'vue'

const { showToast } = useToast()

// State
const souvenirs = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)
const searchQuery = ref('')
const selectedYear = ref(new Date().getFullYear().toString())
const currentPage = ref(1)
const pageSize = 25

const availableYears = ['2026', '2025', '2024']

// Form Data
const formData = ref({
  code: '',
  name: '',
  souvenir_item: '',
  meeting_date: '',
  last_buy_date: '',
  location: ''
})

// Computed
const filteredSouvenirs = computed(() => {
  if (!searchQuery.value) return souvenirs.value
  const q = searchQuery.value.toLowerCase()
  return souvenirs.value.filter(s => 
    s.code?.toLowerCase().includes(q) || 
    s.name?.toLowerCase().includes(q) ||
    s.souvenir_item?.toLowerCase().includes(q)
  )
})

const paginatedSouvenirs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSouvenirs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredSouvenirs.value.length / pageSize))

const withSouvenirCount = computed(() => 
  souvenirs.value.filter(s => s.souvenir_item && s.souvenir_item.trim() !== '').length
)

const pendingCount = computed(() => 
  souvenirs.value.filter(s => !s.souvenir_item || s.souvenir_item.trim() === '').length
)

// Methods
const fetchSouvenirs = async () => {
  loading.value = true
  currentPage.value = 1
  try {
    const startDate = `${selectedYear.value}-01-01`
    const endDate = `${selectedYear.value}-12-31`
    
    const { data, error } = await supabase
      .from('souvenirs')
      .select('*')
      .gte('meeting_date', startDate)
      .lte('meeting_date', endDate)
      .order('code', { ascending: true })
    
    if (error) throw error
    souvenirs.value = data || []
  } catch (e) {
    console.error('取得紀念品資料失敗:', e)
    showToast('取得資料失敗', 'error')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    name: '',
    souvenir_item: '',
    meeting_date: `${selectedYear.value}-06-01`,
    last_buy_date: '',
    location: ''
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = { code: '', name: '', souvenir_item: '', meeting_date: '', last_buy_date: '', location: '' }
}

const saveItem = async () => {
  saving.value = true
  try {
    // Generate doc_id for new items
    const docId = `${formData.value.code}_${formData.value.meeting_date}`
    
    if (isEditing.value) {
      // Update
      const { error } = await supabase
        .from('souvenirs')
        .update({
          name: formData.value.name,
          souvenir_item: formData.value.souvenir_item,
          meeting_date: formData.value.meeting_date,
          last_buy_date: formData.value.last_buy_date || null,
          location: formData.value.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.value.id)
      
      if (error) throw error
      showToast('更新成功', 'success')
    } else {
      // Insert
      const { error } = await supabase
        .from('souvenirs')
        .insert({
          doc_id: docId,
          code: formData.value.code,
          name: formData.value.name,
          souvenir_item: formData.value.souvenir_item,
          meeting_date: formData.value.meeting_date,
          last_buy_date: formData.value.last_buy_date || null,
          location: formData.value.location
        })
      
      if (error) throw error
      showToast('新增成功', 'success')
    }
    
    closeModal()
    await fetchSouvenirs()
  } catch (e) {
    console.error('儲存失敗:', e)
    showToast(e.message || '儲存失敗', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const deleteItem = async () => {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    const { error } = await supabase
      .from('souvenirs')
      .delete()
      .eq('id', itemToDelete.value.id)
    
    if (error) throw error
    showToast('刪除成功', 'success')
    showDeleteConfirm.value = false
    itemToDelete.value = null
    await fetchSouvenirs()
  } catch (e) {
    console.error('刪除失敗:', e)
    showToast(e.message || '刪除失敗', 'error')
  } finally {
    deleting.value = false
  }
}

// Init
onMounted(() => {
  fetchSouvenirs()
})
</script>
