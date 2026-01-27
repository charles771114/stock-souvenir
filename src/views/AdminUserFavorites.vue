<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900 mb-2 tracking-tighter">使用者收藏總覽</h1>
        <p class="text-gray-600">查看全站使用者的收藏統計與明細</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">總收藏數</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalCollections }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">活躍用戶</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.activeUsers }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">平均收藏數</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ avgCollections }}</p>
            </div>
            <div class="p-3 bg-indigo-100 rounded-full">
              <svg class="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">篩選用戶</label>
            <select v-model="selectedUser"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">全部用戶</option>
              <option v-for="user in users" :key="user.id" :value="user.email">
                {{ user.full_name || user.email }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">年份</label>
            <select v-model="selectedYear"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">全部年份</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div class="flex items-end">
            <button @click="exportCSV"
              class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              匯出 CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>

        <div v-else-if="favorites.length === 0" class="text-center py-12">
          <p class="text-gray-500">暫無收藏資料</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-[800px] md:min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用戶</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代號</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司名稱</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">紀念品</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開會日期</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收藏時間</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="fav in favorites" :key="fav.collection_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ fav.full_name || fav.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ fav.stock_code }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ fav.company_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ fav.souvenir_item }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(fav.meeting_date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(fav.collected_at) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Summary Section -->
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span class="text-sm font-semibold text-gray-700">查詢結果統計</span>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="text-xs text-gray-500">總筆數</p>
                  <p class="text-lg font-bold text-indigo-600">{{ favorites.length }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">涉及用戶</p>
                  <p class="text-lg font-bold text-purple-600">{{ uniqueUsersInResults }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">不同公司</p>
                  <p class="text-lg font-bold text-pink-600">{{ uniqueCompaniesInResults }}</p>
                </div>
              </div>
            </div>

            <!-- Souvenir Item Breakdown -->
            <div v-if="souvenirSummary.length > 0" class="mt-4 pt-4 border-t border-indigo-100">
              <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">紀念品彙整</p>
              <div class="flex flex-wrap gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <div v-for="item in souvenirSummary" :key="item.name"
                  class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-indigo-100 shadow-sm transition-all hover:border-indigo-200">
                  <span class="text-sm text-gray-700 font-medium whitespace-nowrap">{{ item.name }}</span>
                  <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-md whitespace-nowrap">
                    {{ item.count }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref, watch } from 'vue'

const { showToast } = useToast()

const favorites = ref([])
const users = ref([])
const loading = ref(false)
const selectedUser = ref('')
const selectedYear = ref(new Date().getFullYear().toString())  // 預設為當前年度

const stats = computed(() => {
  const totalCollections = favorites.value.length
  const uniqueUsers = new Set(favorites.value.map(f => f.user_id)).size
  const avgCollections = uniqueUsers > 0 ? (totalCollections / uniqueUsers).toFixed(1) : 0

  return {
    totalCollections,
    activeUsers: uniqueUsers,
  }
})

const avgCollections = computed(() => {
  return stats.value.activeUsers > 0
    ? (stats.value.totalCollections / stats.value.activeUsers).toFixed(1)
    : '0'
})

// 查詢結果統計
const uniqueUsersInResults = computed(() => {
  return new Set(favorites.value.map(f => f.user_id)).size
})

const uniqueCompaniesInResults = computed(() => {
  return new Set(favorites.value.map(f => f.stock_code)).size
})

const souvenirSummary = computed(() => {
  const summary = {}
  favorites.value.forEach(f => {
    const item = f.souvenir_item || '未指定紀念品'
    summary[item] = (summary[item] || 0) + 1
  })
  // 轉為陣列並排序（數量多到少）
  return Object.entries(summary)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const fetchUsers = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .order('email')

  if (data) users.value = data
}

const fetchFavorites = async () => {
  loading.value = true

  try {
    let query = supabase
      .from('user_collections')
      .select(`
        id,
        user_id,
        souvenir_id,
        created_at,
        profiles!inner(email, full_name),
        souvenirs!inner(code, name, souvenir_item, meeting_date)
      `)
      .order('created_at', { ascending: false })

    // Filter by user
    if (selectedUser.value) {
      query = query.eq('profiles.email', selectedUser.value)
    }

    const { data, error } = await query

    if (error) throw error

    if (data) {
      favorites.value = data.map(item => ({
        collection_id: item.id,
        user_id: item.user_id,
        email: item.profiles.email,
        full_name: item.profiles.full_name,
        stock_code: item.souvenirs.code,
        company_name: item.souvenirs.name,
        souvenir_item: item.souvenirs.souvenir_item,
        meeting_date: item.souvenirs.meeting_date,
        collected_at: item.created_at
      }))

      // Year filtering (client-side since it's based on meeting_date)
      if (selectedYear.value) {
        favorites.value = favorites.value.filter(f => {
          const year = new Date(f.meeting_date).getFullYear().toString()
          return year === selectedYear.value
        })
      }
    }
  } catch (e) {
    console.error('Fetch favorites error:', e)
    showToast('載入資料失敗', 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW')
}

const exportCSV = () => {
  const headers = ['用戶', '代號', '公司名稱', '紀念品', '開會日期', '收藏時間']
  const rows = favorites.value.map(f => [
    f.email,
    f.stock_code,
    f.company_name,
    f.souvenir_item,
    formatDate(f.meeting_date),
    formatDate(f.collected_at)
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `user_favorites_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  showToast('已匯出 CSV', 'success')
}

watch([selectedUser, selectedYear], () => {
  fetchFavorites()
})

onMounted(async () => {
  await fetchUsers()
  await fetchFavorites()
})
</script>
