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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const statusMessage = ref('登入中...')
const error = ref(null)

const goToLogin = () => {
  router.push({ path: '/', query: { auth: 'login' } })
}

onMounted(async () => {
  try {
    // 等待 OAuth callback 處理完成
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw sessionError
    }

    if (!session) {
      // 檢查網址是否有 hash (通常包含 access_token)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.error('網址包含 token 但無法建立 session。這通常是因為 Anon Key 設定錯誤或無效。');
        throw new Error('登入驗證失敗：無法解析 Token。請檢查 Supabase Anon Key 設定。');
      }
      throw new Error('無法取得登入資訊 (Session 為空)')
    }

    statusMessage.value = '正在載入用戶資料...'

    // 取得用戶資料
    // 取得用戶資料
    // Ensure we query the correct table 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('取得用戶資料失敗:', profileError)
      throw new Error('無法載入用戶資料，請重新登入')
    }

    // Role check logic
    const isAdmin = profile?.role === 'admin'

    if (isAdmin) {
      statusMessage.value = '歡迎回來，管理員！'
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/admin/scraper')
    } else {
      statusMessage.value = '登入成功！'
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/gifts')
    }

  } catch (e) {
    console.error('處理登入回調失敗:', e)
    error.value = e.message || '登入過程發生錯誤'
    statusMessage.value = '登入失敗'
  }
})
</script>
