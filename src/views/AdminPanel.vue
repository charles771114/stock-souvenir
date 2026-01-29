<template>
  <div class="min-h-screen bg-[#fafafa] flex flex-col">
    <Navbar />

    <main class="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <!-- Header -->
      <div class="w-full text-center mb-16 animate-fade-in-up">
        <div
          class="inline-flex items-center justify-center p-1 rounded-3xl bg-indigo-50/50 backdrop-blur-xl border border-indigo-100/50 mb-6 shadow-sm">
          <div class="px-4 py-1.5 rounded-2xl bg-white shadow-sm">
            <span class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">後台管理系統</span>
          </div>
        </div>
        <h1
          class="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter mb-4">
          管理者控制台
        </h1>
        <p class="text-slate-400 font-bold text-sm sm:text-base uppercase tracking-wider max-w-2xl mx-auto">
          系統核心管理、數據監控與自動化排程中心
        </p>
      </div>

      <!-- Quick Stats / Overview Tabs (Optional simplified design) -->
      <!-- We skip heavy stats for now and focus on the grid as requested by user -->

      <!-- Navigation Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full animate-fade-in-up delay-100">

        <!-- 01. 分類中心 -->
        <router-link to="/admin/classification" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-purple">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">數據處理</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors duration-300">#01</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">分類中心</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">紀念品分類、關鍵字過濾與人工審核</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 02. 用戶管理 -->
        <router-link to="/admin/users" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-green">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">用戶生態</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#02</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">用戶管理</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">檢視用戶列表、權限設定與收藏統計</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 03. 庫存管理 -->
        <router-link to="/admin/inventory" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-indigo">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">持股管理</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#03</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">庫存管理</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">管理使用者持有項目，修正錯誤記錄</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 04. 庫存匯入 -->
        <router-link to="/admin/import/inventory" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-amber">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">批次匯入</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#04</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">庫存匯入</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">批次上傳年度庫存檔案並進行歸戶</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 05. 歸戶管理 -->
        <router-link to="/admin/staging" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-blue">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">歸戶佇列</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#05</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">歸戶管理</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">處理待歸戶清單，連結用戶與庫存</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 06. 收藏熱度 -->
        <router-link to="/admin/favorites" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-pink">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">數據統計</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#06</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">收藏熱度</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">全站紀念品收藏熱門程度與趨勢分析</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 07. 紀念品資料 -->
        <router-link to="/admin/souvenirs" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-cyan">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">主資料庫</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#07</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">紀念品資料
              </h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">手動維護、編輯各年度紀念品基礎資料</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 08. 爬蟲管理 -->
        <router-link to="/admin/scraper" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-slate">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">自動化管理</span>
                <span
                  class="text-xs font-black text-indigo-100 group-hover:text-indigo-600 transition-colors">#08</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">爬蟲管理</h3>
              <p class="text-xs text-slate-400 font-medium leading-relaxed">資料抓取、更新狀態與排程執行紀錄</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue';
</script>

<style scoped>
.admin-card {
  @apply relative block w-full p-px bg-white border border-slate-100 rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100;
}

.admin-card-inner {
  @apply bg-white rounded-[1.95rem] p-6 sm:p-7 flex items-start gap-5 sm:gap-6;
}

.card-icon {
  @apply w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:shadow-indigo-100;
}

.card-icon-purple {
  @apply bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white;
}

.card-icon-green {
  @apply bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white;
}

.card-icon-indigo {
  @apply bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white;
}

.card-icon-amber {
  @apply bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white;
}

.card-icon-blue {
  @apply bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white;
}

.card-icon-pink {
  @apply bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white;
}

.card-icon-cyan {
  @apply bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white;
}

.card-icon-slate {
  @apply bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white;
}

.card-arrow {
  @apply flex-shrink-0 w-8 h-8 rounded-full border border-slate-50 flex items-center justify-center text-slate-200 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300 self-center hidden sm:flex;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}
</style>
