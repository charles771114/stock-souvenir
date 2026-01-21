<template>
  <div class="min-h-screen bg-gray-50 relative overflow-hidden">
    <!-- Animated Background Mesh (same as AdminPanel) -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[100px] animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
    </div>

    <Navbar class="relative z-10" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <!-- Header -->
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight mb-2">
            用戶管理
          </h1>
          <p class="text-lg text-gray-600 font-light">
            User Management & Permissions
          </p>
        </div>
        <div class="text-sm text-gray-500 font-mono bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50">
          {{ users.length }} Users
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-8">
        <div class="bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-2 inline-flex gap-2">
          <button
            @click="activeTab = 'all'"
            :class="[
              'px-6 py-3 rounded-xl font-medium transition-all duration-300',
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              所有用戶 ({{ users.length }})
            </span>
          </button>
          <button
            @click="activeTab = 'admins'"
            :class="[
              'px-6 py-3 rounded-xl font-medium transition-all duration-300',
              activeTab === 'admins' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              管理員 ({{ adminEmails.length }})
            </span>
          </button>
        </div>
      </div>

      <!-- All Users Tab Content -->
      <div v-show="activeTab === 'all'" class="space-y-6">
        <!-- Search & Filter Bar -->
        <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜尋 Email 或姓名..."
                class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              v-model="filterRole"
              class="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">所有角色</option>
              <option value="admin">管理員</option>
              <option value="user">一般用戶</option>
            </select>
          </div>
        </div>

        <!-- User Cards Grid -->
        <div v-if="loading && users.length === 0" class="flex justify-center py-12">
          <LoadingSpinner />
        </div>

        <div v-else-if="filteredUsers.length === 0" class="bg-white/80 backdrop-blur-md rounded-2xl p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-gray-500 text-lg">找不到符合條件的用戶</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="group relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-100/20 rounded-2xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200/30"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none"></div>
            
            <div class="relative">
              <!-- User Avatar & Info -->
              <div class="flex items-start gap-4 mb-4">
                <div class="relative flex-shrink-0">
                  <div class="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {{ user.email.charAt(0).toUpperCase() }}
                  </div>
                  <!-- Primary Badge -->
                  <div v-if="user.is_primary_admin" class="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-lg" title="主管理員">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-semibold text-gray-900 truncate">
                      {{ user.email }}
                    </h3>
                    <span v-if="isCurrentUser(user.email)" class="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                      您
                    </span>
                  </div>
                  
                  <!-- Role Toggle -->
                  <button
                    @click="toggleRole(user)"
                    :disabled="user.is_primary_admin || isCurrentUser(user.email)"
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200',
                      user.role === 'admin'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                      (user.is_primary_admin || isCurrentUser(user.email)) && 'opacity-50 cursor-not-allowed'
                    ]"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {{ user.role === 'admin' ? 'Admin' : 'User' }}
                  </button>
                </div>
              </div>

              <!-- User Stats -->
              <div class="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div class="text-center">
                  <p class="text-xs text-gray-500 mb-1">註冊時間</p>
                  <p class="text-sm font-semibold text-gray-900">{{ formatDate(user.created_at) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500 mb-1">收藏數</p>
                  <p class="text-sm font-semibold text-gray-900">{{ user.collection_count || 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admins Tab Content -->
      <div v-show="activeTab === 'admins'" class="space-y-6">
        <!-- Add Admin Form -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50/30 border border-indigo-100 rounded-2xl p-6 shadow-lg">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增管理員
          </h2>
          
          <form @submit.prevent="handleAddAdmin" class="flex gap-4">
            <div class="flex-1">
              <input
                v-model="newAdminEmail"
                type="email"
                placeholder="輸入 Email 地址"
                required
                class="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80"
              />
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
            >
              {{ loading ? '新增中...' : '新增' }}
            </button>
          </form>

          <p class="mt-3 text-sm text-indigo-700 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            新增後該 email 下次登入會自動成為 admin
          </p>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>

        <!-- Admin List -->
        <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-transparent">
            <h2 class="text-lg font-bold text-gray-900">Admin 帳號列表</h2>
          </div>

          <div v-if="loading && adminEmails.length === 0" class="p-6 flex justify-center">
            <LoadingSpinner />
          </div>

          <div v-else-if="adminEmails.length === 0" class="p-6 text-center text-gray-500">
            尚無 Admin 帳號
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="admin in adminEmails"
              :key="admin.email"
              class="px-6 py-5 flex items-center justify-between hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-transparent transition-all duration-200"
            >
              <div class="flex items-center gap-4">
                <div class="relative">
                  <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {{ admin.email.charAt(0).toUpperCase() }}
                  </div>
                  <!-- Primary Badge -->
                  <div v-if="admin.is_primary_admin" class="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-lg" title="主管理員">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-gray-900">{{ admin.email }}</span>
                    <span v-if="isCurrentUser(admin.email)" class="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                      您現在的帳號
                    </span>
                    <span v-if="admin.is_primary_admin" class="px-2 py-0.5 text-xs bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-full font-medium border border-amber-200 shadow-sm">
                      Primary
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">
                    新增於 {{ formatDate(admin.added_at) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Promote Button -->
                <button
                  v-if="!admin.is_primary_admin"
                  @click="confirmPromote(admin.email)"
                  class="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200 border border-indigo-100 hover:border-indigo-200"
                >
                  設為主管理員
                </button>

                <!-- Remove Button -->
                <button
                  v-if="!isCurrentUser(admin.email) && !admin.is_primary_admin"
                  @click="confirmRemove(admin.email)"
                  class="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-100 hover:border-red-200"
                >
                  移除權限
                </button>
                <span v-else-if="admin.is_primary_admin" class="px-4 py-2 text-xs text-gray-400 italic">
                  無法移除
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning Notice -->
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50/30 border border-yellow-200 rounded-2xl p-6 shadow-lg">
          <div class="flex gap-4">
            <svg class="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <p class="font-semibold text-yellow-900 mb-2">注意事項</p>
              <ul class="space-y-1 text-sm text-yellow-800">
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>您無法移除自己的 admin 權限</span>
                </li>
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>移除 admin 後，該用戶下次登入時會失去管理員權限</span>
                </li>
                <li class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>請謹慎管理 admin 帳號列表</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'
import { computed, onMounted, ref } from 'vue'

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

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u => 
      u.email.toLowerCase().includes(query) ||
      u.full_name?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value)
  }

  return result
})

const formatDate = (dateString) => {
  if (!dateString) return '未知'
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
    // Modern toast notification would be better, but using alert for now
    alert('✅ Admin 新增成功')
  }
}

const toggleRole = async (targetUser) => {
  if (targetUser.is_primary_admin || isCurrentUser(targetUser.email)) {
    return
  }

  const newRole = targetUser.role === 'admin' ? 'user' : 'admin'
  const action = newRole === 'admin' ? '升級為管理員' : '降級為一般用戶'
  
  if (!confirm(`確定要將「${targetUser.email}」${action}嗎？`)) return

  const { error: toggleError } = await toggleUserRole(targetUser.id, newRole)
  
  if (!toggleError) {
    alert(`✅ 已成功${action}`)
  } else {
    alert(`❌ 操作失敗: ${toggleError.message}`)
  }
}

const confirmRemove = async (email) => {
  if (!confirm(`確定要移除「${email}」的 admin 權限嗎？`)) return

  const { error: removeError } = await removeAdminEmail(email)
  
  if (!removeError) {
    alert('✅ Admin 移除成功')
  } else {
    alert(`❌ ${removeError.message}`)
  }
}

const confirmPromote = async (email) => {
  if (!confirm(`確定要將「${email}」設為主管理員 (Primary Admin) 嗎？\n\n主管理員擁有最高權限，且不能被移除。`)) return

  const { error: promoteError } = await promoteToPrimary(email)
  
  if (!promoteError) {
    alert('✅ 已成功設為主管理員')
  } else {
    alert(`❌ ${promoteError.message}`)
  }
}

onMounted(async () => {
  await fetchAllUsers()
})
</script>

<style scoped>
.font-display {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
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
