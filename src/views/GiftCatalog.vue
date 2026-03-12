<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

      <!-- Branded Title (Non-sticky or separate) -->
      <div class="mb-10 px-1 flex flex-col gap-2">
        <h1 class="text-4xl font-black text-slate-800 tracking-tight">紀念品目錄</h1>
        <p class="text-base font-black text-slate-400 uppercase tracking-widest">
          全台上市櫃公司 {{ gifts.length }} 份
        </p>
      </div>

      <!-- Sticky Expanded Dashboard (Adaptive Stacked Mobile / Unified Bar Desktop) -->
      <div class="sticky top-0 z-30 -mx-4 px-4 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 flex flex-col gap-4">
        
        <!-- Top Control Surface: Unified on Desktop -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:bg-white lg:border lg:border-slate-200 lg:rounded-[2rem] lg:shadow-2xl lg:shadow-slate-200/40 lg:gap-0 lg:p-1">
          
          <!-- Layer 1: Search (Flexible width) -->
          <div class="relative group/search flex-1 min-w-0">
            <div class="absolute inset-0 bg-brand-primary/10 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity hidden lg:block"></div>
            <div class="relative flex items-center bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all focus-within:ring-4 focus-within:ring-brand-primary/10 focus-within:border-brand-primary/30 lg:border-none lg:shadow-none lg:bg-transparent">
              <i class="ri-search-2-line ml-5 text-slate-400 text-xl"></i>
              <input v-model="filters.search"
                class="flex-grow pl-3 pr-4 py-4 lg:py-5 bg-transparent border-none text-base font-black text-slate-700 placeholder-slate-400 focus:outline-none"
                placeholder="搜尋公司名稱或代號..." type="search" @input="debouncedSearch" />
              <span v-if="filters.search" @click="filters.search = ''; applyFilters()" 
                class="pr-5 cursor-pointer text-slate-400 hover:text-rose-500 transition-colors">
                <i class="ri-close-circle-fill text-2xl"></i>
              </span>
            </div>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px h-8 bg-slate-100 mx-2"></div>

          <!-- Layer 2: Main States (All / Following) -->
          <div class="relative flex bg-slate-100 p-2 rounded-2xl lg:rounded-xl lg:w-72">
            <!-- Sliding Indicator -->
            <div class="absolute inset-y-2 transition-all duration-300 ease-out bg-white rounded-xl shadow-md border border-slate-200/50"
              :style="{ 
                left: currentView === 'collection' ? 'calc(50% + 2px)' : '8px', 
                width: 'calc(50% - 10px)' 
              }"></div>
            
            <button @click="currentView = 'all'; triggerFilterAnimation()"
              class="relative z-10 flex-1 px-4 lg:px-2 py-3 text-base font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              :class="currentView === 'all' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'">
              全部
            </button>
            <button @click="currentView = 'collection'; triggerFilterAnimation()"
              class="relative z-10 flex-1 px-4 lg:px-2 py-3 text-base font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              :class="currentView === 'collection' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'">
              <i class="ri-heart-fill" :class="currentView === 'collection' ? 'animate-pulse' : ''"></i>
              追蹤
            </button>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px h-8 bg-slate-100 mx-2"></div>

          <!-- Layer 3: Unified Control Panel (Sort, Year, View) -->
          <div class="flex items-center gap-3 w-full lg:w-auto pb-1 lg:pb-0 overflow-x-auto no-scrollbar scrollbar-hide px-0.5">
            <!-- Sort Sector (Custom Dropdown) -->
            <CustomDropdown 
              v-model="filters.sort"
              :options="sortOptions"
              icon="ri-sort-desc"
              class="shrink-0"
              customClass="lg:py-4"
            />

            <div class="h-6 w-px bg-slate-100 shrink-0 hidden sm:block"></div>

            <!-- Year Sector -->
            <div class="flex items-center bg-slate-50 p-1 rounded-2xl shrink-0 shadow-sm">
              <button v-for="year in ['2026', '2025', '2024']" :key="year" @click="setYear(year)"
                class="px-3 sm:px-4 py-2.5 rounded-xl text-[13px] font-black transition-all whitespace-nowrap"
                :class="filters.year === year ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-white/50'">
                {{ year }}
              </button>
            </div>

            <div class="h-6 w-px bg-slate-100 shrink-0 lg:hidden"></div>

            <!-- View Sector -->
            <div class="flex items-center bg-slate-50 p-1 rounded-2xl shrink-0 shadow-sm">
              <button @click="viewMode = 'grid'" :class="viewMode === 'grid' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-300'"
                class="p-2 sm:p-2.5 rounded-xl transition-all">
                <i class="ri-grid-fill text-lg"></i>
              </button>
              <button @click="viewMode = 'list'" :class="viewMode === 'list' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-300'"
                class="p-2 sm:p-2.5 rounded-xl transition-all">
                <i class="ri-list-check-3 text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Category List -->
        <div class="flex items-center gap-4 overflow-x-auto no-scrollbar py-3 min-h-[70px]">
          <div v-if="sortedCategories.length > 0" class="flex gap-4 whitespace-nowrap">
            <button v-for="cat in sortedCategories" :key="cat.name" @click="setCategory(cat.name)"
              class="px-6 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all border flex items-center gap-2.5"
              :class="filters.category === cat.name ? getCategoryActiveClasses(cat.color) + ' shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'">
              <i :class="getCategoryIcon(cat.name)" class="text-xl"></i>
              {{ cat.name }}
            </button>
          </div>
          <div v-else class="flex gap-4">
             <div v-for="i in 5" :key="i" class="w-32 h-14 bg-slate-100 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Zone -->
      <div class="mt-6 min-h-[500px] relative">
        <!-- Segmented Control Loading Overlay -->
        <Transition name="fade">
          <div v-if="isFiltering" 
            class="absolute inset-x-0 top-0 z-20 bg-gray-50/40 backdrop-blur-[2px] h-[300px] flex items-center justify-center transition-all">
            <div class="bg-white/90 p-5 rounded-[2.5rem] shadow-2xl border border-white flex items-center gap-4">
              <div class="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <span class="text-sm font-black uppercase tracking-[0.2em] text-slate-500">正在整理數據...</span>
            </div>
          </div>
        </Transition>

        <Transition name="fade-slide" mode="out-in">
          <div :key="currentView + filters.category + filters.year + viewMode" class="py-4">
            <template v-if="loading && gifts.length === 0">
              <LoadingSpinner message="正在同步股東資料..." />
            </template>
            
            <template v-else-if="error">
              <div class="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-12 text-center mx-auto max-w-2xl">
                <div class="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="ri-error-warning-fill text-rose-500 text-4xl"></i>
                </div>
                <h3 class="text-xl font-black text-rose-900 mb-2">無法載入資料</h3>
                <p class="text-rose-600 mb-6">{{ error }}</p>
                <button @click="applyFilters" 
                  class="px-8 py-3 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">
                  重試一次
                </button>
              </div>
            </template>

            <template v-else-if="paginatedMappedGifts.length === 0">
              <div class="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-sm">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="ri-inbox-line text-slate-200 text-5xl"></i>
                </div>
                <h3 class="text-slate-600 font-black text-xl mb-2">未找到符合條件的紀念品</h3>
                <p class="text-sm text-slate-400 max-w-xs mx-auto mb-8">試著調整篩選條件、年份，或重新搜尋關鍵字</p>
                <button @click="clearFilters"
                  class="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                  清除所有篩選
                </button>
              </div>
            </template>

            <template v-else>
              <!-- Info Bar -->
              <div v-if="!isCurrentYear" class="mb-8 p-6 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
                <p class="text-base font-black text-amber-700 uppercase tracking-widest flex items-center justify-center gap-2">
                  <i class="ri-error-warning-fill text-xl"></i>
                  非當年度資料僅供參考，部分操作可能受限
                </p>
              </div>

              <!-- Grid View -->
              <GiftGridView v-if="viewMode === 'grid'" 
                :items="paginatedMappedGifts" 
                :isExpired="isExpired"
                :disabled="!isCurrentYear"
                :processing-ids="processingIds"
                :inventory-processing-ids="inventoryProcessingIds"
                @toggle-collection="handleToggleCollection"
                @toggle-inventory="handleToggleInventory" />

              <!-- Table View -->
              <TableView v-else 
                :items="paginatedMappedGifts" 
                :isExpired="isExpired"
                :disabled="!isCurrentYear"
                :sort-by="filters.sort"
                :processing-ids="processingIds"
                :inventory-processing-ids="inventoryProcessingIds"
                @toggle-collection="handleToggleCollection"
                @toggle-inventory="handleToggleInventory"
                @sort="handleSort" />

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="mt-12 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                <div class="flex items-center gap-4">
                  <span class="text-sm font-black uppercase tracking-widest text-slate-400">每頁顯示</span>
                  <select v-model="pageSize" @change="handlePageSizeChange"
                    class="bg-slate-50 border-none rounded-xl text-base font-black text-slate-700 px-4 py-2 cursor-pointer focus:ring-2 focus:ring-slate-200">
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                </div>

                <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl">
                  <button @click="prevPage" :disabled="!hasPrevPage"
                    class="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white hover:shadow-sm disabled:opacity-20 disabled:hover:bg-transparent">
                    <i class="ri-arrow-left-s-line text-lg"></i>
                  </button>
                  
                  <div class="flex items-center px-6 gap-3">
                    <span class="text-base font-black text-slate-900">{{ currentPage }}</span>
                    <span class="text-slate-300 text-sm">/</span>
                    <span class="text-sm font-black text-slate-400">{{ totalPages }}</span>
                  </div>

                  <button @click="nextPage" :disabled="!hasNextPage"
                    class="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white hover:shadow-md disabled:opacity-20 disabled:hover:bg-transparent">
                    <i class="ri-arrow-right-s-line text-2xl"></i>
                  </button>
                </div>

                <div class="hidden sm:block text-sm font-black text-slate-400 uppercase tracking-widest">
                  顯示第 {{ startIndex + 1 }}-{{ endIndex }} 筆，共 {{ sortedMappedGifts.length }} 筆
                </div>
              </div>
            </template>
          </div>
        </Transition>
      </div>

    </main>
  </div>
