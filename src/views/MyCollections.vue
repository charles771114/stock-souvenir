<template>
  <div class="min-h-screen bg-surface-50 flex flex-col">
    <Navbar />

    <!-- Pull to Refresh Indicator -->
    <div
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-75 pointer-events-none"
      :style="{
        transform: `translateY(${pullDistance - 60}px)`,
        opacity: pullDistance > 20 ? 1 : 0
      }">
      <div
        class="bg-white/90 backdrop-blur-xl rounded-full p-4 shadow-2xl border border-white/60 flex items-center justify-center">
        <div class="w-10 h-10 rounded-full border-4 border-slate-100 border-t-brand-primary transition-none"
          :class="{ 'animate-spin': isRefreshing }"
          :style="{ transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg)` }"></div>
        <div v-if="!isRefreshing"
          class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-base font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
          下拉重整</div>
        <div v-else
          class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-base font-black text-brand-primary uppercase tracking-widest whitespace-nowrap animate-pulse">
          更新中...</div>
      </div>
    </div>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in-up">
      <!-- Header & Year Switcher -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 stagger-item-1">
        <div>
          <h1 class="text-4xl font-black text-slate-800 tracking-tight">
            我的購股計畫
          </h1>
          <p class="text-base font-black text-slate-400 uppercase tracking-widest mt-2">
            管理您的領取計畫，追蹤各項紀念品的入袋進度
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center gap-4 self-start md:self-auto">
          <button v-if="aggregatedPlanned.length > 0" @click="handleClearAll"
            class="px-6 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100 flex items-center gap-2 group shadow-sm">
            <i class="ri-delete-bin-7-line text-lg group-hover:shake"></i>
            移除全部優先待買清單
          </button>
          
          <div class="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/30 backdrop-blur-sm shadow-sm">
            <button v-for="y in ['2026', '2025']" :key="y" @click="selectedYear = y"
              class="px-6 py-2.5 rounded-xl text-base font-black transition-all uppercase tracking-widest shadow-sm shadow-transparent"
              :class="selectedYear === y ? 'bg-white text-brand-primary shadow-slate-200/50' : 'text-slate-500 hover:text-brand-primary hover:bg-white/50'">
              {{ y }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content Sections -->
      <div v-if="loading || categoriesLoading" class="space-y-16">
          <div class="stagger-item-1">
             <div class="flex items-center gap-4 mb-8">
                <div class="w-2 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                <div class="w-48 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="i in 4" :key="i" class="glass-card p-6 h-40 bg-slate-100/50 animate-pulse border border-slate-100"></div>
             </div>
          </div>
      </div>
      
      <div v-else-if="!loading && !categoriesLoading && hasFilteredItems" class="space-y-16">
        <!-- 1. 領取計畫 (The Priority Section) -->
        <div v-if="aggregatedPlanned.length > 0" class="stagger-item-3">
          <div class="flex items-center justify-between mb-8 px-2">
            <div class="flex items-center gap-4">
              <div class="w-2 h-8 bg-brand-primary rounded-full shadow-glow"></div>
              <h2 class="text-2xl font-black text-slate-800 tracking-tight">優先待買清單</h2>
            </div>
            <div v-if="aggregatedPlanned.filter(i => getUrgencyLevel(i.gift?.last_buy_date) === 'urgent').length > 0" 
                 class="flex items-center gap-3 px-5 py-2 bg-rose-50 border border-rose-100 rounded-2xl animate-pulse">
               <i class="ri-error-warning-fill text-rose-500 text-xl"></i>
               <span class="text-base font-black text-rose-600 uppercase tracking-widest">
                 {{ aggregatedPlanned.filter(i => getUrgencyLevel(i.gift?.last_buy_date) === 'urgent').length }} 筆急需處理
               </span>
            </div>
          </div>

          <div v-if="isCurrentYear" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
             <div v-for="item in aggregatedPlanned" :key="item.id" 
                  class="glass-card p-6 border border-slate-100 hover:border-brand-primary/30 hover:translate-y-[-4px] hover:shadow-2xl transition-all group relative">
                
                <div class="flex gap-6">
                    <!-- Left: Code & Urgency -->
                    <div class="flex flex-col items-center gap-3">
                        <div class="px-4 py-3 rounded-2xl bg-white text-slate-700 font-mono text-base font-black tracking-tighter border border-slate-100 transition-all group-hover:bg-brand-primary/5 group-hover:text-brand-primary group-hover:border-brand-primary/20 shadow-sm">
                            {{ item.gift?.code }}
                        </div>
                        <div v-if="item.gift?.last_buy_date" 
                             class="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 shadow-sm transition-transform group-hover:scale-105"
                             :class="getUrgencyColor(getUrgencyLevel(item.gift?.last_buy_date))">
                             <span class="text-xs font-black uppercase tracking-widest opacity-60">剩餘</span>
                             <span class="text-2xl font-black leading-none my-1">{{ Math.max(0, getDaysRemaining(item.gift?.last_buy_date)) }}</span>
                             <span class="text-sm font-black">天</span>
                        </div>
                    </div>

                    <!-- Right: Info & Actions -->
                    <div class="flex-grow flex flex-col justify-between min-w-0">
                        <div class="flex justify-between items-start gap-4">
                            <div class="min-w-0">
                                <h3 class="text-xl font-black text-slate-800 truncate tracking-tight group-hover:text-brand-primary transition-colors">
                                    {{ item.gift?.name }}
                                </h3>
                                <div class="min-w-0">
                                    <div class="font-black tracking-tight"
                                      :class="isPlaceholder(item.gift?.souvenir_item) ? 'text-brand-primary text-base' : 'text-slate-700 text-base'">
                                      <template v-if="isPlaceholder(item.gift?.souvenir_item)">
                                        <div v-if="previousYearSouvenirs.get(item.gift?.code)" class="flex flex-col gap-1">
                                          <span class="text-brand-primary">(去) {{ previousYearSouvenirs.get(item.gift?.code) }}</span>
                                          <span class="text-[10px] text-slate-400 italic font-bold">今年：{{ item.gift?.souvenir_item || '尚未公布' }}</span>
                                        </div>
                                        <span v-else class="text-slate-400 text-sm italic">尚未公布</span>
                                      </template>
                                      <span v-else>{{ item.gift?.souvenir_item }}</span>
                                    </div>
                                </div>
                            </div>
                            <button @click="addToInventory(item.souvenir_id)" 
                                    :disabled="addingToInventory === item.souvenir_id || confirmedIds.has(item.souvenir_id)"
                                    class="flex items-center gap-2 px-6 py-4 rounded-2xl transition-all cursor-pointer group disabled:cursor-not-allowed shrink-0 min-h-[56px] border shadow-sm"
                                    :class="[
                                      confirmedIds.has(item.souvenir_id) 
                                        ? 'bg-emerald-50/50 text-emerald-400 border-emerald-100 shadow-none animate-none' 
                                        : 'bg-orange-50/80 text-brand-primary border-orange-100 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-95'
                                    ]">
                                    <i v-if="addingToInventory === item.souvenir_id" class="ri-loader-4-line animate-spin text-xl"></i>
                                    <i v-else-if="confirmedIds.has(item.souvenir_id)" class="ri-checkbox-circle-fill text-xl"></i>
                                    <i v-else class="ri-add-line text-2xl"></i>
                                    <span class="text-base font-black tracking-widest uppercase">
                                      {{ confirmedIds.has(item.souvenir_id) ? '已入庫存' : '加入庫存' }}
                                    </span>
                            </button>
                        </div>

                        <div class="flex items-center justify-between mt-6">
                            <div class="flex items-center gap-4">
                                <span v-if="isCombinedView" class="text-sm font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                    {{ getPortfolioName(item.portfolio_id) }}
                                </span>
                                <span v-if="item.gift?.last_buy_date" class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <i class="ri-calendar-event-line"></i>最後買進: {{ item.gift?.last_buy_date }}
                                </span>
                            </div>
                            <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                                    class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group disabled:opacity-50">
                                    <i v-if="removing === item.id" class="ri-loader-4-line animate-spin text-xl"></i>
                                    <i v-else class="ri-delete-bin-line text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          </div>
          <div v-else class="text-center py-12 glass-card bg-slate-50/30 border-dashed border-slate-200">
              <p class="text-slate-400 text-sm font-bold uppercase tracking-widest">非當年度資料僅供查詢</p>
          </div>
        </div>
        

        <!-- 3. 已達成清單 (Achieved Achievement) -->
        <div v-if="aggregatedInventory.length > 0" class="stagger-item-4 pb-20">
          <div class="flex items-center gap-4 mb-8 px-2">
            <div class="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"></div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">已在庫存清單</h2>
          </div>

          <div v-if="isCurrentYear" class="space-y-6">
               <div v-for="catGroup in aggregatedInventory" :key="catGroup.category_id" 
                    class="glass-card overflow-hidden bg-white/40 border border-slate-100/50">
                  
                  <!-- Category Header -->
                  <div class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/60 transition-colors"
                       @click="toggleCategory('inv_cat_' + catGroup.category_id)">
                      <div class="flex items-center gap-4">
                          <!-- Color Indicator -->
                          <div class="w-3 h-3 rounded-full shadow-sm"
                               :class="[
                                   catGroup.category_color === 'rose' ? 'bg-rose-400 shadow-rose-200' :
                                   catGroup.category_color === 'amber' ? 'bg-amber-400 shadow-amber-200' :
                                   catGroup.category_color === 'emerald' ? 'bg-emerald-400 shadow-emerald-200' :
                                   catGroup.category_color === 'blue' ? 'bg-blue-400 shadow-blue-200' :
                                   catGroup.category_color === 'indigo' ? 'bg-indigo-400 shadow-indigo-200' :
                                   catGroup.category_color === 'purple' ? 'bg-purple-400 shadow-purple-200' :
                                   'bg-slate-400 shadow-slate-200'
                               ]"></div>
                          <h3 class="text-xl font-black text-slate-800 tracking-tight">{{ catGroup.category_name }}</h3>
                          <span class="px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest uppercase">
                              共 {{ catGroup.count }} 筆
                          </span>
                      </div>
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 transition-transform duration-300"
                           :class="{ 'rotate-180': isCategoryExpanded('inv_cat_' + catGroup.category_id) }">
                          <i class="ri-arrow-down-s-line text-xl"></i>
                      </div>
                  </div>

                  <!-- Category Content (Item Groups) -->
                  <div v-if="isCategoryExpanded('inv_cat_' + catGroup.category_id)" 
                       class="bg-slate-50/50 border-t border-slate-100/50 p-4 space-y-3">
                       
                       <div v-for="group in catGroup.items" :key="group.souvenir_item" 
                            class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:border-brand-primary/20 transition-all">
                          
                          <!-- Item Group Header -->
                          <div class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                               @click="toggleDetails('inv_item_' + catGroup.category_id + '_' + group.souvenir_item)">
                              <div class="flex items-center gap-4">
                                   <!-- Sub-arrow indicator -->
                                   <div class="w-6 h-6 rounded flex items-center justify-center text-slate-300 transition-transform duration-300"
                                        :class="{ 'rotate-180 text-brand-primary': isExpanded('inv_item_' + catGroup.category_id + '_' + group.souvenir_item) }">
                                       <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                       </svg>
                                   </div>
                                   <div>
                                       <h4 class="text-base font-black text-slate-800">{{ group.souvenir_item }}</h4>
                                   </div>
                              </div>
                              <div class="flex items-center gap-3">
                                  <div class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest border border-emerald-100">
                                     {{ group.companies.length }} 家已解鎖
                                  </div>
                              </div>
                          </div>

                          <!-- Company Details (Leaf) -->
                          <div v-if="isExpanded('inv_item_' + catGroup.category_id + '_' + group.souvenir_item)" 
                               class="bg-slate-50/30 border-t border-slate-50 px-5 py-4 space-y-2">
                              <div v-for="item in group.companies" :key="item.id" 
                                   class="bg-white border text-sm border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm group/item hover:border-emerald-200 transition-all">
                                  
                                  <div class="flex items-center gap-4 min-w-0">
                                      <span class="px-2 py-1.5 rounded-lg bg-slate-50 text-slate-500 font-mono text-xs font-black tracking-tight border border-slate-100 group-hover/item:text-emerald-600 group-hover/item:border-emerald-100 transition-all">
                                          {{ item.gift?.code }}
                                      </span>
                                      <div class="min-w-0">
                                          <div class="flex flex-col gap-0.5">
                                              <div class="flex items-center gap-2">
                                                  <span class="text-sm font-black text-slate-700 truncate">{{ item.gift?.name }}</span>
                                                  <span v-if="isCombinedView" class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase tracking-widest">
                                                      {{ getPortfolioName(item.portfolio_id) }}
                                                  </span>
                                              </div>
                                              <span class="text-[10px] text-slate-400 font-bold truncate" :title="item.original_item_name">{{ item.original_item_name }}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="flex items-center justify-end shrink-0">
                                       <button @click="handleRemoveInventory(item.souvenir_id, item.id)" :disabled="removing === item.id"
                                              class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all group disabled:opacity-50">
                                              <i v-if="removing === item.id" class="ri-loader-4-line animate-spin text-lg"></i>
                                              <i v-else class="ri-delete-bin-line text-lg"></i>
                                       </button>
                                  </div>
                              </div>
                          </div>
                       </div>
                  </div>
               </div>
          </div>
          <div v-else class="text-center py-12 glass-card bg-slate-50/30 border-dashed border-slate-200">
             <p class="text-slate-400 text-sm font-bold uppercase tracking-widest">非當年度資料僅供查詢</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && !categoriesLoading"
        class="py-32 flex flex-col items-center justify-center text-center px-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-dashed border-slate-200 stagger-item-1">
        <div
          class="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-100 shadow-inner">
          <i class="ri-heart-3-line text-6xl text-slate-200"></i>
        </div>
        <h4 class="text-2xl font-black text-slate-900 mb-4">
          {{ selectedYear }} 年度尚無領取計畫
        </h4>
        <p class="text-base font-bold text-slate-400 max-w-sm mb-12">您可以前往目錄挑選感興趣的紀念品加入計畫。</p>
        <router-link to="/gifts"
          class="px-10 py-5 bg-brand-primary text-white rounded-3xl font-black text-base uppercase tracking-widest shadow-2xl shadow-brand-primary/20 hover:bg-slate-900 transition-all flex items-center gap-3">
          <i class="ri-compass-3-line text-2xl"></i>
          前往紀念品目錄
        </router-link>
      </div>
    </main>

  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useAuth } from '@/composables/useAuth'
