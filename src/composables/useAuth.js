import { supabase } from '@/lib/supabase'
import { computed, ref } from 'vue'

const user = ref(null)
const profile = ref(null)
const loading = ref(false)
const error = ref(null)

export function useAuth() {
  const isAdmin = computed(() => profile.value?.is_admin || false)
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Google OAuth 登入
   */
  /**
   * Google OAuth 登入
   * @param {string} redirectPath - 登入後要導向的內部路徑 (預設 /)
   */
  const signInWithGoogle = async (redirectPath = '/') => {
    loading.value = true
    error.value = null

    try {
      // 1. 動態建構 Callback URL
      // 優先使用環境變數 (適合正式環境固定網址)，否則使用當前 Origin (適合預覽/開發)
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
      const callbackUrl = `${siteUrl}${import.meta.env.BASE_URL}auth/callback`
      
      console.log('Initiating Google Login with callback:', callbackUrl)

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          // 將目標路徑存在 query params 中，讓 Callback 頁面讀取
          queryParams: {
            next: redirectPath
          }
        },
      })

      if (signInError) throw signInError

      return { data, error: null }
    } catch (e) {
      console.error('登入失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  const signOut = async () => {
    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      profile.value = null

      return { error: null }
    } catch (e) {
      console.error('登出失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得用戶資料（含 is_admin）
   */
  const fetchProfile = async (userId) => {
    if (!userId) return { data: null, error: new Error('User ID is required') }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to avoid 406 error if row doesn't exist

      if (fetchError) throw fetchError

      if (!data) {
        console.warn(`Profile not found for user ${userId}`)
        // Handle missing profile case gracefully, maybe return null or default structure
      }

      // Map profiles structure to expected useAuth structure if needed
      // Currently, isAdmin computed property uses profile.value.is_admin
      // In new schema, we have 'role' column ('admin' or 'user').
      // So we attach a virtual is_admin property for compatibility.
      if (data) {
        data.is_admin = data.role === 'admin'
      }

      profile.value = data
      return { data, error: null }
    } catch (e) {
      console.error('取得用戶資料失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 初始化認證狀態
   */
  const initAuth = async () => {
    loading.value = true

    try {
      // 取得當前 session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      }

      // 監聽認證狀態變化
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)

        if (session?.user) {
          user.value = session.user
          await fetchProfile(session.user.id)
        } else {
          user.value = null
          profile.value = null
        }
      })
    } catch (e) {
      console.error('初始化認證失敗:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * 重新載入用戶資料
   */
  const refreshProfile = async () => {
    if (user.value?.id) {
      await fetchProfile(user.value.id)
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    isAdmin,
    isAuthenticated,
    signInWithGoogle,
    signOut,
    fetchProfile,
    initAuth,
    refreshProfile,
  }
}