</template>

<script setup>
import GiftGridView from '@/components/GiftGridView.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import TableView from '@/components/TableView.vue'
import CustomDropdown from '@/components/CustomDropdown.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { useCategories } from '@/composables/useCategories'
import { useCollection } from '@/composables/useCollection'
import { useGifts } from '@/composables/useGifts'
import { usePagination } from '@/composables/usePagination'
import { usePortfolio } from '@/composables/usePortfolio'
import { useToast } from '@/composables/useToast'
import { getCategoryIcon, getCategoryStyles } from '@/utils/categoryUtils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const { 
  gifts, myCollections, allUserCollections, loading, error, 
  fetchAllGifts, fetchMyCollections, fetchAllUserCollections, 
  fetchUserInventoryIds, fetchPreviousYearSouvenirs, enrichWithPreviousYear, 
  getCollection 
} = useGifts()
const { addToCollection, removeFromCollection, addToInventory, removeFromInventoryCompletely } = useCollection()
const { portfolios, currentPortfolioId, isCombinedView } = usePortfolio()
const { categories, fetchCategories, matchCategory } = useCategories()
const { showToast } = useToast()
const { openAuthModal } = useAuthModal()
const router = useRouter()

// UI State - Default to 'list'
const viewMode = ref('list') // Changed from 'grid' to 'list'
const currentView = ref('all') // 'all' | 'collection'
const userInventoryIds = ref(new Set()) // Track user's inventory items
const previousYearSouvenirs = ref(new Map()) // Track previous year souvenirs for reference

