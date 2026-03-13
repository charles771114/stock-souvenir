<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/admin/panel"
              class="group flex items-center gap-2 text-slate-400 hover:text-brand-primary transition-all font-black text-[10px] uppercase tracking-[0.2em] leading-none">
              <div
                class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-100 shadow-sm transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              管理主頁
            </router-link>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            已入袋持股統計
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            依使用者歸戶 -> 物品清單 -> 公司明細 (可展開)
          </p>
        </div>

        <button @click="exportCSV"
          class="h-12 px-8 bg-white border border-slate-100 text-brand-primary rounded-2xl shadow-sm hover:bg-amber-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          匯出 CSV
        </button>
      </div>

      <!-- Combined Filter & Table View -->
      <div class="animate-fade-in-up delay-200">
        <!-- Controls -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="relative">
            <span
              class="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-primary uppercase tracking-widest pointer-events-none">使用者:</span>
            <select v-model="selectedUser"
              class="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none appearance-none cursor-pointer">
              <option value="">所有使用者</option>
              <option v-for="user in users" :key="user.id" :value="user.email">
                {{ user.full_name || user.email }}
              </option>
            </select>
          </div>

          <div class="relative">
            <span
              class="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-primary uppercase tracking-widest pointer-events-none">年度:</span>
            <select v-model="selectedYear"
              class="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none appearance-none cursor-pointer">
              <option value="">所有年度</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        <!-- Content Area -->
        <div class="">
          <div v-if="loading" class="py-24 flex flex-col items-center gap-6 glass-card">
            <div class="w-16 h-16 border-8 border-amber-50 border-t-brand-primary rounded-full animate-spin"></div>
            <p class="text-sm font-black text-amber-400 uppercase tracking-[0.2em] animate-pulse">正在篩選數據...</p>
          </div>

          <div v-else-if="aggregatedData.length === 0" class="py-24 text-center glass-card">
            <div
              class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-200">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-sm font-black text-slate-300 uppercase tracking-widest">暫無收藏資料</p>
          </div>

          <div v-else class="space-y-6">
            <!-- User Card Loop -->
             <div v-for="userGroup in aggregatedData" :key="userGroup.user_id" 
                  class="glass-card overflow-hidden transition-all hover:shadow-lg hover:border-amber-200">
                <!-- User Header -->
                <div class="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black uppercase shadow-sm">
                            {{ (userGroup.full_name || userGroup.email || '?').charAt(0) }}
                        </div>
                        <div>
                            <div class="text-base font-black text-slate-800 leading-tight mb-1">
                                {{ userGroup.full_name || '匿名用戶' }}
                            </div>
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {{ userGroup.email }}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                         <div class="text-right">
                             <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">總兌換次數</span>
                             <span class="text-lg font-black text-brand-primary">{{ userGroup.totalCount }}</span>
                         </div>
                    </div>
                </div>

                <!-- Categories List -->
                <div class="divide-y divide-slate-50">
                    <div v-for="catGroup in userGroup.categories" :key="catGroup.category_id" class="group">
                        <!-- Category Summary Row -->
                         <div class="px-6 sm:px-8 py-4 flex items-center justify-between hover:bg-amber-50 transition-colors cursor-pointer"
                              @click="toggleCategory(userGroup.user_id, catGroup.category_id)">
                            <div class="flex items-center gap-4">
                                <div class="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-brand-primary group-hover:border-amber-200 transition-all">
                                    <svg class="w-4 h-4 transition-transform duration-300" 
                                         :class="{ 'rotate-180': isCategoryExpanded(userGroup.user_id, catGroup.category_id) }"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <div :class="['w-2 h-2 rounded-full shadow-sm', getColorClass(catGroup.category_color)]"></div>
                                <span class="text-sm font-black text-slate-700 group-hover:text-brand-primary transition-colors">
                                    {{ catGroup.category_name }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-black group-hover:bg-amber-100 group-hover:text-brand-primary transition-colors">
                                    {{ catGroup.totalItems }} 種類
                                </span>
                            </div>
                         </div>

                        <!-- Expandable Details (Grouped Items under Category) -->
                         <div v-if="isCategoryExpanded(userGroup.user_id, catGroup.category_id)" class="bg-slate-50 border-y border-slate-100/50 px-6 sm:px-8 py-4 animate-fade-in shadow-inner">
                             <div class="space-y-3">
                                 <!-- Grouped Item Row -->
                                 <div v-for="itemGroup in catGroup.items" :key="itemGroup.souvenir_item" class="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:border-amber-200 transition-all">
                                     <div class="p-3 sm:px-4 sm:py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                          @click="toggleItem(userGroup.user_id, catGroup.category_id, itemGroup.souvenir_item)">
                                         <div class="flex items-center gap-3">
                                             <div class="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-all">
                                                 <svg class="w-3 h-3 transition-transform duration-300" 
                                                      :class="{ 'rotate-180': isItemExpanded(userGroup.user_id, catGroup.category_id, itemGroup.souvenir_item) }"
                                                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                 </svg>
                                             </div>
                                             <span class="text-sm font-black text-slate-800">{{ itemGroup.souvenir_item }}</span>
                                         </div>
                                         <span class="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded text-[10px] font-black tracking-widest uppercase">
                                             {{ itemGroup.companies.length }} 筆明細
                                         </span>
                                     </div>

                                     <!-- Leaf Details (Companies for this Item) -->
                                     <div v-if="isItemExpanded(userGroup.user_id, catGroup.category_id, itemGroup.souvenir_item)" class="bg-slate-50/50 border-t border-slate-50 px-4 py-3">
                                         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                             <div v-for="comp in itemGroup.companies" :key="comp.id" class="bg-white border border-slate-100 rounded-lg p-2 flex items-center justify-between shadow-sm">
                                                 <div class="flex items-center gap-2 min-w-0">
                                                     <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px] font-black tracking-tight shrink-0">
                                                         {{ comp.stock_code }}
                                                     </span>
                                                     <div class="flex flex-col min-w-0">
                                                         <span class="text-xs font-bold text-slate-700 truncate">{{ comp.company_name }}</span>
                                                         <span class="text-[10px] text-slate-500 truncate" :title="comp.original_item_name">{{ comp.original_item_name }}</span>
                                                     </div>
                                                 </div>
                                                 <span class="text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-100 text-slate-400 uppercase tracking-tighter shrink-0 ml-2">
                                                     {{ comp.portfolio_name }}
                                                 </span>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref, watch } from 'vue'

