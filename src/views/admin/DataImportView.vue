<template>
  <div class="min-h-screen bg-surface-50 relative overflow-hidden">
    <!-- Animated Background Mesh -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-100 rounded-full blur-[100px] animate-blob">
      </div>
      <div
        class="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-50 rounded-full blur-[100px] animate-blob animation-delay-2000">
      </div>
      <div
        class="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-slate-200/50 rounded-full blur-[100px] animate-blob animation-delay-4000">
      </div>
    </div>

    <Navbar class="relative z-10" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <!-- Breadcrumb / Header -->
      <div class="header-content animate-fade-in">
          <nav class="flex mb-4" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/admin/panel"
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-all">
                  主控台
                </router-link>
              </li>
              <li>
                <svg class="h-4 w-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </li>
              <li>
                <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest">資料匯入</span>
              </li>
            </ol>
          </nav>
          <h1
            class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            匯入歷史資料
          </h1>
          <p class="text-slate-400 font-bold text-sm uppercase tracking-wider">從外部數據中同步紀念品與庫存資訊</p>
        </div>

        <!-- Action Button (Optional, maybe specific to import) -->
        <div class="mt-4 md:mt-0">
          <div class="inline-flex rounded-lg shadow-sm bg-white/50 backdrop-blur-sm p-1 border border-gray-200/50">
            <span class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-widest">
              支援格式: CSV, Excel
            </span>
          </div>
        </div>
      </div>

      <!-- Main Panel (Glass Effect handled inside AdminImportPanel if needed, or wrapper here) -->
      <!-- We wrap AdminImportPanel to control its glass effect from outside or pass a prop if necessary. 
           Actually, AdminImportPanel has its own bg-white style. We sort of want to override it or wrap it.
           Let's wrap it in a div that might eventually support glass styles, but AdminImportPanel itself creates the card. 
           We will trust AdminImportPanel's internal styling for now but the surrounding page is now 'Pro Max'. 
      -->
      <AdminImportPanel />
    </div>
  </template>

<script setup>
import AdminImportPanel from '@/components/AdminImportPanel.vue';
import Navbar from '@/components/Navbar.vue';
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 10s infinite alternate;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
