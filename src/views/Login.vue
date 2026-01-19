<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 relative overflow-hidden">
    <!-- Decorative Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Login Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/40">
        <div class="p-8 sm:p-10">
          <!-- Logo / Title -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-6 rotate-3 hover:rotate-6 transition-transform duration-300">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              股東會紀念品
            </h1>
            <p class="text-gray-500 text-sm font-medium tracking-wide uppercase">
              管理與追蹤您的投資收藏
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-xl animate-shake">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-semibold text-red-800">登入失敗</p>
                <p class="text-xs text-red-600 mt-1">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Google Login Button -->
          <button
            @click="handleGoogleLogin"
            :disabled="loading"
            class="w-full group relative flex items-center justify-center px-4 py-4 border-0 rounded-xl shadow-lg bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
           <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                <span class="text-base font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {{ loading ? '正在登入...' : '使用 Google 帳號登入' }}
                </span>
            </div>
          </button>

          <!-- Footer Info -->
          <div class="mt-8 text-center text-xs text-gray-400">
             登入即代表您同意服務條款<br>本網站僅供個人收藏管理使用
          </div>
        </div>
        
        <!-- Bottom Features Bar -->
        <div class="bg-gray-50/50 backdrop-blur-sm border-t border-gray-100 p-4 grid grid-cols-3 divide-x divide-gray-200">
             <div class="text-center px-2 flex flex-col items-center">
                 <div class="mb-1 text-indigo-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                 </div>
                 <div class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">最新紀念品</div>
             </div>
             <div class="text-center px-2 flex flex-col items-center">
                 <div class="mb-1 text-indigo-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </div>
                 <div class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">股東會提醒</div>
             </div>
             <div class="text-center px-2 flex flex-col items-center">
                 <div class="mb-1 text-indigo-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                 </div>
                 <div class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">收藏清單</div>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { signInWithGoogle, loading, error } = useAuth()
const { showToast } = useToast()

const handleGoogleLogin = async () => {
  error.value = null
  const { error: loginError } = await signInWithGoogle()
  
  if (loginError) {
    showToast('登入失敗: ' + loginError.message, 'error')
    console.error('登入錯誤:', loginError)
  }
}
</script>