const { showToast } = useToast()

const rawFavorites = ref([])
const users = ref([])
const loading = ref(false)
const selectedUser = ref('')
const selectedYear = ref(new Date().getFullYear().toString())

const categories = ref(new Map())

// Color Map (from ClassificationCenterView)
const colorMap = {
  gray: 'bg-slate-200',
  red: 'bg-rose-500',
  yellow: 'bg-brand-secondary',
  green: 'bg-emerald-500',
  blue: 'bg-brand-primary',
  indigo: 'bg-indigo-600',
  purple: 'bg-violet-600',
  pink: 'bg-pink-600',
}

const getColorClass = (colorName) => {
  return colorMap[colorName] || colorMap['gray']
}

// 展開狀態管理
const expandedCategories = ref(new Set()) // "userId_categoryId"
const expandedGroupedItems = ref(new Set()) // "userId_categoryId_itemName"

const isCategoryExpanded = (userId, categoryId) => {
    return expandedCategories.value.has(`${userId}_${categoryId}`)
}

const toggleCategory = (userId, categoryId) => {
    const key = `${userId}_${categoryId}`
    if (expandedCategories.value.has(key)) {
        expandedCategories.value.delete(key)
    } else {
        expandedCategories.value.add(key)
    }
}

const isItemExpanded = (userId, categoryId, itemName) => {
    return expandedGroupedItems.value.has(`${userId}_${categoryId}_${itemName}`)
}

const toggleItem = (userId, categoryId, itemName) => {
    const key = `${userId}_${categoryId}_${itemName}`
    if (expandedGroupedItems.value.has(key)) {
        expandedGroupedItems.value.delete(key)
    } else {
        expandedGroupedItems.value.add(key)
    }
}

// 輔助函數：將品名正規化，以便合併相似的紀念品
// 例如「全家便利商店禮物卡50元」和「全家便利商店50元禮券」都會變成「全家 50元商品卡」
// 統一超商 和 7-11 視為相同
const normalizeItemName = (originalName) => {
    if (!originalName) return '未知物品'
    
    let n = originalName.toUpperCase()
    
    // 擷取金額 (容許 "50元" 或 單純 "50"，但避開股票代號，通常代號在另一欄，這裡只有紀念品名稱)
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
    
    // 判斷是否為商品卡/禮物卡/禮券
    const isCard = n.includes('卡') || n.includes('券') || n.includes('禮物')

    if (is711) return amount ? `7-11 ${amount}元商品卡/券` : '7-11 商品卡/券'
    if (isFamilyMart) return amount ? `全家 ${amount}元商品卡/券` : '全家 商品卡/券'
    if (isHiLife) return amount ? `萊爾富 ${amount}元商品卡/券` : '萊爾富 商品卡/券'
    if (isOK) return amount ? `OK超商 ${amount}元商品卡/券` : 'OK超商 商品卡/券'
    if (isGeneralStore && isCard) return amount ? `超商 ${amount}元商品卡/券` : '超商 商品卡/券'
    
    return originalName
}