// Localized Loading States
const processingIds = ref(new Set())
const inventoryProcessingIds = ref(new Set())
const isFiltering = ref(false)

const sortOptions = [
  { label: '買進日期 ▼', value: 'date_desc' },
  { label: '買進日期 ▲', value: 'date_asc' },
  { label: '股票代號 ▲', value: 'code_asc' },
  { label: '股票代號 ▼', value: 'code_desc' }
]

const triggerFilterAnimation = () => {
  isFiltering.value = true
  setTimeout(() => {
    isFiltering.value = false
  }, 300)
}

// Filters
const filters = ref({
  search: '',
  year: new Date().getFullYear().toString(),
  category: '超商商品卡',
  sort: 'date_desc' // Default sort: Last Buy Date (Desc)
})

const isCurrentYear = computed(() => filters.value.year === new Date().getFullYear().toString())

const sortedCategories = computed(() => {
  const all = { id: 'all', name: '全部', color: 'gray' }
  const fallbacks = [
    { id: 1, name: '超商商品卡', color: 'blue' },
    { id: 2, name: '生技醫療', color: 'emerald' },
    { id: 3, name: '旅遊住宿', color: 'indigo' },
    { id: 4, name: '食品飲料', color: 'amber' },
    { id: 5, name: '生活用品', color: 'purple' }
  ]
  const existingNames = new Set(categories.value.map(c => c.name))
  const uniqueFallbacks = fallbacks.filter(f => !existingNames.has(f.name))
  
  return [all, ...categories.value, ...uniqueFallbacks]
})

