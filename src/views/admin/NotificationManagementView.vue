
<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <header class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">通知管理中心</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理與預覽 LINE 股東會紀念品提醒</p>
      </div>
      <div class="flex gap-3">
        <button @click="refreshStatus" class="btn-secondary flex items-center gap-2">
          <i class="ri-refresh-line"></i> 刷新狀態
        </button>
      </div>
    </header>

    <!-- 系統狀態卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-5 border-l-4 border-blue-500 bg-white dark:bg-gray-800 shadow-sm">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
            <i class="ri-time-line text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-700 dark:text-gray-300">自動發送排程</h3>
        </div>
        <p class="text-2xl font-bold dark:text-white">{{ cronStatus }}</p>
        <p class="text-xs text-gray-500 mt-1">透過 Supabase pg_cron 執行</p>
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
             <i class="ri-information-line text-yellow-500"></i> 通知邏輯備忘錄
          </h3>
          <ul class="text-sm space-y-3 text-gray-600 dark:text-gray-400">
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>高優先順序</strong>：分類為「超商商品卡」的項目會顯示在最上方區塊，預告期設定為 7 天。</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>重複性優化</strong>：早上 9 點發送今日資料與預告；下午 1 點只會補發「今日截止」的催促訊息。</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>資料更新提醒</strong>：若商品名稱從「尚未公布」更新為具體內容，系統會在 24 小時內自動發送更新提醒。</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-600 font-bold">•</span>
              <span><strong>資料抓取</strong>：目前的預告範圍標準化為未來 7 天，並根據截止熱度分群顯示。</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import { onMounted, ref } from 'vue'

const { showToast } = useToast()
const loading = ref(false)
const sending = ref(false)
const previewMessage = ref('')
const previewTime = ref('morning')
const cronStatus = ref('讀取中...')
const lastSentTime = ref('')
const activeGroupsCount = ref(0)

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
  } catch (e) {
    console.error('Refresh status failed:', e)
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
  if (!confirm('確定要立即對所有 LINE 群組執行真實推播嗎？')) return
  
  sending.value = true
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-notify`
    await axios.post(functionUrl, {}, {
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
      const expiryDays = Math.floor(data.expires_in / (24 * 3600))
      showToast(`Token 有效！剩餘：${expiryDays} 天 (${data.scope})`, 'success')
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
