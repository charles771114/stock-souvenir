<template>
  <div class="line-binding-card bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="flex items-center space-x-4 mb-4">
      <div class="p-3 rounded-full bg-green-100 text-green-600">
        <!-- LINE Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.3.079.766.038 1.063-.083.619-.302 2.228-.302 2.228s-.133.782.472.964c.606.181 3.259-1.928 4.544-3.305 2.502-2.676 3.076-4.544 3.076-4.544a8.627 8.627 0 0 0 .041-.115c3.079-1.636 5.038-4.14 5.038-6.491z"/>
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">LINE 通知綁定</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">綁定後可接收股東會紀念品領取通知</p>
      </div>
    </div>

    <div v-if="bindingStatus === 'bound'" class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
      <p class="text-green-600 dark:text-green-400 font-medium">已成功綁定 LINE 帳號 ✅</p>
      <button 
        @click="unlinkLine"
        class="mt-2 text-sm text-red-500 hover:text-red-700 underline"
      >
        解除綁定
      </button>
    </div>

    <div v-else class="space-y-4">
      <div v-if="!bindingCode" class="text-center">
        <button 
          @click="generateCode" 
          :disabled="loading"
          class="bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2 px-6 rounded-full transition duration-300 disabled:opacity-50"
        >
          {{ loading ? '產生中...' : '產生綁定碼' }}
        </button>
      </div>

      <div v-else class="text-center space-y-4 animate-fade-in">
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg inline-block">
          <p class="text-sm text-gray-500 mb-1">您的綁定碼 (10分鐘內有效)</p>
          <p class="text-4xl font-mono font-bold tracking-wider text-gray-900 dark:text-white">{{ bindingCode }}</p>
        </div>
        
        <div class="text-sm text-gray-600 dark:text-gray-300">
          <p>請對 <span class="font-bold text-[#06C755]">股東會紀念品小幫手</span> 輸入此代碼</p>
        </div>

        <!-- 這裡可以放 QR Code 圖片連結 -->
        <a 
          href="https://line.me/R/ti/p/@YOUR_BOT_ID" 
          target="_blank"
          class="inline-flex items-center text-[#06C755] hover:underline"
        >
          <span>加入好友並輸入</span>
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const loading = ref(false)
const bindingCode = ref('')
const bindingStatus = ref('unbound') // 'unbound' | 'bound'

onMounted(() => {
  checkBindingStatus()
})

async function checkBindingStatus() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('user_bindings')
    .select('line_user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (data?.line_user_id) {
    bindingStatus.value = 'bound'
  }
}

async function generateCode() {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 產生 6 位數隨機碼
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 寫入 user_bindings (upsert)
    const { error } = await supabase
      .from('user_bindings')
      .upsert({ 
        user_id: user.id,
        binding_code: code,
        updated_at: new Date()
      }, { onConflict: 'user_id' })

    if (error) throw error

    bindingCode.value = code

    // 開始輪詢檢查是否綁定成功
    pollBindingStatus()

  } catch (error) {
    console.error('Error generating code:', error)
    alert('無法產生綁定碼，請稍後再試')
  } finally {
    loading.value = false
  }
}

let pollInterval
function pollBindingStatus() {
  if (pollInterval) clearInterval(pollInterval)
  
  pollInterval = setInterval(async () => {
    await checkBindingStatus()
    if (bindingStatus.value === 'bound') {
      clearInterval(pollInterval)
      bindingCode.value = '' // 清除畫面上的代碼
    }
  }, 3000) // 每 3 秒檢查一次
}

async function unlinkLine() {
  if (!confirm('確定要解除 LINE 綁定嗎？您將無法接收通知。')) return

  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('user_bindings')
    .update({ line_user_id: null })
    .eq('user_id', user.id)

  if (!error) {
    bindingStatus.value = 'unbound'
  }
}
</script>
