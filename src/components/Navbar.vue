<template>
  <nav class="sticky top-0 z-50 glass transition-all duration-500 hover:bg-white/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Nav Links -->
        <div class="flex">
          <!-- Logo -->
          <router-link to="/gifts" class="flex items-center group">
            <div class="flex-shrink-0 flex items-center">
              <div
                class="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span
                class="hidden min-[400px]:block ml-3 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tighter">股東會紀念品</span>
            </div>
          </router-link>

          <!-- Nav Links -->
          <div class="hidden sm:ml-8 sm:flex sm:space-x-4">
            <router-link to="/gifts"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isActive('/gifts') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'">
              紀念品目錄
            </router-link>

            <router-link to="/my-collections"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isActive('/my-collections') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'">
              購股計畫
            </router-link>

            <router-link to="/inventory"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="isActive('/inventory') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'">
              庫存管理
            </router-link>

            <!-- Admin Links -->
            <template v-if="isAdmin">
              <div class="border-l border-gray-300 mx-2"></div>

              <router-link to="/admin/panel"
                class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="isActive('/admin') ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'">
                <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                主控台
              </router-link>
            </template>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center">
          <!-- Logged In State -->
          <div v-if="user" class="flex items-center space-x-1.5 sm:space-x-3">
            <!-- User Info (Clickable) -->
            <button @click="isProfileModalOpen = true"
              class="hidden sm:block text-right group/user hover:opacity-80 transition-opacity">
              <div class="text-sm font-medium text-gray-900 group-hover/user:text-indigo-600 transition-colors">
                {{ displayName }}
              </div>
              <div v-if="isAdmin" class="text-xs text-purple-600 font-medium">
                管理員
              </div>
              <div v-else class="text-xs text-gray-400 font-medium">
                設定個人資料
              </div>
            </button>

            <!-- User Avatar (Clickable) -->
            <button @click="isProfileModalOpen = true" class="flex-shrink-0 relative group/avatar">
              <div
                class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-200 flex items-center justify-center shadow-sm group-hover/avatar:ring-2 group-hover/avatar:ring-indigo-200 transition-all">
                <span class="text-sm font-bold text-indigo-600">
                  {{ userInitials }}
                </span>
              </div>
            </button>

            <!-- Logout Button -->
            <button @click="handleLogout"
              class="inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="登出系統">
              <svg class="w-4 h-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">登出</span>
            </button>
          </div>

          <!-- Logged Out State -->
          <button v-else @click="openAuthModal"
            class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
            登入系統
          </button>

          <!-- Mobile Menu Button -->
          <div class="flex items-center sm:hidden ml-2">
            <button @click="showMobileMenu = !showMobileMenu" type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu" :aria-expanded="showMobileMenu">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!showMobileMenu" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu with Slide Animation -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 max-h-96"
      leave-to-class="opacity-0 -translate-y-2 max-h-0"
    >
      <div v-if="showMobileMenu" class="sm:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-lg overflow-hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link to="/gifts" 
            class="block px-4 py-2.5 text-base font-medium transition-all duration-200 animate-slide-in"
            style="animation-delay: 0.05s"
            :class="isActive('/gifts') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'">
            紀念品目錄
          </router-link>
          <router-link to="/my-collections" 
            class="block px-4 py-2.5 text-base font-medium transition-all duration-200 animate-slide-in"
            style="animation-delay: 0.1s"
            :class="isActive('/my-collections') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'">
            購股計畫
          </router-link>
          <router-link to="/inventory" 
            class="block px-4 py-2.5 text-base font-medium transition-all duration-200 animate-slide-in"
            style="animation-delay: 0.15s"
            :class="isActive('/inventory') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'">
            庫存管理
          </router-link>

          <!-- Mobile Admin Links -->
          <template v-if="isAdmin">
            <div class="border-t border-gray-100 my-2 pt-2 animate-slide-in" style="animation-delay: 0.2s">
              <div class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                後台管理
              </div>
              <router-link to="/admin/panel" 
                class="block px-4 py-2.5 text-base font-medium transition-all duration-200"
                :class="isActive('/admin') ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'">
                主控台
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </Transition>
    <!-- Profile Edit Modal -->
    <UserProfileModal :is-open="isProfileModalOpen" @close="isProfileModalOpen = false" />
  </nav>
</template>

<script setup>
import UserProfileModal from '@/components/UserProfileModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { user, profile, isAdmin, signOut } = useAuth()
const { confirm } = useDialog()
const { showToast } = useToast()
const { openAuthModal } = useAuthModal()

const showMobileMenu = ref(false)
const isProfileModalOpen = ref(false)

const isActive = (path) => {
  return route.path.startsWith(path)
}

// Display Name Logic: Nickname > Full Name > Email
const displayName = computed(() => {
  if (profile.value?.nickname) return profile.value.nickname
  if (profile.value?.full_name) return profile.value.full_name
  return user.value?.email || 'Guest'
})

const userInitials = computed(() => {
  return displayName.value.charAt(0).toUpperCase()
})

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

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out both;
}
</style>
