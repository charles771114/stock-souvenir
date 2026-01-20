<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb / Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/admin/panel" class="text-gray-400 hover:text-gray-500">
                  管理主控台
                </router-link>
              </li>
              <li class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-2 text-gray-500 font-medium">用戶管理</span>
              </li>
            </ol>
          </nav>
          <h1 class="text-3xl font-bold text-gray-900 mt-2">用戶清單</h1>
          <p class="text-gray-600 mt-1">檢視系統所有註冊用戶與權限</p>
        </div>
      </div>

      <!-- Main Content -->
      <AdminUserList />
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import AdminUserList from '@/components/AdminUserList.vue'
</script>
