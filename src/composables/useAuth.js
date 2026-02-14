import { supabase } from '@/lib/supabase'
import { computed, ref } from 'vue'

const user = ref(null)
const profile = ref(null)
const loading = ref(false)
const error = ref(null)
let initAuthPromise = null

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
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
      const callbackUrl = `${siteUrl}${import.meta.env.BASE_URL.replace(/\/$/, '')}/auth/callback`

      console.log('Initiating Google OAuth redirect to:', callbackUrl)

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            next: encodeURIComponent(redirectPath)
          }
        },
      })

      if (signInError) throw signInError

      return { data, error: null }
    } catch (e) {
      console.error('[Auth] Google Login Exception:', e)
      error.value = e.message || 'Login failed'
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
        .select('*, id, email, full_name, nickname, avatar_url, role, legacy_names')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) throw fetchError

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
  const initAuth = () => {
    if (initAuthPromise) return initAuthPromise

    initAuthPromise = (async () => {
      loading.value = true
      console.log('[Auth] Initializing authentication state...')
      try {
        // 取得當前 session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.warn('[Auth] Session retrieval warning:', sessionError.message)
          // Don't throw here, allow the app to load in guest mode
        }

        if (session?.user) {
          console.log('[Auth] Active session found for user:', session.user.id)
          user.value = session.user
          await fetchProfile(session.user.id)
        } else {
          console.log('[Auth] No active session found.')
        }

        // 監聽認證狀態變化
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`[Auth] Auth state changed: ${event}`, session?.user?.id || 'no-user')

          if (session?.user) {
            // 避免重複 fetch 同一用戶的 profile
            if (user.value?.id !== session.user.id) {
              user.value = session.user
              await fetchProfile(session.user.id)
            }
          } else {
            user.value = null
            profile.value = null
          }
        })
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('[Auth] Initialization critical error:', e)
          error.value = e.message
        }
      } finally {
        loading.value = false
      }
    })()

    return initAuthPromise
  }

  /**
   * 重新載入用戶資料
   */
  const refreshProfile = async () => {
    if (user.value?.id) {
      await fetchProfile(user.value.id)
    }
  }

  /**
   * 更新用戶資料
   * @param {Object} updates - { full_name, nickname }
   */
  const updateProfile = async (updates) => {
    if (!user.value?.id) return { error: new Error('User not authenticated') }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      if (data) {
        // Preserve virtual properties like is_admin
        const isAdminVal = profile.value?.is_admin
        profile.value = {
          ...data,
          is_admin: isAdminVal // Keep is_admin flag
        }
      }

      return { data, error: null }
    } catch (e) {
      console.error('更新用戶資料失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
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
    updateProfile,
    _resetAuth: () => { initAuthPromise = null } // For testing
  }
}
