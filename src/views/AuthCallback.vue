<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="text-center">
      <!-- Loading Spinner -->
      <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {{ statusMessage }}
      </h2>
      <p class="text-gray-600">
        請稍候...
      </p>

      <!-- Error Message -->
      <div v-if="error" class="mt-6 max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button
          @click="goToLogin"
          class="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          返回登入頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const statusMessage = ref('登入中...')
const error = ref(null)

const goToLogin = () => {
  router.push({ path: '/', query: { auth: 'login' } })
}

onMounted(async () => {
  try {
    // 1. 等待 Supabase 處理 URLHash (pkce flow) 並建立 Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) throw sessionError

    if (!session) {
      // 容錯處理：有時候 Hash 處理需要一點時間，或是瀏覽器重整導致 Hash 消失
       if (window.location.hash && window.location.hash.includes('access_token')) {
        console.error('有 Token 但無 Session -> 可能是 Anon Key 問題或 PKCE 驗證失敗')
        throw new Error('登入驗證失敗 (Token 無法交換 Session)')
      }
      // 若真的沒有 Session，導回登入頁
      throw new Error('未偵測到登入狀態，請重新嘗試')
    }

    statusMessage.value = '正在載入用戶資料...'

    // 2. 取得 Profile 以判斷角色
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
    
    // 若 Profile 不存在 (理論上 trigger 會建立，但以防萬一)
    // 這裡不拋出錯誤，而是視為普通用戶繼續，避免卡死
    if (profileError) {
      console.warn('Profile fetch error:', profileError)
    }

    const isAdmin = profile?.role === 'admin'

    // 3. 決定跳轉目標
    // 優先讀取登入時傳入的 `next` 參數
    const routeNode = router.currentRoute.value
    // 注意：Supabase OAuth queryParams 會附加在 URL 上
    // 但因為是 Hash 模式或 History 模式混用，要在 query 中找 'next'
    // 實際上 supabase 會把 queryParams 帶回 redirect URL 的 query string
    
    // 嘗試從 query 取得 next
    let nextPath = routeNode.query.next 
    
    // 如果沒有，依角色決定預設路徑
    if (!nextPath) {
        nextPath = isAdmin ? '/admin/scraper' : '/gifts'
    }

    statusMessage.value = `登入成功！即將前往 ${isAdmin ? '管理後台' : '首頁'}...`
    
    // 稍微延遲讓用戶看到成功訊息
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('Redirecting to:', nextPath)
    router.replace(nextPath)

  } catch (e) {
    console.error('處理登入回調失敗:', e)
    error.value = e.message || '登入過程發生未知錯誤'
    statusMessage.value = '登入失敗'
  }
})
</script>
