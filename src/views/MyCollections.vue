<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <!-- Pull to Refresh Indicator -->
    <div
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-75 pointer-events-none"
      :style="{
        transform: `translateY(${pullDistance - 60}px)`,
        opacity: pullDistance > 20 ? 1 : 0
      }">
      <div
        class="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-2xl border border-indigo-100 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 transition-none"
          :class="{ 'animate-spin': isRefreshing }"
          :style="{ transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg)` }"></div>
        <div v-if="!isRefreshing"
          class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-widest whitespace-nowrap">
          下拉重整</div>
        <div v-else
          class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap animate-pulse">
          更新中...</div>
      </div>
    </div>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in-up">
      <!-- Header -->
      <div class="mb-12">
        <h1
          class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter">
          年度購股計畫
        </h1>
        <p class="text-slate-400 mt-1 font-bold text-xs sm:text-sm uppercase tracking-wider">
          追蹤喜愛的紀念品，規劃您的購股入袋清單
        </p>
      </div>

      <!-- Filter Bar -->
      <div class="glass-card p-6 mb-8 flex flex-wrap items-center justify-between gap-6 animate-fade-in-up delay-100">
        <div class="flex items-center gap-4">
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest">選擇年度</span>
          <div class="flex bg-slate-100 p-1 rounded-xl">
            <button v-for="y in ['2026', '2025', '2024']" :key="y" @click="selectedYear = y"
              class="px-5 py-2 rounded-lg text-xs font-black transition-all"
              :class="selectedYear === y ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'">
              {{ y }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <p
            class="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            {{ selectedYear }} 年度計畫總計: {{ filteredCollections.length }}
          </p>
          <button @click="showStats = !showStats"
            class="text-[10px] font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 hover:bg-slate-100 rounded-lg">
            {{ showStats ? '收起統計' : '展開統計' }}
            <i class="fas" :class="showStats ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </button>
        </div>
      </div>



      <!-- Loading State -->
      <div v-if="loading" class="py-20 flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-xs font-black text-indigo-300 uppercase tracking-widest">Loading Collections...</p>
      </div>

      <!-- Content Sections -->
      <div v-if="!loading && hasFilteredItems">
        <!-- 1. 領取計畫 (collected) -->
        <div v-if="aggregatedPlanned.length > 0" class="mb-10">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="w-1 h-6 bg-indigo-500 rounded-full"></div>
            <h2 class="text-lg font-black text-slate-700 tracking-tight">待買進標的</h2>
            <span
              class="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">
              {{ aggregatedPlanned.length }} 筆
            </span>
          </div>

          <div v-if="isCurrentYear" class="space-y-4">
          <div v-if="isCurrentYear" class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div v-for="item in aggregatedPlanned" :key="item.id" 
                  class="glass-card p-4 border border-slate-100/50 hover:border-indigo-100 hover:shadow-lg transition-all group relative overflow-hidden">
                
                <!-- Urgency Indicator Strip -->
                <div v-if="item.gift?.last_buy_date" 
                     class="absolute left-0 top-0 bottom-0 w-1 transition-colors"
                     :class="getUrgencyColor(getUrgencyLevel(item.gift?.last_buy_date)).replace('text-', 'bg-').split(' ')[1]">
                </div>

                <div class="flex flex-col gap-3 pl-2">
                    <!-- Top Row: Code & Name -->
                    <div class="flex justify-between items-start gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs font-black tracking-tight shrink-0 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                {{ item.gift?.code }}
                            </span>
                            <h3 class="text-base font-black text-slate-800 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                                {{ item.gift?.name }}
                            </h3>
                        </div>
                        
                        <!-- Actions (Top Right for easy access) -->
                         <div class="flex items-center gap-2">
                             <button @click="addToInventory(item.souvenir_id)" :disabled="addingToInventory === item.souvenir_id"
                                    class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed">
                                    <svg v-if="addingToInventory === item.souvenir_id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span class="text-xs font-black tracking-wide">確認入庫</span>
                             </button>

                             <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                                    class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all cursor-pointer group disabled:opacity-50"
                                    title="移除">
                                    <i v-if="removing === item.id" class="fas fa-spinner fa-spin text-xs"></i>
                                    <i v-else class="fas fa-trash-alt text-xs"></i>
                                    <span class="text-xs font-black tracking-wide">移除</span>
                             </button>
                        </div>
                    </div>

                    <!-- Middle: Souvenir Item -->
                    <div class="text-sm font-bold text-slate-500 pl-1">
                        {{ item.gift?.souvenir_item || '尚未公布' }}
                    </div>

                    <!-- Bottom: Last Buy Date & Portfolio -->
                    <div class="flex items-center justify-between mt-1 pl-1">
                         <div class="flex items-center gap-2">
                            <span v-if="item.gift?.last_buy_date" 
                                  :class="['text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1.5', getUrgencyColor(getUrgencyLevel(item.gift?.last_buy_date))]">
                                <i class="far fa-clock"></i>
                                最後買進: {{ item.gift?.last_buy_date }}
                                <span v-if="getDaysRemaining(item.gift?.last_buy_date) > 0" class="font-mono">
                                    ({{ getDaysRemaining(item.gift?.last_buy_date) }}天)
                                </span>
                            </span>
                         </div>
                         
                         <span v-if="isCombinedView" class="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-1.5 py-0.5 border border-slate-100 rounded">
                            {{ getPortfolioName(item.portfolio_id) }}
                         </span>
                    </div>
                </div>
             </div>
          </div>
          </div>
          
          <!-- Card View for Other Years (Keep as is or simplify? Let's keep simple aggregated view for now as requested) -->
           <div v-else class="text-center py-8 text-slate-400 text-xs font-bold">
               非當年度資料僅供查詢
           </div>
        </div>

        <!-- 2. 在庫項目 (holding) -->
        <div v-if="aggregatedInventory.length > 0" class="mb-10">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="w-1 h-6 bg-emerald-500 rounded-full"></div>
            <h2 class="text-lg font-black text-slate-700 tracking-tight">已入袋持股</h2>
            <span
              class="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100">
              {{ groupedCollections.inventory.length }}
            </span>
          </div>

          <div v-if="isCurrentYear" class="space-y-4">
               <div v-for="group in aggregatedInventory" :key="group.souvenir_item" 
                    class="glass-card overflow-hidden transition-all hover:shadow-lg border border-emerald-100/50 hover:border-emerald-200">
                  
                  <!-- Group Header -->
                  <div class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50/20 transition-colors"
                       @click="toggleDetails('inv_' + group.souvenir_item)">
                      <div class="flex items-center gap-4">
                           <div>
                               <h3 class="text-sm font-black text-slate-800">{{ group.souvenir_item }}</h3>
                               <p class="text-[10px] font-bold text-slate-400 mt-0.5">
                                  共 {{ group.companies.length }} 家公司
                               </p>
                           </div>
                           <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                              <span class="text-xs font-black">{{ group.companies.length }}</span>
                           </div>
                      </div>
                      <div class="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 transition-transform duration-300"
                           :class="{ 'rotate-180': isExpanded('inv_' + group.souvenir_item) }">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                      </div>
                  </div>

                  <!-- Expanded Details -->
                  <div v-if="isExpanded('inv_' + group.souvenir_item)" class="bg-emerald-50/10 border-t border-emerald-100/50 px-6 py-4 space-y-3 animate-fade-in">
                      <div v-for="item in group.companies" :key="item.id" 
                           class="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-emerald-200 transition-all">
                          
                          <!-- Info -->
                          <div class="flex items-center gap-3 min-w-0">
                              <span class="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 font-mono text-[10px] font-black tracking-tight shrink-0 border border-emerald-100">
                                  {{ item.gift?.code }}
                              </span>
                              <div class="min-w-0">
                                  <div class="flex items-center gap-2">
                                      <span class="text-xs font-black text-slate-800 truncate">{{ item.gift?.name }}</span>
                                      <span v-if="isCombinedView" class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                          {{ getPortfolioName(item.portfolio_id) }}
                                      </span>
                                  </div>
                                  <div class="flex items-center gap-2 mt-1">
                                      <div class="flex items-center gap-1">
                                          <svg class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                          </svg>
                                          <span class="text-[10px] font-black text-emerald-500">已持有</span>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <!-- Actions -->
                          <div class="flex items-center justify-end gap-3 shrink-0">
                               <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                                      class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100">
                                      <i v-if="removing === item.id" class="fas fa-spinner fa-spin text-xs"></i>
                                      <i v-else class="fas fa-trash-alt text-xs"></i>
                               </button>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
             <div v-else class="text-center py-8 text-slate-400 text-xs font-bold">
               非當年度資料僅供查詢
           </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading"
        class="py-32 flex flex-col items-center justify-center text-center px-8 bg-white rounded-[3rem] border border-dashed border-slate-200">
        <div
          class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
          <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h4 class="text-xl font-bold text-slate-900 mb-2">
          {{ selectedYear }} 年度尚無待買標的
        </h4>
        <p class="text-sm text-slate-400 max-w-xs mb-8">您可以前往「紀念品目錄」挑選感興趣的紀念品加入清單。</p>
        <router-link to="/gifts"
          class="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
          前往領取目錄
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
const { addToCollection } = useCollection()

const {
  myCollections,
  loading,
  fetchMyCollections,
  fetchUserInventoryIds,
  fetchPreviousYearSouvenirs,
  removeFromCollection
} = useGifts()

const selectedYear = ref(new Date().getFullYear().toString())
const showStats = ref(true)
const showOtherYears = ref(false)
const inventoryIds = ref(new Set())
const previousYearSouvenirs = ref(new Map())
const removing = ref(null)
const addingToInventory = ref(null)  // 追蹤正在新增到庫存的項目
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
    case 'urgent': return 'text-red-500 bg-red-50 border-red-200'
    case 'warning': return 'text-amber-500 bg-amber-50 border-amber-200'
    case 'normal': return 'text-emerald-500 bg-emerald-50 border-emerald-200'
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
    const meetingDate = item.gift?.meeting_date
    if (!meetingDate?.startsWith(selectedYear.value)) return false

    // 嚴格過濾：名稱必須「明確」，但排除 (開會55日前...) 的情況以便追蹤待買標的
    const name = item.gift?.souvenir_item || ''
    const isVague = name === '尚未公布' || name === ''
    if (isVague) return false

    // 自動移除已過期但尚未買進的「待買進標的」
    if (item.status === 'collected') {
      const lastBuyDate = item.gift?.last_buy_date
      if (isExpired(lastBuyDate)) return false
    }

    return true
  })
})

const hasFilteredItems = computed(() => filteredCollections.value.length > 0)

const groupedCollections = computed(() => {
  // 領取計畫：狀態為 collected 且尚未持有
  const planned = filteredCollections.value.filter(item =>
    item.status === 'collected' && !inventoryIds.value.has(item.gift?.code)
  )
  // 在庫項目：狀態為 holding，或是雖然是 collected 但在庫存中已存在
  const inventory = filteredCollections.value.filter(item =>
    item.status === 'holding' || (item.status === 'collected' && inventoryIds.value.has(item.gift?.code))
  )
  return { planned, inventory }
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

// 🆕 聚合邏輯: 已入袋
const aggregatedInventory = computed(() => {
  const map = new Map()
  groupedCollections.value.inventory.forEach(item => {
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
      showToast('已加入庫存', 'success')
      // 重新載入庫存狀態
      inventoryIds.value = await fetchUserInventoryIds()
    } else {
      showToast(error || '加入失敗', 'error')
    }
  } catch (e) {
    console.error('Add to inventory error:', e)
    showToast('加入失敗', 'error')
  } finally {
    addingToInventory.value = null
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
  @apply bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-[1.5rem] shadow-sm;
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

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.delay-100 {
  animation-delay: 0.1s;
}
</style>
