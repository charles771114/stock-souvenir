<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-grow flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <!-- Header -->
      <div class="w-full text-center mb-16 animate-fade-in-up">
        <div
          class="inline-flex items-center justify-center p-1 rounded-3xl bg-amber-50 backdrop-blur-xl border border-amber-100 mb-6 shadow-inner">
          <div class="px-6 py-1.5 rounded-2xl bg-white shadow-sm border border-slate-100">
            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">後台管理系統 / MANAGEMENT</span>
          </div>
        </div>
        <h1
          class="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-4">
          管理者控制台
        </h1>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest max-w-2xl mx-auto">
          系統核心管理、數據監控與自動化排程中心
        </p>
      </div>

      <!-- Quick Stats / Overview Tabs (Optional simplified design) -->
      <!-- We skip heavy stats for now and focus on the grid as requested by user -->

      <!-- Navigation Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full animate-fade-in-up delay-100">

        <!-- 01. 分類中心 -->
        <router-link to="/admin/classification" aria-label="分類中心: 紀念品分類、關鍵字過濾與人工審核" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-purple">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">數據處理</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors duration-300">#01</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">分類中心</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">紀念品分類、關鍵字過濾與人工審核</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 02. 用戶管理 -->
        <router-link to="/admin/users" aria-label="用戶管理: 檢視用戶列表、權限設定與收藏統計" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-green">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">用戶生態</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#02</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">用戶管理</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">檢視用戶列表、權限設定與收藏統計</p>
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
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">持股管理</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#03</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">庫存管理</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">管理使用者持有項目，修正錯誤記錄</p>
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
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">批次匯入</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#04</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">庫存匯入</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">批次上傳年度庫存檔案並進行歸戶</p>
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
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">歸戶佇列</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#05</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">歸戶管理</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">處理待歸戶清單，連結用戶與庫存</p>
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
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">數據統計</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#06</span>
              </div>
                <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">入袋持股統計</h3>
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">全站紀念品入袋持股統計與分析</p>
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
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">主資料庫</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#07</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">紀念品資料
              </h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">手動維護、編輯各年度紀念品基礎資料</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 08. 股代爬蟲 (Gooddie) -->
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
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">自動化</span>
                <span
                  class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#08</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">股代爬蟲</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">Gooddie 自動爬蟲執行紀錄與控制</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 09. LINE 群組管理 -->
        <router-link to="/admin/line-groups" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-green">
              <!-- LINE Icon Custom SVG -->
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.8 1.5 5.25 3.85 6.85-.15.95-.55 2.5-1.35 3.55 1.65-.2 4.15-.95 5.5-1.95.65.1 1.35.15 2 .15 5.52 0 10-3.92 10-8.75S17.52 2 12 2zm0 15c-4.41 0-8-3.13-8-7s3.59-7 8-7 8 3.13 8 7-3.59 7-8 7z"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">社群整合</span>
                <span class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#09</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">LINE 群組</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">檢視已加入的 LINE 群組與狀態</p>
            </div>
            <div class="card-arrow">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>
        
        <!-- 10. 通知管理 -->
        <router-link to="/admin/notifications" class="admin-card group">
          <div class="admin-card-inner">
            <div class="card-icon card-icon-indigo">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">通知系統</span>
                <span class="text-xs font-black text-slate-100 group-hover:text-brand-primary transition-colors">#10</span>
              </div>
              <h3 class="text-xl font-black text-slate-800 group-hover:text-brand-primary transition-colors mb-2">通知管理</h3>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">預覽 LINE 通知訊息、手動推播與狀態監控</p>
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
  @apply relative block w-full p-px bg-white border border-slate-100 rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:border-amber-200;
}

.admin-card-inner {
  @apply bg-white rounded-[1.95rem] p-6 sm:p-7 flex items-start gap-5 sm:gap-6;
}

.card-icon {
  @apply w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:shadow-2xl;
}

.card-icon-purple {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-icon-green {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-icon-indigo {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-icon-amber {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-secondary group-hover:text-white group-hover:shadow-xl;
}

.card-icon-blue {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-icon-pink {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-icon-cyan {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-icon-slate {
  @apply bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white;
}

.card-arrow {
  @apply flex-shrink-0 w-8 h-8 rounded-full border border-slate-50 flex items-center justify-center text-slate-200 group-hover:text-brand-primary group-hover:bg-amber-50 group-hover:border-amber-100 transition-all duration-300 self-center;
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
