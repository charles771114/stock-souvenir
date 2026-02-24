<template>
  <div class="min-h-screen bg-[#fafafa] pb-20">
    <!-- Header -->
    <div class="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <!-- Back Button (Left) -->
        <button @click="goBack" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <i class="ri-arrow-left-s-line text-2xl"></i>
        </button>

        <!-- Title (Center) -->
        <div class="flex items-center gap-2 justify-center flex-1">
          <div class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <i class="ri-calendar-event-line text-lg"></i>
          </div>
          <h1 class="text-lg font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
            今日股東會重點
          </h1>
        </div>

        <!-- Right Action (Placeholder for balance) -->
        <div class="w-10"></div>
      </div>
      <!-- Sub-header Meta -->
      <div class="max-w-3xl mx-auto px-4 py-2 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
        <p class="text-xs text-gray-500 font-medium">更新時間：{{ formattedDate }}</p>
        <button @click="goToCatalog" class="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors">
          查看完整庫存 <i class="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 py-6 space-y-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-500 font-medium text-sm">正在為您整理最新資料...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-3xl p-6 text-center">
        <i class="ri-error-warning-line text-4xl text-red-400 mb-2"></i>
        <h3 class="text-red-800 font-bold mb-1">發生錯誤</h3>
        <p class="text-sm text-red-600">{{ error }}</p>
        <button @click="loadData" class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors">
          重新整理
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasAnyGroups" class="bg-white border border-gray-100 shadow-sm rounded-3xl p-10 text-center">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
          <i class="ri-check-double-line text-3xl text-gray-300"></i>
        </div>
        <h3 class="text-gray-900 font-bold text-lg mb-2">今日尚無特別關注事項</h3>
        <p class="text-sm text-gray-500 mb-6">太棒了！目前沒有即將截止的股東會，也沒有最新的紀念品情報。</p>
        <button @click="goToCatalog" class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-md hover:bg-indigo-700 transition-colors">
          前往紀念品目錄探索
        </button>
      </div>

      <!-- Data Groups -->
      <template v-else>
        
        <!-- ⏰ Section 1: 截止期限提醒 (Deadline Timeline) -->
        <div v-if="Object.keys(deadlineGroups).length > 0" class="space-y-6">
          <div v-for="(group, days) in deadlineGroups" :key="days" class="animate-fade-in-up">
            <h2 class="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4" 
                :class="getDaysRemainingClass(parseInt(days)).replace('bg-', 'text-').split(' ')[0]">
               <i :class="parseInt(days) === 0 ? 'ri-alarm-warning-fill' : 'ri-calendar-todo-line'" class="text-lg"></i>
               {{ getLabelForGroup(parseInt(days)) }}
            </h2>
            
            <div class="grid gap-3">
              <div v-for="item in group" :key="item.id" 
                   class="bg-white rounded-2xl p-4 border border-gray-100 shadow-md relative overflow-hidden cursor-pointer hover:border-indigo-200 transition-colors"
                   @click="viewDetails(item.id)">
                 <!-- Status Bar -->
                 <div class="absolute left-0 top-0 bottom-0 w-1" :class="getDaysRemainingClass(parseInt(days)).split(' ')[1]"></div>
                
                <div class="flex justify-between items-start mb-2 pl-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-gray-50 text-gray-600 font-black text-[10px] rounded border border-gray-200">
                      {{ item.code }}
                    </span>
                    <h3 class="font-bold text-gray-900 leading-tight">
                      {{ item.name }}
                      <span v-if="item.category_name === '超商商品卡'" class="ml-1 text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm">商品卡</span>
                    </h3>
                  </div>
                </div>
                
                 <div class="mt-2 pl-2 flex items-center justify-between">
                  <div class="flex items-start gap-2">
                    <i class="ri-gift-line text-gray-400 mt-0.5"></i>
                    <div>
                      <div class="font-bold text-gray-800 text-sm">
                        {{ item.souvenir_item || '尚未公布' }}
                      </div>
                       <div class="text-[10px] text-gray-400 mt-0.5" v-if="item.previousYearSouvenir">
                          去年: {{ item.previousYearSouvenir }}
                       </div>
                    </div>
                  </div>
                  <div class="text-gray-300">
                    <i class="ri-arrow-right-s-line text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 my-8"></div>

        <!-- 🌟 Section 2: 最近資料更新 (Recently Updated) -->
        <div v-if="recentlyUpdatedItems.length > 0" class="animate-fade-in-up">
          <h2 class="flex items-center gap-2 text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">
            <i class="ri-sparkling-fill text-lg"></i> 📢 資料更新提醒
          </h2>
          <div class="grid gap-3 mb-8">
            <div v-for="item in recentlyUpdatedItems" :key="item.id" 
                 class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors"
                 @click="viewDetails(item.id)">
              <div class="absolute right-0 top-0 w-24 h-24 bg-indigo-200 opacity-20 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
              
              <div class="flex justify-between items-start mb-2 relative z-10">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-white text-indigo-600 font-black text-[10px] rounded-md shadow-sm border border-indigo-100">
                    {{ item.code }}
                  </span>
                  <h3 class="font-bold text-gray-900 leading-tight">
                    {{ item.name }}
                  </h3>
                </div>
                <div class="text-right">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    最後買進日 {{ formatDate(item.last_buy_date) }}
                  </div>
                </div>
              </div>
              
              <div class="mt-3 bg-white/80 rounded-xl p-3 border border-indigo-100/50 relative z-10 flex">
                <div class="flex-1">
                  <div class="flex items-start gap-2">
                    <i class="ri-history-line text-indigo-500 mt-0.5"></i>
                    <div>
                      <div class="font-bold text-gray-800 text-sm">
                        {{ item.souvenir_item || '尚未公布' }}
                      </div>
                      <div class="text-[10px] text-gray-400 mt-0.5" v-if="item.previousYearSouvenir">
                        去年: {{ item.previousYearSouvenir }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-center pl-2 text-gray-300">
                  <i class="ri-arrow-right-s-line text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Bottom padding for FAB -->
      <div class="h-10"></div>
    </main>
  </div>
</template>

<script setup>
import { useGifts } from '@/composables/useGifts'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-tw'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

dayjs.extend(isToday)
dayjs.extend(relativeTime)
dayjs.locale('zh-tw')

const router = useRouter()
const { gifts, loading, error, fetchAllGifts, fetchPreviousYearSouvenirs, enrichWithPreviousYear } = useGifts()

const formattedDate = computed(() => {
  return dayjs().format('YYYY-MM-DD HH:mm')
})

const goBack = () => {
    // If we have history, go back, else go to catalog
    if (window.history.length > 2) {
        router.back()
    } else {
        router.push('/gifts')
    }
}

const goToCatalog = () => {
    router.push('/gifts')
}

const viewDetails = (id) => {
    router.push({ path: '/gifts', query: { item: id } })
}

// Processing Data
const processedGifts = computed(() => {
  if (!gifts.value) return []
  const today = dayjs().startOf('day')
  
  return gifts.value.map(g => {
    let daysRemaining = null
    if (g.last_buy_date) {
      const target = dayjs(g.last_buy_date).startOf('day')
      daysRemaining = target.diff(today, 'day')
    }
    
    return {
      ...g,
      days_remaining: daysRemaining
    }
  })
})

const deadlineGroups = computed(() => {
  const groups = {}
  
  processedGifts.value.forEach(g => {
    // Strictly follow the 7-day notification business rule
    // Range: 0 (Today) to 7 days
    if (g.days_remaining !== null && g.days_remaining >= 0 && g.days_remaining <= 7) {
      if (!groups[g.days_remaining]) groups[g.days_remaining] = []
      groups[g.days_remaining].push(g)
    }
  })
  
  // Return sorted keys (numeric)
  const sorted = {}
  Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
    sorted[key] = groups[key]
  })
  return sorted
})

