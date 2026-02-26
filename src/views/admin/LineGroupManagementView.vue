<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb / Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/admin/panel" class="text-sm font-medium text-gray-500 hover:text-gray-700">主控台</router-link>
              </li>
              <li>
                <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </li>
              <li>
                <span class="text-sm font-medium text-gray-900">LINE 群組管理</span>
              </li>
            </ol>
          </nav>
          <h1 class="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            LINE 群組列表
          </h1>
        </div>
        <div class="flex items-center gap-2">
            <button @click="fetchGroups" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新整理
            </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div v-if="loading" class="p-12 flex justify-center">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
        
        <div v-else-if="groups.length === 0" class="p-12 text-center text-gray-500">
            目前沒有已追蹤的 LINE 群組。
            <p class="text-sm mt-2">請將機器人邀請至群組，並發送任意訊息以啟用追蹤。</p>
        </div>

        <ul v-else role="list" class="divide-y divide-gray-200">
            <li v-for="group in groups" :key="group.group_id" class="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex items-center min-w-0 gap-4">
                        <!-- Group Icon -->
                        <div class="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                            <img v-if="group.picture_url" :src="group.picture_url" alt="Group Icon" class="h-full w-full object-cover" />
                            <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Info -->
                        <div class="min-w-0">
                            <h3 class="text-base font-bold text-gray-900 truncate">
                                {{ group.group_name || group.display_name || '未命名群組' }}
                            </h3>
                            <div class="mt-1 flex items-center gap-3">
                                <div class="flex items-center text-xs text-gray-400 font-mono">
                                    <span class="truncate block max-w-[120px]">{{ group.group_id }}</span>
                                    <button @click="copy(group.group_id)" class="ml-1 text-gray-400 hover:text-indigo-600 transition-colors" title="複製 ID">
                                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <span v-if="group.line_bots?.bot_name" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                                    <i class="ri-robot-2-line mr-1"></i>
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
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-gray-50 text-gray-400 border-gray-200'">
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
                                class="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200"
                                :class="group.is_active 
                                    ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'"
                                :title="group.is_active ? '關閉廣播通知' : '開啟廣播通知'"
                            >
                                <i :class="group.is_active ? 'ri-broadcast-line' : 'ri-broadcast-line'" class="text-lg"></i>
                            </button>

                            <!-- Toggle Keywords -->
                            <button 
                                @click="toggleKeywords(group)"
                                class="h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-200"
                                :class="group.allow_keywords 
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'"
                                :title="group.allow_keywords ? '關閉關鍵字查詢' : '開啟關鍵字查詢'"
                            >
                                <i class="ri-search-2-line text-lg"></i>
                            </button>
                            
                            <div class="w-[1px] h-4 bg-gray-200 mx-1"></div>

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
      <div class="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-8 sm:px-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-indigo-50 rounded-lg">
              <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">如何加入並啟用群組通知</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">1</span>
                <span class="font-semibold text-gray-800">搜尋機器人</span>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed">
                在 LINE 中搜尋您的 Bot 並將其加入好友。
              </p>
            </div>
            
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">2</span>
                <span class="font-semibold text-gray-800">邀請至群組</span>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed">
                將 Bot 邀請進入目標群組，並在群組隨意發送一則訊息。
              </p>
            </div>
            
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">3</span>
                <span class="font-semibold text-gray-800">完成啟用</span>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed">
                重新整理此頁面，群組將自動出現在清單中。
              </p>
            </div>
          </div>
          
          <div class="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
            <p class="text-xs text-gray-400">
              提示：若要停止特定群組通知，只需在清單中點擊「停用」即可。
            </p>
            <div class="flex items-center gap-2 text-indigo-600">
              <span class="text-xs font-semibold">運作狀態正常</span>
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
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
