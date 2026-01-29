<template>
  <div class="min-h-screen bg-gray-50 relative overflow-hidden">
    <!-- Animated Background Mesh -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[100px] animate-blob">
      </div>
      <div
        class="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] animate-blob animation-delay-2000">
      </div>
      <div
        class="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[100px] animate-blob animation-delay-4000">
      </div>
    </div>

    <Navbar class="relative z-10" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <!-- Breadcrumb / Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <nav class="flex mb-2" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/admin/panel"
                  class="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                  主控台
                </router-link>
              </li>
              <li>
                <span class="text-gray-300">/</span>
              </li>
              <li>
                <span class="text-indigo-600 font-medium text-sm">資料匯入</span>
              </li>
            </ol>
          </nav>
          <h1
            class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
            匯入歷史資料
          </h1>
          <p class="text-lg text-gray-500 font-light mt-1">從數據中發現洞察</p>
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
  </div>
</template>

<script setup>
import AdminImportPanel from '@/components/AdminImportPanel.vue';
import Navbar from '@/components/Navbar.vue';
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
