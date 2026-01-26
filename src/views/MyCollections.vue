<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Header -->
      <div class="mb-12 animate-fade-in-up">
        <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">領取清單 / My Collections</h1>
        <p class="text-slate-500">管理您各年度計畫領取或已領取的紀念品項目</p>
      </div>

      <!-- Filter Bar -->
      <div class="glass-card p-6 mb-8 flex flex-wrap items-center justify-between gap-6 animate-fade-in-up delay-100">
        <div class="flex items-center gap-4">
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest">選擇年度</span>
          <div class="flex bg-slate-100 p-1 rounded-xl">
            <button v-for="y in ['2026', '2025', '2024']" :key="y"
              @click="selectedYear = y"
              class="px-5 py-2 rounded-lg text-xs font-black transition-all"
              :class="selectedYear === y ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
            >
              {{ y }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
           <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total {{ filteredCollections.length }} Items
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-20 flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-xs font-black text-indigo-300 uppercase tracking-widest">Loading Collections...</p>
      </div>

      <!-- Content -->
      <div v-else-if="filteredCollections.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in filteredCollections" :key="item.id" class="animate-fade-in-up">
          <div class="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="flex justify-between items-start mb-4">
              <span class="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {{ item.gift?.code }}
              </span>
              <button @click="handleRemove(item.id)" class="text-slate-300 hover:text-rose-500 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-2">{{ item.gift?.name }}</h3>
            <p class="text-sm text-slate-600 font-medium mb-6 line-clamp-2">
              {{ item.gift?.souvenir_item || '尚未公布' }}
            </p>
            
            <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">開會日期</span>
                <span class="text-xs font-black font-mono text-slate-600">{{ item.gift?.meeting_date || '-' }}</span>
              </div>
              <div class="flex flex-col text-right">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">領取狀態</span>
                <span class="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded shadow-sm">已在清單</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-32 flex flex-col items-center justify-center text-center px-8 bg-white rounded-[3rem] border border-dashed border-slate-200">
        <div class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
          <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h4 class="text-xl font-bold text-slate-900 mb-2">{{ selectedYear }} 年度尚無收藏</h4>
        <p class="text-sm text-slate-400 max-w-xs mb-8">您可以前往「紀念品目錄」挑選感興趣的紀念品加入清單。</p>
        <router-link to="/gifts" class="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
          前往領取目錄
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useAuth } from '@/composables/useAuth'
import { useDialog } from '@/composables/useDialog'
import { useGifts } from '@/composables/useGifts'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref, watch } from 'vue'

const { myCollections, loading, fetchMyCollections, removeFromCollection } = useGifts()
const { confirm } = useDialog()
const { showToast } = useToast()
const { user } = useAuth()

const selectedYear = ref(new Date().getFullYear().toString())

const filteredCollections = computed(() => {
  return myCollections.value.filter(item => {
    // Check if the associated gift belongs to the selected year
    const meetingDate = item.gift?.meeting_date
    if (!meetingDate) return false
    return meetingDate.startsWith(selectedYear.value)
  })
})

const handleRemove = async (id) => {
  if (await confirm('確定要從領取清單中移除這項紀念品嗎？', '移除收藏')) {
    const { error } = await removeFromCollection(id)
    if (!error) {
      showToast('已移除', 'success')
      await fetchMyCollections()
    } else {
      showToast('移除失敗', 'error')
    }
  }
}

onMounted(() => {
  if (user.value) {
    fetchMyCollections()
  }
})

watch(user, (val) => {
  if (val) fetchMyCollections()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2rem;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

.delay-100 { animation-delay: 0.1s; }
</style>
