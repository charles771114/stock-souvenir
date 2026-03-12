<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />
    <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb / Header -->
      <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <nav class="flex mb-4" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/admin/panel" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-all">主控台</router-link>
              </li>
              <li>
                <svg class="h-4 w-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </li>
              <li>
                <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest">LINE 群組管理</span>
              </li>
            </ol>
          </nav>
          <h1 class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            LINE 群組列表
          </h1>
          <p class="text-slate-400 font-bold text-sm uppercase tracking-wider">
            管理已串接的 LINE 通知群組與查詢權限
          </p>
        </div>
        <div class="flex items-center gap-2">
            <button @click="fetchGroups" class="h-10 px-5 bg-white border border-slate-100 text-brand-primary rounded-xl shadow-sm hover:bg-brand-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <svg :class="['w-4 h-4', loading ? 'animate-spin' : '']" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新整理
            </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="glass-card overflow-hidden p-0 animate-fade-in-up">
        <div v-if="loading" class="p-24 flex flex-col items-center justify-center gap-4">
            <div class="w-12 h-12 border-4 border-slate-50 border-t-brand-primary rounded-full animate-spin"></div>
            <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">正在掃描群組資料...</p>
        </div>
        
        <div v-else-if="groups.length === 0" class="p-24 text-center">
            <div class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">未發現數據</div>
            <p class="text-sm font-bold text-slate-400">目前沒有已追蹤的 LINE 群組。</p>
            <p class="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-4">請參閱下方說明以啟動連線</p>
        </div>

        <ul v-else role="list" class="divide-y divide-slate-50">
            <li v-for="group in groups" :key="group.group_id" class="px-8 py-6 hover:bg-amber-50 transition-all group">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div class="flex items-center min-w-0 gap-5">
                        <!-- Group Icon -->
                        <div class="flex-shrink-0 h-16 w-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shadow-sm group-hover:border-amber-200 transition-all">
                            <img v-if="group.picture_url" :src="group.picture_url" alt="Group Icon" class="h-full w-full object-cover" />
                            <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Info -->
                        <div class="min-w-0">
                            <h3 class="text-xl font-black text-slate-800 tracking-tighter truncate group-hover:text-brand-primary transition-colors">
                                {{ group.group_name || group.display_name || '未命名群組' }}
                            </h3>
                            <div class="mt-1 flex items-center gap-3">
                                <div class="flex items-center text-[10px] text-slate-400 font-black tracking-widest uppercase">
                                    <span class="truncate block max-w-[120px]">{{ group.group_id }}</span>
                                    <button @click="copy(group.group_id)" class="ml-1 text-slate-300 hover:text-brand-primary transition-colors" title="複製 ID">
                                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <span v-if="group.line_bots?.bot_name" class="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-amber-50 text-brand-primary border border-amber-100 uppercase tracking-widest">
                                    {{ group.line_bots.bot_name }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Status & Actions -->
                    <div class="flex flex-col items-end gap-3">
                        <!-- Status Badges Row -->
                        <div class="flex items-center gap-2">
                            <!-- Notification Status Badge -->
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                                :class="group.is_active 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-gray-50 text-gray-400 border-gray-200'">
                                <i :class="group.is_active ? 'ri-notification-line' : 'ri-notification-off-line'" class="mr-1"></i>
                                推播{{ group.is_active ? '中' : '關閉' }}
                            </span>
                            
                            <!-- Keyword Status Badge -->
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                                :class="group.allow_keywords 
                                    ? 'bg-amber-50 text-brand-primary border-amber-100' 
                                    : 'bg-slate-50 text-slate-400 border-slate-200'">
                                <i class="ri-search-eye-line mr-1"></i>
                                查詢{{ group.allow_keywords ? '中' : '關閉' }}
                            </span>
                        </div>
                        
                        <!-- Last Active Time -->
                        <div class="text-[10px] text-gray-400 font-medium">
                             最後活動: {{ formatDate(group.last_active_at) }}
                        </div>
                        
                        <!-- Action Buttons Group -->
                        <div class="flex items-center gap-2 mt-1">
                            <!-- Toggle Active (Notification) -->
                            <button 
                                @click="toggleActive(group)"
                                class="h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 border border-slate-100 shadow-sm"
                                :class="group.is_active 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-200'"
                                :title="group.is_active ? '關閉廣播通知' : '開啟廣播通知'"
                            >
                                <i :class="group.is_active ? 'ri-broadcast-line' : 'ri-broadcast-line'" class="text-xl"></i>
                            </button>

                            <!-- Toggle Keywords -->
                            <button 
                                @click="toggleKeywords(group)"
                                class="h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 border border-slate-100 shadow-sm"
                                :class="group.allow_keywords 
                                    ? 'bg-amber-50 text-brand-primary border-amber-100 hover:bg-brand-primary hover:text-white' 
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-200'"
                                :title="group.allow_keywords ? '關閉關鍵字查詢' : '開啟關鍵字查詢'"
                            >
                                <i class="ri-search-2-line text-xl"></i>
                            </button>
                            
                            <div class="w-[1px] h-4 bg-slate-100 mx-1"></div>

                            <!-- Remove Button -->
                            <button 
                                @click="removeGroup(group)"
                                class="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                title="移除群組"
                            >
                                <i class="ri-delete-bin-line text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
      </div>
      
      <!-- Improved Help Section -->
      <div class="mt-20 glass-card p-0 animate-fade-in-up delay-100">
        <div class="px-8 py-10 sm:px-12">
          <div class="flex items-center gap-4 mb-10">
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
              <svg class="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-800 tracking-tighter">連線啟用指南</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect & Broadcast Workflow</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="flex flex-col gap-4 relative">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-primary text-white text-xs font-black shadow-lg shadow-amber-200">01</span>
                <span class="font-black text-slate-700 tracking-tight uppercase text-sm">搜尋關鍵字</span>
              </div>
              <p class="text-xs text-slate-400 font-bold leading-relaxed border-l-2 border-slate-50 pl-4 py-1">
                在 LINE App 中搜尋您的 Bot 名稱，並將其正式加入好友。
              </p>
            </div>
            
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-primary text-white text-xs font-black shadow-lg shadow-amber-200">02</span>
                <span class="font-black text-slate-700 tracking-tight uppercase text-sm">串接至群組</span>
              </div>
              <p class="text-xs text-slate-400 font-bold leading-relaxed border-l-2 border-slate-50 pl-4 py-1">
                將 Bot 邀請進入目標群組，並在群組隨意發送一則訊息觸發 Hook。
              </p>
            </div>
            
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-primary text-white text-xs font-black shadow-lg shadow-amber-200">03</span>
                <span class="font-black text-slate-700 tracking-tight uppercase text-sm">數據熱重載</span>
              </div>
              <p class="text-xs text-slate-400 font-bold leading-relaxed border-l-2 border-slate-50 pl-4 py-1">
                點擊上方「重新整理」按鈕，群組將即刻同步至管理介面中。
              </p>
            </div>
          </div>
          
          <div class="mt-12 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="flex flex-col">
              <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">系統穩定性建議</p>
              <p class="text-xs font-bold text-slate-400">
                若群組未出現，請檢查 Webhook 網址是否已正確配置於 LINE Developers 平台。
              </p>
            </div>
            <div class="flex items-center gap-3 px-5 py-3 bg-amber-50 rounded-2xl border border-amber-100 self-end sm:self-auto">
              <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest whitespace-nowrap">Node 運作狀態正常</span>
              <span class="flex h-2.5 w-2.5 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'

const groups = ref([])
const loading = ref(true)
const { showToast } = useToast()

const fetchGroups = async () => {
    loading.value = true
    const { data, error } = await supabase
        .from('line_groups')
        .select(`
            *,
            line_bots (
                bot_name
            )
        `)
        .order('last_active_at', { ascending: false })
    
    if (error) {
        console.error(error)
        showToast('載入群組失敗', 'error')
    } else {
        groups.value = data
    }
    loading.value = false
}

const copy = (text) => {
    navigator.clipboard.writeText(text)
    showToast('ID 已複製', 'success')
}

const toggleActive = async (group) => {
    const newStatus = !group.is_active
    const { error } = await supabase
        .from('line_groups')
        .update({ is_active: newStatus })
        .eq('group_id', group.group_id)
    
    if (error) {
        console.error(error)
        showToast('更新失敗', 'error')
    } else {
        group.is_active = newStatus
        showToast(
            newStatus ? '已開啟廣播通知' : '已關閉廣播通知', 
            'success'
        )
    }
}

const toggleKeywords = async (group) => {
    const newStatus = !group.allow_keywords
    const { error } = await supabase
        .from('line_groups')
        .update({ allow_keywords: newStatus })
        .eq('group_id', group.group_id)
    
    if (error) {
        console.error(error)
        showToast('更新失敗', 'error')
    } else {
        group.allow_keywords = newStatus
        showToast(
            newStatus ? '已開啟關鍵字查詢' : '已關閉關鍵字查詢', 
            'success'
        )
    }
}

const removeGroup = async (group) => {
    if (!confirm(`確定要移除群組「${group.group_name || group.display_name || '未命名群組'}」嗎？`)) {
        return
    }
    
    const { error } = await supabase
        .from('line_groups')
        .delete()
        .eq('group_id', group.group_id)
    
    if (error) {
        console.error(error)
        showToast('移除失敗', 'error')
    } else {
        groups.value = groups.value.filter(g => g.group_id !== group.group_id)
        showToast('群組已移除', 'success')
    }
}

const formatDate = (ts) => {
    if (!ts) return '-'
    return new Date(ts).toLocaleString('zh-TW')
}

onMounted(() => {
    fetchGroups()
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
