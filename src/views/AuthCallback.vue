<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="text-center">
      <!-- Loading Spinner -->
      <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
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
        <button @click="goToLogin" class="mt-3 text-sm text-red-600 hover:text-red-800 underline">
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
    console.log('Auth callback triggered')
    console.log('Current URL:', window.location.href)
    console.log('Hash:', window.location.hash)

    statusMessage.value = '處理登入資訊...'

    // IMPORTANT: For hash-based OAuth flow, we need to let Supabase parse the hash first
    // This happens automatically if detectSessionInUrl is true, but we need to wait

    // Give Supabase client time to process the hash
    await new Promise(resolve => setTimeout(resolve, 500))

    // Now get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log('Session after hash processing:', session)
    console.log('Session error:', sessionError)

    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }

    if (!session) {
      // If still no session, check if we have hash params
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.error('Hash contains token but no session created')
        // Try to manually trigger session from hash
        await supabase.auth.refreshSession()
        const { data: retryData } = await supabase.auth.getSession()

        if (!retryData.session) {
          throw new Error('登入驗證失敗：無法建立 Session。請清除瀏覽器快取後重試。')
        }
      } else {
        throw new Error('未偵測到登入狀態，請重新嘗試')
      }
    }

    statusMessage.value = '正在載入用戶資料...'

    // Refresh session data to ensure we have the latest
    const { data: { session: currentSession } } = await supabase.auth.getSession()

    if (!currentSession) {
      throw new Error('Session 已過期')
    }

    // Get Profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentSession.user.id)
      .maybeSingle()

    if (profileError) {
      console.warn('Profile fetch error:', profileError)
    }

    const isAdmin = profile?.role === 'admin'

    // Determine redirect target
    const routeNode = router.currentRoute.value
    let nextPath = routeNode.query.next

    if (!nextPath) {
      nextPath = isAdmin ? '/admin/panel' : '/gifts'
    }

    statusMessage.value = `登入成功！即將前往 ${isAdmin ? '管理後台' : '首頁'}...`

    // Slight delay for user feedback
    await new Promise(resolve => setTimeout(resolve, 800))

    console.log('Redirecting to:', nextPath)

    // Clean up the URL hash before redirecting
    window.history.replaceState({}, document.title, window.location.pathname)

    router.replace(nextPath)

  } catch (e) {
    console.error('處理登入回調失敗:', e)
    error.value = e.message || '登入過程發生未知錯誤'
    statusMessage.value = '登入失敗'
  }
})
</script>