// Color Helpers for Category Buttons - Use Centralized Utility
const getCategoryActiveClasses = (color) => {
  return getCategoryStyles(color).tab
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

// Helper to check if a souvenir string is a placeholder
const isPlaceholder = (val) => {
  if (!val) return true
  const s = String(val).trim()
  return s === '' || s === '尚未公布' || s.includes('再行公告') || s === '尚未公告'
}

// Optimized Lookups for O(N) performance
const collectionIdsSet = computed(() => {
  return new Set(myCollections.value.map(c => c.souvenir_id))
})

const allUserCollectionsMap = computed(() => {
  const map = new Map()
  allUserCollections.value.forEach(c => {
    const code = String(c.gift?.code || '').trim()
    if (!map.has(code)) map.set(code, [])
    map.get(code).push(c)
  })
  return map
})

const portfoliosMap = computed(() => {
  const map = new Map()
  portfolios.value.forEach(p => map.set(p.id, p))
  return map
})

// Data Filtering
const filteredGifts = computed(() => {
  let result = gifts.value

  // 1. Filter by Collection (if active) - Optimized with Set O(1)
  if (currentView.value === 'collection') {
    const collSet = collectionIdsSet.value
    result = result.filter(g => {
      const isInMyCollection = collSet.has(g.id)
      const isInInventory = userInventoryIds.value.has(g.code)
      return isInMyCollection && !isInInventory
    })
  }

  // 2. Filter by Search Keyword
  if (filters.value.search) {
    const keyword = filters.value.search.toLowerCase()
    result = result.filter(g =>
      (g.name && String(g.name).toLowerCase().includes(keyword)) ||
      (g.code && String(g.code).toLowerCase().includes(keyword)) ||
      (g.souvenir_item && String(g.souvenir_item).toLowerCase().includes(keyword))
    )
  }

  // 3. Filter by Category
  if (filters.value.category && filters.value.category !== '全部') {
    result = result.filter(g => {
      // Check current year match
      const currentMatch = matchCategory(g.souvenir_item)
      const currentCat = categories.value.find(c => c.id === currentMatch.id)
      if (currentCat && currentCat.name === filters.value.category) return true

      // If current year is placeholder, check previous year match
      if (isPlaceholder(g.souvenir_item)) {
        const prevSouvenir = previousYearSouvenirs.value.get(g.code)
        if (prevSouvenir) {
          const prevMatch = matchCategory(prevSouvenir)
          const prevCat = categories.value.find(c => c.id === prevMatch.id)
          return prevCat && prevCat.name === filters.value.category
        }
      }
      return false
    })
  }

  return result
})

// Mapped Gifts with Dynamic Categories
const mappedGifts = computed(() => {
  return filteredGifts.value.map(g => {
    // Dynamic Category Matching
    // If current is placeholder, try to match by previous year to give it a "likely" category
    let souvenirToMatch = g.souvenir_item
    const prevSouvenir = previousYearSouvenirs.value.get(g.code)
    
    if (isPlaceholder(souvenirToMatch) && prevSouvenir) {
      souvenirToMatch = prevSouvenir
    }

    const match = matchCategory(souvenirToMatch)
    const categoryObj = categories.value.find(c => c.id === match.id)

    const normalizedCode = String(g.code || '').trim()
    const collectedIn = allUserCollectionsMap.value.get(normalizedCode) || []
    const collectedPortfolios = collectedIn.map(c => {
      const p = portfoliosMap.value.get(c.portfolio_id)
      const pName = p?.name || '未知'
      return {
        id: c.portfolio_id,
        name: pName,
        initial: pName.charAt(0) || '?',
        status: c.status
      }
    })

    return {
      ...g, // Spread first to ensure no properties are lost
      id: g.id,
      code: g.code, 
      name: g.name, 
      souvenir: g.souvenir_item,
      category: categoryObj ? categoryObj.name : '其他',
      categoryColor: categoryObj ? categoryObj.color : 'gray',
      lastBuy: g.last_buy_date,
      meeting: g.meeting_date,
      isCollected: isInCollection(g.id),
      isInInventory: userInventoryIds.value.has(g.code),
      previousYearSouvenir: prevSouvenir,
      collectedPortfolios
    }
  })
})

// Sorted Mapped Gifts
const sortedMappedGifts = computed(() => {
  const items = [...mappedGifts.value]
  const sort = filters.value.sort
  
  if (sort === 'code_asc') {
    return items.sort((a, b) => String(a.code).localeCompare(String(b.code)))
  } else if (sort === 'code_desc') {
    return items.sort((a, b) => String(b.code).localeCompare(String(a.code)))
  } else if (sort === 'date_asc') {
    return items.sort((a, b) => {
      if (!a.lastBuy) return 1
      if (!b.lastBuy) return -1
      return new Date(a.lastBuy) - new Date(b.lastBuy)
    })
  } else if (sort === 'date_desc') {
    return items.sort((a, b) => {
      if (!a.lastBuy) return 1
      if (!b.lastBuy) return -1
      return new Date(b.lastBuy) - new Date(a.lastBuy)
    })
  }
  return items
})

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
} = usePagination(sortedMappedGifts) // Use sortedMappedGifts here to ensure pagination works on sorted data

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

