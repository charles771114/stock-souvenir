<template>
  <nav class="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
        <div class="glass flex items-center justify-between h-20 px-3 sm:px-6 rounded-2xl shadow-2xl transition-all duration-500 hover:bg-white/90">
          <!-- Logo and Nav Links -->
          <div class="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
            <!-- Logo -->
            <router-link to="/gifts" class="flex items-center group mr-2 sm:mr-8 shrink-0">
              <div class="flex-shrink-0 flex items-center">
                <div class="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-amber-200 transition-all duration-500 overflow-hidden bg-white border border-slate-100 p-1">
                  <img src="/logo.png" alt="Logo" class="h-full w-full object-cover" />
                </div>
                <span class="hidden min-[600px]:block ml-4 text-2xl font-black text-gradient tracking-tighter">股東會紀念品</span>
              </div>
            </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-1 lg:space-x-2">
            <router-link to="/today"
              class="inline-flex items-center px-4 py-2.5 text-base font-bold rounded-xl transition-all"
              aria-label="今日重點"
              :class="isActive('/today') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-500 hover:text-brand-primary hover:bg-slate-50'">
              <i class="ri-fire-line mr-2 text-status-warning text-lg"></i> 今日重點
            </router-link>

            <router-link to="/gifts"
              class="inline-flex items-center px-4 py-2.5 text-base font-bold rounded-xl transition-all"
              aria-label="紀念品目錄"
              :class="isActive('/gifts') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-500 hover:text-brand-primary hover:bg-slate-50'">
              <i class="ri-list-check-3 mr-2 text-lg"></i> 紀念品目錄
            </router-link>

            <router-link v-if="!isActive('/my-collections')" to="/my-collections"
              class="inline-flex items-center px-4 py-2.5 text-base font-bold rounded-xl transition-all"
              aria-label="購股清單"
              :class="isActive('/my-collections') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-500 hover:text-brand-primary hover:bg-slate-50'">
              <i class="ri-heart-2-line mr-2 text-lg"></i> 購股清單
            </router-link>

            <router-link to="/inventory"
              class="inline-flex items-center px-4 py-2.5 text-base font-bold rounded-xl transition-all"
              aria-label="庫存管理"
              :class="isActive('/inventory') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-500 hover:text-brand-primary hover:bg-slate-50'">
              <i class="ri-bank-line mr-2 text-lg"></i> 庫存管理
            </router-link>

            <!-- Admin Links -->
            <template v-if="isAdmin">
              <div class="h-6 w-px bg-slate-200 mx-2"></div>
              <router-link to="/admin/panel"
                class="inline-flex items-center px-4 py-2.5 text-base font-bold rounded-xl transition-all"
                aria-label="主控台"
                :class="isActive('/admin') ? 'text-brand-secondary bg-indigo-50 shadow-inner' : 'text-slate-500 hover:text-brand-secondary hover:bg-slate-50'">
                <i class="ri-dashboard-3-line mr-2 text-lg"></i> 主控台
              </router-link>
            </template>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
          <!-- Portfolio Switcher -->
          <PortfolioSwitcher v-if="user" class="shrink-0" />

          <!-- Logged In State -->
          <div v-if="user" class="flex items-center space-x-1 sm:space-x-3 shrink-0">
            <!-- User Info (Clickable) -->
            <button @click="isProfileModalOpen = true"
              class="hidden sm:block text-right group/user hover:opacity-80 transition-opacity shrink-0">
              <div class="text-base font-bold text-slate-800 group-hover/user:text-brand-primary transition-colors">
                {{ displayName }}
              </div>
              <div v-if="isAdmin" class="text-xs text-purple-600 font-black uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-md">
                管理員
              </div>
              <div v-else class="text-xs text-slate-400 font-bold uppercase tracking-widest">
                個人設定
              </div>
            </button>

            <!-- User Avatar (Clickable) -->
            <button @click="isProfileModalOpen = true" class="flex-shrink-0 relative group/avatar shrink-0">
              <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-white border border-brand-primary/20 flex items-center justify-center shadow-sm group-hover/avatar:ring-4 group-hover/avatar:ring-brand-primary/10 transition-all">
                <span class="text-base font-black text-brand-primary">
                  {{ userInitials }}
                </span>
              </div>
            </button>

            <!-- Logout Button -->
            <button @click="handleLogout"
              class="inline-flex items-center px-3 sm:px-4 py-2.5 text-base font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0"
              title="登出系統">
              <i class="ri-logout-box-r-line sm:mr-2 text-lg"></i>
              <span class="hidden xl:inline">登出</span>
            </button>
          </div>

          <!-- Logged Out State -->
          <button v-else @click="openAuthModal"
            aria-label="登入系統"
            class="inline-flex items-center px-6 py-3 bg-brand-primary text-white text-base font-black rounded-2xl hover:shadow-glow transition-all whitespace-nowrap">
            <i class="ri-user-heart-line mr-2 text-lg"></i> 登入系統
          </button>

          <!-- Mobile Menu Button -->
          <div class="flex items-center md:hidden ml-2">
            <button @click="showMobileMenu = !showMobileMenu" type="button"
              class="inline-flex items-center justify-center p-3 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              aria-controls="mobile-menu" :aria-expanded="showMobileMenu">
              <span class="sr-only">Open main menu</span>
              <i v-if="!showMobileMenu" class="ri-menu-5-line text-2xl"></i>
              <i v-else class="ri-close-line text-2xl"></i>
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
      <div v-if="showMobileMenu" class="sm:hidden mt-4 rounded-3xl border border-slate-100 bg-white/95 backdrop-blur-lg overflow-hidden shadow-2xl animate-fade-in">
        <div class="p-4 space-y-2">
          <router-link to="/today" 
            class="flex items-center px-5 py-4 text-lg font-bold transition-all duration-200 rounded-2xl animate-slide-in"
            style="animation-delay: 0.05s"
            :class="isActive('/today') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'">
            <i class="ri-fire-fill mr-3 text-status-warning text-xl"></i> 今日重點
          </router-link>
          
          <router-link to="/gifts" 
            class="flex items-center px-5 py-4 text-lg font-bold transition-all duration-200 rounded-2xl animate-slide-in"
            style="animation-delay: 0.1s"
            :class="isActive('/gifts') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'">
            <i class="ri-list-check-3 mr-3 text-xl"></i> 紀念品目錄
          </router-link>
          
          <router-link v-if="!isActive('/my-collections')" to="/my-collections" 
            class="flex items-center px-5 py-4 text-lg font-bold transition-all duration-200 rounded-2xl animate-slide-in"
            style="animation-delay: 0.15s"
            :class="isActive('/my-collections') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'">
            <i class="ri-heart-2-fill mr-3 text-xl"></i> 購股清單
          </router-link>
          
          <router-link to="/inventory" 
            class="flex items-center px-5 py-4 text-lg font-bold transition-all duration-200 rounded-2xl animate-slide-in"
            style="animation-delay: 0.2s"
            :class="isActive('/inventory') ? 'text-brand-primary bg-amber-50 shadow-inner' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'">
            <i class="ri-bank-fill mr-3 text-xl"></i> 庫存管理
          </router-link>

          <!-- Mobile Admin Links -->
          <template v-if="isAdmin">
            <div class="h-px bg-slate-100 my-4 mx-4 animate-slide-in" style="animation-delay: 0.25s"></div>
            <router-link to="/admin/panel" 
              class="flex items-center px-5 py-4 text-lg font-bold transition-all duration-200 rounded-2xl animate-slide-in"
              style="animation-delay: 0.3s"
              :class="isActive('/admin') ? 'text-brand-secondary bg-indigo-50 shadow-inner' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-secondary'">
              <i class="ri-dashboard-3-fill mr-3 text-xl text-purple-600"></i> 主控台
            </router-link>
          </template>
        </div>
      </div>
    </Transition>
    <!-- Profile Edit Modal -->
    <UserProfileModal :is-open="isProfileModalOpen" @close="isProfileModalOpen = false" />
  </nav>
</template>

<script setup>
import PortfolioSwitcher from '@/components/PortfolioSwitcher.vue'
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
