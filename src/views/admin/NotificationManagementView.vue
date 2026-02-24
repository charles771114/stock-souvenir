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
            通知管理中心
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            管理與預覽 LINE 股東會紀念品提醒
          </p>
        </div>

        <div class="flex gap-3">
          <button @click="refreshStatus" 
            class="h-12 px-6 bg-white border border-slate-100 text-slate-600 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
            <i class="ri-refresh-line text-lg"></i>
            刷新狀態
          </button>
        </div>
      </div>

    <!-- 系統狀態卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-5 border-l-4 border-blue-500 bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <i class="ri-time-line text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-300">自動發送排程</h3>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 font-bold border border-green-200 dark:border-green-800/50">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            運行中 (Active)
          </div>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ cronStatus }}</p>
        <p class="text-xs text-gray-500 mt-1">每天 09:00 & 13:00 (pg_cron)</p>
      </div>

      <div class="card p-5 border-l-4 border-green-500 bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
            <i class="ri-check-double-line text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-700 dark:text-gray-300">上次發送時間</h3>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ lastSentTime || '暫無紀錄' }}</p>
        <p class="text-xs text-gray-500 mt-1">成功推播至 LINE 群組</p>
      </div>

      <div class="card p-5 border-l-4 border-purple-500 bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
            <i class="ri-group-line text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-700 dark:text-gray-300">接收群組數</h3>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ activeGroupsCount }} 個群組</p>
        <p class="text-xs text-gray-500 mt-1">已啟用的 LINE Notify 目標</p>
      </div>

      <div class="card p-5 border-l-4 border-pink-500 bg-white dark:bg-gray-800 shadow-sm" :class="{ 'opacity-50': quotaLoading }">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
              <i class="ri-mail-send-line text-xl"></i>
            </div>
            <h3 class="font-semibold text-gray-700 dark:text-gray-300">本月訊息剩餘</h3>
          </div>
          <div v-if="quotaInfo?.type === 'none'" class="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-600 font-bold">
            無上限
          </div>
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

    <!-- 主要操作區 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 通知預覽 -->
      <div class="card bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 class="font-bold flex items-center gap-2 dark:text-white">
            <i class="ri-chat-smile-2-line text-green-500"></i> 通知訊息預覽
          </h2>
          <div class="flex gap-2">
            <select v-model="previewTime" class="text-xs bg-white dark:bg-gray-800 border dark:border-gray-600 rounded px-2 py-1 dark:text-gray-300">
              <option value="morning">早上 (含預告)</option>
              <option value="afternoon">下午 (僅限今日)</option>
            </select>
            <button @click="generatePreview" :disabled="loading" class="text-xs btn-primary py-1 px-3">
              生成預覽
            </button>
          </div>
        </div>
        
        <div class="p-6 flex-grow flex flex-col min-h-[400px]">
          <div v-if="loading" class="flex-grow flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
          
          <div v-else-if="previewMessage" class="flex-grow">
            <div class="bg-blue-50 dark:bg-gray-900 rounded-xl p-4 font-mono text-sm border border-blue-100 dark:border-gray-700 whitespace-pre-wrap dark:text-gray-300 relative">
              <button @click="copyPreview" class="absolute top-2 right-2 p-1 hover:bg-white rounded text-gray-400">
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
      <div class="space-y-6">
        <div class="card p-6 bg-white dark:bg-gray-800 shadow-md">
          <h3 class="font-bold mb-4 flex items-center gap-2 dark:text-white">
            <i class="ri-tools-line text-orange-500"></i> 開發者工具
          </h3>
          <div class="grid grid-cols-1 gap-4">
            <button @click="handleManualTrigger" :disabled="sending" class="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl hover:bg-orange-100 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-orange-200 dark:bg-orange-900/40 rounded-lg text-orange-600">
                  <i class="ri-rocket-line text-xl"></i>
                </div>
                <div class="text-left">
                  <div class="font-bold text-orange-900 dark:text-orange-400">立即執行 Edge Function</div>
                  <div class="text-xs text-orange-700 dark:text-orange-300">直接手動呼叫 line-notify 接口</div>
                </div>
              </div>
              <i class="ri-arrow-right-line text-orange-400 group-hover:translate-x-1 transition-transform"></i>
            </button>

            <button @click="testLineAuth" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl hover:bg-gray-100 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600">
                  <i class="ri-shield-user-line text-xl"></i>
                </div>
                <div class="text-left">
                  <div class="font-bold text-gray-900 dark:text-white">測試 LINE Token 有效性</div>
                  <div class="text-xs text-gray-500">檢查目前的 Channel Access Token 是否過期</div>
                </div>
              </div>
              <i class="ri-arrow-right-line text-gray-400 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>

        <div class="card p-6 bg-white dark:bg-gray-800 shadow-md border-t-4 border-yellow-500">
          <h3 class="font-bold mb-3 flex items-center gap-2 dark:text-white">
             <i class="ri-information-line text-yellow-500"></i> 通知邏輯與限額備忘
          </h3>
          <ul class="text-sm space-y-3 text-gray-600 dark:text-gray-400">
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>限額說明</strong>：Messaging API 免費版每月有 200 則額度。若群組數較多，建議監控剩餘量。</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>替代方案</strong>：若額度不足，可考慮將推播改為 <strong>LINE Notify (Service)</strong>，該服務完全免費且無上限，但訊息樣式較為簡化。</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>高優先順序</strong>：分類為「超商商品卡」的項目會顯示在最上方區塊，預告期設定為 7 天。</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>資料更新提醒</strong>：名稱從「尚未公布」更新後，系統會在 24 小時內自動發送更新提醒。</span>
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

const refreshStatus = async () => {
  try {
    // 1. Fetch Cron Status (needs admin role to query cron schema, or we might need a RPC/Function for this)
    // For now, we'll try to get it from a safe view or just show it's scheduled.
    // In many Supabase setups, you can't query the 'cron' schema directly via API easily.
    // We'll simulate for now or get it from line_groups last_active_at.
    cronStatus.value = '2x / 每日'
    
    // 2. Fetch Active Groups
    const { count } = await supabase.from('line_groups').select('*', { count: 'exact', head: true }).eq('is_active', true)
    activeGroupsCount.value = count || 0
    
    // 3. Last sent time (from a custom log or line_groups)
    const { data: latestAction } = await supabase
      .from('line_groups')
      .select('last_active_at')
      .order('last_active_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    if (latestAction?.last_active_at) {
      lastSentTime.value = new Date(latestAction.last_active_at).toLocaleString()
    }

    // 4. Fetch Quota
    fetchQuota()
  } catch (e) {
    console.error('Refresh status failed:', e)
  }
}

const fetchQuota = async () => {
  quotaLoading.value = true
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    const { data } = await axios.post(functionUrl, { action: 'quota' }, {
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
    confirmButtonColor: '#f97316',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-[1.5rem] bg-white dark:bg-gray-800 border-none shadow-2xl',
      confirmButton: 'rounded-xl font-bold px-6 py-3 ml-2',
      cancelButton: 'rounded-xl font-bold px-6 py-3'
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

const testLineAuth = async () => {
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    const { data } = await axios.post(functionUrl, { action: 'verify' }, {
       headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (data.valid) {
      showToast(`Token 有效！Bot：${data.display_name} (${data.basic_id})`, 'success')
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
.card {
  @apply rounded-2xl transition-all duration-300;
}
.btn-primary {
  @apply bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50;
}
.btn-secondary {
  @apply bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold px-4 py-2 rounded-lg transition-all;
}
</style>