const handleSort = (key) => {
  if (key === 'code') {
    filters.value.sort = filters.value.sort === 'code_asc' ? 'code_desc' : 'code_asc'
  } else if (key === 'date') {
    filters.value.sort = filters.value.sort === 'date_desc' ? 'date_asc' : 'date_desc'
  }
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
  if (isCombinedView.value) {
    showToast('請先選擇一個特定的帳戶，不能在歸戶模式下收藏', 'warning')
    return
  }

  processingIds.value.add(gift.id)
  try {
      const collection = getCollection(gift.id)
      if (collection) {
        await removeFromCollection(collection.id)
        showToast('已取消追蹤', 'success', 1000)
      } else {
        const { error } = await addToCollection(gift.id)
        if (error && error.message === '未登入') {
          showToast('請先登入才能追蹤紀念品', 'warning')
          openAuthModal()
          return
        } else if (error) {
          throw error
        }
        showToast('已加入追蹤清單', 'success', 1000)
      }
      // Refresh data
      await Promise.all([
        fetchMyCollections(),
        fetchAllUserCollections(filters.value.year)
      ])
  } catch (e) {
    console.error(e)
    showToast(e.message, 'error')
  } finally {
    processingIds.value.delete(gift.id)
  }
}

const handleToggleInventory = async (gift) => {
  if (isCombinedView.value) {
    showToast('請先選擇一個特定的帳戶，不能在歸戶模式下新增', 'warning')
    return
  }

  inventoryProcessingIds.value.add(gift.id)
  try {
    if (gift.isInInventory) {
      // 徹底移除：不論有沒有追蹤都完全消失
      const { success, error } = await removeFromInventoryCompletely(gift.id)
      if (error) throw error
      
      if (success) {
        showToast(`已從庫存移除 「${gift.name}」`, 'success', 1000)
      }
    } else {
      // 直接入庫：不再連動追蹤狀態
      const { success, error } = await addToInventory(gift.code, gift.name)
      if (error && error.message === '未登入') {
        showToast('請先登入才能新增庫存', 'warning')
        openAuthModal()
        return
      } else if (error) {
        throw error
      }

      if (success || !error) {
        showToast(`「${gift.name}」已直接加入庫存`, 'success', 2000)
      }
    }

    // Refresh data for both add and remove
    await Promise.all([
      fetchMyCollections(),
      fetchAllUserCollections(filters.value.year),
      fetchUserInventoryIds().then(ids => userInventoryIds.value = ids)
    ])
  } catch (e) {
    console.error(e)
    showToast(e.message, 'error')
  } finally {
    inventoryProcessingIds.value.delete(gift.id)
  }
}

const isExpired = (dateString) => {
  if (!dateString) return false
  const target = new Date(dateString).setHours(0, 0, 0, 0)
  const now = new Date().setHours(0, 0, 0, 0)
  return target < now
}

// Watchers
watch(filters, async (newVal, oldVal) => {
  // Only apply API filters if Year or Search changed
  // Category is client-side, so just reset pagination
  if (newVal.year !== oldVal.year || newVal.search !== oldVal.search) {
    // debounced handled separately for search input events
    if (newVal.year !== oldVal.year) {
      applyFilters()
      // Also fetch previous year data for reference
      previousYearSouvenirs.value = await fetchPreviousYearSouvenirs(newVal.year)
    }
  }
  reset()
}, { deep: true })

watch(viewMode, () => reset())

watch(currentPortfolioId, async () => {
  await Promise.all([
    fetchMyCollections(),
    fetchAllUserCollections(filters.value.year),
    fetchUserInventoryIds().then(ids => userInventoryIds.value = ids)
  ])
})

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
  await fetchAllUserCollections(filters.value.year) // Load all collections for badges
  userInventoryIds.value = await fetchUserInventoryIds() // NEW: Load inventory state
  // Fetch previous year souvenirs for reference
  previousYearSouvenirs.value = await fetchPreviousYearSouvenirs(filters.value.year)
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

/* Pro Max Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.02);
}

/* Pulse animation for the heart icon in active state */
@keyframes heart-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.animate-pulse-heart {
  animation: heart-pulse 1.5s infinite ease-in-out;
}
</style>
