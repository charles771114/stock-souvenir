<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

      <!-- Sticky Header & Filter Bar -->
      <div
        class="sticky top-0 z-30 pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 bg-gray-50/95 backdrop-blur-sm transition-all duration-300">

        <!-- Header Content -->
        <div class="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1
              class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter animate-fade-in-up">
              股東會紀念品目錄
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              探索 {{ gifts.length }} 份紀念品，總有一款打動你
            </p>
          </div>

          <!-- View Toggle & Sort (Mobile Optimized) -->
          <div class="flex items-center gap-3 self-end md:self-auto">
            <!-- View Toggle -->
            <div class="bg-white rounded-lg p-1 border border-gray-200 shadow-sm flex items-center">
              <button @click="viewMode = 'grid'" class="p-2 rounded-md transition-all duration-200"
                :class="viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                title="網格視圖">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button @click="viewMode = 'list'" class="p-2 rounded-md transition-all duration-200"
                :class="viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                title="列表視圖">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <!-- Sort Dropdown -->
            <div class="relative">
              <select
                class="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors">
                <option value="date_desc">依日期 (新到舊)</option>
                <option value="date_asc">依日期 (舊到新)</option>
                <option value="code_asc">依代號</option>
              </select>
              <div class="absolute right-3 top-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Glassmorphic Filter Bar -->
        <div
          class="bg-white/80 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] border border-white/50 shadow-2xl shadow-indigo-500/10 p-3 md:p-6 mb-2 relative overflow-hidden group animate-fade-in-up delay-150">
          <!-- Decor -->
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <!-- Category Filters (Dynamic) -->
            <div class="md:col-span-8 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">

              <!-- All / Collection Toggles -->
              <div class="flex gap-2 flex-shrink-0">
                <button @click="setCategory(null)"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border"
                  :class="!filters.category ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'">
                  全部
                </button>
                <button @click="currentView === 'collection' ? currentView = 'all' : currentView = 'collection'"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border"
                  :class="currentView === 'collection' ? 'bg-amber-400 text-white border-amber-400 shadow-md shadow-amber-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'">
                  <svg class="w-3.5 h-3.5" :class="currentView === 'collection' ? 'fill-current' : 'fill-none'"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  收藏
                </button>
              </div>

              <div class="h-6 w-px bg-gray-200 mx-1 flex-shrink-0"></div>

              <!-- Dynamic Categories -->
              <div class="flex gap-2">
                <button v-for="cat in categories" :key="cat.id" @click="setCategory(cat.name)"
                  class="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border whitespace-nowrap flex items-center gap-1.5"
                  :class="filters.category === cat.name ? getCategoryActiveClasses(cat.color) : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:text-gray-700'">
                  <span :class="`w-1.5 h-1.5 rounded-full ${getCategoryDotClass(cat.color)}`"></span>
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="md:col-span-4 relative group/search">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400 group-focus-within/search:text-indigo-500 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input v-model="filters.search"
                class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow shadow-sm"
                placeholder="搜尋公司、代號或紀念品..." type="search" />
            </div>
          </div>
        </div>

        <!-- Active Context Bar (Filters & Pagination Stats) -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 mt-4 gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Year Selector (Compact) -->
            <div class="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg flex-shrink-0">
              <button v-for="year in ['2026', '2025', '2024']" :key="year" @click="setYear(year)"
                class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all"
                :class="filters.year === year ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'">
                {{ year }}
              </button>
            </div>

            <!-- Active Filters Text -->
            <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
              <span v-if="filters.category" class="text-[10px] font-black text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-lg">
                {{ filters.category }}
              </span>
              <button @click="clearFilters" class="text-[10px] font-black text-gray-400 hover:text-red-500 underline decoration-gray-200 transition-colors">
                清除全部
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-6 border-t border-gray-100 sm:border-none pt-3 sm:pt-0">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total {{ paginatedMappedGifts.length }} Items
            </p>
            <!-- Page Size -->
            <div class="flex items-center gap-2">
              <select v-model="pageSize" @change="handlePageSizeChange"
                class="block w-full pl-1 pr-6 py-1 text-[10px] border-none bg-transparent focus:ring-0 text-gray-800 font-black cursor-pointer uppercase">
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} / Page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Zone -->
      <div class="mt-6 min-h-[500px]">
        <!-- Loading -->
        <div v-if="loading" class="flex flex-col justify-center items-center py-20">
          <LoadingSpinner />
          <p class="mt-4 text-gray-500 font-medium animate-pulse">正在為您準備紀念品清單...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mx-auto max-w-2xl">
          <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-bold text-red-800 mb-2">無法載入資料</h3>
          <p class="text-red-600">{{ error }}</p>
          <button @click="window.location.reload()"
            class="mt-4 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50">重新整理</button>
        </div>

        <!-- Empty -->
        <div v-else-if="paginatedMappedGifts.length === 0"
          class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">沒有找到相關紀念品</h3>
          <p class="text-gray-500 max-w-sm mx-auto mb-6">試試看調整關鍵字或年份，或清除篩選條件重新搜尋</p>
          <button @click="clearFilters"
            class="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            清除所有篩選
          </button>
        </div>

        <!-- Content List/Grid -->
        <div v-else>
          <!-- Grid View -->
          <GiftGridView v-if="viewMode === 'grid'" :items="paginatedMappedGifts" :isExpired="isExpired"
            @toggle-collection="handleToggleCollection" />

          <!-- List View -->
          <TableView v-else :items="paginatedMappedGifts" :isExpired="isExpired"
            @toggle-collection="handleToggleCollection" />

          <!-- Pagination (Pro Max Focused) -->
          <div v-if="totalPages > 1" class="mt-16 flex flex-col items-center justify-center gap-6">
            <div class="flex items-center bg-white/60 backdrop-blur-xl border border-gray-100 p-1.5 rounded-[1.25rem] shadow-xl shadow-indigo-100/50">
              <button @click="prevPage" :disabled="!hasPrevPage"
                class="h-10 px-3 sm:px-4 rounded-xl border border-transparent text-xs font-black text-gray-700 hover:bg-white hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 group">
                <svg class="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="hidden min-[400px]:inline">上一頁</span>
              </button>

              <div class="h-6 w-px bg-gray-200 mx-1"></div>

              <div class="px-2 sm:px-4 flex items-center gap-2 sm:gap-3">
                <span class="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-tight whitespace-nowrap">
                  <span class="hidden min-[450px]:inline">第</span> <span class="text-indigo-600 font-black">{{ currentPage }}</span> / {{ totalPages }} <span class="hidden min-[450px]:inline">頁</span>
                </span>
                <div class="relative group/select">
                  <select :value="currentPage" @change="goToPage($event.target.value)"
                    class="appearance-none bg-indigo-50 text-indigo-700 text-[10px] font-black pl-2 pr-6 sm:pl-3 sm:pr-8 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option v-for="page in totalPages" :key="page" :value="page">跳至 {{ page }}</option>
                  </select>
                  <svg class="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div class="h-6 w-px bg-gray-200 mx-1"></div>

              <button @click="nextPage" :disabled="!hasNextPage"
                class="h-10 px-3 sm:px-4 rounded-xl border border-transparent text-xs font-black text-gray-700 hover:bg-white hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 group">
                <span class="hidden min-[400px]:inline">下一頁</span>
                <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import GiftGridView from '@/components/GiftGridView.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import TableView from '@/components/TableView.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { useCategories } from '@/composables/useCategories'; // New import
