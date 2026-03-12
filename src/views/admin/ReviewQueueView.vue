<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1
            class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            待審核紀念品
          </h1>
          <p class="text-slate-400 font-bold text-sm uppercase tracking-wider">
            手動核對自動匹配結果，並完善分類精確度
          </p>
        </div>
        <button @click="fetchQueue"
          class="h-12 px-8 bg-white border border-slate-100 text-brand-primary rounded-2xl shadow-sm hover:bg-amber-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重新同步數據
        </button>
      </div>

      <!-- Stats -->
      <div class="mb-10 p-6 rounded-[2rem] bg-amber-50 border border-amber-100 animate-fade-in-up" v-if="queue.length > 0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-brand-primary">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-black text-brand-primary uppercase tracking-widest leading-none mb-1">
              需要人工審核通知
            </p>
            <p class="text-xs font-bold text-slate-500">
              目前偵測到 {{ queue.length }} 筆紀念品尚未分類。請手動指定正確分類以維持系統大數據精確。
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="py-24 flex flex-col items-center gap-6">
        <div class="w-16 h-16 border-8 border-amber-100 border-t-brand-primary rounded-full animate-spin"></div>
        <p class="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">正在精準同步大數據...</p>
      </div>

      <div v-else-if="queue.length === 0" class="glass-card py-24 text-center border-emerald-100/30">
        <div
          class="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 text-emerald-500 shadow-xl shadow-emerald-50">
          <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-3xl font-black text-slate-800 mb-2 tracking-tighter">審核任務清掃完畢</h3>
        <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">目前沒有需要審核的項目，您非常勤奮！</p>
      </div>

      <!-- Queue Table -->
      <div v-else class="glass-card overflow-hidden p-0 animate-fade-in-up delay-100">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0">
            <thead>
              <tr class="bg-amber-50 border-b border-amber-100">
                <th
                  class="px-8 py-5 text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  代號 / 來源公司
                </th>
                <th
                  class="px-8 py-5 text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  紀念品來源名稱
                </th>
                <th
                  class="px-8 py-5 text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-widest leading-none">
                  手動對齊分類標籤
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in queue" :key="item.id" class="group hover:bg-amber-50 transition-all">
                <td class="px-8 py-6">
                  <div class="font-black text-slate-800 tracking-tighter text-lg">{{ item.code }}</div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.name }}</div>
                </td>
                <td class="px-8 py-6">
                  <div class="status-badge status-badge-neutral !px-4 !py-2 !rounded-xl !text-sm border-none">
                    {{ item.souvenir_item }}
                  </div>
                </td>
                <td class="px-8 py-6 max-w-xs">
                  <select @change="e => assignCategory(item, (e.target as HTMLSelectElement).value)"
                    class="block w-full h-12 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 focus:border-amber-200 focus:ring-4 focus:ring-amber-50 outline-none transition-all appearance-none cursor-pointer">
                    <option value="">選擇正確分類...</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'

const { showToast } = useToast()

const { categories, fetchCategories } = useCategories()
const queue = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  fetchCategories()
  fetchQueue()
})

const fetchQueue = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('souvenirs')
    .select('*')
    .eq('classification_status', 'unclassified')
    .order('meeting_date', { ascending: false })
    .limit(100)

  if (data) {
    queue.value = data
  }
  loading.value = false
}

const assignCategory = async (item: any, categoryIdStr: string) => {
  if (!categoryIdStr) return
  const categoryId = parseInt(categoryIdStr)

  const { error } = await supabase
    .from('souvenirs')
    .update({
      category_id: categoryId,
      classification_status: 'verified'
    })
    .eq('id', item.id)

  if (!error) {
    // Remove from local queue
    queue.value = queue.value.filter(q => q.id !== item.id)
    showToast('分類更新成功', 'success')
  } else {
    showToast('更新失敗: ' + error.message, 'error')
  }
}
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

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}
</style>
