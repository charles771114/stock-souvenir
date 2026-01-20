<template>
  <div class="min-h-screen bg-gray-50 relative overflow-hidden">
    <!-- Animated Background Mesh -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[100px] animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
    </div>

    <Navbar class="relative z-10" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <!-- Header -->
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight mb-2">
            主控台
          </h1>
          <p class="text-lg text-gray-600 font-light">
            Insights & Command Center
          </p>
        </div>
        <div class="text-sm text-gray-500 font-mono bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50">
          Administrator
        </div>
      </div>

      <!-- Stats Grid (Glass Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div v-for="(stat, index) in statsCards" :key="index" 
             class="group relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-100/20 rounded-2xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200/30">
          <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none"></div>
          
          <div class="relative flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 tracking-wide uppercase">{{ stat.label }}</p>
              <p class="text-4xl font-bold text-gray-900 mt-2 font-display">{{ stat.value }}</p>
            </div>
            <div :class="`p-3 rounded-xl ${stat.iconBg} ${stat.iconColor} shadow-inner`">
              <component :is="stat.icon" class="w-7 h-7" />
            </div>
          </div>
          
          <div v-if="stat.trend" class="relative mt-4 flex items-center text-sm">
            <span :class="stat.trend > 0 ? 'text-emerald-600' : 'text-red-600'" class="font-medium flex items-center">
              <svg v-if="stat.trend > 0" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {{ Math.abs(stat.trend) }}%
            </span>
            <span class="text-gray-400 ml-2 font-light">vs last month</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
        快速操作
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Classification Center -->
        <router-link to="/admin/classification" class="group bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 md:col-span-2">
          <div class="flex items-start justify-between mb-4">
             <div class="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
               <svg class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
             </div>
             <span class="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full" v-if="stats?.unclassified > 0">{{ stats.unclassified }} 待辦</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">分類中心 (Classification Center)</h3>
          <p class="text-sm text-gray-600">統一管理待審核項目與分類規則。支援批次處理與自動化分類。</p>
        </router-link>

        <!-- Import -->
        <router-link to="/admin/import" class="group bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
           <div class="flex items-start justify-between mb-4">
             <div class="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
               <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
             </div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">匯入資料</h3>
          <p class="text-sm text-gray-600">上傳 CSV/Excel 檔案，支援自動分類偵測。</p>
        </router-link>
        
        <!-- Scraper -->
        <router-link to="/admin/scraper" class="group bg-gradient-to-br from-teal-50 to-emerald-50/30 border border-teal-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
           <div class="flex items-start justify-between mb-4">
             <div class="p-3 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors">
               <svg class="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
             </div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">爬蟲管理</h3>
          <p class="text-sm text-gray-600">管理外部數據源連接與抓取狀態。</p>
        </router-link>

        <!-- User Management -->
        <router-link to="/admin/users" class="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-300">
           <div class="flex items-start justify-between mb-4">
             <div class="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
               <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
             </div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">用戶管理</h3>
          <p class="text-sm text-gray-600">查看用戶清單與管理員權限。</p>
        </router-link>
      </div>

      <!-- Recent Activity Feed -->
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
        最近活動
      </h2>
      <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="stats?.recent" class="divide-y divide-gray-100">
          <div v-for="gift in stats.recent" :key="gift.id" class="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {{ gift.company_code.substring(0,2) }}
              </div>
              <div>
                 <p class="text-sm font-semibold text-gray-900">{{ gift.company_name }}</p>
                 <p class="text-xs text-gray-500">{{ gift.gift_name }}</p>
              </div>
            </div>
            <div class="text-right">
               <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                 {{ gift.gift_year }}
               </span>
               <p class="text-xs text-gray-400 mt-1">{{ formatDate(gift.created_at) }}</p>
            </div>
          </div>
        </div>
        <div v-if="loading" class="p-8 text-center text-gray-500">
          Loading Data...
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw, h } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { useScraper } from '@/composables/useScraper'
import Navbar from '@/components/Navbar.vue'

const { users, stats, loading, fetchAllUsers, fetchGiftStats } = useAdmin()
const { sources, fetchScraperSources } = useScraper()

const adminCount = computed(() => users.value.filter(u => u.is_admin).length)

// Helper to create simple SVG Icon vnodes
const createIcon = (d) => {
  return markRaw({
    render: () => h('svg', { 
      class: 'w-6 h-6', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor' 
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'stroke-width': '2', 
        d: d 
      })
    ])
  })
}

const statsCards = computed(() => [
  { 
    label: '總紀念品', 
    value: stats.value.total, 
    trend: 12, 
    iconBg: 'bg-indigo-50', 
    iconColor: 'text-indigo-600',
    icon: createIcon('M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7')
  },
  { 
    label: '活躍用戶', 
    value: users.value.length, 
    trend: 5, 
    iconBg: 'bg-green-50', 
    iconColor: 'text-green-600',
    icon: createIcon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z')
  },
  { 
    label: '管理員', 
    value: adminCount.value, 
    trend: 0, 
    iconBg: 'bg-purple-50', 
    iconColor: 'text-purple-600',
    icon: createIcon('M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z')
  },
  { 
    label: '數據來源', 
    value: sources.value.length, 
    trend: 0, 
    iconBg: 'bg-blue-50', 
    iconColor: 'text-blue-600',
    icon: createIcon('M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15')
  }
])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }).format(
    Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)), 
    'day'
  )
}

onMounted(async () => {
  await Promise.all([
    fetchAllUsers(),
    fetchGiftStats(),
    fetchScraperSources(),
  ])
})
</script>

<style scoped>
.font-display {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
