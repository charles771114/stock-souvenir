<template>
  <div class="min-h-screen bg-gray-50 relative overflow-hidden">
    <!-- Animated Background Mesh -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <Navbar class="relative z-10" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 min-h-[80vh]">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 animate-fade-in">
        <div>
          <h1 class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 tracking-tighter mb-2 uppercase">
            我的收藏
          </h1>
          <p class="text-lg text-gray-400 font-black uppercase tracking-[0.2em]">
            Wishlist & Favorites
          </p>
        </div>
        
        <div v-if="myCollections.length > 0" class="flex items-center gap-6 bg-white/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/60 shadow-lg">
           <div class="flex flex-col items-center">
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total</span>
              <span class="text-xl font-black text-indigo-600 tracking-tighter">{{ myCollections.length }}</span>
           </div>
           <div class="w-px h-6 bg-gray-200"></div>
           <div class="flex flex-col items-center">
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Companies</span>
              <span class="text-xl font-black text-purple-600 tracking-tighter">{{ uniqueCompanies }}</span>
           </div>
           <div class="w-px h-6 bg-gray-200"></div>
           <div class="flex flex-col items-center">
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Years</span>
              <span class="text-xl font-black text-pink-600 tracking-tighter">{{ uniqueYears }}</span>
           </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-32 space-y-4">
        <LoadingSpinner />
        <span class="text-xs font-black text-gray-400 animate-pulse uppercase tracking-[0.3em]">Loading Assets...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-card border-red-100 bg-red-50/50 p-8 rounded-[2rem] text-center">
        <p class="text-red-500 font-black uppercase tracking-widest">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="myCollections.length === 0" class="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
        <div class="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3 border border-gray-50">
          <svg class="h-12 w-12 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 class="text-2xl font-black text-gray-900 tracking-tighter mb-3">收藏清單空空如也</h3>
        <p class="text-gray-400 font-medium mb-8 max-w-xs mx-auto">點擊目錄中的心形圖示，將感興趣的紀念品加入清單。</p>
        <router-link to="/gifts" class="h-12 px-10 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 transition-transform flex items-center gap-2 font-black uppercase text-xs tracking-widest">
           探索紀念品
        </router-link>
      </div>

      <!-- Collections Grid/List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        <div
          v-for="item in myCollections"
          :key="item.id"
          class="glass-card group rounded-[2.5rem] p-6 border border-white/60 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all flex flex-col h-full overflow-hidden relative"
        >
          <!-- Accent Gradient Bubble -->
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-colors"></div>

          <!-- Header Section -->
          <div class="flex justify-between items-start mb-6 relative">
             <div class="flex-1 min-w-0">
               <div class="flex items-center gap-2 mb-2">
                 <span class="text-[10px] font-black px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-600 font-mono tracking-tighter">
                   {{ item.gift?.code }}
                 </span>
                 <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                   {{ item.gift?.meeting_date ? new Date(item.gift.meeting_date).getFullYear() : 'N/A' }}
                 </span>
               </div>
               <h3 class="text-xl font-black text-gray-900 tracking-tighter line-clamp-1 group-hover:text-indigo-600 transition-colors">
                 {{ item.gift?.name }}
               </h3>
             </div>
             
             <button
                @click="confirmRemove(item)"
                class="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shrink-0"
                title="移除收藏"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
          </div>

          <!-- Item Content -->
          <div class="mb-8 flex-1">
             <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">紀念品項目 / Asset</div>
             <p class="text-sm font-bold text-gray-700 leading-relaxed">
                {{ item.gift?.souvenir_item }}
             </p>
          </div>

          <!-- Footer Action -->
          <div v-if="item.gift?.source_url" class="pt-6 border-t border-gray-100/50">
             <button @click="openUrl(item.gift.source_url)" class="w-full py-3 px-4 bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                查看官方來源
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import { useDialog } from '@/composables/useDialog'
import { useGifts } from '@/composables/useGifts'
import { computed, onMounted } from 'vue'

const { myCollections, loading, error, fetchMyCollections, removeFromCollection, updateCollectionNote } = useGifts()
const { confirm } = useDialog()

const uniqueCompanies = computed(() => {
  const companies = new Set()
  myCollections.value.forEach(c => {
    if (c.gift?.code) companies.add(c.gift.code)
  })
  return companies.size
})

const uniqueYears = computed(() => {
  const years = new Set()
  myCollections.value.forEach(c => {
    const year = c.gift?.meeting_date ? new Date(c.gift.meeting_date).getFullYear() : null
    if (year) years.add(year)
  })
  return years.size
})

const updateNote = async (collectionId, note) => {
  // Logic removed
}

const confirmRemove = async (collection) => {
  if (await confirm(`確定要移除「${collection.gift?.name}」的收藏嗎？`, '移除收藏')) {
    await removeFromCollection(collection.id)
  }
}

const openUrl = (url) => {
  window.open(url, '_blank')
}

onMounted(async () => {
  await fetchMyCollections()
})
</script>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
