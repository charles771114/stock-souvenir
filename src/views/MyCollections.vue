<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Header -->
      <div class="mb-12 animate-fade-in-up">
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
          <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            {{ selectedYear }} 年度計畫總計: {{ filteredCollections.length }}
          </p>
          <button @click="showStats = !showStats" 
            class="text-[10px] font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 hover:bg-slate-100 rounded-lg">
            {{ showStats ? '收起統計' : '展開統計' }}
            <i class="fas" :class="showStats ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </button>
        </div>
      </div>

      <!-- Statistics Breakdown -->
      <div v-show="showStats" v-if="!loading && souvenirCounts.length > 0" class="mb-10 animate-fade-in-up delay-200">
        <div class="flex flex-wrap gap-x-4 gap-y-6">
          <div v-for="stat in souvenirCounts" :key="stat.name" class="flex flex-col gap-2 min-w-[150px]">
            <!-- Main Pill (L1) -->
            <div
              class="backdrop-blur-md px-4 py-2 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300 group/stat cursor-pointer"
              @click="toggleCategory(stat.name)"
              :class="stat.isCard ? 'bg-indigo-50/80 border border-indigo-200/50 text-indigo-700 hover:bg-indigo-100' : 'bg-white/50 border border-white/40 text-slate-600 hover:bg-white'">
              
              <div class="flex items-center gap-2">
                <div v-if="stat.isCard" class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span class="text-[11px] font-black tracking-tight">{{ stat.name }}</span>
              </div>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm"
                :class="stat.isCard ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'">
                {{ stat.total }}
              </span>
            </div>

            <!-- Sub Items (L2: Denomination) -->
            <transition name="expand">
              <div v-if="isCategoryExpanded(stat.name) && stat.subItems.length > 0" class="flex flex-col gap-2 px-3 border-l-2 border-slate-100 ml-4">
                <div v-for="sub in stat.subItems" :key="sub.label" class="flex flex-col gap-1">
                  <div class="flex items-center justify-between group/sub">
                    <span class="text-[10px] font-bold text-slate-500">{{ sub.label }}</span>
                    <span class="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{{ sub.count }}</span>
                  </div>
                  <!-- L3: Companies with Inventory Status -->
                  <div class="flex flex-wrap gap-1.5">
                    <div v-for="company in sub.companies" :key="company.name"
                      class="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all"
                      :class="company.inInventory 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'">
                      <span>{{ company.name }}</span>
                      <i v-if="company.inInventory" class="fas fa-check-circle text-[8px]"></i>
                      <span v-else class="text-[7px] font-black opacity-60">庫存沒有此股票</span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
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
        <div v-if="groupedCollections.planned.length > 0" class="mb-10">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="w-1 h-6 bg-indigo-500 rounded-full"></div>
            <h2 class="text-lg font-black text-slate-700 tracking-tight">待買進標的</h2>
            <span class="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">
              {{ groupedCollections.planned.length }}
            </span>
          </div>
          
          <div v-if="isCurrentYear" class="flex flex-col gap-3">
            <div v-for="item in groupedCollections.planned" :key="item.id" class="animate-fade-in-up">
              <div class="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-white transition-all duration-300 border-white/50 group">
                <!-- 左側資訊 -->
                <div class="flex items-center gap-4 sm:gap-6 flex-grow">
                  <span class="font-mono text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                    {{ item.gift?.code }}
                  </span>
                  <div class="flex flex-col">
                    <h3 class="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {{ item.gift?.name }}
                    </h3>
                    <p class="text-[11px] font-bold text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{{ item.gift?.souvenir_item }}</span>
                      <span v-if="isPlaceholder(item.gift?.souvenir_item) && previousYearSouvenirs.get(item.gift?.code)" 
                        class="text-[10px] text-slate-300 italic font-medium">
                        (去年: {{ previousYearSouvenirs.get(item.gift?.code) }})
                      </span>
                    </p>
                  </div>
                </div>

                <!-- 右側操作 -->
                <div class="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <button @click="addToInventory(item.souvenir_id)" :disabled="addingToInventory === item.souvenir_id"
                    class="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 cursor-pointer group">
                    <svg v-if="addingToInventory === item.souvenir_id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span class="text-[10px] font-black uppercase tracking-wider">{{ addingToInventory === item.souvenir_id ? '新增中...' : '新增到庫存' }}</span>
                  </button>

                  <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                    class="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-100">
                    <i v-if="removing === item.id" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-trash-alt w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- 卡片式 (其他年度 - 領取計畫) -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="item in groupedCollections.planned" :key="item.id" class="animate-fade-in-up">
              <div class="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="flex justify-between items-start mb-4">
                  <span class="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {{ item.gift?.code }}
                  </span>
                  <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                    class="text-slate-300 hover:text-rose-500 transition-colors">
                    <i v-if="removing === item.id" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-trash-alt w-5 h-5"></i>
                  </button>
                </div>
                <h3 class="text-lg font-black text-slate-900 mb-2">{{ item.gift?.name }}</h3>
                <p class="text-sm text-slate-600 font-medium mb-6 line-clamp-2">
                  <span>{{ item.gift?.souvenir_item || '尚未公布' }}</span>
                  <br v-if="isPlaceholder(item.gift?.souvenir_item) && previousYearSouvenirs.get(item.gift?.code)" />
                  <span v-if="isPlaceholder(item.gift?.souvenir_item) && previousYearSouvenirs.get(item.gift?.code)" 
                    class="text-xs text-slate-400 italic">
                    (去年: {{ previousYearSouvenirs.get(item.gift?.code) }})
                  </span>
                </p>
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">開會日期</span>
                    <span class="text-xs font-black font-mono text-slate-600">{{ item.gift?.meeting_date || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 在庫項目 (holding) -->
        <div v-if="groupedCollections.inventory.length > 0" class="mb-10">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="w-1 h-6 bg-emerald-500 rounded-full"></div>
            <h2 class="text-lg font-black text-slate-700 tracking-tight">已入袋持股</h2>
            <span class="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100">
              {{ groupedCollections.inventory.length }}
            </span>
          </div>

          <div v-if="isCurrentYear" class="flex flex-col gap-3">
            <div v-for="item in groupedCollections.inventory" :key="item.id" class="animate-fade-in-up">
              <div class="glass-card border-emerald-100/50 hover:border-emerald-200/50 bg-emerald-50/20 flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-white transition-all duration-300 group">
                <!-- 左側資訊 -->
                <div class="flex items-center gap-4 sm:gap-6 flex-grow">
                  <span class="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                    {{ item.gift?.code }}
                  </span>
                  <div class="flex flex-col">
                    <h3 class="text-sm font-black text-slate-700 group-hover:text-emerald-600 transition-colors">
                      {{ item.gift?.name }}
                    </h3>
                    <p class="text-[11px] font-bold text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{{ item.gift?.souvenir_item }}</span>
                      <span v-if="isPlaceholder(item.gift?.souvenir_item) && previousYearSouvenirs.get(item.gift?.code)" 
                        class="text-[10px] text-emerald-400/60 italic font-medium">
                        (去年: {{ previousYearSouvenirs.get(item.gift?.code) }})
                      </span>
                    </p>
                  </div>
                </div>

                <!-- 右側狀態 -->
                <div class="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <div class="flex items-center shrink-0">
                    <div class="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50 shadow-sm">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                      <span class="text-[10px] font-black uppercase tracking-wider">已持有</span>
                    </div>
                  </div>
                  
                  <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                    class="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-100">
                    <i v-if="removing === item.id" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-trash-alt w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- 卡片式 (其他年度 - 在庫項目) -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="item in groupedCollections.inventory" :key="item.id" class="animate-fade-in-up">
              <div class="glass-card border-emerald-100/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="flex justify-between items-start mb-4">
                  <span class="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {{ item.gift?.code }}
                  </span>
                  <button @click="handleRemove(item.id)" :disabled="removing === item.id"
                    class="text-slate-300 hover:text-rose-500 transition-colors">
                    <i v-if="removing === item.id" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-trash-alt w-5 h-5"></i>
                  </button>
                </div>
                <h3 class="text-lg font-black text-slate-900 mb-2">{{ item.gift?.name }}</h3>
                <p class="text-sm text-slate-600 font-medium mb-6 line-clamp-2">
                  {{ item.gift?.souvenir_item || '尚未公布' }}
                </p>
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">狀態</span>
                    <span class="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded shadow-sm">已持有</span>
                  </div>
                </div>
              </div>
            </div>
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
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref, watch } from 'vue'

const { confirm } = useDialog()
const { showToast } = useToast()
const { user } = useAuth()
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

// Helper to check if a souvenir string is a placeholder
const isPlaceholder = (val) => {
  if (!val) return true
  const s = String(val).trim()
  return s === '' || s === '尚未公布' || s.includes('再行公告') || s === '尚未公告'
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
    
    return !isVague
  })
})

const hasFilteredItems = computed(() => filteredCollections.value.length > 0)

const groupedCollections = computed(() => {
  // 領取計畫：狀態為 collected 且名稱明確（已在 filteredCollections 中過濾過）
  const planned = filteredCollections.value.filter(item => item.status === 'collected')
  // 在庫項目：狀態為 holding 且名稱明確
  const inventory = filteredCollections.value.filter(item => item.status === 'holding')
  return { planned, inventory }
})

const souvenirCounts = computed(() => {
  const groups = {} // { mainName: { isCard, subItems: { label: { count, companies: Map<name, inInventory> } } } }
  
  filteredCollections.value.forEach(item => {
    let name = item.gift?.souvenir_item || '尚未公布'
    const companyName = item.gift?.name || '未知公司'
    const inInventory = inventoryIds.value.has(item.souvenir_id)
    
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
    const { success, error } = await addToCollection(souvenirId)
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

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.delay-100 {
  animation-delay: 0.1s;
}
</style>
