<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    
    <div class="flex-grow flex flex-col items-center justify-center p-4">
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 transform transition-all hover:scale-[1.01] duration-300">

        <!-- Header -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">管理者控制台</h1>
          <p class="text-gray-500 text-lg">系統管理與數據監控</p>
        </div>

        <!-- Quick Actions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- Scraper Management -->
          <router-link to="/admin/scraper"
            class="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-400 group-hover:text-blue-200 transition-colors">01</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700">爬蟲管理</h3>
            <p class="text-sm text-gray-600">管理資料抓取、更新紀念品資料庫與爬蟲狀態監控。</p>
          </router-link>

          <!-- Classification Center -->
          <router-link to="/admin/classification"
            class="group bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-400 group-hover:text-purple-200 transition-colors">02</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700">分類中心</h3>
            <p class="text-sm text-gray-600">紀念品分類管理、關鍵字過濾與人工審核。</p>
          </router-link>

          <!-- User Management -->
          <router-link to="/admin/users"
            class="group bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 hover:shadow-lg hover:border-green-300 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-400 group-hover:text-green-200 transition-colors">03</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700">用戶管理</h3>
            <p class="text-sm text-gray-600">檢視用戶列表、權限設定與用戶收藏統計。</p>
          </router-link>

          <!-- Inventory Import (NEW) -->
          <router-link to="/admin/import/inventory"
            class="group bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100 hover:shadow-lg hover:border-amber-300 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-400 group-hover:text-amber-200 transition-colors">04</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700">庫存匯入</h3>
            <p class="text-sm text-gray-600">批次上傳年度庫存檔案，並進行用戶歸戶作業。</p>
          </router-link>
          <!-- Inventory Staging (NEW Link) -->
          <router-link to="/admin/staging"
            class="group bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 hover:shadow-lg hover:border-indigo-300 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-400 group-hover:text-indigo-200 transition-colors">05</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700">歸戶管理</h3>
            <p class="text-sm text-gray-600">處理待歸戶清單，連結用戶與庫存資料。</p>
          </router-link>

          <!-- Favorites Overview -->
          <router-link to="/admin/favorites"
            class="group bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl border border-pink-100 hover:shadow-lg hover:border-pink-300 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <div
                class="p-3 bg-pink-100 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-400 group-hover:text-pink-200 transition-colors">06</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-700">收藏熱度</h3>
            <p class="text-sm text-gray-600">分析全站紀念品收藏熱門程度與趨勢。</p>
          </router-link>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>