// Groups
const recentlyUpdatedItems = computed(() => {
  // Define "recently updated" as within the last 48 hours
  const twoDaysAgo = dayjs().subtract(2, 'day')
  
  return processedGifts.value
    .filter(g => {
      // Only show recently updated items that have NOT expired yet
      if (g.days_remaining === null || g.days_remaining < 0) return false
      // Must have a known souvenir
      if (!g.souvenir_item || g.souvenir_item === '尚未公布' || g.souvenir_item === '尚未公告') return false
      
      if (!g.updated_at) return false
      const updatedDate = dayjs(g.updated_at)
      return updatedDate.isAfter(twoDaysAgo)
    })
    .sort((a, b) => dayjs(b.updated_at).valueOf() - dayjs(a.updated_at).valueOf())
    .slice(0, 20)
})

const hasAnyGroups = computed(() => {
  return recentlyUpdatedItems.value.length > 0 || Object.keys(deadlineGroups.value).length > 0
})

// Helpers
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dayjs(dateString).format('YYYY-MM-DD')
}

const getLabelForGroup = (days) => {
  if (days === 0) return '【 🔥 今天截止 🔥 】'
  if (days === 1) return '【 📅 明天截止 】'
  return `【 📅 ${days} 天後截止 】`
}

const getDaysRemainingClass = (days) => {
  if (days === 0) return 'text-red-600 bg-red-500' // Using space-split for bar color
  if (days < 0) return 'text-gray-400 bg-gray-300'
  if (days === 1) return 'text-orange-600 bg-orange-400'
  return 'text-indigo-600 bg-indigo-400'
}

onMounted(async () => {
  if (gifts.value.length === 0) {
    await fetchAllGifts()
  }
  
  if (gifts.value.length > 0) {
    const currentYear = dayjs().year()
    const previousYearMap = await fetchPreviousYearSouvenirs(currentYear)
    gifts.value = enrichWithPreviousYear(gifts.value, previousYearMap)
  }
})
</script>

<style scoped>
/* Simplified animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
}
</style>
