import { supabase } from '@/lib/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const allowEmails = ['charles771114@gmail.com', 'you@example.com']

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      console.error('Login failed:', error)
      alert('登入失敗: ' + error.message)
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout failed:', error)
    } else {
      user.value = null
    }
  }

  const initAuth = async () => {
    // 1. Check current session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user && allowEmails.includes(session.user.email)) {
      user.value = session.user
    }

    // 2. Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && allowEmails.includes(session.user.email)) {
        user.value = session.user
      } else {
        user.value = null
        if (session?.user && !allowEmails.includes(session.user.email)) {
          // Optional: aggressive logout if not allowed
          supabase.auth.signOut()
          alert('你沒有使用權限')
        }
      }
    })
  }

  return { user, login, logout, initAuth }
})