import { useGifts } from '@/composables/useGifts'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const { gifts, myCollections, loading, error, fetchAllGifts, fetchMyCollections, fetchUserInventoryIds, addToCollection, removeFromCollection, getCollection } = useGifts()
const { categories, fetchCategories, matchCategory } = useCategories() // New composable usage
const { showToast } = useToast()
const { openAuthModal } = useAuthModal()
const router = useRouter()

// UI State - Default to 'list'
const viewMode = ref('list') // Changed from 'grid' to 'list'
const currentView = ref('all') // 'all' | 'collection'
const userInventoryIds = ref(new Set()) // Track user's inventory items

// Filters
const filters = ref({
  search: '',
  year: '2025',
  category: '超商商品卡',
})

// Color Helpers for Category Buttons
const getCategoryActiveClasses = (color) => {
  const map = {
    gray: 'bg-gray-500 text-white border-gray-600 shadow-md shadow-gray-200',
    red: 'bg-red-500 text-white border-red-600 shadow-md shadow-red-200',
    yellow: 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-md shadow-yellow-200',
    green: 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200',
    blue: 'bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-200',
    indigo: 'bg-indigo-500 text-white border-indigo-600 shadow-md shadow-indigo-200',
    purple: 'bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-200',
    pink: 'bg-pink-500 text-white border-pink-600 shadow-md shadow-pink-200',
  }
  return map[color] || map['gray']
}

const getCategoryDotClass = (color) => {
  const map = {
    gray: 'bg-gray-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-400',
    blue: 'bg-blue-400',
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400',
  }
  return map[color] || 'bg-gray-300'
}

