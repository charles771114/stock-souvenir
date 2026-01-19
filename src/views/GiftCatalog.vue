<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header with Gradient Text -->
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
            股東會紀念品目錄
        </h1>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">
            探索各家公司的股東會心意，輕鬆篩選並收藏您感興趣的紀念品
        </p>
      </div>

      <!-- Modern Filter Bar -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-10 sticky top-4 z-20 backdrop-blur-md bg-white/90">
        <!-- Year Tabs -->
        <div class="flex items-center justify-center mb-6">
          <div class="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl">
            <button
              v-for="year in ['2026', '2025', '2024']"
              :key="year"
              @click="setYear(year)"
              class="relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ease-out flex items-center gap-2"
              :class="filters.year === year ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'"
            >
              <span v-if="year === '2026'" class="flex h-2 w-2 relative">
                 <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              {{ year }} 年度
            </button>
             <button
              @click="setYear(null)"
              class="px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ease-out"
              :class="!filters.year ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'"
            >
              全部
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Search -->
          <div class="md:col-span-3 relative group">
            <label class="absolute text-xs font-semibold text-indigo-500 -top-2.5 left-3 bg-white px-1">搜尋</label>
            <div class="relative">
                <svg class="w-5 h-5 absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                v-model="filters.search"
                type="text"
                placeholder="輸入公司名稱、代號或紀念品關鍵字..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-gray-50 focus:bg-white"
                @input="debouncedSearch"
                />
            </div>
          </div>

          <!-- Sort -->
          <div class="relative group">
             <label class="absolute text-xs font-semibold text-indigo-500 -top-2.5 left-3 bg-white px-1">排序</label>
             <div class="relative">
                 <select
                   class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors cursor-pointer appearance-none"
                 >
                   <option value="date_desc">依日期 (新到舊)</option>
                   <option value="date_asc">依日期 (舊到新)</option>
                   <option value="code_asc">依代號</option>
                 </select>
                  <div class="absolute right-3 top-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                     </svg>
                </div>
            </div>
          </div>
        </div>

        <!-- Filter Tags / info -->
        <div class="mt-4 flex justify-between items-center border-t border-gray-100 pt-4">
             <div class="flex items-center space-x-2">
                 <span v-if="hasActiveFilters" class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors" @click="clearFilters">
                     清除所有篩選 ✕
                 </span>
             </div>
             <p class="text-sm font-medium text-gray-500">
                 顯示 {{ gifts.length }} 筆結果
             </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-20">
        <LoadingSpinner />
        <p class="mt-4 text-gray-500 font-medium">正在載入紀念品資訊...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-bold text-red-800 mb-2">無法載入資料</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="gifts.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">沒有找到相關紀念品</h3>
        <p class="text-gray-500 max-w-sm mx-auto">試試看調整關鍵字或年份，或清除篩選條件重新搜尋</p>
        <button @click="clearFilters" class="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            清除所有篩選
        </button>
      </div>

      <!-- Gift List (Table View) -->
      <div v-else>
          <TableView 
            :items="mappedGifts" 
            :isExpired="isExpired"
            @toggle-collection="handleToggleCollection"
          />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGifts } from '@/composables/useGifts'
import { useToast } from '@/composables/useToast'
import { useAuthModal } from '@/composables/useAuthModal'
import Navbar from '@/components/Navbar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import TableView from '@/components/TableView.vue'

const { gifts, myCollections, loading, error, fetchAllGifts, fetchMyCollections, addToCollection, removeFromCollection, getCollection } = useGifts()

import { getSouvenirCategory } from '@/utils/souvenirCategory'

const mappedGifts = computed(() => {
  return gifts.value.map(g => ({
    id: g.id, 
    code: g.company_code,     // Renamed to 'code' as requested (代號)
    name: g.company_name,     // Renamed to 'name' as requested (名稱)
    souvenir: g.souvenir_item,
    category: getSouvenirCategory(g.souvenir_item),
    lastBuy: g.last_buy_date,
    meeting: g.meeting_date, // Added: Meeting Date
    isCollected: isInCollection(g.id),
    ...g // Spread other props just in case
  }))
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-TW')
}

const isUrgent = (dateString) => {
  if (!dateString) return false
  const target = new Date(dateString)
  const now = new Date()
  const diffTime = target - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

const isExpired = (dateString) => {
  if (!dateString) return false 
  const target = new Date(dateString).setHours(0,0,0,0)
  const now = new Date().setHours(0,0,0,0)
  return target < now
}

const filters = ref({
  search: '',
  year: '2025', // Default to 2025
  category: null,
})

const setYear = (year) => {
  filters.value.year = year
  applyFilters()
}

// Removed legacy availableYears computed since we use hardcoded tabs now
// const availableYears = computed(() => { ... })

const availableCategories = computed(() => {
  // Category field removed in new schema, return empty array
  return [] 
})

const hasActiveFilters = computed(() => {
  return filters.value.search || filters.value.year || filters.value.category
})

const isInCollection = (giftId) => {
  return myCollections.value.some(c => c.souvenir_id === giftId)
}

const applyFilters = async () => {
  const filterParams = {}
  
  if (filters.value.year) {
    filterParams.year = filters.value.year
  }
  
  if (filters.value.category) {
    filterParams.category = filters.value.category
  }
  
  if (filters.value.search) {
    filterParams.companyName = filters.value.search
    filterParams.giftName = filters.value.search
  }
  
  await fetchAllGifts(filterParams)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    year: null,
    category: null,
  }
  applyFilters()
}

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const router = useRouter()
const { showToast } = useToast()
const { openAuthModal } = useAuthModal()

const handleToggleCollection = async (gift) => {
  try {
    const collection = getCollection(gift.id)
    
    if (collection) {
      await removeFromCollection(collection.id)
      showToast('已移除收藏', 'success', 1000)
    } else {
      const { error } = await addToCollection(gift.id)
      if (error && error.message === '未登入') {
        showToast('請先登入才能收藏紀念品', 'warning')
        openAuthModal()
        return
      } else if (error) {
        throw error
      }
      showToast('已加入收藏', 'success', 1000)
    }
  } catch (e) {
    console.error(e)
    showToast(e.message, 'error')
  }
}

onMounted(async () => {
  // Pass initial filters (year: 2025)
  await applyFilters() 
  await fetchMyCollections()
})
</script>
