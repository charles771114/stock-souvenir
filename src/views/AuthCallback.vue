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
    statusMessage.value = '處理登入資訊...'
    console.log('[AuthCallback] Processing OAuth response...')

    // Helper for retrying session retrieval
    const getSessionWithRetry = async (retries = 3, delay = 800) => {
      for (let i = 0; i < retries; i++) {
        console.log(`[AuthCallback] Session attempt ${i + 1}/${retries}...`)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (session) return session
        if (error) {
          console.warn(`[AuthCallback] Attempt ${i + 1} failed:`, error.message)
        }

        // Check if hash contains tokens even if getSession didn't find them yet
        if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
          console.log('[AuthCallback] Hash detected, forcing refresh...')
          await supabase.auth.refreshSession()
        }

        await new Promise(resolve => setTimeout(resolve, delay))
      }
      return null
    }

    const session = await getSessionWithRetry()

    if (!session) {
      // Check for error in hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const errorDescription = hashParams.get('error_description')
      if (errorDescription) {
        throw new Error(`登入失敗：${errorDescription}`)
      }
      throw new Error('登入驗證失敗：無法建立 Session。請嘗試重新登入。')
    }

    statusMessage.value = '正在載入用戶資料...'
    console.log('[AuthCallback] Session established for:', session.user.id)

    // Get Profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profileError) {
      console.warn('[AuthCallback] Profile fetch error:', profileError)
    }

    const isAdmin = profile?.role === 'admin'

    // Determine redirect target
    const routeNode = router.currentRoute.value
    let nextPath = routeNode.query.next

    // Handle potential double encoding or empty paths
    if (nextPath) {
      try {
        nextPath = decodeURIComponent(nextPath)
      } catch (e) {
        console.warn('[AuthCallback] Failed to decode next path:', nextPath)
      }
    }

    if (!nextPath || nextPath === 'null' || nextPath === 'undefined') {
      nextPath = isAdmin ? '/admin/panel' : '/gifts'
    }

    statusMessage.value = `登入成功！即將前往 ${isAdmin ? '管理後台' : '首頁'}...`

    // Clean up the URL hash before redirecting to avoid re-triggering logic if user hits 'back'
    window.history.replaceState({}, document.title, window.location.pathname)

    // Final short delay for UX
    setTimeout(() => {
      console.log('[AuthCallback] Redirecting to:', nextPath)
      router.replace(nextPath)
    }, 500)

  } catch (e) {
    console.error('[AuthCallback] Critical Error:', e)
    error.value = e.message || '登入過程發生未知錯誤'
    statusMessage.value = '登入失敗'
  }
})
</script>
