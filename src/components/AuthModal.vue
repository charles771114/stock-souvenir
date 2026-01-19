<template>
  <transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" @click="closeAuthModal"></div>

      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md w-full">
            <!-- Close Button -->
            <button class="absolute top-3 right-3 z-[60] text-gray-400 hover:text-gray-600 bg-white/50 rounded-full p-1" @click="closeAuthModal">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <!-- Login Content (Adapted from Login.vue but simplified for modal) -->
            <div class="relative overflow-hidden">
               <!-- Decorative Header Background -->
               <div class="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                   <div class="absolute top-[-20px] left-[-20px] w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
                   <div class="absolute bottom-[-10px] right-[-10px] w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
               </div>

                <div class="relative px-8 pt-0 pb-8">
                     <!-- Logo Icon -->
                    <div class="flex justify-center -mt-10 mb-6">
                        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg rotate-3 hover:rotate-6 transition-transform duration-300">
                            <svg class="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                    </div>

                    <div class="text-center mb-8">
                         <h2 class="text-2xl font-bold text-gray-900 mb-1">歡迎回來</h2>
                         <p class="text-sm text-gray-500">登入以收藏紀念品並追蹤股東會資訊</p>
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                         <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                           <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                         </svg>
                         <div class="text-left">
                           <p class="text-sm font-semibold text-red-800">登入失敗</p>
                           <p class="text-xs text-red-600 mt-1">{{ error }}</p>
                         </div>
                    </div>

                    <button
                        @click="handleGoogleLogin"
                        :disabled="loading"
                        class="w-full group relative flex items-center justify-center px-4 py-3.5 border-2 border-gray-100 rounded-xl bg-white hover:bg-gray-50 hover:border-indigo-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <div class="relative flex items-center">
                            <svg v-if="!loading" class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <svg v-else class="animate-spin h-5 w-5 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span class="text-sm font-bold text-gray-700">
                                {{ loading ? '正在連接 Google...' : '使用 Google 帳號登入' }}
                            </span>
                        </div>
                    </button>
                    
                    <div class="mt-6 text-center text-[10px] text-gray-400">
                        繼續即代表您同意服務條款<br>僅供個人收藏使用
                    </div>
                </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useToast } from '@/composables/useToast'

const { isOpen, closeAuthModal } = useAuthModal()
const { signInWithGoogle, loading, error } = useAuth()
const { showToast } = useToast()

const handleGoogleLogin = async () => {
    error.value = null
    const { error: loginError } = await signInWithGoogle()
    
    if (loginError) {
        showToast('登入失敗: ' + loginError.message, 'error')
    } else {
        // Normally redirects, but if it doesn't immediately
        // closeAuthModal() 
    }
}
</script>
