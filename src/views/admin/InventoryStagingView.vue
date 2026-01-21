<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/admin/panel" class="text-gray-500 hover:text-gray-700 mr-4">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-700">
              庫存歸戶管理
            </h1>
          </div>
          <div class="flex items-center">
            <router-link to="/admin/import/inventory" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              匯入新資料 &rarr;
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Stats / Filter -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="text-sm font-medium text-gray-500">待歸戶總筆數</div>
          <div class="text-3xl font-bold text-orange-500 mt-2">{{ stats.pendingCount }}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="text-sm font-medium text-gray-500">不同姓名數</div>
          <div class="text-3xl font-bold text-indigo-600 mt-2">{{ stats.uniqueOwners }}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <input v-model="searchOwner" type="text" placeholder="搜尋姓名..."
            class="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <!-- Grouped List -->
      <div v-if="loading" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>

      <div v-else-if="groupedStaging.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900">太棒了！所有資料都已歸戶</h3>
        <p class="text-gray-500 mt-2">目前沒有待處理的庫存資料。</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="group in filteredGroups" :key="group.owner_name"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <!-- Info -->
            <div>
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-gray-900">{{ group.owner_name }}</h3>
                <span class="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  {{ group.items.length }} 筆待歸戶
                </span>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="(item, idx) in group.items.slice(0, 5)" :key="idx"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {{ item.stock_name }} ({{ item.year }})
                </span>
                <span v-if="group.items.length > 5" class="text-xs text-gray-500 self-center">
                  ...還有 {{ group.items.length - 5 }} 筆
                </span>
              </div>
            </div>

            <!-- Action -->
            <button @click="openLinkModal(group)"
              class="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <svg class="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              連結用戶
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Link User Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

          <div
            class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
                將「{{ selectedGroup?.owner_name }}」歸戶給...
              </h3>

              <!-- User Search -->
              <div class="mb-4 relative">
                <input v-model="userSearch" @input="searchUsers" type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="搜尋 Email、姓名或暱稱..." autofocus />
                <div v-if="searchingUsers" class="absolute right-3 top-2.5">
                  <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
              </div>

              <!-- User List -->
              <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                <div v-if="userResults.length === 0 && userSearch" class="p-4 text-center text-sm text-gray-500">
                  找不到相關用戶
                </div>
                <div v-for="user in userResults" :key="user.id" @click="targetUser = user"
                  class="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center"
                  :class="{ 'bg-indigo-50 ring-1 ring-indigo-500 inside': targetUser?.id === user.id }">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.full_name || '未設定姓名' }} <span
                        v-if="user.nickname" class="text-gray-500 text-xs">({{ user.nickname }})</span></div>
                    <div class="text-xs text-gray-500">{{ user.email }}</div>
                  </div>
                  <div v-if="targetUser?.id === user.id" class="text-indigo-600">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" @click="confirmLink" :disabled="!targetUser || linking"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {{ linking ? '處理中...' : '確認歸戶' }}
              </button>
              <button type="button" @click="closeModal"
                class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref } from 'vue'

const loading = ref(true)
const stagingItems = ref([])
const searchOwner = ref('')
const { showToast } = useToast()

// Modal State
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
  const { data, error } = await supabase
    .from('inventory_staging')
    .select('*')
    .eq('status', 'PENDING')
    .order('owner_name')

  if (error) {
    console.error(error)
    showToast('載入資料失敗', 'error')
  } else {
    stagingItems.value = data
  }
  loading.value = false
}

// User Search Logic
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
    // 1. 找出對應的 souvenir_id 
    // 這一步比較麻煩，因為 staging table 只有 stock_code / year
    // 我們需要先 query souvenirs table 找到對應 ID
    // 但為了簡化，我們可以設計一個 Database Function 來處理整個 Transaction
    // 或者在這裡分步處理 (MVP)

    // Step 1: 標記 Staging 為 IMPORTED
    // Step 2: 插入 user_collections
    // 因為可能有很多筆，最好用 Backend Function。
    // 我們暫時用前端 Loop 處理 (如果量不大)，或者呼叫自定義 RPC。
    // 為了安全和正確性，我們應該寫一個 RPC。但現在先用最簡單的方法：
    // 假設 staging 每一筆資料都正確對應一個 souvenir。如果找不到就記錄錯誤。

    // 獲取 souvenir_id map
    const itemCodes = selectedGroup.value.items.map(i => i.stock_code)
    const itemYears = selectedGroup.value.items.map(i => i.year)

    // 這裡有個問題：souvenirs table 是 unique by (code, year) 嗎？理論上是。
    // 查詢所有對應的 souvenirs
    const { data: souvenirs, error: sError } = await supabase
      .from('souvenirs')
      .select('id, code, meeting_date')
    // 這 query 有點難寫 (code IN (...) AND year IN (...)) 不夠精準
    // 簡單點：Loop 處理 (效率差但簡單) 或者假設資料一致性

    if (sError) throw sError

    // 簡單解法：
    // 直接由 SQL 處理比較好，但既然沒有 RPC，由前端逐筆處理
    let successCount = 0

    for (const item of selectedGroup.value.items) {
      // Find souvenir ID
      // 這邊會造成大量 Request，應該優化。
      // Optimization: Pre-fetch souvenirs for this group locally? Or Backend RPC.
      // Let's implement a 'smart' approach: 
      // 1. Get ALL souvenirs that match ANY code in this group (bulk select)
      // 2. Map locally

      // This is getting complicated. Let's create a Backend Function for this later.
      // MVP: Simple Loop (Acceptable for small batches, < 50 items per user usually)

      // 1. Find Souvenir
      let { data: sData } = await supabase.from('souvenirs')
        .select('id')
        .eq('code', item.stock_code)
        // .eq date year... text match is hard
        // 假設我們有 gift_year column? Schema 說是 meeting_date.
        .filter('meeting_date', 'gte', `${item.year}-01-01`)
        .filter('meeting_date', 'lte', `${item.year}-12-31`)
        .maybeSingle()

      if (!sData) {
        console.warn(`找不到紀念品資料: ${item.stock_code} (${item.year})`)
        // 可以選擇創建一個 placeholder souvenir，或者忽略
        continue
      }

      // 2. Insert to user_collections
      const { error: insertError } = await supabase
        .from('user_collections')
        .upsert({
          user_id: targetUser.value.id,
          souvenir_id: sData.id,
          quantity: 1, // Default 1
          status: 'collected',
          note: '大量匯入'
        }, { onConflict: 'user_id, souvenir_id' })

      if (insertError) {
        console.error('歸戶失敗:', insertError)
        continue
      }

      // 3. Update Staging Status
      await supabase
        .from('inventory_staging')
        .update({
          status: 'IMPORTED',
          matched_user_id: targetUser.value.id
        })
        .eq('id', item.id)

      successCount++
    }

    showToast(`成功歸戶 ${successCount} 筆資料`, 'success')
    closeModal()
    await fetchStagingData() // Refresh

  } catch (e) {
    console.error(e)
    showToast('歸戶過程發生錯誤: ' + e.message, 'error')
  } finally {
    linking.value = false
  }
}

onMounted(() => {
  fetchStagingData()
})
</script>
