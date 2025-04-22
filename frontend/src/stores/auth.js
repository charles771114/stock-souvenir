import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, provider } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const allowEmails = ['charles771114@gmail.com', 'you@example.com']

  const login = async () => {
    const result = await signInWithPopup(auth, provider)
    if (allowEmails.includes(result.user.email)) {
      user.value = result.user
    } else {
      await signOut(auth)
      alert('你沒有使用權限')
    }
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
  }

  const initAuth = () => {
    onAuthStateChanged(auth, u => {
      if (u && allowEmails.includes(u.email)) {
        user.value = u
      } else {
        user.value = null
      }
    })
  }

  return { user, login, logout, initAuth }
})
