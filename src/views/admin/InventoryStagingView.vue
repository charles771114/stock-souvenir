<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            庫存歸戶管理
          </h1>
          <p class="text-gray-600 mt-2">連結暫存庫存資料與使用者帳號</p>
        </div>
        <router-link to="/admin/import/inventory"
          class="inline-flex items-center px-4 py-2 bg-white border border-indigo-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          匯入新資料
        </router-link>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="stat-card animate-fade-in-up" style="animation-delay: 0.1s">
          <div class="stat-icon bg-orange-100 text-orange-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900">{{ stats.pendingCount }}</div>
            <div class="text-sm text-gray-600">待歸戶總筆數</div>
          </div>
        </div>

        <div class="stat-card animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="stat-icon bg-indigo-100 text-indigo-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900">{{ stats.uniqueOwners }}</div>
            <div class="text-sm text-gray-600">不同姓名數</div>
          </div>
        </div>

        <div class="glass-card animate-fade-in-up" style="animation-delay: 0.3s">
          <input v-model="searchOwner" type="text" placeholder="🔍 搜尋姓名..."
            class="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg class="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>

      <!-- Empty State -->
      <div v-else-if="groupedStaging.length === 0"
        class="glass-card text-center py-20 animate-fade-in-up">
        <svg class="mx-auto h-20 w-20 text-green-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">太棒了！所有資料都已歸戶</h3>
        <p class="text-gray-600">目前沒有待處理的庫存資料</p>
      </div>

      <!-- Staging Table -->
      <div v-else class="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up">
        <table class="w-full">
          <thead class="bg-gray-50/80">
            <tr class="border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">待歸戶對象</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">待處理項目</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">數量</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="group in filteredGroups" :key="group.owner_name"
              class="hover:bg-indigo-50/30 transition-colors duration-200">
              <!-- Owner Name -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {{ group.owner_name.charAt(0) }}
                  </div>
                  <span class="font-bold text-gray-900">{{ group.owner_name }}</span>
                </div>
              </td>
              
              <!-- Items Preview -->
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <span v-for="(item, idx) in group.items.slice(0, 4)" :key="idx"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    {{ item.stock_name || item.stock_code }}
                  </span>
                  <span v-if="group.items.length > 4" class="text-xs text-gray-400 self-center">
                    ...及其他 {{ group.items.length - 4 }} 項
                  </span>
                </div>
              </td>

              <!-- Count Badge -->
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold shadow-sm">
                  {{ group.items.length }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-center">
                <button @click="openLinkModal(group)" 
                  class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all">
                  <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  連結用戶
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Link User Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

          <div class="modal-content">
            <div class="p-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">
                將「{{ selectedGroup?.owner_name }}」歸戶給...
              </h3>

              <div class="mb-6 relative">
                <input v-model="userSearch" @input="searchUsers" type="text"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="🔍 搜尋 Email、姓名或暱稱..." autofocus />
                <div v-if="searchingUsers" class="absolute right-3 top-3.5">
                  <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
              </div>

              <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                <div v-if="userResults.length === 0 && userSearch" class="p-6 text-center text-sm text-gray-500">
                  找不到相關用戶
                </div>
                <div v-for="user in userResults" :key="user.id" @click="targetUser = user"
                  class="user-option" :class="{ 'selected': targetUser?.id === user.id }">
                  <div>
                    <div class="text-sm font-semibold text-gray-900">
                      {{ user.full_name || '未設定姓名' }}
                      <span v-if="user.nickname" class="text-gray-500 font-normal text-xs">({{ user.nickname }})</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ user.email }}</div>
                  </div>
                  <div v-if="targetUser?.id === user.id" class="text-indigo-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <button type="button" @click="closeModal" class="btn-secondary">
                取消
              </button>
              <button type="button" @click="confirmLink" :disabled="!targetUser || linking" class="btn-primary">
                <svg v-if="linking" class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ linking ? '處理中...' : '確認歸戶' }}
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
    let successCount = 0

    for (const item of selectedGroup.value.items) {

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