import { useCollection } from '@/composables/useCollection'
import { useDialog } from '@/composables/useDialog'
import { useGifts } from '@/composables/useGifts'
import { useCategories } from '@/composables/useCategories'
import { usePortfolio } from '@/composables/usePortfolio'
import { usePullRefresh } from '@/composables/usePullRefresh'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref, watch } from 'vue'

const { isCombinedView, portfolios, currentPortfolioId } = usePortfolio()

const { confirm } = useDialog()
const { showToast } = useToast()
const { user } = useAuth()
const { categories, fetchCategories, loading: categoriesLoading } = useCategories() // 🆕 引入分類資料與 loading 狀態

// Pull to Refresh
const { pullDistance, isRefreshing } = usePullRefresh(async () => {
  await fetchMyCollections(selectedYear.value)
})
const { addToCollection, removeFromInventoryCompletely, removeFromCollection, clearOnlyPlannedCollections } = useCollection()

const {
  myCollections,
  loading,
  fetchMyCollections,
  fetchUserInventoryIds,
  fetchPreviousYearSouvenirs
} = useGifts()

const selectedYear = ref(new Date().getFullYear().toString())
const showStats = ref(true)
const showOtherYears = ref(false)
const inventoryIds = ref(new Set())
const previousYearSouvenirs = ref(new Map())
const removing = ref(null)
const addingToInventory = ref(null)  // 追蹤正在新增到庫存的項目
const confirmedIds = ref(new Set()) // 🆕 追蹤剛確認入袋的項目
const expandedCategories = ref({})
const expandedItems = ref(new Set()) // 🆕 用於展開單個紀念品項目

