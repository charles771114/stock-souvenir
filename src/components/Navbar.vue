<template>
  <nav class="sticky top-0 z-50 glass transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Nav Links -->
        <div class="flex">
          <!-- Logo -->
          <router-link to="/gifts" class="flex items-center group">
            <div class="flex-shrink-0 flex items-center">
              <div class="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span class="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">股東會紀念品</span>
            </div>
          </router-link>

          <!-- Nav Links -->
          <div class="hidden sm:ml-8 sm:flex sm:space-x-4">
            <router-link
              to="/gifts"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isActive('/gifts') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'"
            >
              紀念品目錄
            </router-link>
            
            <router-link
              to="/my-collections"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isActive('/my-collections') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'"
            >
              我的收藏
            </router-link>

            <!-- Admin Links -->
            <template v-if="isAdmin">
              <div class="border-l border-gray-300 mx-2"></div>
              
              <router-link
                to="/admin/panel"
                class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="isActive('/admin/panel') ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                主控台
              </router-link>
              
              <router-link
                to="/admin/scraper"
                class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="isActive('/admin/scraper') ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                爬蟲管理
              </router-link>
              
              <router-link
                to="/admin/settings"
                class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="isActive('/admin/settings') ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                設定
              </router-link>
            </template>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center">
          <!-- Logged In State -->
          <div v-if="user" class="flex items-center space-x-3">
            <!-- User Info -->
            <div class="hidden sm:block text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ user.email }}
              </div>
              <div v-if="isAdmin" class="text-xs text-purple-600 font-medium">
                管理員
              </div>
            </div>

            <!-- User Avatar -->
            <div class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-sm font-medium text-indigo-600">
                  {{ user.email?.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              @click="handleLogout"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              登出
            </button>
          </div>

          <!-- Logged Out State -->
          <button
            v-else
            @click="openAuthModal"
            class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
          >
            登入系統
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu (Optional) -->
    <div v-if="showMobileMenu" class="sm:hidden border-t border-gray-200">
      <div class="pt-2 pb-3 space-y-1">
        <router-link
          to="/gifts"
          class="block px-4 py-2 text-base font-medium"
          :class="isActive('/gifts') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'"
        >
          紀念品目錄
        </router-link>
        <router-link
          to="/my-collections"
          class="block px-4 py-2 text-base font-medium"
          :class="isActive('/my-collections') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'"
        >
          我的收藏
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { useAuthModal } from '@/composables/useAuthModal'

const router = useRouter()
const route = useRoute()
const { user, isAdmin, signOut } = useAuth()
const { confirm } = useDialog()
const { showToast } = useToast()
const { openAuthModal } = useAuthModal()

const showMobileMenu = ref(false)

const isActive = (path) => {
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  const isConfirmed = await confirm('您確定要登出系統嗎？', '登出確認')
  
  if (isConfirmed) {
    const { error } = await signOut()
    if (error) {
      showToast('登出失敗: ' + error.message, 'error')
    } else {
      showToast('已成功登出', 'success')
      router.push('/gifts')
    }
  }
}
</script>
