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
            通知管理中心
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            管理與預覽 LINE 股東會紀念品提醒
          </p>
        </div>

        <div class="flex gap-3">
          <button @click="refreshStatus" 
            class="h-12 px-6 bg-white border border-slate-100 text-brand-primary rounded-2xl shadow-sm hover:bg-brand-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
            <i class="ri-refresh-line text-lg"></i>
            刷新狀態
          </button>
        </div>
      </div>

    <!-- 系統狀態卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-100">
      <div class="glass-card p-6 border-l-4 border-slate-900 group">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-50 rounded-lg text-brand-primary">
              <i class="ri-time-line text-xl"></i>
            </div>
            <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">自動發送排程</h3>
          </div>
          <div class="status-badge status-badge-success !rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            運行中 (Active)
          </div>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ cronStatus }}</p>
        <p class="text-xs text-gray-500 mt-1">每天 09:00 & 13:00 (pg_cron)</p>
      </div>

      <div class="glass-card p-6 border-l-4 border-emerald-500 group">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <i class="ri-check-double-line text-xl"></i>
          </div>
          <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">上次發送時間</h3>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ lastSentTime || '暫無紀錄' }}</p>
        <p class="text-xs text-gray-500 mt-1">成功推播至 LINE 群組</p>
      </div>

      <div class="glass-card p-6 border-l-4 border-brand-primary group">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-amber-50 rounded-lg text-brand-primary">
            <i class="ri-group-line text-xl"></i>
          </div>
          <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">接收群組數</h3>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ activeGroupsCount }} 個群組</p>
        <p class="text-xs text-gray-500 mt-1">已啟用的 LINE Notify 目標</p>
      </div>

      <div class="glass-card p-6 border-l-4 border-amber-500 group" :class="{ 'opacity-50': quotaLoading }">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
              <i class="ri-mail-send-line text-xl"></i>
            </div>
            <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">本月訊息剩餘</h3>
          </div>
          <select v-if="bots.length > 0" v-model="selectedBotId" @change="fetchQuota" class="text-[10px] bg-transparent border-none focus:ring-0 font-bold text-slate-400">
            <option v-for="bot in bots" :key="bot.id" :value="bot.id">{{ bot.bot_name }}</option>
          </select>
        </div>
        <div v-if="quotaLoading" class="animate-pulse flex items-baseline gap-2">
          <div class="h-8 w-16 bg-slate-100 rounded"></div>
        </div>
        <div v-else-if="quotaInfo?.error" class="text-sm text-red-500 font-bold">讀取失敗</div>
        <div v-else class="flex items-baseline gap-2">
          <p class="text-2xl font-bold dark:text-white" :class="{ 'text-red-500': quotaInfo?.remaining < 50 }">
            {{ quotaInfo?.remaining ?? '---' }}
          </p>
          <span class="text-xs text-gray-400">/ {{ quotaInfo?.value || 0 }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">Messaging API 免費額度</p>
      </div>
    </div>

    <!-- 機器人狀態 (NEW section) -->
    <div class="mt-12 mb-12 animate-fade-in-up delay-200">
      <div class="flex items-center justify-between mb-6 px-2">
        <h2 class="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <i class="ri-robot-2-line"></i> Bot 狀態與管理
        </h2>
        <button @click="fetchBots" class="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">更新列表</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="bot in bots" :key="bot.id" class="glass-card p-6 hover:border-amber-200 transition-all group">
          <div class="flex items-center justify-between mb-3">
            <div class="font-black text-slate-800 tracking-tighter">{{ bot.bot_name }}</div>
            <div class="status-badge !rounded-full" :class="bot.is_active ? 'status-badge-success' : 'status-badge-neutral'">
              {{ bot.is_active ? 'Active' : 'Disabled' }}
            </div>
          </div>
          <div class="text-[10px] text-slate-400 font-mono mb-3 truncate">{{ bot.id }}</div>
          <div class="flex items-center gap-2">
            <button @click="testLineAuth(bot.id)" class="flex-1 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold transition-all border border-slate-100">
              驗證 Token
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要操作區 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 通知預覽 -->
      <div class="glass-card overflow-hidden flex flex-col p-0">
        <div class="px-8 py-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
          <h2 class="font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <i class="ri-chat-smile-2-line text-emerald-500"></i> 通知訊息預覽
          </h2>
          <div class="flex gap-2 w-full sm:w-auto">
            <select v-model="previewTime" class="text-[10px] font-black bg-white border-slate-100 rounded-xl px-4 py-2 text-slate-600 focus:ring-brand-primary flex-1 sm:flex-none uppercase tracking-widest">
              <option value="morning">早上 (含預告)</option>
              <option value="afternoon">下午 (僅限今日)</option>
            </select>
            <button @click="generatePreview" :disabled="loading" class="h-9 px-4 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50">
              生成預覽
            </button>
          </div>
        </div>
        
        <div class="p-6 flex-grow flex flex-col min-h-[400px]">
          <div v-if="loading" class="flex-grow flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
          
          <div v-else-if="previewMessage" class="flex-grow">
            <div class="bg-slate-50 rounded-2xl p-6 font-mono text-xs border border-slate-100 whitespace-pre-wrap text-slate-700 relative shadow-inner">
              <button @click="copyPreview" class="absolute top-4 right-4 p-2 bg-white rounded-xl text-slate-400 hover:text-brand-primary shadow-sm transition-all">
                <i class="ri-file-copy-line"></i>
              </button>
              {{ previewMessage }}
            </div>
          </div>
          
          <div v-else class="flex-grow flex flex-col items-center justify-center text-gray-400">
            <i class="ri-eye-off-line text-4xl mb-2"></i>
            <p>點擊按鈕生成預覽訊息</p>
          </div>
        </div>
      </div>

      <!-- 控制台與工具 -->
      <div class="space-y-8">
        <div class="glass-card p-8">
          <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i class="ri-tools-line text-amber-500 text-lg"></i> 開發者工具
          </h3>
          <div class="grid grid-cols-1 gap-4">
            <button @click="handleManualTrigger" :disabled="sending" class="flex items-center justify-between p-5 bg-amber-50/50 border border-amber-100 rounded-2xl hover:bg-amber-50 transition-all group">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-amber-100 rounded-xl text-amber-600 shadow-sm">
                  <i class="ri-rocket-line text-2xl"></i>
                </div>
                <div class="text-left">
                  <div class="font-black text-slate-800 tracking-tight">立即執行 Edge Function</div>
                  <div class="text-[10px] font-bold text-amber-700 uppercase tracking-wider">直接手動呼叫 line-notify 接口</div>
                </div>
              </div>
              <i class="ri-arrow-right-line text-amber-400 group-hover:translate-x-1 transition-transform"></i>
            </button>

            <button @click="testLineAuth" class="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-white rounded-xl text-slate-600 shadow-sm">
                  <i class="ri-shield-user-line text-2xl"></i>
                </div>
                <div class="text-left">
                  <div class="font-black text-slate-800 tracking-tight">測試 LINE Token</div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">檢查 Channel Access Token 是否有效</div>
                </div>
              </div>
              <i class="ri-arrow-right-line text-slate-400 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>

        <div class="glass-card p-8 border-t-4 border-amber-500/50">
          <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <i class="ri-information-line text-amber-500"></i> 通知邏輯備忘
          </h3>
          <ul class="text-xs space-y-4 text-slate-500 font-bold">
            <li class="flex gap-3">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-1.5 flex-shrink-0"></span>
              <span>Messaging API 每月提供核心額度。若群組數較多，請務必監控額度剩餘量。</span>
            </li>
            <li class="flex gap-3">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-1.5 flex-shrink-0"></span>
              <span>「超商商品卡」類別具有最高優先權，會顯示在推播的最上方區塊。</span>
            </li>
            <li class="flex gap-3">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-1.5 flex-shrink-0"></span>
              <span>系統會自動過濾已過期的紀念品，僅推播尚未領取截止之項目。</span>
            </li>
          </ul>
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
import axios from 'axios'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const { showToast } = useToast()
const loading = ref(false)
const sending = ref(false)
const previewMessage = ref('')
const previewTime = ref('morning')
const cronStatus = ref('讀取中...')
const lastSentTime = ref('')
const activeGroupsCount = ref(0)
const quotaInfo = ref(null)
const quotaLoading = ref(false)
const bots = ref([])
const selectedBotId = ref(null)

const refreshStatus = async () => {
  try {
    cronStatus.value = '2x / 每日'
    
    // Fetch Active Groups
    const { count } = await supabase.from('line_groups').select('*', { count: 'exact', head: true }).eq('is_active', true)
    activeGroupsCount.value = count || 0
    
    // Last sent time
    const { data: latestAction } = await supabase
      .from('line_groups')
      .select('last_active_at')
      .order('last_active_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    if (latestAction?.last_active_at) {
      lastSentTime.value = new Date(latestAction.last_active_at).toLocaleString()
    }

    // Fetch Bots and then Quota
    await fetchBots()
    fetchQuota()
  } catch (e) {
    console.error('Refresh status failed:', e)
  }
}

const fetchBots = async () => {
  const { data } = await supabase.from('line_bots').select('*').order('created_at', { ascending: true })
  bots.value = data || []
  if (bots.value.length > 0 && !selectedBotId.value) {
    selectedBotId.value = bots.value[0].id
  }
}

const fetchQuota = async () => {
  quotaLoading.value = true
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    const { data } = await axios.post(functionUrl, { 
      action: 'quota',
      bot_id: selectedBotId.value
    }, {
       headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    quotaInfo.value = data
  } catch (e) {
    console.error('Fetch quota failed:', e)
    quotaInfo.value = { error: true }
  } finally {
    quotaLoading.value = false
  }
}

const generatePreview = async () => {
  loading.value = true
  try {
    // We call the edge function but with a flag 'dry_run=true'
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    
    const res = await axios.post(functionUrl, { 
      dry_run: true,
      time_context: previewTime.value
    }, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (res.data?.message) {
      previewMessage.value = res.data.message
    } else if (res.data?.status === 'no_data' || res.data?.status === 'no_notifications') {
      previewMessage.value = '今天沒有符合條件的通知內容。'
    } else {
      previewMessage.value = '無可預覽內容'
    }
  } catch (e) {
    console.error('Preview failed:', e)
    const errorMsg = e.response?.data?.message || e.response?.data || e.message
    showToast('生成預覽失敗: ' + errorMsg, 'error')
  } finally {
    loading.value = false
  }
}

const handleManualTrigger = async () => {
  const result = await Swal.fire({
    title: '確定要立即執行推播嗎？',
    text: '這將對所有啟用的 LINE 群組發送最新的紀念品資訊推播。',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定執行',
    cancelButtonText: '取消',
    confirmButtonColor: '#1e293b',
    customClass: {
      popup: 'rounded-[2rem] border-none shadow-2xl glass-card-swal',
      confirmButton: 'rounded-xl font-black px-6 py-3 bg-brand-primary',
      cancelButton: 'rounded-xl font-black px-6 py-3'
    }
  })

  if (!result.isConfirmed) return
  
  sending.value = true
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    await axios.post(functionUrl, { force: true }, {
       headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    showToast('執行成功！通知已發出。', 'success')
  } catch (e) {
    console.error('Manual trigger failed:', e)
    showToast('執行失敗: ' + (e.response?.data || e.message), 'error')
  } finally {
    sending.value = false
  }
}

const copyPreview = () => {
  if (!previewMessage.value) return
  navigator.clipboard.writeText(previewMessage.value)
  showToast('已複製到剪貼簿', 'success')
}

const testLineAuth = async (botId = null) => {
  try {
    const targetBotId = botId || selectedBotId.value
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    const { data } = await axios.post(functionUrl, { 
      action: 'verify', 
      bot_id: targetBotId 
    }, {
       headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data.valid) {
      showToast(`Token 有效！Bot：${data.display_name}`, 'success')
    } else {
      showToast(`Token 已失效: ${data.error}`, 'error')
    }
  } catch (e) {
    console.error('Verify failed:', e)
    showToast('驗證失敗', 'error')
  }
}

onMounted(() => {
  refreshStatus()
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

.delay-200 {
  animation-delay: 0.2s;
}

:deep(.glass-card-swal) {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}
</style>
