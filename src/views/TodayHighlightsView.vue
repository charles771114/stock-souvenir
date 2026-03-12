<template>
  <div class="min-h-screen bg-surface-50 pb-20">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-sm border-b border-slate-100">
      <div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <!-- Back Button (Left) -->
        <button @click="goBack" class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
          <i class="ri-arrow-left-line text-2xl"></i>
        </button>

        <!-- Title (Center) -->
        <div class="flex items-center gap-3 justify-center flex-1">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-brand-primary shadow-inner">
            <i class="ri-calendar-event-line text-2xl font-normal"></i>
          </div>
          <h1 class="text-xl font-black text-slate-800 tracking-tight">
            今日股東會重點
          </h1>
        </div>

        <!-- Right Action (Placeholder for balance) -->
        <div class="w-10"></div>
      </div>
      <!-- Sub-header Meta -->
      <div class="max-w-3xl mx-auto px-4 py-3 border-t border-slate-50 flex justify-between items-center bg-slate-50/50">
        <p class="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">更新時間：{{ formattedDate }}</p>
        <button @click="goToCatalog" class="text-xs font-black text-brand-primary flex items-center gap-1.5 hover:text-brand-primary/80 transition-colors uppercase tracking-[0.2em]">
          查看完整目錄 <i class="ri-arrow-right-s-line text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 py-8 space-y-10">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32">
        <div class="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin mb-6"></div>
        <p class="text-slate-400 font-black text-xs uppercase tracking-widest">正在載入最新情報...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-card p-10 text-center border-status-error/20">
        <div class="w-16 h-16 bg-status-error/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-status-error">
          <i class="fas fa-exclamation-triangle text-2xl"></i>
        </div>
        <h3 class="text-slate-800 font-extrabold mb-2">發生執行錯誤</h3>
        <p class="text-sm text-slate-500 mb-8">{{ error }}</p>
        <button @click="loadData" class="px-8 py-3 bg-status-error text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-status-error/90 transition-colors shadow-xl shadow-status-error/20">
          重新載入
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasAnyGroups" class="glass-card p-12 text-center stagger-item-1">
        <div class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
          <i class="fas fa-check-circle text-3xl text-status-success/40"></i>
        </div>
        <h3 class="text-slate-800 font-extrabold text-xl mb-3 tracking-tight">今日尚無特別關注事項</h3>
        <p class="text-sm text-slate-400 max-w-xs mx-auto mb-10 leading-relaxed font-bold">目前沒有即將截止的股東會，也沒有最新的紀念品情報。</p>
        <button @click="goToCatalog" class="px-10 py-4 bg-brand-primary text-white font-black rounded-2xl shadow-xl shadow-amber-200 hover:bg-amber-600 transition-colors uppercase tracking-widest text-xs">
          前往領取目錄探索
        </button>
      </div>

      <!-- Data Groups -->
      <template v-else>
        
        <!-- ⏰ Section 1: 截止期限提醒 (Deadline Timeline) -->
        <div v-if="Object.keys(deadlineGroups).length > 0" class="space-y-8">
          <div v-for="(group, days) in deadlineGroups" :key="days" class="animate-fade-in-up">
            <h2 class="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] mb-4" 
                :class="getDaysRemainingClass(parseInt(days)).replace('bg-', 'text-').split(' ')[0]">
               <i :class="parseInt(days) === 0 ? 'fas fa-fire' : 'fas fa-hourglass-half'" class="text-sm"></i>
               {{ getLabelForGroup(parseInt(days)) }}
            </h2>
            
            <div class="grid gap-4">
              <div v-for="item in group" :key="item.id" 
                   class="glass-card p-6 border border-slate-100 group relative overflow-hidden cursor-pointer hover:border-amber-200 transition-all shadow-sm hover:shadow-xl hover:shadow-amber-50 active:scale-[0.98]"
                   @click="viewDetails(item.id)">
                 <!-- Status Bar -->
                 <div class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors" :class="getDaysRemainingClass(parseInt(days)).split(' ')[1]"></div>
                
                <div class="flex justify-between items-start mb-4 pl-2">
                  <div class="flex items-center gap-3">
                    <span class="px-2.5 py-1 bg-slate-50 text-slate-400 font-mono text-[10px] font-black rounded-lg border border-slate-100 group-hover:bg-amber-50 group-hover:text-brand-primary group-hover:border-amber-100 transition-colors uppercase tracking-wider">
                      {{ item.code }}
                    </span>
                    <h3 class="text-lg font-black text-slate-800 leading-tight tracking-tight group-hover:text-brand-primary transition-colors">
                      {{ item.name }}
                      <span v-if="item.category_name === '超商商品卡'" class="ml-2 text-[9px] bg-brand-secondary text-white font-black px-2 py-0.5 rounded-full shadow-lg shadow-indigo-200 uppercase tracking-widest">商品卡</span>
                    </h3>
                  </div>
                </div>
                
                 <div class="mt-4 pl-2 flex items-center justify-between">
                  <div class="flex items-start gap-4">
                    <i class="fas fa-gift text-slate-300 mt-1 transition-colors group-hover:text-amber-400 text-sm"></i>
                    <div>
                      <div class="font-black tracking-tight leading-snug"
                        :class="isPlaceholder(item.souvenir_item) ? 'text-brand-primary text-base' : 'text-slate-700 text-base'">
                        <template v-if="isPlaceholder(item.souvenir_item)">
                          <div v-if="item.previousYearSouvenir" class="flex flex-col gap-1">
                            <span class="text-brand-primary">(去) {{ item.previousYearSouvenir }}</span>
                            <span class="text-[10px] text-slate-400 italic font-bold">今年資訊：{{ item.souvenir_item }}</span>
                          </div>
                          <span v-else class="text-slate-400 text-sm italic">尚未公布</span>
                        </template>
                        <span v-else>{{ item.souvenir_item }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-slate-200 group-hover:text-brand-primary group-hover:translate-x-1 transition-all">
                    <i class="fas fa-chevron-right text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 my-8"></div>

        <!-- 🌟 Section 2: 最近資料更新 (Recently Updated) -->
        <div v-if="recentlyUpdatedItems.length > 0" class="animate-fade-in-up">
          <h2 class="flex items-center gap-3 text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-4">
            <i class="fas fa-bullhorn text-sm"></i> 資料更新提醒
          </h2>
          <div class="grid gap-4 mb-8">
            <div v-for="item in recentlyUpdatedItems" :key="item.id" 
                 class="glass-card p-5 border border-amber-100 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-300 transition-all hover:shadow-md group"
                 @click="viewDetails(item.id)">
              <div class="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-[4rem] -mr-4 -mt-4 pointer-events-none transition-transform group-hover:scale-110"></div>
              
              <div class="flex justify-between items-start mb-4 relative z-10 pl-2">
                <div class="flex items-center gap-2.5">
                  <span class="px-2 py-1 bg-white text-brand-primary font-mono text-[10px] font-black rounded-lg shadow-sm border border-amber-100">
                    {{ item.code }}
                  </span>
                  <h3 class="font-extrabold text-slate-800 leading-tight tracking-tight group-hover:text-brand-primary transition-colors">
                    {{ item.name }}
                  </h3>
                </div>
                <div class="text-right">
                  <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    最後買進日
                  </div>
                  <div class="text-[10px] font-black text-slate-600 mt-1">
                    {{ formatDate(item.last_buy_date) }}
                  </div>
                </div>
              </div>
              
              <div class="mt-4 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-slate-100 relative z-10 flex group-hover:border-amber-100 transition-colors">
                <div class="flex-1">
                  <div class="flex items-start gap-3">
                    <i class="fas fa-sync-alt text-amber-400 mt-1 transition-transform group-hover:rotate-180 duration-500"></i>
                    <div>
                      <div class="font-black tracking-tight"
                        :class="isPlaceholder(item.souvenir_item) ? 'text-brand-primary text-sm' : 'text-slate-700 text-sm'">
                        <template v-if="isPlaceholder(item.souvenir_item)">
                          <div v-if="item.previousYearSouvenir" class="flex flex-col gap-1">
                            <span class="text-brand-primary">(去) {{ item.previousYearSouvenir }}</span>
                            <span class="text-[10px] text-slate-400 italic font-bold">今年：{{ item.souvenir_item }}</span>
                          </div>
                          <span v-else class="text-slate-400 italic">尚未公布</span>
                        </template>
                        <span v-else>{{ item.souvenir_item }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-center pl-4 text-slate-200 group-hover:text-brand-primary group-hover:translate-x-1 transition-all">
                  <i class="fas fa-chevron-right text-xs"></i>
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
const isPlaceholder = (val) => {
  if (!val) return true
  const s = String(val).trim()
  const p = ['尚未公布', '尚未公告', '尚未提供', 'NA', 'N/A', '-', '待公告']
  return p.includes(s) || s.includes('再行公告') || s.includes('再行公佈')
}

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
  if (days === 0) return 'text-status-error bg-status-error' 
  if (days < 0) return 'text-slate-400 bg-slate-300'
  if (days === 1) return 'text-status-warning bg-status-warning'
  return 'text-brand-primary bg-brand-primary'
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
