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
            優先追蹤待買清單，紀錄您的入袋成就
          </p>
        </div>
        
        <div class="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/30 backdrop-blur-sm self-start md:self-auto shadow-sm">
          <button v-for="y in ['2026', '2025']" :key="y" @click="selectedYear = y"
            class="px-6 py-2.5 rounded-xl text-base font-black transition-all uppercase tracking-widest shadow-sm shadow-transparent"
            :class="selectedYear === y ? 'bg-white text-brand-primary shadow-slate-200/50' : 'text-slate-500 hover:text-brand-primary hover:bg-white/50'">
            {{ y }}
          </button>
        </div>
      </div>

      <!-- Content Sections -->
      <div v-if="!loading && hasFilteredItems" class="space-y-16">
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
                                <p class="text-base font-bold text-slate-500 mt-1.5 truncate">
                                    {{ item.gift?.souvenir_item || '尚未公布名稱' }}
                                </p>
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
        
        <!-- 2. 等待公布 (Owned Stock but Souvenir TBD) -->
        <div v-if="aggregatedWaiting.length > 0" class="stagger-item-3 animate-fade-in">
          <div class="flex items-center gap-4 mb-8 px-2">
            <div class="w-2 h-8 bg-slate-300 rounded-full"></div>
            <h2 class="text-2xl font-black text-slate-500 tracking-tight">持股待公布項目</h2>
          </div>

          <div v-if="isCurrentYear" class="space-y-4">
              <div v-for="group in aggregatedWaiting" :key="group.souvenir_item" 
                   class="glass-card overflow-hidden bg-slate-50/50 border-dashed border-slate-200 group/waiting">
                  
                  <div class="px-8 py-6 flex items-center justify-between cursor-pointer"
                       @click="toggleDetails('wait_' + group.souvenir_item)">
                      <div class="flex items-center gap-6">
                           <div class="w-14 h-14 rounded-2xl bg-white text-slate-300 flex items-center justify-center border border-slate-100 shadow-sm">
                              <i class="ri-eye-line text-2xl"></i>
                           </div>
                           <div>
                               <h3 class="text-lg font-black text-slate-400">{{ group.souvenir_item }}</h3>
                               <p class="text-base font-bold text-slate-500 mt-1 uppercase tracking-widest">
                                  {{ group.companies.length }} 家持股正等待今年度資訊
                                </p>
                           </div>
                      </div>
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 transition-transform bg-white border border-slate-100 shadow-sm"
                           :class="{ 'rotate-180': isExpanded('wait_' + group.souvenir_item) }">
                          <i class="ri-arrow-down-s-line text-2xl"></i>
                      </div>
                  </div>

                  <div v-if="isExpanded('wait_' + group.souvenir_item)" class="bg-white/40 border-t border-slate-100 px-6 py-4 space-y-3">
                      <div v-for="item in group.companies" :key="item.id" 
                           class="flex items-center justify-between gap-4 p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                          <div class="flex items-center gap-5 min-w-0">
                              <span class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-mono text-base font-black tracking-tighter border border-slate-100">
                                  {{ item.gift?.code }}
                              </span>
                              <div class="min-w-0">
                                  <span class="text-base font-black text-slate-700 truncate">{{ item.gift?.name }}</span>
                                  <div class="flex items-center gap-2 mt-1">
                                      <div class="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
                                      <span class="text-sm font-black text-slate-400 uppercase tracking-widest">等待公布</span>
                                  </div>
                              </div>
                          </div>
                          <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                                  class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-xl shadow-sm border border-slate-100">
                                  <i v-if="removing === item.id" class="ri-loader-4-line animate-spin text-xl"></i>
                                  <i v-else class="ri-delete-bin-line text-xl"></i>
                          </button>
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
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">已達成入袋清單</h2>
          </div>

          <div v-if="isCurrentYear" class="space-y-4">
               <div v-for="group in aggregatedInventory" :key="group.souvenir_item" 
                    class="glass-card overflow-hidden transition-all hover:bg-white/80 border border-slate-100/50 group">
                  
                  <div class="px-8 py-6 flex items-center justify-between cursor-pointer"
                       @click="toggleDetails('inv_' + group.souvenir_item)">
                      <div class="flex items-center gap-6">
                           <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100/50">
                              <i class="ri-medal-fill text-2xl"></i>
                           </div>
                           <div>
                               <h3 class="text-lg font-black text-slate-800">{{ group.souvenir_item }}</h3>
                               <p class="text-base font-black text-slate-600 mt-1 uppercase tracking-widest">
                                  達成率: {{ group.companies.length }} 家已解鎖
                                </p>
                           </div>
                      </div>
                      <div class="flex items-center gap-5">
                          <div class="px-4 py-2 rounded-xl bg-emerald-100/50 text-emerald-700 text-base font-black uppercase tracking-widest border border-emerald-100">
                             x{{ group.companies.length }}
                          </div>
                          <div class="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 transition-transform duration-500 shadow-sm"
                               :class="{ 'rotate-180': isExpanded('inv_' + group.souvenir_item) }">
                              <i class="ri-arrow-down-s-line text-2xl"></i>
                          </div>
                      </div>
                  </div>

                  <!-- Achievement Details -->
                  <div v-if="isExpanded('inv_' + group.souvenir_item)" class="bg-slate-50/30 border-t border-slate-100/50 px-6 py-5 space-y-3 animate-fade-in">
                      <div v-for="item in group.companies" :key="item.id" 
                           class="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group/item">
                          
                          <div class="flex items-center gap-5 min-w-0">
                              <span class="px-3 py-2 rounded-xl bg-slate-50 text-slate-600 font-mono text-base font-black tracking-tighter border border-slate-100 group-hover/item:text-emerald-600 group-hover/item:border-emerald-100 transition-all shadow-sm">
                                  {{ item.gift?.code }}
                              </span>
                              <div class="min-w-0">
                                  <div class="flex items-center gap-3">
                                      <span class="text-lg font-black text-slate-800 truncate">{{ item.gift?.name }}</span>
                                      <span v-if="isCombinedView" class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-black uppercase tracking-widest border border-slate-200">
                                          {{ getPortfolioName(item.portfolio_id) }}
                                      </span>
                                  </div>
                                  <div class="flex items-center gap-2 mt-1.5">
                                      <i class="ri-checkbox-circle-fill text-emerald-500 text-base"></i>
                                      <span class="text-sm font-black text-emerald-600 uppercase tracking-widest">領取成就已達成</span>
                                  </div>
                              </div>
                          </div>
                          <div class="flex items-center justify-end gap-3 shrink-0">
                               <button @click="handleUndoInventory(item.souvenir_id)"
                                      class="flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all cursor-pointer group/undo shadow-sm">
                                      <i class="ri-history-line text-lg"></i>
                                      <span class="text-base font-black tracking-widest uppercase">移回計畫</span>
                               </button>
                               <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                                      class="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 shadow-sm bg-white">
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
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading"
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
import { usePortfolio } from '@/composables/usePortfolio'
import { usePullRefresh } from '@/composables/usePullRefresh'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref, watch } from 'vue'

const { isCombinedView, portfolios, currentPortfolioId } = usePortfolio()

const { confirm } = useDialog()
const { showToast } = useToast()
const { user } = useAuth()

// Pull to Refresh
const { pullDistance, isRefreshing } = usePullRefresh(async () => {
  await fetchMyCollections(selectedYear.value)
})
const { addToCollection, removeFromInventoryCompletely, removeFromCollection } = useCollection()

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
  return s === '' || s === '尚未公布' || s.includes('再行公告') || s === '尚未公告'
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

  // 待公布：已持有股票但紀念品名稱為預填/尚未公布
  const waiting = ownedItems.filter(item => isPlaceholder(item.gift?.souvenir_item))
  
  // 已達成：已持有股票且紀念品名稱已公布
  const achieved = ownedItems.filter(item => !isPlaceholder(item.gift?.souvenir_item))

  return { planned, waiting, achieved }
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

// 🆕 聚合邏輯: 已入袋
const aggregatedInventory = computed(() => {
  const map = new Map()
  groupedCollections.value.achieved.forEach(item => {
    const name = item.gift?.souvenir_item || '未知物品'
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

const loadData = async () => {
  if (user.value) {
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
