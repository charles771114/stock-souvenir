<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1
            class="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            庫存歸戶管理
          </h1>
          <p class="text-gray-400 mt-1 font-bold text-xs sm:text-sm uppercase tracking-wider">連結暫存庫存資料與使用者帳號</p>
        </div>
        <router-link to="/admin/import/inventory"
          class="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-md border border-indigo-100 rounded-xl sm:rounded-2xl text-indigo-600 font-black hover:bg-indigo-50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 text-sm sm:text-base">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          匯入新資料
        </router-link>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
        <div class="stat-card animate-fade-in-up glass-card relative group" style="animation-delay: 0.1s">
          <div class="stat-icon bg-orange-100/50 text-orange-600 shadow-orange-100/50">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">{{ stats.pendingCount }}</div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 sm:mt-2">待處理總量</div>
          </div>
        </div>

        <div class="stat-card animate-fade-in-up glass-card border border-white/40 overflow-hidden relative group"
          style="animation-delay: 0.2s">
          <div class="stat-icon bg-indigo-50 text-indigo-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl sm:text-4xl font-black text-gray-900 leading-none">{{ stats.uniqueOwners }}</div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">不同姓名數</div>
          </div>
        </div>

        <div class="glass-card animate-fade-in-up p-2 sm:p-3 flex items-center relative overflow-hidden group/search"
          style="animation-delay: 0.3s">
          <div class="absolute inset-y-0 left-6 sm:left-10 flex items-center pointer-events-none z-10">
            <svg class="h-5 w-5 text-indigo-400 group-focus-within/search:scale-110 transition-transform" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchOwner" type="text" placeholder="快速搜尋對象姓名..."
            class="w-full pl-12 sm:pl-16 pr-6 py-4 sm:py-6 bg-indigo-50/50 border-none rounded-2xl sm:rounded-[1.5rem] text-gray-900 placeholder-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all duration-300 font-bold text-sm sm:text-base" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32 space-y-6">
        <div class="relative">
          <div class="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div class="text-indigo-900 font-black tracking-widest animate-pulse">正在載入暫存資料...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="groupedStaging.length === 0"
        class="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[3rem] text-center py-32 animate-fade-in-up shadow-2xl">
        <div class="mx-auto h-32 w-32 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <svg class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-4xl font-black text-gray-900 mb-4">太棒了！所有資料都已歸戶</h3>
        <p class="text-gray-500 text-lg font-medium">目前沒有待處理的庫存資料，休息一下吧！</p>
      </div>

      <!-- Staging Table (Desktop) / Cards (Mobile) -->
      <div class="animate-fade-in-up" style="animation-delay: 0.4s">
        <!-- Desktop Table: Visible on md and up -->
        <div class="hidden md:block glass-card border-none overflow-hidden hover:shadow-indigo-500/20">
          <table class="w-full">
            <thead>
              <tr class="bg-indigo-50/50 backdrop-blur-sm border-b border-indigo-100/50">
                <th class="px-10 py-6 text-left text-xs font-black text-indigo-900/60 uppercase tracking-[0.2em]">待歸戶對象
                </th>
                <th class="px-10 py-6 text-left text-xs font-black text-indigo-900/60 uppercase tracking-[0.2em]">待處理項目集
                </th>
                <th class="px-10 py-6 text-center text-xs font-black text-indigo-900/60 uppercase tracking-[0.2em]">總量
                </th>
                <th class="px-10 py-6 text-center text-xs font-black text-indigo-900/60 uppercase tracking-[0.2em]">操作
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-indigo-50/30">
              <tr v-for="(group, gIdx) in filteredGroups" :key="group.owner_name"
                class="hover:bg-indigo-50/40 transition-all duration-300 group"
                :style="{ animationDelay: `${gIdx * 0.05}s` }">
                <!-- Owner Name -->
                <td class="px-10 py-8">
                  <div class="flex items-center gap-5">
                    <div>
                      <span
                        class="font-black text-gray-900 text-xl block group-hover:text-indigo-600 transition-colors">{{
                          group.owner_name }}</span>
                    </div>
                  </div>
                </td>

                <!-- Items Preview -->
                <td class="px-10 py-8">
                  <div class="flex flex-wrap gap-2 max-w-xl">
                    <span v-for="(item, idx) in group.items.slice(0, 5)" :key="idx"
                      class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 shadow-sm hover:border-indigo-400 hover:bg-white transition-all uppercase">
                      {{ item.stock_name || item.stock_code }}
                    </span>
                    <div v-if="group.items.length > 5"
                      class="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-gray-900 text-white shadow-lg">
                      +{{ group.items.length - 5 }} 筆項目
                    </div>
                  </div>
                </td>

                <!-- Count Badge -->
                <td class="px-10 py-8 text-center">
                  <span
                    class="inline-flex items-center justify-center min-w-[3rem] px-4 py-2 rounded-2xl bg-orange-100 text-orange-700 text-sm font-black shadow-lg">
                    {{ group.items.length }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-10 py-8 text-center">
                  <button @click="openLinkModal(group)"
                    class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all active:scale-95">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    連結用戶
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards: Visible below md -->
        <div class="md:hidden space-y-4">
          <div v-for="(group, gIdx) in filteredGroups" :key="group.owner_name"
            class="bg-white rounded-3xl p-6 shadow-xl border border-indigo-50/50 animate-fade-in-up"
            :style="{ animationDelay: `${gIdx * 0.05}s` }">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-grow">
                <div class="flex items-center justify-between">
                  <span class="font-black text-gray-900 text-lg">{{ group.owner_name }}</span>
                  <span class="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full shadow-sm">
                    {{ group.items.length }} 筆項目
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
              <span v-for="(item, idx) in group.items.slice(0, 3)" :key="idx"
                class="px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 uppercase">
                {{ item.stock_name || item.stock_code }}
              </span>
              <div v-if="group.items.length > 3"
                class="px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-950 text-white shadow-md">
                +{{ group.items.length - 3 }} 筆項目
              </div>
            </div>

            <button @click="openLinkModal(group)"
              class="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              即刻歸戶
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Link User Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-indigo-950/60 backdrop-blur-xl transition-all duration-700" @click="closeModal">
          </div>

          <div
            class="modal-content relative bg-white border border-white/50 shadow-[0_64px_256px_-32px_rgba(79,70,229,0.5)] w-full max-w-xl rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden animate-modal-scale">
            <div class="p-6 sm:p-12">
              <div class="flex items-start sm:items-center justify-between mb-6 sm:mb-10">
                <div>
                  <h3 class="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter">歸戶手續</h3>
                  <p class="text-indigo-500 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">將暫存資料連結至正確用戶
                  </p>
                </div>
              </div>

              <div
                class="bg-indigo-50/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-10 border border-indigo-100/50 flex items-center gap-4 sm:gap-8">
                <div>
                  <div class="text-gray-900 font-black text-2xl sm:text-3xl tracking-tighter">{{
                    selectedGroup?.owner_name }}</div>
                  <div class="text-indigo-600 font-black text-sm uppercase tracking-widest mt-1">待處理：{{
                    selectedGroup?.items.length }} 筆項目</div>
                </div>
              </div>

              <div class="mb-6 sm:mb-8 relative">
                <label
                  class="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-2 sm:ml-4">搜尋目標使用者</label>
                <input v-model="userSearch" @input="searchUsers" type="text"
                  class="w-full px-4 sm:px-8 py-3 sm:py-5 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-200 transition-all font-bold text-sm sm:text-lg"
                  placeholder="輸入 Email、姓名或暱稱..." autofocus />
                <div v-if="searchingUsers" class="absolute right-6 top-12">
                  <svg class="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
              </div>

              <div class="max-h-72 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                <div v-if="userResults.length === 0 && userSearch && !searchingUsers"
                  class="p-10 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-[2rem]">
                  找不到符合條件的用戶
                </div>
                <div v-for="user in userResults" :key="user.id" @click="targetUser = user" class="user-option group"
                  :class="{ 'selected': targetUser?.id === user.id }">
                  <div class="flex items-center gap-3 sm:gap-4">
                    <div
                      class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm">
                      {{ user.full_name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0 flex-grow">
                      <div class="font-black text-gray-900 text-sm sm:text-base truncate">
                        {{ user.full_name || '未設定姓名' }}
                        <span v-if="user.nickname" class="text-indigo-500 font-bold ml-1">#{{ user.nickname }}</span>
                      </div>
                      <div class="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
                        {{ user.email }}</div>
                    </div>
                  </div>
                  <div v-if="targetUser?.id === user.id"
                    class="text-indigo-600 bg-white shadow-md p-1 rounded-full shrink-0">
                    <svg class="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="bg-gray-50/80 backdrop-blur-md px-6 sm:px-10 py-4 sm:py-8 flex gap-3 sm:gap-4 justify-end border-t border-gray-100">
              <button type="button" @click="closeModal" class="btn-secondary flex-1 sm:flex-none">
                取消
              </button>
              <button type="button" @click="confirmLink" :disabled="!targetUser || linking"
                class="btn-primary flex-1 sm:flex-none">
                <svg v-if="linking" class="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ linking ? '處理中...' : '確認' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref } from 'vue'

// 核心狀態

const loading = ref(true)
const stagingItems = ref([])
const searchOwner = ref('')
const { showToast } = useToast()

const isModalOpen = ref(false)
const selectedGroup = ref(null)
const userSearch = ref('')
const userResults = ref([])
const searchingUsers = ref(false)
const targetUser = ref(null)
const linking = ref(false)

const stats = computed(() => {
  const pendingCount = stagingItems.value.length
  const uniqueOwners = new Set(stagingItems.value.map(i => i.owner_name)).size
  return { pendingCount, uniqueOwners }
})

const groupedStaging = computed(() => {
  const groups = {}
  stagingItems.value.forEach(item => {
    if (!groups[item.owner_name]) {
      groups[item.owner_name] = {
        owner_name: item.owner_name,
        items: []
      }
    }
    groups[item.owner_name].items.push(item)
  })
  return Object.values(groups)
})

const filteredGroups = computed(() => {
  if (!searchOwner.value) return groupedStaging.value
  return groupedStaging.value.filter(g =>
    g.owner_name.toLowerCase().includes(searchOwner.value.toLowerCase())
  )
})

const fetchStagingData = async () => {
  loading.value = true
  let allData = []
  let from = 0
  const PAGE_SIZE = 1000
  let hasMore = true

  try {
    while (hasMore) {
      const { data, error } = await supabase
        .from('inventory_staging')
        .select('*')
        .eq('status', 'PENDING')
        .order('id')
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        if (data.length < PAGE_SIZE) {
          hasMore = false
        } else {
          from += PAGE_SIZE
        }
      } else {
        hasMore = false
      }
    }
    stagingItems.value = allData
  } catch (err) {
    console.error('載入資料失敗:', err)
    showToast('載入資料失敗', 'error')
  } finally {
    loading.value = false
  }
}

let searchTimer
const searchUsers = () => {
  clearTimeout(searchTimer)
  if (!userSearch.value || userSearch.value.length < 2) {
    userResults.value = []
    return
  }

  searchingUsers.value = true
  searchTimer = setTimeout(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, nickname')
      .or(`email.ilike.%${userSearch.value}%,full_name.ilike.%${userSearch.value}%,nickname.ilike.%${userSearch.value}%`)
      .limit(10)

    if (!error) userResults.value = data
    searchingUsers.value = false
  }, 400)
}

// Default Category logic
const categories = ref([])
const convenienceStoreCategoryId = ref(null)

const fetchCategoriesData = async () => {
  const { data } = await supabase.from('souvenir_categories').select('*')
  if (data) {
    categories.value = data
    const cat = data.find(c => c.name === '超商商品卡')
    if (cat) convenienceStoreCategoryId.value = cat.id
  }
}

const openLinkModal = (group) => {
  selectedGroup.value = group
  isModalOpen.value = true
  targetUser.value = null
  userSearch.value = ''
  userResults.value = []
}

const closeModal = () => {
  isModalOpen.value = false
}

const confirmLink = async () => {
  if (!selectedGroup.value || !targetUser.value) return

  linking.value = true
  try {
    const items = selectedGroup.value.items
    const userId = targetUser.value.id

    // 1. Get unique code+year combinations to check souvenirs
    const uniqueCombos = []
    const seen = new Set()
    items.forEach(item => {
      const key = `${item.stock_code}_${item.year}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueCombos.push({ code: item.stock_code, year: item.year, stock_name: item.stock_name })
      }
    })

    // 2. Fetch existing souvenirs in bulk
    // We search by year range and code
    // Optimization: Since we usually have many items for the same year, we can filter by codes
    const codes = uniqueCombos.map(c => c.code)
    const { data: existingSouvenirs, error: fetchError } = await supabase
      .from('souvenirs')
      .select('id, code, meeting_date')
      .in('code', codes)

    if (fetchError) throw fetchError

    // Map existing by key
    const souvenirMap = {}
    existingSouvenirs?.forEach(s => {
      const year = new Date(s.meeting_date).getFullYear()
      const key = `${s.code}_${year}`
      souvenirMap[key] = s.id
    })

    // 3. Identify and create missing souvenirs in bulk
    const missingCombos = uniqueCombos.filter(c => !souvenirMap[`${c.code}_${c.year}`])

    if (missingCombos.length > 0) {
      console.log(`Found ${missingCombos.length} missing souvenirs, auto-creating...`)
      const toInsert = missingCombos.map(c => ({
        code: c.code,
        name: c.stock_name || '未知公司',
        souvenir_item: '超商商品卡',
        meeting_date: `${c.year}-06-30`,
        category_id: convenienceStoreCategoryId.value,
        classification_status: 'system_matched',
        doc_id: `AUTO_${c.code}_${c.year}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }))

      const { data: createdData, error: createError } = await supabase
        .from('souvenirs')
        .insert(toInsert)
        .select('id, code, meeting_date')

      if (createError) throw createError

      createdData?.forEach(s => {
        const year = new Date(s.meeting_date).getFullYear()
        const key = `${s.code}_${year}`
        souvenirMap[key] = s.id
      })
    }

    // 4. Bulk upsert user_collections (Deduplicated)
    const collectionsToUpsertMap = new Map()
    items.forEach(item => {
      const souvenirId = souvenirMap[`${item.stock_code}_${item.year}`]
      if (souvenirId) {
        // We only need one record per (User + Stock Year + Status)
        const uniqueKey = `${userId}_${souvenirId}_holding`
        if (!collectionsToUpsertMap.has(uniqueKey)) {
          collectionsToUpsertMap.set(uniqueKey, {
            user_id: userId,
            souvenir_id: souvenirId,
            status: 'holding'
          })
        }
      }
    })

    const collectionsToUpsert = Array.from(collectionsToUpsertMap.values())

    if (collectionsToUpsert.length === 0) {
      console.warn('[DEBUG] No valid items to upsert after deduplication');
      throw new Error('找不到可歸戶的紀念品資料')
    }

    // [DEBUG-LOG-20260127-0023]
    console.log(`[DEBUG] Upserting ${collectionsToUpsert.length} records to user_collections...`);
    const { error: collError } = await supabase
      .from('user_collections')
      .upsert(collectionsToUpsert, { onConflict: 'user_id,souvenir_id,status' })

    if (collError) throw collError

    // 5. Bulk update staging status
    const stagingIds = items.map(i => i.id)
    const { error: stageError } = await supabase
      .from('inventory_staging')
      .update({
        status: 'IMPORTED',
        matched_user_id: userId
      })
      .in('id', stagingIds)

    if (stageError) throw stageError

    showToast(`成功歸戶 ${items.length} 筆資料`, 'success')
    closeModal()
    await fetchStagingData()

  } catch (e) {
    console.error('歸戶錯誤:', e)
    showToast('歸戶過程發生錯誤: ' + (e.message || e), 'error')
  } finally {
    linking.value = false
  }
}

