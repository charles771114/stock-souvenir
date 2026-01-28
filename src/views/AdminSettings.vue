<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin 設定</h1>
        <p class="text-gray-600">管理系統管理員帳號</p>
      </div>

      <!-- Add Admin Form -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">新增 Admin</h2>
        
        <form @submit.prevent="handleAddAdmin" class="flex gap-4">
          <div class="flex-1">
            <input
              v-model="newAdminEmail"
              type="email"
              placeholder="輸入 Email 地址"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '新增中...' : '新增' }}
          </button>
        </form>

        <p class="mt-3 text-sm text-gray-600">
          💡 提示：新增後該 email 下次登入會自動成為 admin
        </p>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Admin List -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Admin 帳號列表</h2>
        </div>

        <div v-if="loading && adminEmails.length === 0" class="p-6 flex justify-center">
          <LoadingSpinner />
        </div>

        <div v-else-if="adminEmails.length === 0" class="p-6 text-center text-gray-500">
          尚無 Admin 帳號
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="admin in adminEmails"
            :key="admin.email"
            class="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div class="flex-1">
              <div class="flex items-center">
                <div class="relative flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-indigo-600 font-medium text-sm">
                    {{ admin.email.charAt(0).toUpperCase() }}
                  </span>
                  <!-- Primary Badge -->
                  <div v-if="admin.is_primary_admin" class="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white" title="主管理員">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 flex items-center">
                    {{ admin.email }}
                    <span v-if="isCurrentUser(admin.email)" class="ml-2 text-xs text-indigo-600 font-normal bg-indigo-50 px-2 py-0.5 rounded-full">
                      (您現在的帳號)
                    </span>
                    <span v-if="admin.is_primary_admin" class="ml-2 text-xs text-amber-600 font-normal bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      Primary
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    新增於 {{ formatDate(admin.added_at) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Promote Button -->
              <button
                v-if="!admin.is_primary_admin"
                @click="confirmPromote(admin.email)"
                class="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
              >
                設為主管理員
              </button>

              <!-- Remove Button -->
              <button
                v-if="!isCurrentUser(admin.email) && !admin.is_primary_admin"
                @click="confirmRemove(admin.email)"
                class="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                移除權限
              </button>
              <span v-else-if="admin.is_primary_admin" class="px-3 py-1.5 text-xs text-gray-400 italic">
                無法移除
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning -->
      <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex">
          <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="text-sm text-yellow-800">
            <p class="font-medium mb-1">注意事項</p>
            <ul class="list-disc list-inside space-y-1">
              <li>您無法移除自己的 admin 權限</li>
              <li>移除 admin 後，該用戶下次登入時會失去管理員權限</li>
              <li>請謹慎管理 admin 帳號列表</li>
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