// Data Filtering
const filteredGifts = computed(() => {
  let result = gifts.value

  // 1. Filter by Collection (if active)
  if (currentView.value === 'collection') {
    const collectionIds = myCollections.value.map(c => c.souvenir_id)
    // Only show items that are in collection BUT NOT in inventory
    result = result.filter(g => {
      const isInMyCollection = collectionIds.includes(g.id)
      const isInInventory = userInventoryIds.value.has(g.id)
      return isInMyCollection && !isInInventory
    })
  }

  // 2. Filter by Search Keyword
  if (filters.value.search) {
    const keyword = filters.value.search.toLowerCase()
    result = result.filter(g =>
      g.name?.toLowerCase().includes(keyword) ||
      g.code?.toLowerCase().includes(keyword) ||
      g.souvenir_item?.toLowerCase().includes(keyword)
    )
  }

  // 3. Filter by Category (moved to client-side logic due to dynamic matching)
  // Note: useGifts API filter might be removed if we rely on matchCategory
  if (filters.value.category) {
    result = result.filter(g => {
      const match = matchCategory(g.souvenir_item)
      // We need to compare specific category name
      // Find the cat object
      const cat = categories.value.find(c => c.id === match.id)
      return cat && cat.name === filters.value.category
    })
  }

  return result
})

// Mapped Gifts with Dynamic Categories
const mappedGifts = computed(() => {
  return filteredGifts.value.map(g => {
    // Dynamic Category Matching
    const match = matchCategory(g.souvenir_item)
    const categoryObj = categories.value.find(c => c.id === match.id)

    return {
      id: g.id,
      code: g.company_code,
      name: g.company_name,
      souvenir: g.souvenir_item,
      // Use dynamic data
      category: categoryObj ? categoryObj.name : '其他',
      categoryColor: categoryObj ? categoryObj.color : 'gray',
      lastBuy: g.last_buy_date,
      meeting: g.meeting_date,
      isCollected: isInCollection(g.id),
      isInInventory: userInventoryIds.value.has(g.id), // NEW: Pass inventory status
      ...g
    }
  })
})

// Pagination
const hasActiveFilters = computed(() => {
  return !!filters.value.search || !!filters.value.category
})

// Pagination
const {
  currentPage,
  pageSize,
  totalPages,
  paginatedItems,
  hasNextPage,
  hasPrevPage,
  startIndex,
  endIndex,
  nextPage,
  prevPage,
  goToPage,
  setPageSize,
  reset,
  pageSizeOptions
} = usePagination(mappedGifts) // Use mappedGifts here to ensure pagination works on transformed data

// Use paginatedItems directly (it's already mapped)
const paginatedMappedGifts = computed(() => paginatedItems.value)

// Handlers
const handlePageSizeChange = () => {
  setPageSize(pageSize.value)
}

const setYear = (year) => {
  filters.value.year = year
  applyFilters() // Refresh API data
}

const setCategory = (catName) => {
  filters.value.category = catName
  reset() // Reset pagination
}

const applyFilters = async () => {
  const filterParams = {
    year: filters.value.year,
    search: filters.value.search
      ? { companyName: filters.value.search, giftName: filters.value.search }  // API helper supports this? 
      // Actually useGifts.js expects flat params:
      // companyName: ..., giftName: ...
      : undefined
  }

  // Flatten search params
  const apiParams = { year: filters.value.year }
  // Search is now purely client-side to avoid restrictive AND logic on server
  // if (filters.value.search) {
  //   apiParams.companyName = filters.value.search
  //   apiParams.giftName = filters.value.search
  // }
  // Remove category from API call since we do it client-side with dynamic rules
  // apiParams.category = filters.value.category 

  await fetchAllGifts(apiParams)
}

const clearFilters = () => {
  filters.value = { search: '', year: null, category: null }
  applyFilters()
}

const isInCollection = (giftId) => {
  return myCollections.value.some(c => c.souvenir_id === giftId)
}

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

const isExpired = (dateString) => {
  if (!dateString) return false
  const target = new Date(dateString).setHours(0, 0, 0, 0)
  const now = new Date().setHours(0, 0, 0, 0)
  return target < now
}

// Watchers
watch(filters, (newVal, oldVal) => {
  // Only apply API filters if Year or Search changed
  // Category is client-side, so just reset pagination
  if (newVal.year !== oldVal.year || newVal.search !== oldVal.search) {
    // debounced handled separately for search input events
    if (newVal.year !== oldVal.year) applyFilters()
  }
  reset()
}, { deep: true })

watch(viewMode, () => reset())

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => applyFilters(), 500)
}

// Init
onMounted(async () => {
  await fetchCategories() // Fetch dynamic categories first
  await fetchAllGifts({ year: filters.value.year })
  await fetchMyCollections()
  userInventoryIds.value = await fetchUserInventoryIds() // NEW: Load inventory state
})
</script>

<style scoped>
/* Hide scrollbar for tabs */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
