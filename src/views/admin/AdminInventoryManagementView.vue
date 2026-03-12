<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
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
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            主動庫存維護
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            跨使用者搜尋、分析與批量庫存回收
          </p>
        </div>
      </div>

      <!-- Mode Switch Tabs -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12 animate-fade-in-up delay-100">
        <div class="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] w-full sm:w-auto self-start">
          <button @click="searchMode = 'user'" :class="[
            'px-6 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2',
            searchMode === 'user' ? 'bg-white text-brand-primary shadow-xl shadow-2xl' : 'text-slate-400 hover:text-slate-600'
          ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            依使用者
          </button>
          <button @click="searchMode = 'souvenir'" :class="[
            'px-6 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2',
            searchMode === 'souvenir' ? 'bg-white text-brand-primary shadow-xl shadow-2xl' : 'text-slate-400 hover:text-slate-600'
          ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            依紀念品
          </button>
        </div>

        <!-- Search Input (User Mode) -->
        <div v-if="searchMode === 'user'" class="flex-1 relative animate-fade-in">
          <div class="relative group">
            <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="userSearch" @input="handleUserSearch" type="text" placeholder="搜尋使用者電子郵件或名稱..."
              class="w-full h-full min-h-[56px] pl-14 pr-6 py-3 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-black placeholder:text-slate-300 shadow-sm focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />

            <!-- User Search Results Dropdown -->
            <div v-if="userResults.length > 0"
              class="absolute z-30 w-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 animate-bounce-in">
              <div v-for="user in userResults" :key="user.id" @click="selectUser(user)"
                class="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4 group/item">
                <div
                  class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black group-hover/item:bg-brand-primary group-hover/item:text-white transition-all shadow-inner">
                  {{ user.full_name?.charAt(0) || user.email?.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <div class="font-black text-slate-800 truncate text-sm leading-none mb-1">{{ user.full_name ||
                    '匿名用戶' }}</div>
                  <div class="text-[10px] text-slate-400 font-bold truncate leading-none">{{ user.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Input (Souvenir Mode) -->
        <div v-if="searchMode === 'souvenir'" class="flex-1 relative animate-fade-in">
          <div class="relative group">
            <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="souvenirSearch" @input="handleSouvenirSearch" type="text" placeholder="搜尋紀念品代碼或名稱..."
              class="w-full h-full min-h-[56px] pl-14 pr-6 py-3 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-black placeholder:text-slate-300 shadow-sm focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />

            <!-- Souvenir Search Results Dropdown -->
            <div v-if="souvenirResults.length > 0"
              class="absolute z-30 w-full mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 animate-bounce-in">
              <div v-for="s in souvenirResults" :key="s.id" @click="selectSouvenir(s)"
                class="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4 group/item">
                <div
                  class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                  {{ s.code }}
                </div>
                <div class="min-w-0">
                  <div class="font-black text-slate-800 truncate text-sm leading-none mb-1">{{ s.name }}</div>
                  <div class="text-[10px] text-slate-400 font-bold truncate leading-none">
                    {{ s.souvenir_item }} ({{ s.meeting_date ? new Date(s.meeting_date).getFullYear() : 'N/A' }})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Area for Selected State -->
      <div v-if="selectedUser || selectedSouvenir" class="mb-12 animate-fade-in-up">
        <div
          class="glass-card mb-8 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 bg-gradient-to-br from-white via-white to-slate-50">
          <div class="flex items-center gap-6">
            <div v-if="selectedUser"
              class="w-20 h-20 rounded-[1.75rem] bg-brand-primary text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-amber-200">
              {{ selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0) }}
            </div>
            <div v-if="selectedSouvenir"
              class="w-20 h-20 rounded-[1.75rem] bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl">
              {{ selectedSouvenir.code }}
            </div>
            <div>
              <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1 block">目前檢查對象</span>
              <h2 class="text-3xl font-black text-slate-800 tracking-tighter">{{ selectedUser?.full_name ||
                selectedUser?.email || selectedSouvenir?.name }}</h2>
              <div class="flex items-center gap-2 mt-2">
                <span v-if="inventory.length > 0" class="text-xs font-black text-emerald-500">{{ inventory.length }}
                  筆符合紀錄</span>
                <span v-else class="text-xs font-black text-slate-300">目前無紀錄</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button v-if="searchMode === 'souvenir' && inventory.length > 0" @click="showBatchModal = true"
              class="h-14 px-8 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
              批量回收 ({{ inventory.length }})
            </button>
            <button @click="searchMode === 'user' ? resetUserSearch() : resetSouvenirSearch()"
              class="h-14 w-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Inventory List -->
        <div v-if="loadingInventory" class="py-24 flex flex-col items-center gap-6">
          <div class="w-16 h-16 border-8 border-slate-50 border-t-brand-primary rounded-full animate-spin"></div>
          <p class="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">正在取得紀錄...</p>
        </div>

        <div v-else-if="inventory.length === 0" class="glass-card py-24 text-center">
          <div
            class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <svg class="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-sm font-black text-slate-300 uppercase tracking-widest">{{ searchMode === 'user' ? '此用戶目前無庫存' :
            '全站無用戶持有此紀念品' }}</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
          <div v-for="(item, idx) in inventory" :key="item.id"
            class="glass-card p-6 flex flex-col group hover:border-amber-200 transition-all active:scale-[0.98]">

            <!-- User Info (in Souvenir Mode) -->
            <div v-if="searchMode === 'souvenir'" class="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-50/50">
              <div
                class="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-white">
                {{ item.profile?.full_name?.charAt(0) || item.profile?.email?.charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-black text-slate-800 truncate leading-none mb-1">{{ item.profile?.full_name ||
                  'Anonymous' }}</div>
                <div class="text-[10px] text-brand-primary/60 font-black truncate leading-none uppercase tracking-widest">{{ item.profile?.email }}</div>
              </div>
            </div>

            <div class="flex items-start justify-between mb-4">
              <div
                class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">
                代碼: {{ item.souvenir?.code || 'N/A' }}
              </div>
              <button @click="handleDelete(item)" :disabled="deletingId === item.id"
                class="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                <svg v-if="deletingId === item.id" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <h3 class="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{{ item.souvenir?.name ||
              UNKNOWN_ITEM }}</h3>
            <p class="text-xs font-bold text-slate-400 mb-6 truncate">{{ item.souvenir?.souvenir_item ||
              PENDING_VERIFICATION }}</p>

            <div class="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">目前持有中</span>
              </div>
              <span class="text-[10px] font-bold text-slate-300 font-mono italic">自 {{ item.created_at ? new
                Date(item.created_at).toLocaleDateString() : '-' }} 起</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Welcome State (Empty search) -->
      <div v-else class="flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <div
          class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 rotate-3 shadow-2xl shadow-slate-200 border border-slate-100">
          <svg v-if="searchMode === 'user'" class="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <svg v-else class="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 class="text-3xl font-black text-slate-800 mb-4 tracking-tighter">
          {{ searchMode === 'user' ? '依使用者管理庫存' : '依紀念品批量管理' }}
        </h2>
        <p class="text-slate-400 max-w-sm text-center font-bold text-sm leading-relaxed">
          {{ searchMode === 'user' ? USER_SEARCH_HINT : SOUVENIR_SEARCH_HINT }}
        </p>
      </div>
    </main>

    <!-- Batch Delete Modal -->
    <Teleport to="body">
      <div v-if="showBatchModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" @click="showBatchModal = false">
        </div>
        <div
          class="relative bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-bounce-in overflow-hidden">
          <!-- Top Warning Accent -->
          <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>

          <div
            class="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 mx-auto border-4 border-white shadow-xl">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 class="text-3xl font-black text-center text-slate-800 mb-2 tracking-tighter">不可逆：批量回收</h3>
          <p class="text-center text-slate-400 mb-8 font-bold text-sm leading-relaxed">將從全站 <span
              class="text-rose-600 underline px-1">{{ inventory.length }} 位使用者</span> 清單中，永久移除「{{ selectedSouvenir?.name
              }}」。</p>

          <div class="space-y-4 mb-10">
            <label class="block text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">請輸入 「DELETE
              ALL」 以執行</label>
            <input v-model="batchConfirmText" type="text"
              class="block w-full px-4 py-4 bg-slate-50 border border-slate-100 focus:border-rose-300 focus:bg-white rounded-2xl text-center font-black transition-all outline-none"
              placeholder="Type here..." />
          </div>

          <div class="flex gap-4">
            <button @click="showBatchModal = false"
              class="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
              取消
            </button>
            <button @click="handleBatchDelete" :disabled="batchConfirmText !== 'DELETE ALL' || deletingAll"
              class="flex-[2] py-4 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 disabled:opacity-30 transition-all">
              {{ deletingAll ? '處理中...' : '確認批量回收' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

const UNKNOWN_ITEM = '未知項目'
const PENDING_VERIFICATION = '待驗證項目'

const USER_SEARCH_HINT = '請在上方搜尋框輸入 Email 或姓名，即可開始管理該用戶的庫存項目。'
const SOUVENIR_SEARCH_HINT = '搜尋特定紀念品，一次找出全站持有的使用者並進行批量移除。'

const searchMode = ref('user')
const userSearch = ref('')
const userResults = ref([])
const selectedUser = ref(null)

const souvenirSearch = ref('')
const souvenirResults = ref([])
const selectedSouvenir = ref(null)

const inventory = ref([])
const loadingInventory = ref(false)
const deletingId = ref(null)

const showBatchModal = ref(false)
const batchConfirmText = ref('')
const deletingAll = ref(false)

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

  const ok = await openConfirm(`確定要刪除「${item.souvenir?.name}」的庫存嗎？` + (searchMode.value === 'souvenir' ? `\n對象：${targetName}` : ''))
  if (!ok) return

  deletingId.value = item.id
  try {
    if (item.souvenir?.code && item.user_id) {
      await supabase
        .from('inventory_staging')
        .update({ status: 'PENDING', matched_user_id: null })
        .eq('matched_user_id', item.user_id)
        .eq('stock_code', item.souvenir.code)
    }
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
    for (const item of itemsToDelete) {
      if (item.souvenir?.code && item.user_id) {
        await supabase
          .from('inventory_staging')
          .update({ status: 'PENDING', matched_user_id: null })
          .eq('matched_user_id', item.user_id)
          .eq('stock_code', item.souvenir.code)
      }
    }
    const { error } = await supabase
      .from('user_collections')
      .delete()
      .in('id', idsToDelete)
    if (error) throw error
    showToast(`已回收 ${idsToDelete.length} 筆庫存`, 'success')
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
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 2.25rem;
  box-shadow: 0 20px 50px -15px rgba(15, 23, 42, 0.04);
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

.delay-200 {
  animation-delay: 0.2s;
}
</style>
