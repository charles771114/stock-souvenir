<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/admin/panel"
              class="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest leading-none">
              <div
                class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 shadow-sm transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              管理主頁
            </router-link>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter mb-2">
            用戶權限管理
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            使用者列表、權限設定與社群統計
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-5 py-2 rounded-2xl bg-indigo-50 border border-indigo-100/50 shadow-sm">
            <span class="text-xs font-black text-indigo-600 uppercase tracking-widest">{{ users.length }} 位註冊用戶</span>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12 animate-fade-in-up delay-100">
        <div class="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] w-full sm:w-auto self-start">
          <button @click="activeTab = 'all'" :class="[
            'px-6 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2',
            activeTab === 'all' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-600'
          ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            所有用戶
          </button>
          <button @click="activeTab = 'admins'" :class="[
            'px-6 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2',
            activeTab === 'admins' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-600'
          ]">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            管理員
          </button>
        </div>

        <!-- Quick Search (Only for All Tab) -->
        <div v-if="activeTab === 'all'" class="flex-1 relative animate-fade-in">
          <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchQuery" type="text" placeholder="搜尋電子郵件或名稱..."
            class="w-full h-full min-h-[56px] pl-14 pr-6 py-3 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold placeholder:text-slate-300 shadow-sm focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
        </div>
      </div>

      <!-- Tab Content: All Users -->
      <div v-show="activeTab === 'all'" class="animate-fade-in-up delay-200">
        <div v-if="loading && users.length === 0" class="py-24 flex flex-col items-center gap-6">
          <div class="w-16 h-16 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-sm font-black text-indigo-300 uppercase tracking-[0.2em] animate-pulse">同步使用者目錄中...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="glass-card py-24 text-center">
          <div
            class="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <svg class="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-sm font-black text-slate-300 uppercase tracking-widest">找不到符合搜尋條件的用戶</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="user in filteredUsers" :key="user.id"
            class="glass-card p-8 group hover:border-indigo-200 transition-all flex flex-col">
            <div class="flex items-start justify-between mb-8">
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-black text-slate-800 truncate tracking-tight">
                    {{ user.full_name || user.email.split('@')[0] }}
                  </h3>
                  <span v-if="isCurrentUser(user.email)"
                    class="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">自己</span>
                </div>
                <p class="text-xs font-bold text-slate-400 truncate">{{ user.email }}</p>
                <div v-if="user.is_primary_admin" class="mt-2">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100 shadow-sm shadow-amber-100/50">
                    <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    主管理員
                  </span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8">
              <div
                class="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/20 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">收藏項目數</span>
                <span class="text-xl font-black text-slate-700 tracking-tighter">{{ user.collection_count || 0 }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 group-hover:bg-white transition-all">
                <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">註冊日期</span>
                <span class="text-[10px] font-black text-slate-600 font-mono tracking-tighter">{{
                  formatDate(user.created_at) }}</span>
              </div>
            </div>

            <div class="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
              <div class="flex flex-wrap gap-1.5 min-h-[24px]">
                <span v-for="p in user.portfolios.slice(0, 2)" :key="p.id"
                  class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-bold border border-slate-200 shadow-sm leading-none">
                  {{ p.name }}
                </span>
                <span v-if="user.portfolios.length > 2" class="text-[9px] font-black text-slate-300 self-center">+{{
                  user.portfolios.length - 2 }} 個帳戶</span>
              </div>

              <button @click="toggleRole(user)" :disabled="user.is_primary_admin || isCurrentUser(user.email)"
                class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                :class="[
                  user.role === 'admin' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600',
                  (user.is_primary_admin || isCurrentUser(user.email)) && 'opacity-30 cursor-not-allowed grayscale'
                ]">
                {{ user.role.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Admins -->
      <div v-show="activeTab === 'admins'" class="animate-fade-in-up delay-200 space-y-12">
        <!-- New Admin Section -->
        <div class="glass-card p-10 bg-gradient-to-br from-white/80 via-white to-indigo-50/30">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div class="max-w-md">
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 block">權限管理中心</span>
              <h2 class="text-3xl font-black text-slate-800 tracking-tighter mb-4">新增管理員權限</h2>
              <p class="text-sm font-bold text-slate-400 leading-relaxed mb-6">輸入電子郵件以授權管理員權限。被授權者下次登入時，系統將自動套用管理員角色環境。
              </p>

              <div v-if="error"
                class="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-500 animate-bounce-in">
                Error: {{ error }}
              </div>
            </div>

            <form @submit.prevent="handleAddAdmin" class="flex-1 w-full flex flex-col sm:flex-row gap-4">
              <div class="relative flex-1">
                <input v-model="newAdminEmail" type="email" placeholder="enter-email@stock-souvenir.com" required
                  class="w-full h-16 px-8 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold placeholder:text-slate-300 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
              </div>
              <button type="submit" :disabled="loading"
                class="px-10 h-16 bg-indigo-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                <div v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                </div>
                同步權限設定
              </button>
            </form>
          </div>
        </div>

        <!-- Admin Table / Cards -->
        <div>
          <div class="flex items-center gap-3 mb-8 px-2">
            <h2 class="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              已授權管理員帳戶
            </h2>
            <div class="h-px flex-1 bg-indigo-50/50"></div>
          </div>

          <div v-if="adminEmails.length === 0" class="glass-card py-24 text-center">
            <p class="text-sm font-black text-slate-300 uppercase tracking-widest">尚無 Admin 帳號</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="admin in adminEmails" :key="admin.email"
              class="glass-card p-6 flex items-center justify-between group hover:border-indigo-200 transition-all">
              <div class="flex items-center gap-2">
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-black text-slate-800">{{ admin.full_name || admin.email.split('@')[0]
                      }}</span>
                    <span v-if="isCurrentUser(admin.email)"
                      class="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-widest border border-indigo-100 shadow-sm leading-none">Your
                      Account</span>
                    <span v-if="admin.is_primary_admin"
                      class="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-widest border border-amber-100 shadow-sm leading-none">Primary</span>
                  </div>
                  <p class="text-xs font-bold text-slate-400">{{ admin.email }}</p>
                  <p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">加入日期: {{
                    formatDate(admin.added_at) }}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button v-if="!admin.is_primary_admin" @click="confirmPromote(admin.email)"
                  class="px-4 py-2.5 bg-white border border-slate-200 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm">
                  升級權限
                </button>
                <button v-if="!isCurrentUser(admin.email) && !admin.is_primary_admin"
                  @click="confirmRemove(admin.email)"
                  class="px-4 py-2.5 bg-white border border-slate-100 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                  撤銷權限
                </button>
                <span v-else-if="admin.is_primary_admin"
                  class="px-4 py-2.5 bg-slate-50 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100/50">
                  鎖定中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { computed, onMounted, ref, watch } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()

