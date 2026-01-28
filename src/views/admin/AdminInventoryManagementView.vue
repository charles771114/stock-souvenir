<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Header -->
      <div class="mb-8 animate-fade-in-up">
        <h1 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          管理者庫存管理
        </h1>
        <p class="text-gray-500 mt-2 font-medium">跨用戶管理、搜尋與批量回收庫存項目</p>
      </div>

      <!-- Mode Switch Tabs -->
      <div class="flex gap-2 mb-8 p-1 bg-gray-100 rounded-2xl w-fit">
        <button @click="searchMode = 'user'" 
          :class="['px-6 py-2.5 rounded-xl font-black transition-all text-sm tracking-widest uppercase', 
          searchMode === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
          搜尋使用者
        </button>
        <button @click="searchMode = 'souvenir'" 
          :class="['px-6 py-2.5 rounded-xl font-black transition-all text-sm tracking-widest uppercase', 
          searchMode === 'souvenir' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']">
          搜尋紀念品
        </button>
      </div>

      <!-- Search Section (User Mode) -->
      <div v-if="searchMode === 'user'" class="glass-card p-6 mb-10 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div class="relative">
            <label class="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-2">搜尋使用者</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input v-model="userSearch" @input="handleUserSearch" type="text"
                class="block w-full pl-12 pr-4 py-4 bg-indigo-50/50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900"
                placeholder="輸入 Email 或姓名..." />
              
              <div v-if="userResults.length > 0" class="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-indigo-50 overflow-hidden divide-y divide-indigo-50">
                <div v-for="user in userResults" :key="user.id" @click="selectUser(user)"
                  class="p-4 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                    {{ user.full_name?.charAt(0) || user.email?.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-black text-gray-900 truncate">{{ user.full_name || '未設定姓名' }}</div>
                    <div class="text-xs text-gray-400 font-bold truncate">{{ user.email }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedUser" class="flex items-center gap-4 animate-fade-in">
            <div class="glass-card px-6 py-4 bg-green-50 border-green-100 flex items-center gap-4 flex-grow">
               <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 font-black text-2xl">
                 {{ selectedUser.full_name?.charAt(0) }}
               </div>
               <div>
                  <div class="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">正在檢視</div>
                  <div class="text-lg font-black text-gray-900 tracking-tighter">{{ selectedUser.full_name }}</div>
               </div>
            </div>
            <button @click="resetUserSearch" class="p-4 rounded-2xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Search Section (Souvenir Mode) -->
      <div v-if="searchMode === 'souvenir'" class="glass-card p-6 mb-10 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div class="relative">
            <label class="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-2">搜尋紀念品</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input v-model="souvenirSearch" @input="handleSouvenirSearch" type="text"
                class="block w-full pl-12 pr-4 py-4 bg-indigo-50/50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-gray-900"
                placeholder="輸入公司名稱或項目..." />
              
              <div v-if="souvenirResults.length > 0" class="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-indigo-50 overflow-hidden divide-y divide-indigo-50">
                <div v-for="s in souvenirResults" :key="s.id" @click="selectSouvenir(s)"
                  class="p-4 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                    {{ s.code }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-black text-gray-900 truncate">{{ s.name }}</div>
                    <div class="text-[10px] text-gray-400 font-black uppercase tracking-wider truncate">
                      {{ s.souvenir_item }} ({{ s.meeting_date ? new Date(s.meeting_date).getFullYear() : 'N/A' }})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedSouvenir" class="flex items-center gap-4 animate-fade-in">
            <div class="glass-card px-6 py-4 bg-purple-50 border-purple-100 flex items-center gap-4 flex-grow">
               <div class="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-sm">
                 {{ selectedSouvenir.code }}
               </div>
               <div class="min-w-0">
                  <div class="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none mb-1">正在查詢</div>
                  <div class="text-lg font-black text-gray-900 tracking-tighter truncate">{{ selectedSouvenir.name }}</div>
               </div>
            </div>
            <button @click="resetSouvenirSearch" class="p-4 rounded-2xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Area for Souvenir Mode -->
      <div v-if="searchMode === 'souvenir' && selectedSouvenir && !loadingInventory && inventory.length > 0" 
        class="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center justify-between animate-fade-in-up">
        <div>
          <h4 class="text-red-900 font-black tracking-tight">危險操作：批量回收庫存</h4>
          <p class="text-red-500/70 text-xs font-bold mt-1">此操作將從所有持有的使用者清單中移除此紀念品。</p>
        </div>
        <button @click="showBatchModal = true"
          class="px-8 py-3 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-200 uppercase tracking-widest text-sm">
          刪除全部持有者 ({{ inventory.length }})
        </button>
      </div>

      <!-- Result Grid (Shared) -->
      <div v-if="(selectedUser || selectedSouvenir)" class="space-y-6">
        <div v-if="loadingInventory" class="flex flex-col items-center justify-center py-20 space-y-6">
          <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div class="text-indigo-950 font-black tracking-widest animate-pulse">正在搜尋中...</div>
        </div>

        <div v-else-if="inventory.length === 0" class="glass-card p-20 text-center animate-fade-in">
          <div class="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-2">未找到任何記錄</h3>
          <p class="text-gray-400">{{ searchMode === 'user' ? '此用戶目前無庫存' : '全站無用戶持有此紀念品' }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(item, idx) in inventory" :key="item.id" 
            class="glass-card p-6 group hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
            :style="{ animationDelay: `${idx * 0.05}s` }">
            
            <!-- User Info (in Souvenir Mode) -->
            <div v-if="searchMode === 'souvenir'" class="flex items-center gap-3 mb-6 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-50">
               <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-black shadow-sm">
                 {{ item.profile?.full_name?.charAt(0) || item.profile?.email?.charAt(0) }}
               </div>
               <div class="min-w-0">
                  <div class="text-xs font-black text-gray-900 truncate">{{ item.profile?.full_name || '未設定姓名' }}</div>
                  <div class="text-[10px] text-gray-400 font-black truncate">{{ item.profile?.email }}</div>
               </div>
            </div>

            <div class="flex justify-between items-start mb-4">
              <div class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                {{ item.souvenir?.code || '未知' }}
              </div>
              <button @click="handleDelete(item)" :disabled="deletingId === item.id"
                class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <svg v-if="deletingId === item.id" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <h3 class="text-xl font-black text-gray-900 mb-1 tracking-tighter">{{ item.souvenir?.name || '未知公司' }}</h3>
            <div class="text-gray-400 text-xs font-bold mb-4">{{ item.souvenir?.souvenir_item || '紀念品待查' }}</div>
            
            <div class="flex items-center justify-between pt-4 border-t border-gray-50">
               <div class="flex items-center gap-2">
                 <div class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                 <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Holding</span>
               </div>
               <span class="text-[10px] font-bold text-gray-300">
                 {{ item.created_at ? new Date(item.created_at).toLocaleDateString() : '-' }}
               </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Welcome State -->
      <div v-else class="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <div class="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg">
          <svg v-if="searchMode === 'user'" class="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <svg v-else class="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-3xl font-black text-gray-900 mb-4 tracking-tighter">
          {{ searchMode === 'user' ? '依使用者管理' : '依紀念品批量管理' }}
        </h3>
        <p class="text-gray-400 max-w-md text-center font-medium">
          {{ searchMode === 'user' ? '請在上方搜尋框輸入 Email 或姓名，即可開始管理該用戶的庫存項目。' : '搜尋特定紀念品，一次找出全站持有的使用者並進行批量移除。' }}
        </p>
      </div>
    </main>

    <!-- Batch Delete Modal -->
    <div v-if="showBatchModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm" @click="showBatchModal = false"></div>
      <div class="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-2xl font-black text-center text-gray-900 mb-2">確認批量刪除？</h3>
        <p class="text-center text-gray-500 mb-6 font-medium">將刪除全站共 <span class="text-red-500 font-black">{{ inventory.length }}</span> 位使用者手中的「{{ selectedSouvenir?.name }}」。此動作無法復原！</p>
        
        <div class="mb-8">
           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">請輸入「DELETE ALL」確認</label>
           <input v-model="batchConfirmText" type="text" 
             class="block w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl text-center font-black transition-all"
             placeholder="DELETE ALL" />
        </div>

        <div class="flex gap-4">
          <button @click="showBatchModal = false" class="flex-grow py-4 rounded-2xl bg-gray-100 text-gray-500 font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-sm">
            取消
          </button>
          <button @click="handleBatchDelete" :disabled="batchConfirmText !== 'DELETE ALL' || deletingAll"
            class="flex-grow py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 disabled:opacity-30 transition-all uppercase tracking-widest text-sm shadow-lg shadow-red-200">
            {{ deletingAll ? '刪除中...' : '確認刪除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { ref, watch } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()

const searchMode = ref('user') // 'user' | 'souvenir'
const userSearch = ref('')
const userResults = ref([])
const selectedUser = ref(null)

const souvenirSearch = ref('')
const souvenirResults = ref([])
const selectedSouvenir = ref(null)

const inventory = ref([])
const loadingInventory = ref(false)
const deletingId = ref(null)

// Batch Delete
const showBatchModal = ref(false)
const batchConfirmText = ref('')
const deletingAll = ref(false)

// Reset when mode changes
watch(searchMode, () => {
  resetUserSearch()
  resetSouvenirSearch()
})

let searchTimer
const handleUserSearch = () => {
  clearTimeout(searchTimer)
  if (!userSearch.value || userSearch.value.length < 2) {
    userResults.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(`email.ilike.%${userSearch.value}%,full_name.ilike.%${userSearch.value}%`)
        .limit(5)

      if (!error) userResults.value = data
    } catch (e) {
      console.error(e)
    }
  }, 300)
}

const handleSouvenirSearch = () => {
  clearTimeout(searchTimer)
  if (!souvenirSearch.value || souvenirSearch.value.length < 2) {
    souvenirResults.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    try {
      const { data, error } = await supabase
        .from('souvenirs')
        .select('id, name, souvenir_item, code, meeting_date')
        .or(`name.ilike.%${souvenirSearch.value}%,code.ilike.%${souvenirSearch.value}%`)
        .order('meeting_date', { ascending: false })
        .limit(10)

      if (!error) souvenirResults.value = data
    } catch (e) {
      console.error(e)
    }
  }, 300)
}

const selectUser = async (user) => {
  selectedUser.value = user
  userResults.value = []
  userSearch.value = ''
  await fetchInventoryByUser(user.id)
}

const selectSouvenir = async (souvenir) => {
  selectedSouvenir.value = souvenir
  souvenirResults.value = []
  souvenirSearch.value = ''
  await fetchInventoryBySouvenir(souvenir)
}

const fetchInventoryByUser = async (userId) => {
  loadingInventory.value = true
  try {
    const { data, error } = await supabase
      .from('user_collections')
      .select('*, souvenir: souvenirs (*)')
      .eq('user_id', userId)
      .eq('status', 'holding')
      .order('created_at', { ascending: false })

    if (error) throw error
    inventory.value = data || []
  } catch (err) {
    showToast('載入庫存失敗', 'error')
    console.error(err)
  } finally {
    loadingInventory.value = false
  }
}

const fetchInventoryBySouvenir = async (souvenir) => {
  loadingInventory.value = true
  try {
    const { data, error } = await supabase
      .from('user_collections')
      .select('*, souvenir: souvenirs!inner(*), profile: profiles (id, email, full_name)')
      .eq('souvenir.code', souvenir.code)
      .eq('status', 'holding')
      .order('created_at', { ascending: false })

    if (error) throw error
    inventory.value = data || []
  } catch (err) {
    showToast('載入持有清單失敗', 'error')
    console.error(err)
  } finally {
    loadingInventory.value = false
  }
}

const handleDelete = async (item) => {
  const targetName = searchMode.value === 'user' 
    ? item.souvenir?.name 
    : item.profile?.full_name || item.profile?.email

  const ok = await openConfirm(`確定要刪除「${item.souvenir?.name}」的庫存記錄嗎？` + (searchMode.value === 'souvenir' ? `\n對象：${targetName}` : ''))
  if (!ok) return
  
  deletingId.value = item.id
  try {
    // 1. Reset matching inventory staging records if they exist
    // Matching by user_id and stock_code
    if (item.souvenir?.code && item.user_id) {
       await supabase
        .from('inventory_staging')
        .update({ status: 'PENDING', matched_user_id: null })
        .eq('matched_user_id', item.user_id)
        .eq('stock_code', item.souvenir.code)
    }

    // 2. Delete the collection record
    const { error } = await supabase
      .from('user_collections')
      .delete()
      .eq('id', item.id)

    if (error) throw error
    
    showToast('刪除成功並已移回暫存區', 'success')
    inventory.value = inventory.value.filter(i => i.id !== item.id)
  } catch (err) {
    showToast('刪除失敗', 'error')
    console.error(err)
  } finally {
    deletingId.value = null
  }
}

const handleBatchDelete = async () => {
  if (batchConfirmText.value !== 'DELETE ALL') return
  if (!selectedSouvenir.value) return

  deletingAll.value = true
  try {
    const itemsToDelete = inventory.value
    const idsToDelete = itemsToDelete.map(i => i.id)

    // 1. Reset inventory staging for all items in bulk if possible, 
    // or iterate if composite keys are needed. 
    // Since we have the list, we can group by user and code.
    for (const item of itemsToDelete) {
      if (item.souvenir?.code && item.user_id) {
        await supabase
          .from('inventory_staging')
          .update({ status: 'PENDING', matched_user_id: null })
          .eq('matched_user_id', item.user_id)
          .eq('stock_code', item.souvenir.code)
      }
    }

    // 2. Delete collection records
    const { error } = await supabase
      .from('user_collections')
      .delete()
      .in('id', idsToDelete)

    if (error) throw error
    
    showToast(`已回收 ${idsToDelete.length} 筆庫存至暫存區`, 'success')
    inventory.value = []
    showBatchModal.value = false
    batchConfirmText.value = ''
  } catch (err) {
    showToast('批量刪除失敗', 'error')
    console.error(err)
  } finally {
    deletingAll.value = false
  }
}

const resetUserSearch = () => {
  selectedUser.value = null
  inventory.value = []
}

const resetSouvenirSearch = () => {
  selectedSouvenir.value = null
  inventory.value = []
}
</script>

<style scoped>
.glass-card {
  @apply bg-white border border-gray-100 shadow-xl rounded-[2rem] transition-all;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
