<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4 relative overflow-hidden">
    <!-- Subtle Background Pattern -->
    <div class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
      <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
    </div>

    <div class="max-w-md w-full relative z-10 animate-fade-in-up">
      <!-- Login Card -->
      <div class="glass-card shadow-2xl overflow-hidden border border-white/60">
        <div class="p-8 sm:p-12">
          <!-- Logo / Title -->
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-brand-primary rounded-[2rem] shadow-xl shadow-amber-200 mb-8 rotate-3 hover:rotate-0 transition-all duration-500 group">
              <i class="fas fa-gift text-4xl text-white group-hover:scale-110 transition-transform"></i>
            </div>
            <h1 class="text-3xl font-black text-slate-800 mb-3 tracking-tighter">
              股東會紀念品
            </h1>
            <p class="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">
              專業投資者的收藏管理平台
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-8 p-4 bg-status-error/5 border border-status-error/20 rounded-2xl animate-shake">
            <div class="flex items-start gap-3">
              <i class="fas fa-exclamation-circle text-status-error mt-1 shrink-0"></i>
              <div>
                <p class="text-[10px] font-black text-status-error uppercase tracking-widest">登入失敗</p>
                <p class="text-xs text-slate-600 mt-1 font-bold">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Google Login Button -->
          <button
            @click="handleGoogleLogin"
            :disabled="loading"
            class="w-full group relative flex items-center justify-center px-4 py-5 bg-white rounded-2xl shadow-lg border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div class="relative flex items-center">
                <svg v-if="!loading" class="w-5 h-5 mr-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div v-else class="mr-4">
                  <div class="w-5 h-5 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
                </div>
                <span class="text-sm font-black text-slate-700 uppercase tracking-widest">
                    {{ loading ? '系統驗證中...' : '使用 Google 帳號登入' }}
                </span>
            </div>
          </button>

          <!-- Footer Info -->
          <div class="mt-10 text-center">
             <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
               登入即代表您同意服務條款<br>本網站僅供個人收藏管理使用
             </p>
          </div>
        </div>
        
        <!-- Bottom Features Bar -->
        <div class="bg-slate-50/50 backdrop-blur-md border-t border-slate-100 p-6 grid grid-cols-3 divide-x divide-slate-100">
             <div class="text-center px-2 flex flex-col items-center group cursor-default">
                 <div class="mb-2 text-slate-300 group-hover:text-brand-primary transition-colors">
                    <i class="fas fa-cubes text-lg"></i>
                 </div>
                 <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">最新紀念品</div>
             </div>
             <div class="text-center px-2 flex flex-col items-center group cursor-default">
                 <div class="mb-2 text-slate-300 group-hover:text-brand-primary transition-colors">
                    <i class="fas fa-bell text-lg"></i>
                 </div>
                 <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">股東會提醒</div>
             </div>
             <div class="text-center px-2 flex flex-col items-center group cursor-default">
                 <div class="mb-2 text-slate-300 group-hover:text-brand-primary transition-colors">
                    <i class="fas fa-heart text-lg"></i>
                 </div>
                 <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">收藏清單</div>
                 <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest">收藏清單</div>
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