onMounted(() => {
  fetchStagingData()
  fetchCategoriesData()
})
</script>

<style scoped>
@keyframes modalScale {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(40px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-scale {
  animation: modalScale 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
}

.stat-card {
  @apply flex items-center p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/10;
}

.stat-icon {
  @apply w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mr-4 sm:mr-6 shadow-lg;
}

.glass-card {
  @apply bg-white border border-gray-100 shadow-xl rounded-3xl sm:rounded-[2rem] transition-all duration-500;
}

.user-option {
  @apply flex items-center justify-between p-5 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/80 transition-all rounded-[1.5rem] border-2 border-transparent;
}

.user-option.selected {
  @apply bg-indigo-50 border-indigo-500 shadow-xl shadow-indigo-500/10;
}

.btn-primary {
  @apply px-4 sm:px-10 py-3 sm:py-5 bg-indigo-600 text-white font-black rounded-xl sm:rounded-[1.5rem] hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[10px] sm:text-xs;
}

.btn-secondary {
  @apply px-4 sm:px-10 py-3 sm:py-5 bg-gray-100 text-gray-400 font-black rounded-xl sm:rounded-[1.5rem] hover:bg-gray-200 hover:text-gray-600 transition-all uppercase tracking-widest text-[10px] sm:text-xs;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full hover:bg-indigo-200 transition-colors;
}
</style>
