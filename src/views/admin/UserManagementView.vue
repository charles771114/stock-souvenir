<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1
            class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-brand-primary to-slate-700 tracking-tighter mb-2">
            用戶權限管理
          </h1>
          <p class="text-slate-400 font-bold text-sm uppercase tracking-wider">
            管理系統存取權限、監控用戶狀態與別名學習
          </p>
        </div>

        <div class="flex items-center gap-1 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <button v-for="tab in ['all', 'admins']" :key="tab" @click="activeTab = tab"
            class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            :class="activeTab === tab ? 'bg-brand-primary text-white shadow-lg shadow-amber-200' : 'text-slate-400 hover:text-brand-primary'">
            {{ tab === 'all' ? '所有用戶' : '管理員名單' }}
          </button>
        </div>
      </div>

      <!-- Tab Content: All Users -->
      <div v-show="activeTab === 'all'" class="animate-fade-in-up space-y-8">
        <!-- Search and Filters -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="搜尋姓名、Email 或別名..."
              class="w-full h-14 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-black shadow-sm focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />
          </div>
          <select v-model="filterRole"
            class="h-14 px-6 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm focus:border-brand-primary outline-none transition-all">
            <option value="">所有權限</option>
            <option value="admin">管理員</option>
            <option value="user">一般用戶</option>
          </select>
        </div>
        <div class="space-y-4">
          <div v-for="user in filteredUsers" :key="user.id"
            class="glass-card group overflow-hidden transition-all duration-300 hover:border-brand-primary/30"
            :class="expandedUsers.has(user.id) ? 'shadow-xl shadow-brand-primary/10 border-brand-primary/20' : 'hover:shadow-lg'">
            
            <!-- Collapsed Header Bar -->
            <div @click="toggleUserExpansion(user.id)" 
              class="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
              <!-- Left: User Info -->
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 flex items-center justify-center text-brand-primary text-xs font-black shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                  {{ (user.full_name || user.email || '?')[0].toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-black text-slate-800 flex items-center gap-2 truncate">
                    {{ user.full_name || '未設定名稱' }}
                    <span v-if="user.is_primary_admin" class="px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-tighter border border-red-100">創始</span>
                  </h3>
                  <p class="text-[10px] font-bold text-slate-400 truncate">{{ user.email }}</p>
                </div>
              </div>
              
              <!-- Middle: Role Badge (Desktop) -->
              <div class="hidden md:block">
                <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                  :class="user.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'">
                  {{ user.role === 'admin' ? '管理員' : '一般用戶' }}
                </span>
              </div>

              <!-- Right: Actions & Toggle -->
              <div class="flex items-center justify-end gap-3" @click.stop>
                <button @click="openEditModal(user)"
                  class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-brand-primary transition-all border border-slate-100 flex items-center justify-center">
                  <i class="ri-pencil-line"></i>
                </button>
                <button @click="toggleRole(user)" :disabled="user.is_primary_admin || isCurrentUser(user.email)"
                  class="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1.5"
                  :class="[
                    user.role === 'admin' 
                      ? 'bg-amber-500 text-white border-amber-400 shadow-sm shadow-amber-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary hover:text-brand-primary',
                    (user.is_primary_admin || isCurrentUser(user.email)) && 'opacity-30 cursor-not-allowed grayscale'
                  ]">
                  <i :class="user.role === 'admin' ? 'ri-shield-user-fill' : 'ri-user-line'"></i>
                  <span class="sr-only">切換權限</span>
                </button>
                <div class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-300 transition-all" @click="toggleUserExpansion(user.id)">
                  <i class="ri-arrow-down-s-line text-lg transition-transform duration-300" 
                    :class="{ 'rotate-180 text-brand-primary': expandedUsers.has(user.id) }"></i>
                </div>
              </div>
            </div>

            <!-- Expanded Details -->
            <div v-if="expandedUsers.has(user.id)" 
              class="px-6 pb-6 pt-2 border-t border-slate-50/50 animate-fade-in-up">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <!-- Stats Dashboard -->
                <div class="md:col-span-4 grid grid-cols-2 gap-3">
                  <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <i class="ri-heart-3-line"></i> 已收藏
                    </div>
                    <div class="text-sm font-black text-slate-700 font-mono">
                      {{ user.collection_count }} <span class="text-[10px] text-slate-400 font-bold ml-0.5">份</span>
                    </div>
                  </div>
                  <div class="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <i class="ri-wallet-3-line"></i> 投資帳戶
                    </div>
                    <div class="text-sm font-black text-slate-700 font-mono">
                      {{ user.portfolios.length }} <span class="text-[10px] text-slate-400 font-bold ml-0.5">個</span>
                    </div>
                  </div>
                </div>
                
                <!-- Portfolio Tags -->
                <div class="md:col-span-5 flex flex-wrap gap-1.5">
                  <span v-for="port in user.portfolios" :key="port.id" 
                    class="px-2 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
                    {{ port.name }}
                  </span>
                  <div v-if="user.portfolios.length === 0" class="text-[10px] font-bold text-slate-300 italic">尚未建立帳戶</div>
                </div>

                <!-- Footer Info -->
                <div class="md:col-span-3 flex flex-col gap-2">
                  <div class="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-50">
                    <i class="ri-calendar-line text-slate-300"></i> 註冊於 {{ formatDate(user.created_at) }}
                  </div>
                  <!-- Filtered Aliases -->
                  <div v-if="user.legacy_names && user.legacy_names.filter(a => a !== user.full_name).length > 0" class="flex flex-wrap gap-1">
                    <span v-for="alias in user.legacy_names.filter(a => a !== user.full_name)" :key="alias" 
                      class="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100/50">
                      {{ alias }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Admins -->
      <div v-show="activeTab === 'admins'" class="animate-fade-in-up delay-200 space-y-12">
        <!-- New Admin Section -->
        <div class="glass-card p-10 bg-gradient-to-br from-white/80 via-white to-amber-50">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div class="max-w-md">
              <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2 block">權限管理中心</span>
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
                  class="w-full h-16 px-8 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-black placeholder:text-slate-300 shadow-sm focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />
              </div>
              <button type="submit" :disabled="loading"
                class="px-10 h-16 bg-brand-primary text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
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
            <h2 class="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              已授權管理員帳戶
            </h2>
            <div class="h-px flex-1 bg-amber-50"></div>
          </div>

          <div v-if="adminEmails.length === 0" class="glass-card py-24 text-center">
            <p class="text-sm font-black text-slate-300 uppercase tracking-widest">尚無 Admin 帳號</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="admin in adminEmails" :key="admin.email"
              class="glass-card p-6 flex items-center justify-between group hover:border-amber-200 transition-all">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-brand-primary text-xs font-black shadow-sm group-hover:scale-110 transition-transform">
                  {{ (admin.full_name || admin.email || '?')[0].toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-black text-slate-800 truncate">{{ admin.full_name || admin.email.split('@')[0] }}</span>
                    <span v-if="isCurrentUser(admin.email)"
                      class="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-tighter">當前帳號</span>
                    <span v-if="admin.is_primary_admin"
                      class="px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-tighter border border-red-100">創始管理員</span>
                  </div>
                  <p class="text-[10px] font-bold text-slate-400 truncate">{{ admin.email }}</p>
                  <p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                    <i class="ri-history-line mr-1"></i> 加入日期: {{ formatDate(admin.added_at) }}
                  </p>
                </div>
              </div>

              <div class="flex gap-2">
                <button @click="openEditModal(admin)"
                  class="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-brand-primary transition-all border border-slate-100">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
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

    <!-- Edit User Modal -->
    <div v-if="showEditModal"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" @click="closeEditModal"></div>
      
      <div class="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-bounce-in">
        <div class="px-8 pt-8 pb-6 border-b border-slate-50">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-black text-slate-800 tracking-tighter">編輯用戶資料</h3>
            <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">顯示名稱</label>
            <input v-model="editFormData.full_name" type="text"
              class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all outline-none" />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">已知別名 (Legacy Names)</label>
            <div class="space-y-3">
              <div v-for="(name, index) in editFormData.legacy_names" :key="index" class="flex gap-2">
                <input v-model="editFormData.legacy_names[index]" type="text"
                  class="flex-1 h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:border-amber-300 transition-all outline-none" />
                <button @click="removeLegacyName(index)" class="p-3 text-rose-400 hover:text-rose-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button @click="addLegacyName" 
                class="w-full h-12 rounded-xl border-2 border-dashed border-slate-100 text-slate-400 hover:border-amber-300 hover:text-brand-primary transition-all text-[10px] font-black uppercase tracking-widest">
                + 新增別名
              </button>
            </div>
            <p class="text-[9px] font-bold text-slate-400 italic ml-2 mt-2">※ 別名用於「自動對齊」功能，系統會自動比對這些名稱</p>
          </div>
        </div>

        <div class="px-8 py-6 bg-slate-50/50 flex items-center justify-end gap-3">
          <button @click="closeEditModal"
            class="h-12 px-6 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">取消</button>
          <button @click="handleUpdateProfile" :disabled="updatingProfile"
            class="h-12 px-8 bg-brand-primary text-white rounded-2xl shadow-xl shadow-amber-200 hover:shadow-2xl hover:bg-amber-600 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <svg v-if="updatingProfile" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            確認更新
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useAdmin } from '@/composables/useAdmin'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useDialog } from '@/composables/useDialog'
import { computed, onMounted, ref, watch } from 'vue'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()

const { users, adminEmails, loading, error, fetchAllUsers, addAdminEmail, removeAdminEmail, promoteToPrimary, toggleUserRole, updateProfile } = useAdmin()
const { user } = useAuth()

const activeTab = ref('all')
const newAdminEmail = ref('')
const searchQuery = ref('')
const filterRole = ref('')
const expandedUsers = ref(new Set())

const toggleUserExpansion = (userId) => {
  if (expandedUsers.value.has(userId)) {
    expandedUsers.value.delete(userId)
  } else {
    expandedUsers.value.add(userId)
  }
}

const isCurrentUser = (email) => {
  return user.value?.email === email
}

const filteredUsers = computed(() => {
  let result = users.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      (u.email || '').toLowerCase().includes(query) ||
      (u.full_name || '').toLowerCase().includes(query) ||
      (u.legacy_names || []).some(alias => alias.toLowerCase().includes(query))
    )
  }
  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value)
  }
  return result
})

// Edit Modal Logic
const showEditModal = ref(false)
const updatingProfile = ref(false)
const editFormData = ref({
  id: '',
  full_name: '',
  legacy_names: []
})

const openEditModal = (target) => {
  editFormData.value = {
    id: target.id,
    full_name: target.full_name || '',
    legacy_names: [...(target.legacy_names || [])]
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const addLegacyName = () => {
  editFormData.value.legacy_names.push('')
}

const removeLegacyName = (index) => {
  editFormData.value.legacy_names.splice(index, 1)
}

const handleUpdateProfile = async () => {
  updatingProfile.value = true
  const { error: updateError } = await updateProfile(editFormData.value.id, {
    full_name: editFormData.value.full_name,
    legacy_names: editFormData.value.legacy_names.filter(n => n?.trim() !== '')
  })
  
  if (!updateError) {
    showToast('更新成功', 'success')
    closeEditModal()
  } else {
    showToast('更新失敗: ' + (updateError.message || updateError), 'error')
  }
  updatingProfile.value = false
}

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

.delay-200 {
  animation-delay: 0.2s;
}
</style>