const { users, adminEmails, loading, error, fetchAllUsers, addAdminEmail, removeAdminEmail, promoteToPrimary, toggleUserRole } = useAdmin()
const { user } = useAuth()

const activeTab = ref('all')
const newAdminEmail = ref('')
const searchQuery = ref('')
const filterRole = ref('')

const isCurrentUser = (email) => {
  return user.value?.email === email
}

const filteredUsers = computed(() => {
  let result = users.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.email.toLowerCase().includes(query) ||
      u.full_name?.toLowerCase().includes(query)
    )
  }
  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value)
  }
  return result
})

const formatDate = (dateString) => {
  if (!dateString) return '從未'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const handleAddAdmin = async () => {
  if (!newAdminEmail.value) return
  const { error: addError } = await addAdminEmail(newAdminEmail.value)
  if (!addError) {
    newAdminEmail.value = ''
    showToast('Admin 新增成功', 'success')
    await fetchAllUsers()
  }
}

const toggleRole = async (targetUser) => {
  if (targetUser.is_primary_admin || isCurrentUser(targetUser.email)) return
  const newRole = targetUser.role === 'admin' ? 'user' : 'admin'
  const action = newRole === 'admin' ? '升級為管理員' : '降級為一般用戶'
  const ok = await openConfirm(`確定要將「${targetUser.email}」${action}嗎？`)
  if (!ok) return
  const { error: toggleError } = await toggleUserRole(targetUser.id, newRole)
  if (!toggleError) {
    showToast(`已成功${action}`, 'success')
    await fetchAllUsers()
  } else {
    showToast(`操作失敗: ${toggleError.message}`, 'error')
  }
}

const confirmRemove = async (email) => {
  const ok = await openConfirm(`確定要移除「${email}」的 admin 權限嗎？`)
  if (!ok) return
  const { error: removeError } = await removeAdminEmail(email)
  if (!removeError) {
    showToast('Admin 移除成功', 'success')
    await fetchAllUsers()
  } else {
    showToast(removeError.message, 'error')
  }
}

const confirmPromote = async (email) => {
  const ok = await openConfirm(`確定要將「${email}」設為主管理員 (Primary Admin) 嗎？\n\n主管理員擁有最高權限且不可移除。`)
  if (!ok) return
  const { error: promoteError } = await promoteToPrimary(email)
  if (!promoteError) {
    showToast('已成功設為主管理員', 'success')
    await fetchAllUsers()
  } else {
    showToast(promoteError.message, 'error')
  }
}

onMounted(async () => {
  await fetchAllUsers()
})

watch(activeTab, async (val) => {
  if (val === 'all') await fetchAllUsers()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.5rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
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

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  60% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