// 🆕 聚合: User -> Category (Tag) -> ItemGroup (by souvenir_item) -> Companies
const aggregatedData = computed(() => {
    const userMap = new Map()

    const unclassifiedId = -1
    const unclassifiedCat = { name: '未分類項目', color: 'gray' }

    rawFavorites.value.forEach(fav => {
        // 1. User Group
        if (!userMap.has(fav.user_id)) {
            userMap.set(fav.user_id, {
                user_id: fav.user_id,
                email: fav.email,
                full_name: fav.full_name,
                categoriesMap: new Map(),
                totalCount: 0
            })
        }
        
        const userGroup = userMap.get(fav.user_id)
        
        // 2. Category Group (inside User)
        const catId = fav.category_id || unclassifiedId
        if (!userGroup.categoriesMap.has(catId)) {
            const catInfo = categories.value.get(catId) || unclassifiedCat
            userGroup.categoriesMap.set(catId, {
                category_id: catId,
                category_name: catInfo.name || '其他/未知分類',
                category_color: catInfo.color || 'gray',
                itemsMap: new Map(), // Changed from items array to itemsMap
                totalItems: 0,
                count: 0
            })
        }

        const catGroup = userGroup.categoriesMap.get(catId)
        
        // 3. Item Group (inside Category, grouping by souvenir_item to combine identical ones)
        const rawItemName = fav.souvenir_item || '未知物品'
        const itemName = normalizeItemName(rawItemName)
        
        if (!catGroup.itemsMap.has(itemName)) {
            catGroup.itemsMap.set(itemName, {
                souvenir_item: itemName,
                companies: []
            })
            catGroup.totalItems++
        }
        
        const itemGroup = catGroup.itemsMap.get(itemName)

        // 4. Add company detail (保留原始品名供參考，如果在明細裡想看的話可以擴充，但目前統一存入)
        itemGroup.companies.push({
            ...fav,
            original_item_name: rawItemName // store the original name in case we want to show it in UI
        })
        catGroup.count++
        userGroup.totalCount++
    })

    // 轉換 Map 為 Array
    return Array.from(userMap.values())
        .map(user => ({
            ...user,
            categories: Array.from(user.categoriesMap.values()).map(cat => ({
                ...cat,
                items: Array.from(cat.itemsMap.values()).sort((a, b) => {
                    const nameCompare = a.souvenir_item.localeCompare(b.souvenir_item, 'zh-TW')
                    if (nameCompare !== 0) return nameCompare
                    return b.companies.length - a.companies.length
                })
            })).sort((a, b) => b.count - a.count)
        }))
        .sort((a, b) => b.totalCount - a.totalCount)
})

const fetchUsers = async () => {
  const { data } = await supabase.from('profiles').select('id, email, full_name').order('email')
  if (data) users.value = data
}

