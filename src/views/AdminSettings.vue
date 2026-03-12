<template>
  <div class="min-h-screen bg-surface-50">
    <Navbar />

    <div class="max-w-4xl mx-auto px-6 sm:px-8 py-12 animate-fade-in-up">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-3xl font-black text-slate-800 tracking-tighter mb-2">權限設定 / ADMIN</h1>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest">管理系統管理員帳號與主權限分配</p>
      </div>

      <!-- Add Admin Form -->
      <div class="glass-card p-10 mb-10 border border-slate-100 shadow-xl shadow-amber-50">
        <h2 class="text-sm font-black text-slate-700 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <i class="fas fa-plus-circle text-brand-primary"></i> 新增管理者
        </h2>
        
        <form @submit.prevent="handleAddAdmin" class="flex gap-3">
          <div class="flex-1">
            <input
              v-model="newAdminEmail"
              type="email"
              placeholder="輸入管理者 Email 地址"
              required
              class="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-50 focus:border-amber-200 transition-all font-bold text-slate-800"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {{ loading ? '處理中...' : '提交新增' }}
          </button>
        </form>

        <p class="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <i class="fas fa-info-circle text-amber-400"></i>
          提示：新增後該 Email 下次登入將具備管理者權限
        </p>

        <!-- Error Message -->
        <div v-if="error" class="mt-6 p-4 bg-status-error/5 border border-status-error/10 rounded-2xl flex items-center gap-3">
          <i class="fas fa-exclamation-circle text-status-error"></i>
          <p class="text-xs font-bold text-status-error">{{ error }}</p>
        </div>
      </div>

      <!-- Admin List -->
      <div class="glass-card overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h2 class="text-sm font-black text-slate-700 uppercase tracking-[0.2em] flex items-center gap-2">
            <i class="fas fa-list text-slate-300"></i> 管理者清單
          </h2>
          <span class="text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">
            Total: {{ adminEmails.length }}
          </span>
        </div>

        <div v-if="loading && adminEmails.length === 0" class="p-12 flex justify-center">
          <div class="w-8 h-8 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin"></div>
        </div>

        <div v-else-if="adminEmails.length === 0" class="p-12 text-center text-slate-400 text-[11px] font-black uppercase tracking-widest">
          尚無管理者帳號 / NO ADMIN DATA
        </div>

        <div v-else class="divide-y divide-slate-50">
          <div
            v-for="admin in adminEmails"
            :key="admin.email"
            class="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
          >
            <div class="flex-1">
              <div class="flex items-center">
                <div class="relative flex-shrink-0 h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                  <span class="text-brand-primary font-black text-lg">
                    {{ admin.email.charAt(0).toUpperCase() }}
                  </span>
                  <!-- Primary Badge -->
                  <div v-if="admin.is_primary_admin" class="absolute -top-1.5 -right-1.5 bg-brand-secondary rounded-full p-1 border-2 border-white shadow-lg shadow-indigo-400 transform group-hover:scale-110 transition-transform" title="主管理員">
                    <i class="fas fa-crown text-[8px] text-white"></i>
                  </div>
                </div>
                <div class="ml-5">
                  <div class="text-sm font-black text-slate-800 flex items-center tracking-tight">
                    {{ admin.email }}
                    <span v-if="isCurrentUser(admin.email)" class="ml-3 text-[9px] font-black text-brand-primary bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-widest">
                      YOU
                    </span>
                    <span v-if="admin.is_primary_admin" class="ml-2 text-[9px] font-black text-brand-secondary bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                      Primary
                    </span>
                  </div>
                  <div class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Added: {{ formatDate(admin.added_at) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Promote Button -->
              <button
                v-if="!admin.is_primary_admin"
                @click="confirmPromote(admin.email)"
                class="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-transparent hover:border-amber-100"
              >
                設為主管理員
              </button>

              <!-- Remove Button -->
              <button
                v-if="!isCurrentUser(admin.email) && !admin.is_primary_admin"
                @click="confirmRemove(admin.email)"
                class="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-status-error bg-status-error/5 hover:bg-status-error/10 rounded-xl transition-all border border-transparent hover:border-status-error/10"
              >
                移除權限
              </button>
              <span v-else-if="admin.is_primary_admin" class="px-4 py-2 text-[10px] font-black text-slate-300 italic uppercase tracking-widest">
                IMMUTABLE
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning -->
      <div class="mt-10 glass-card p-6 border border-status-warning/10 bg-status-warning/5 shadow-xl shadow-status-warning/5 rounded-[2rem]">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center text-status-warning">
            <i class="fas fa-shield-alt text-lg"></i>
          </div>
          <div class="text-sm text-slate-600">
            <p class="font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                管理員安全指南 / SAFETY
            </p>
            <ul class="space-y-2">
              <li class="flex items-center gap-2 font-bold text-xs"><i class="fas fa-check-circle text-status-warning text-[10px]"></i> 您無法移除自己的管理員權限</li>
              <li class="flex items-center gap-2 font-bold text-xs"><i class="fas fa-check-circle text-status-warning text-[10px]"></i> 移除後需重新登入才會生效</li>
              <li class="flex items-center gap-2 font-bold text-xs"><i class="fas fa-check-circle text-status-warning text-[10px]"></i> 主管理員負責全站數據，請謹慎分配</li>
            </ul>
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
import { useDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()
const { confirm: openConfirm } = useDialog()
const { adminEmails, loading, error, fetchAdminEmails, addAdminEmail, removeAdminEmail, promoteToPrimary } = useAdmin()
const { user } = useAuth()

const newAdminEmail = ref('')

const isCurrentUser = (email) => {
  return user.value?.email === email
}

const formatDate = (dateString) => {
  if (!dateString) return ''
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
  }
}

const confirmRemove = async (email) => {
  const ok = await openConfirm(`確定要移除「${email}」的 admin 權限嗎？`)
  if (!ok) return

  const { error: removeError } = await removeAdminEmail(email)
  
  if (!removeError) {
    showToast('Admin 移除成功', 'success')
  } else {
    showToast(removeError.message, 'error')
  }
}

const confirmPromote = async (email) => {
  const ok = await openConfirm(`確定要將「${email}」設為主管理員 (Primary Admin) 嗎？\n\n主管理員擁有最高權限，且不能被移除。`)
  if (!ok) return

  const { error: promoteError } = await promoteToPrimary(email)
  
  if (!promoteError) {
    showToast('已成功設為主管理員', 'success')
  } else {
    showToast(promoteError.message, 'error')
  }
}

onMounted(async () => {
  await fetchAdminEmails()
})
</script>