const getPortfolioName = (id) => {
  const p = portfolios.value.find(p => p.id === id)
  return p ? p.name : '未知帳戶'
}

// Helper to check if a souvenir string is a placeholder
const isPlaceholder = (val) => {
  if (!val) return true
  const s = String(val).trim()
  const p = ['尚未公布', '尚未公告', '尚未提供', 'NA', 'N/A', '-', '待公告']
  return p.includes(s) || s.includes('再行公告') || s.includes('再行公佈')
}

// Helper to check if a date is expired (past the last buy date)
const isExpired = (dateString) => {
  if (!dateString) return false
  // 設置最後買進日當天的 23:59:59 為截止點
  const target = new Date(dateString).setHours(23, 59, 59, 999)
  const now = new Date().getTime()
  return target < now
}

// 🆕 計算距離最後買進日的剩餘天數
const getDaysRemaining = (dateString) => {
  if (!dateString) return null
  const target = new Date(dateString).setHours(23, 59, 59, 999)
  const now = new Date().getTime()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 🆕 取得緊急程度 (urgent, warning, normal)
const getUrgencyLevel = (dateString) => {
  const days = getDaysRemaining(dateString)
  if (days === null || days < 0) return null
  if (days <= 3) return 'urgent'
  if (days <= 7) return 'warning'
  return 'normal'
}

// 🆕 取得緊急程度的顏色樣式
const getUrgencyColor = (level) => {
  switch (level) {
    case 'urgent': return 'text-status-error bg-status-error/5 border-status-error/20'
    case 'warning': return 'text-status-warning bg-status-warning/5 border-status-warning/20'
    case 'normal': return 'text-status-success bg-status-success/5 border-status-success/20'
    default: return 'text-slate-400 bg-slate-50 border-slate-200'
  }
}

const toggleCategory = (name) => {
  if (expandedCategories.value[name] === undefined) {
    expandedCategories.value[name] = true
  }
  expandedCategories.value[name] = !expandedCategories.value[name]
}

const isCategoryExpanded = (name) => {
  return expandedCategories.value[name] !== false
}

// 🆕 項目展開控制
const toggleDetails = (id) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const isExpanded = (id) => {
  return expandedItems.value.has(id)
}

onMounted(() => {
  loadData()
})

// 判斷是否為當前年度
const isCurrentYear = computed(() => {
  return selectedYear.value === new Date().getFullYear().toString()
})

const filteredCollections = computed(() => {
  return myCollections.value.filter(item => {
    // 修正：必須優雅處理開會日期尚未公布的情況
    const gift = item.gift
    const yearMatches = gift?.meeting_date?.startsWith(selectedYear.value) || 
                        (!gift?.meeting_date && gift?.last_buy_date?.startsWith(selectedYear.value))
    
    if (!yearMatches) return false

    // 放寬過濾：允許顯示「尚未公布」的項目，因為使用者收藏它們就是為了追蹤進度
    const name = gift?.souvenir_item || ''
    
    // 自動移除已過期但尚未買進的「待買進標的」
    if (item.status === 'collected') {
      const lastBuyDate = gift?.last_buy_date
      if (isExpired(lastBuyDate)) return false
    }

    return true
  })
})

const hasFilteredItems = computed(() => filteredCollections.value.length > 0)

const groupedCollections = computed(() => {
  // 領取計畫：狀態為 collected 且尚未持有 (或剛確認但尚未滑出)
  const planned = filteredCollections.value.filter(item => {
    const isCollected = item.status === 'collected'
    const isInInventory = inventoryIds.value.has(item.gift?.code)
    const isRecentlyConfirmed = confirmedIds.value.has(item.souvenir_id)
    return isCollected && (!isInInventory || isRecentlyConfirmed)
  })

  // 已持有項目 (包括待公布與已達成)
  const ownedItems = filteredCollections.value.filter(item => {
    const isInInventory = inventoryIds.value.has(item.gift?.code)
    const isRecentlyConfirmed = confirmedIds.value.has(item.souvenir_id)
    // 剛確認入袋的項目還在計畫清單暫留，不計入持有清單
    return (item.status === 'holding' || isInInventory) && !isRecentlyConfirmed
  })

  return { planned, ownedItems }
})

// 🆕 聚合邏輯: 待買標的 (改為扁平列表)
const aggregatedPlanned = computed(() => {
  // 直接使用 filteredCollections 中的 planned 項目
  let items = [...groupedCollections.value.planned]

  // 排序邏輯: 緊急程度 (已過期/剩餘天數少) -> 股票代號
  items.sort((a, b) => {
    const dateA = a.gift?.last_buy_date
    const dateB = b.gift?.last_buy_date
    
    // 如果都沒有日期，照代號排
    if (!dateA && !dateB) return (a.gift?.code || '').localeCompare(b.gift?.code || '')
    // 有日期的排前面
    if (!dateA) return 1
    if (!dateB) return -1
    
    // 計算剩餘天數
    const daysA = getDaysRemaining(dateA)
    const daysB = getDaysRemaining(dateB)
    
    // 如果天數不同，天數少的 (緊急) 排前面
    if (daysA !== daysB) return daysA - daysB
    
    // 天數相同，照代號排
    return (a.gift?.code || '').localeCompare(b.gift?.code || '')
  })

  return items
})

// 🆕 聚合邏輯: 待公布
const aggregatedWaiting = computed(() => {
  const map = new Map()
  groupedCollections.value.waiting.forEach(item => {
    const name = item.gift?.souvenir_item || '尚未公布'
    if (!map.has(name)) {
      map.set(name, {
        souvenir_item: name,
        companies: [],
        count: 0
      })
    }
    const group = map.get(name)
    group.companies.push(item)
    group.count++
  })
  return Array.from(map.values()).sort((a, b) => b.count - a.count)
})

// 輔助函數：將品名正規化，以便合併相似的紀念品
const normalizeItemName = (originalName) => {
    if (!originalName) return '未知物品'
    if (originalName.includes('尚未公布') || originalName.includes('尚未公告')) return originalName
    
    let n = originalName.toUpperCase()
    
    // 擷取金額
    const amountMatch = n.match(/([0-9]+)\s*元/) || n.match(/(?:^|[^0-9])([0-9]{2,4})(?:$|[^0-9])/)
    let amount = ''
    if (amountMatch) {
       amount = amountMatch[1] || ''
    }

    const is711 = n.includes('7-11') || n.includes('統一超商') || n.includes('統一超')
    const isFamilyMart = n.includes('全家')
    const isHiLife = n.includes('萊爾富')
    const isOK = n.includes('OK') || n.includes('ＯＫ')
    const isGeneralStore = n.includes('超商') && !is711 && !isFamilyMart && !isHiLife && !isOK
    
    const isCard = n.includes('卡') || n.includes('券') || n.includes('禮物')

    if (is711) return amount ? `7-11 ${amount}元商品卡/券` : '7-11 商品卡/券'
    if (isFamilyMart) return amount ? `全家 ${amount}元商品卡/券` : '全家 商品卡/券'
    if (isHiLife) return amount ? `萊爾富 ${amount}元商品卡/券` : '萊爾富 商品卡/券'
    if (isOK) return amount ? `OK超商 ${amount}元商品卡/券` : 'OK超商 商品卡/券'
    if (isGeneralStore && isCard) return amount ? `超商 ${amount}元商品卡/券` : '超商 商品卡/券'
    
    return originalName
}

// 🆕 聚合邏輯: 已入袋 (Category -> ItemGroup -> Companies)
const aggregatedInventory = computed(() => {
  const catMap = new Map()
  
  const unclassifiedId = -1
  const unclassifiedCat = { name: '未分類項目', color: 'gray' }

  groupedCollections.value.ownedItems.forEach(item => {
    // 1. Category Group
    const catId = item.gift?.category_id || unclassifiedId
    if (!catMap.has(catId)) {
      const catInfo = categories.value.find(c => c.id === catId) || unclassifiedCat
      catMap.set(catId, {
        category_id: catId,
        category_name: catInfo.name || '其他/未知分類',
        category_color: catInfo.color || 'gray',
        itemsMap: new Map(),
        count: 0
      })
    }
    const catGroup = catMap.get(catId)

    // 2. Item Group (inside Category)
    const rawName = item.gift?.souvenir_item || '尚未公布'
    const name = normalizeItemName(rawName)
    
    if (!catGroup.itemsMap.has(name)) {
      catGroup.itemsMap.set(name, {
        souvenir_item: name,
        companies: []
      })
    }
    const itemGroup = catGroup.itemsMap.get(name)
    itemGroup.companies.push({
        ...item,
        original_item_name: rawName // 紀錄原本名稱供明細顯示
    })
    catGroup.count++
  })

  // 轉換 Map 為 Array 並排序
  return Array.from(catMap.values())
    .map(cat => ({
      ...cat,
      items: Array.from(cat.itemsMap.values()).sort((a, b) => {
        const nameCompare = a.souvenir_item.localeCompare(b.souvenir_item, 'zh-TW')
        if (nameCompare !== 0) return nameCompare
        return b.companies.length - a.companies.length
      })
    }))
    .sort((a, b) => b.count - a.count)
})

const souvenirCounts = computed(() => {
  const groups = {} // { mainName: { isCard, subItems: { label: { count, companies: Map<name, inInventory> } } } }

  filteredCollections.value.forEach(item => {
    let name = item.gift?.souvenir_item || '尚未公布'
    const companyName = item.gift?.name || '未知公司'
    const inInventory = inventoryIds.value.has(item.gift?.code)

    const isPending = name.includes('開會55日前再行公告') || name === '尚未公布'
    const prevSouvenir = previousYearSouvenirs.value.get(item.gift?.code)

    const parsed = name.match(/^(.*?)(\d+.*)$/)
    const mainName = isPending ? '名稱待公告項目' : (parsed ? parsed[1].trim() : name)
    const subLabel = isPending && prevSouvenir ? `${name} (預計：${prevSouvenir})` : (isPending ? name : (parsed ? parsed[2].trim() : '其他'))

    if (!groups[mainName]) {
      groups[mainName] = {
        total: 0,
        isCard: mainName.includes('商品卡') || mainName.includes('禮物卡') || mainName.includes('禮券'),
        subItems: {}
      }
    }

    groups[mainName].total++
    if (!groups[mainName].subItems[subLabel]) {
      groups[mainName].subItems[subLabel] = { count: 0, companies: new Map() }
    }
    groups[mainName].subItems[subLabel].count++
    // We use a Map to store unique companies and their inventory status
    groups[mainName].subItems[subLabel].companies.set(companyName, inInventory)
  })

  return Object.entries(groups)
    .map(([name, data]) => ({
      name,
      total: data.total,
      isCard: data.isCard,
      subItems: Object.entries(data.subItems)
        .map(([label, subData]) => ({
          label,
          count: subData.count,
          companies: Array.from(subData.companies.entries()).map(([compName, invStatus]) => ({
            name: compName,
            inInventory: invStatus
          }))
        }))
        .sort((a, b) => {
          const numA = parseInt(a.label) || 0
          const numB = parseInt(b.label) || 0
          return numA - numB
        })
    }))
    .sort((a, b) => {
      if (a.isCard && !b.isCard) return -1
      if (!a.isCard && b.isCard) return 1
      return b.total - a.total
    })
})

// 新增到庫存
const addToInventory = async (souvenirId) => {
  addingToInventory.value = souvenirId
  try {
    const { success, error } = await addToCollection(souvenirId, 'holding')
    if (success) {
      // 🆕 體感優化：不立即移除，先顯示成功狀態
      confirmedIds.value.add(souvenirId)
      
      showToast('已成功加入庫存！', 'success', 5000, {
        label: '撤銷',
        onClick: () => handleUndoInventory(souvenirId, true)
      })

      // 重新載入庫存狀態（這會更新 inventoryIds，但因為有 confirmedIds，項目暫時不會消失）
      inventoryIds.value = await fetchUserInventoryIds()

      // 延遲 1.5 秒後才真正從計畫清單移除
      setTimeout(() => {
        confirmedIds.value.delete(souvenirId)
      }, 1500)
    } else {
      showToast(error || '操作失敗', 'error')
    }
  } catch (e) {
    console.error('Add to inventory error:', e)
    showToast('操作失敗', 'error')
  } finally {
    addingToInventory.value = null
  }
}

// 🆕 移除庫存
const handleUndoInventory = async (souvenirId, skipConfirm = false) => {
  if (skipConfirm || await confirm('確定要從庫存移除嗎？此操作將同時取消追蹤。', '移除庫存')) {
    try {
      // 如果是從 Toast 點擊的，先移除確認狀態
      confirmedIds.value.delete(souvenirId)
      
      const { success, error } = await removeFromInventoryCompletely(souvenirId)
      if (success) {
        showToast('已從庫存移除', 'success')
        await loadData()
      } else {
        showToast(error || '操作失敗', 'error')
      }
    } catch (e) {
      console.error('Undo inventory error:', e)
      showToast('操作失敗', 'error')
    }
  }
}

const handleRemove = async (id) => {
  if (await confirm('確定要從領取清單中移除這項紀念品嗎？', '移除收藏')) {
    removing.value = id
    const { error } = await removeFromCollection(id)
    if (!error) {
      showToast('已移除', 'success')
      await fetchMyCollections(selectedYear.value)
    } else {
      showToast('移除失敗', 'error')
    }
    removing.value = null
  }
}

const handleClearAll = async () => {
  const scopeText = isCombinedView.value ? '所有帳戶' : '目前選定帳戶'
  const message = `確定要清空「${scopeText}」下所有「優先待買」的計畫嗎？\n(這不會影響已入袋的庫存項目)`
  
  if (await confirm(message, '移除全部優先待買清單')) {
    loading.value = true
    try {
      const { success, error } = await clearOnlyPlannedCollections()
      if (success) {
        showToast('已移除優先待買清單', 'success')
        await loadData()
      } else {
        showToast(error || '清空失敗', 'error')
      }
    } catch (e) {
      console.error('Clear planned error:', e)
      showToast('操作失敗', 'error')
    } finally {
      loading.value = false
    }
  }
}

const handleRemoveInventory = async (souvenirId, collectionId) => {
  if (await confirm('確定要從庫存與領取計畫中徹底移除這項標的嗎？', '移除庫存標的')) {
    removing.value = collectionId
    try {
      const { success, error } = await removeFromInventoryCompletely(souvenirId)
      if (success) {
        showToast('已徹底移除', 'success')
        await loadData()
      } else {
        showToast(error || '移除失敗', 'error')
      }
    } catch (e) {
      console.error('Delete inventory error:', e)
      showToast('操作失敗', 'error')
    } finally {
      removing.value = null
    }
  }
}

const loadData = async () => {
  if (user.value) {
    if (categories.value.length === 0) {
        await fetchCategories()
    }
    await fetchMyCollections(selectedYear.value)
    inventoryIds.value = await fetchUserInventoryIds()
    // Fetch previous year data for hints
    previousYearSouvenirs.value = await fetchPreviousYearSouvenirs(selectedYear.value)
  }
}


watch(user, (val) => {
  if (val) loadData()
})

watch(selectedYear, () => {
  if (user.value) {
    loadData()
  }
})

watch(currentPortfolioId, () => {
  if (user.value) {
    loadData()
  }
})
</script>

<style scoped>
.glass-card {
  @apply bg-white/60 backdrop-blur-2xl border border-white/50 shadow-xl transition-all duration-500;
  border-radius: 2.25rem;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
