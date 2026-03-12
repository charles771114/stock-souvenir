<template>
  <footer class="mt-32 pb-16 relative z-10 overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute inset-0 -z-10 opacity-30">
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-200/20 blur-[100px] rounded-full"></div>
      <div class="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-200/20 blur-[80px] rounded-full"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Decorative Line -->
      <div class="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-16 opacity-60"></div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start lg:items-center">
        <!-- Logo & Brand Section -->
        <div class="flex flex-col items-center lg:items-start group/brand order-1">
          <div class="flex items-center gap-4 cursor-default">
            <div class="h-11 w-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-200 group-hover/brand:rotate-[15deg] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
               <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 tracking-tighter uppercase leading-none">
                股東會紀念品
              </span>
            </div>
          </div>
        </div>

        <!-- Links Section - RWD Optimized -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1 p-1 bg-slate-100/50 rounded-[1.5rem] border border-slate-200/30 backdrop-blur-xl order-3 lg:order-2 w-full sm:w-auto mx-auto lg:mx-0">
          <router-link to="/gifts" 
            class="w-full sm:w-auto px-6 py-3.5 text-[13px] font-black text-slate-500 hover:text-indigo-600 hover:bg-white rounded-[1rem] transition-all uppercase tracking-widest text-center shadow-sm shadow-transparent hover:shadow-indigo-100/50 active:scale-95">
            紀念品目錄
          </router-link>
          <router-link to="/my-collections" 
            class="w-full sm:w-auto px-6 py-3.5 text-[13px] font-black text-slate-500 hover:text-indigo-600 hover:bg-white rounded-[1rem] transition-all uppercase tracking-widest text-center shadow-sm shadow-transparent hover:shadow-indigo-100/50 active:scale-95">
            購股計畫
          </router-link>
          <router-link to="/inventory" 
            class="w-full sm:w-auto px-6 py-3.5 text-[13px] font-black text-slate-500 hover:text-indigo-600 hover:bg-white rounded-[1rem] transition-all uppercase tracking-widest text-center shadow-sm shadow-transparent hover:shadow-indigo-100/50 active:scale-95">
            庫存管理
          </router-link>
        </div>

        <!-- Meta Section -->
        <div class="flex flex-col items-center lg:items-end gap-4 order-2 lg:order-3">
          <div class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            <div class="text-[13px] font-black text-slate-500 uppercase tracking-widest opacity-90">
              &copy; {{ new Date().getFullYear() }} Antigravity
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
/**
 * SiteFooter Component
 * Premium, RWD-friendly footer for Stock Souvenir
 */
</script>

<style scoped>
/* Smooth spring transition for logo rotation */
.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