const fetchFavorites = async () => {
  loading.value = true
  try {
    // 1. 查詢 user_collections (只查詢 status = 'holding')
    let collQuery = supabase
      .from('user_collections')
      .select(`
        id, user_id, portfolio_id, souvenir_id, created_at,
        profiles!inner(email, full_name),
        portfolios(name, is_default),
        souvenirs!inner(code, name, souvenir_item, category_id, meeting_date, last_buy_date)
      `)
      .eq('status', 'holding')  // 只查詢已入袋
      .order('created_at', { ascending: false })

    if (selectedUser.value) collQuery = collQuery.eq('profiles.email', selectedUser.value)

    // 2. 查詢 user_inventory
    let invQuery = supabase
      .from('user_inventory')
      .select('*')

    const [collRes, invRes] = await Promise.all([collQuery, invQuery])

    if (collRes.error) throw collRes.error
    if (invRes.error) throw invRes.error

    // 3. 處理 user_collections 資料
    const collectionHoldings = collRes.data?.map(item => ({
      id: item.id,
      user_id: item.user_id,
      email: item.profiles.email,
      full_name: item.profiles.full_name,
      portfolio_id: item.portfolio_id,
      portfolio_name: item.portfolios?.name || '未知',
      is_default_portfolio: item.portfolios?.is_default || false,
      stock_code: item.souvenirs.code,
      company_name: item.souvenirs.name,
      souvenir_item: item.souvenirs.souvenir_item,
      category_id: item.souvenirs.category_id,
      meeting_date: item.souvenirs.meeting_date,
      last_buy_date: item.souvenirs.last_buy_date,
      collected_at: item.created_at,
      _source: 'collection'
    })) || []

    // 4. 處理 user_inventory 資料
    const stockCodes = invRes.data?.map(inv => inv.stock_code).filter(Boolean) || []

    let inventoryHoldings = []
    if (stockCodes.length > 0) {
      // 查詢對應的紀念品
      const { data: souvenirData } = await supabase
        .from('souvenirs')
        .select('*')
        .in('code', stockCodes)

      // 建立映射
      const souvenirMap = new Map()
      souvenirData?.forEach(s => {
        if (s.souvenir_item && s.souvenir_item !== '尚未公布' && s.souvenir_item !== '') {
          souvenirMap.set(String(s.code).trim(), s)
        }
      })

      // 查詢使用者資訊
      const userIds = [...new Set(invRes.data.map(inv => inv.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

      const profileMap = new Map(profilesData?.map(p => [p.id, p]) || [])

      // 查詢帳戶資訊
      const portfolioIds = [...new Set(invRes.data.map(inv => inv.portfolio_id).filter(Boolean))]
      const { data: portfoliosData } = await supabase
        .from('portfolios')
        .select('id, name, is_default')
        .in('id', portfolioIds)

      const portfolioMap = new Map(portfoliosData?.map(p => [p.id, p]) || [])

      // 合併資料
      inventoryHoldings = invRes.data
        .map(inv => {
          const souvenir = souvenirMap.get(String(inv.stock_code).trim())
          if (!souvenir) return null

          const profile = profileMap.get(inv.user_id)
          if (!profile) return null

          // 如果有選擇特定使用者，過濾
          if (selectedUser.value && profile.email !== selectedUser.value) return null

          const portfolio = portfolioMap.get(inv.portfolio_id)

          return {
            id: `inv_${inv.id}`,
            user_id: inv.user_id,
            email: profile.email,
            full_name: profile.full_name,
            portfolio_id: inv.portfolio_id,
            portfolio_name: portfolio?.name || '未知',
            is_default_portfolio: portfolio?.is_default || false,
            stock_code: souvenir.code,
            company_name: souvenir.name,
            souvenir_item: souvenir.souvenir_item,
            category_id: souvenir.category_id,
            meeting_date: souvenir.meeting_date,
            last_buy_date: souvenir.last_buy_date,
            collected_at: inv.created_at,
            _source: 'inventory'
          }
        })
        .filter(Boolean)
    }

    // 5. 合併並去重
    const combined = [...collectionHoldings, ...inventoryHoldings]
    const deduped = deduplicateHoldings(combined)

    // 6. 年份過濾
    let results = deduped
    if (selectedYear.value) {
      results = results.filter(f => {
        const year = new Date(f.meeting_date).getFullYear().toString()
        return year === selectedYear.value
      })
    }

    rawFavorites.value = results
  } catch (e) {
    console.error(e)
    showToast('載入資料失敗', 'error')
  } finally {
    loading.value = false
  }
}

// 去重邏輯
const deduplicateHoldings = (holdings) => {
  const map = new Map()

  holdings.forEach(item => {
    const key = `${item.user_id}_${item.stock_code}_${item.portfolio_id}`
    const existing = map.get(key)

    // 優先保留 collection 來源
    if (!existing || (existing._source === 'inventory' && item._source === 'collection')) {
      map.set(key, item)
    }
  })

  return Array.from(map.values())
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW')
}

const exportCSV = () => {
    // Export Data by User > Category > Item > Company
    const headers = ['用戶', 'Email', '標籤分類', '紀念品', '股票代號', '公司名稱', '帳戶']
    
    const rows = []
    aggregatedData.value.forEach(userGroup => {
        userGroup.categories.forEach(catGroup => {
            catGroup.items.forEach(itemGroup => {
                itemGroup.companies.forEach(comp => {
                    rows.push([
                        userGroup.full_name || '匿名用戶',
                        userGroup.email,
                        catGroup.category_name,
                        itemGroup.souvenir_item,
                        comp.stock_code,
                        comp.company_name,
                        comp.portfolio_name
                    ])
                })
            })
        })
    })

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `user_souvenir_details_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  showToast('分析報表已匯出', 'success')
}


const fetchCategories = async () => {
    const { data } = await supabase.from('souvenir_categories').select('id, name, color')
    if (data) {
        categories.value = new Map(data.map(c => [c.id, c]))
    }
}

watch([selectedUser, selectedYear], fetchFavorites)

onMounted(async () => {
  await fetchCategories()
  await fetchUsers()
  await fetchFavorites()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.25rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--brand-primary);
  opacity: 0.1;
  border-radius: 20px;
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

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  60% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
