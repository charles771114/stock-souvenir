<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/admin/panel"
              class="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest leading-none">
              <div
                class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 shadow-sm transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              管理主頁
            </router-link>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter mb-2">
            已入袋持股總覽
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            全域持股統計、使用者資產分布與領取記錄
          </p>
        </div>

        <button @click="exportCSV"
          class="h-12 px-8 bg-white border border-slate-100 text-indigo-600 rounded-2xl shadow-sm hover:bg-indigo-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          匯出 CSV
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 animate-fade-in-up delay-100">
        <div class="glass-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg class="w-16 h-16 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">總持股筆數</span>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ stats.totalCollections }}</span>
            <span class="text-[10px] font-black text-emerald-500 mb-1.5 uppercase tracking-widest">+ Live</span>
          </div>
        </div>

        <div
          class="glass-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative border-amber-100/20">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg class="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">持股使用者數</span>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ stats.activeUsers }}</span>
            <span class="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">位使用者</span>
          </div>
        </div>

        <div
          class="glass-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative border-purple-100/20">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg class="w-16 h-16 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">人均持股數</span>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ avgCollections }}</span>
            <span class="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">個項目</span>
          </div>
        </div>
      </div>

      <!-- Combined Filter & Table View -->
      <div class="animate-fade-in-up delay-200">
        <!-- Controls -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="relative">
            <span
              class="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-widest pointer-events-none">使用者:</span>
            <select v-model="selectedUser"
              class="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none cursor-pointer">
              <option value="">所有使用者</option>
              <option v-for="user in users" :key="user.id" :value="user.email">
                {{ user.full_name || user.email }}
              </option>
            </select>
          </div>

          <div class="relative">
            <span
              class="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-widest pointer-events-none">年度:</span>
            <select v-model="selectedYear"
              class="w-full h-14 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none cursor-pointer">
              <option value="">所有年度</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        <!-- Content Area -->
        <div class="glass-card overflow-hidden p-0">
          <div v-if="loading" class="py-24 flex flex-col items-center gap-6">
            <div class="w-16 h-16 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-sm font-black text-indigo-300 uppercase tracking-[0.2em] animate-pulse">正在篩選數據...</p>
          </div>

          <div v-else-if="favorites.length === 0" class="py-24 text-center">
            <div
              class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-200">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-sm font-black text-slate-300 uppercase tracking-widest">暫無收藏資料</p>
          </div>

          <div v-else>
            <!-- Desktop Table -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="w-full border-separate border-spacing-0">
                <thead>
                  <tr class="bg-slate-50/50">
                    <th
                      class="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      用戶資訊</th>
                    <th
                      class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      帳戶</th>
                    <th
                      class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      公司/代號</th>
                    <th
                      class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      相關紀念品</th>
                    <th
                      class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      開會日期</th>
                    <th
                      class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      收藏時間</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="fav in favorites" :key="fav.collection_id"
                    class="group hover:bg-slate-50/50 transition-colors">
                    <td class="px-8 py-5 min-w-[200px]">
                      <div class="font-black text-slate-800 text-sm leading-none mb-1">{{ fav.full_name || 'Anonymous'
                      }}</div>
                      <div class="text-[10px] font-bold text-indigo-400 truncate">{{ fav.email }}</div>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap">
                      <span
                        :class="['px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all',
                          fav.is_default_portfolio ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60']">
                        {{ fav.portfolio_name }}
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-2">
                        <div
                          class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                          {{ fav.stock_code }}</div>
                        <div class="text-xs font-black text-slate-700">{{ fav.company_name }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <div class="text-xs font-black text-slate-800 tracking-tight">{{ fav.souvenir_item }}</div>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap">
                      <span class="text-[10px] font-bold text-slate-500 font-mono">{{ formatDate(fav.meeting_date)
                      }}</span>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap">
                      <span class="text-[10px] font-bold text-indigo-400 italic">收藏於: {{ formatDate(fav.collected_at)
                      }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile/Tablet Cards -->
            <div class="lg:hidden p-6 sm:p-8 space-y-4">
              <div v-for="fav in favorites" :key="fav.collection_id"
                class="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100">
                      {{ fav.email.charAt(0).toUpperCase() }}</div>
                    <div class="min-w-0">
                      <div class="text-sm font-black text-slate-800 truncate leading-none mb-1">{{ fav.full_name ||
                        '匿名用戶' }}</div>
                      <div class="text-[10px] font-bold text-indigo-400 truncate">{{ fav.email }}</div>
                    </div>
                  </div>
                  <span
                    :class="['px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest', fav.is_default_portfolio ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100']">
                    {{ fav.portfolio_name }}
                  </span>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 mb-4 border border-slate-100">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-0.5 rounded-md bg-slate-900 text-white font-black text-[9px]">{{ fav.stock_code
                    }}</span>
                    <span class="text-sm font-black text-slate-800">{{ fav.company_name }}</span>
                  </div>
                  <p class="text-[11px] font-bold text-slate-500">{{ fav.souvenir_item }}</p>
                </div>

                <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <div class="text-slate-300">開會: <span class="text-slate-600 font-mono">{{ formatDate(fav.meeting_date)
                  }}</span></div>
                  <div class="text-indigo-300">收藏: <span class="text-indigo-400 italic">{{ formatDate(fav.collected_at)
                  }}</span></div>
                </div>
              </div>
            </div>

            <!-- Enhanced Summary Footer -->
            <div
              class="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 p-8 sm:p-10 border-t border-slate-100">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h2 class="text-xl font-black text-slate-800 tracking-tight uppercase">目前數據摘要</h2>
                  </div>

                  <div class="flex flex-wrap gap-6 sm:gap-12">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                        </svg>
                      </div>
                      <div>
                        <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact
                          Users</span>
                        <span class="text-2xl font-black text-slate-800 tracking-tighter">{{ uniqueUsersInResults
                        }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-purple-600 shadow-sm">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span
                          class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Different
                          Companies</span>
                        <span class="text-2xl font-black text-slate-800 tracking-tighter">{{ uniqueCompaniesInResults
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Souvenir Item Breakdown Chips -->
                <div v-if="souvenirSummary.length > 0" class="lg:max-w-md w-full">
                  <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Demand
                    Analysis</span>
                  <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-3 custom-scrollbar">
                    <div v-for="item in souvenirSummary" :key="item.name"
                      class="flex items-center gap-2 pl-3 pr-1 py-1 bg-white rounded-xl border border-white group/chip hover:border-indigo-200 transition-all shadow-sm">
                      <span class="text-[10px] font-black text-slate-600 truncate">{{ item.name }}</span>
                      <span
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black group-hover/chip:bg-indigo-600 group-hover/chip:text-white transition-all">
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
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref, watch } from 'vue'

const { showToast } = useToast()

const favorites = ref([])
const users = ref([])
const loading = ref(false)
const selectedUser = ref('')
const selectedYear = ref(new Date().getFullYear().toString())

const stats = computed(() => {
  const totalCollections = favorites.value.length
  const uniqueUsers = new Set(favorites.value.map(f => f.user_id)).size
  return {
    totalCollections,
    activeUsers: uniqueUsers,
  }
})

const avgCollections = computed(() => {
  return stats.value.activeUsers > 0
    ? (stats.value.totalCollections / stats.value.activeUsers).toFixed(1)
    : '0.0'
})

const uniqueUsersInResults = computed(() => new Set(favorites.value.map(f => f.user_id)).size)
const uniqueCompaniesInResults = computed(() => new Set(favorites.value.map(f => f.stock_code)).size)

const souvenirSummary = computed(() => {
  const summary = {}
  favorites.value.forEach(f => {
    const item = f.souvenir_item || '未指定'
    summary[item] = (summary[item] || 0) + 1
  })
  return Object.entries(summary)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
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
        souvenirs!inner(code, name, souvenir_item, meeting_date, last_buy_date)
      `)
      .eq('status', 'holding')  // 🆕 只查詢已入袋
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

    favorites.value = results
  } catch (e) {
    console.error(e)
    showToast('載入資料失敗', 'error')
  } finally {
    loading.value = false
  }
}

// 🆕 去重邏輯
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

// 🆕 計算距離最後買進日的剩餘天數
const getDaysRemaining = (dateString) => {
  if (!dateString) return null
  const target = new Date(dateString).setHours(23, 59, 59, 999)
  const now = new Date().getTime()
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 🆕 取得緊急程度
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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW')
}

const exportCSV = () => {
  const headers = ['用戶', 'Email', '帳戶', '代號', '公司名稱', '紀念品', '開會日期', '收藏時間']
  const rows = favorites.value.map(f => [
    f.full_name || '匿名用戶',
    f.email,
    f.portfolio_name,
    f.stock_code,
    f.company_name,
    f.souvenir_item,
    formatDate(f.meeting_date),
    formatDate(f.collected_at)
  ])

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `user_favorites_report_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  showToast('分析報表已匯出', 'success')
}

watch([selectedUser, selectedYear], fetchFavorites)

onMounted(async () => {
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
  background-color: rgba(99, 102, 241, 0.1);
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
