<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog"
        aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="close"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <Transition name="modal">
            <div v-if="isOpen"
              class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-md border border-gray-100">
              <!-- Close Button -->
              <button type="button"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                @click="close">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="p-8">
                <!-- Header & Avatar (Standard Layout) -->
                <div class="text-center mb-8">
                  <div class="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <span v-if="!form.avatarUrl" class="text-3xl font-bold text-indigo-600">
                      {{ (form.nickname || form.fullName || email || '?').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900">個人資料設定</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ email }}</p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-5">
                  <!-- Nickname -->
                  <div>
                    <label for="nickname" class="block text-sm font-medium text-gray-700 mb-1">暱稱 (選填)</label>
                    <input type="text" id="nickname" v-model="form.nickname"
                      class="block w-full rounded-lg border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm"
                      placeholder="設定您的暱稱" />
                    <p class="mt-1.5 text-xs text-gray-500">優先顯示於網站介面</p>
                  </div>

                  <!-- Full Name -->
                  <div>
                    <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">真實姓名 (選填)</label>
                    <input type="text" id="fullName" v-model="form.fullName"
                      class="block w-full rounded-lg border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm"
                      placeholder="您的真實姓名" />
                  </div>

                  <!-- Error Message -->
                  <div v-if="error"
                    class="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ error }}
                  </div>

                  <!-- Actions -->
                  <div class="pt-4 flex gap-3">
                    <button type="button"
                      class="flex-1 justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      @click="close">
                      取消
                    </button>
                    <button type="submit" :disabled="loading"
                      class="flex-1 justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 justify-center">
                      <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                      {{ loading ? '儲存中' : '儲存變更' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const { user, profile, updateProfile } = useAuth()
const { showToast } = useToast()

const loading = ref(false)
const error = ref(null)
const email = ref('')

const form = ref({
  fullName: '',
  nickname: '',
  avatarUrl: null
})

// Sync form with profile data when modal opens or profile changes
watch(() => [props.isOpen, profile.value], ([isOpen, newProfile]) => {
  if (isOpen && newProfile) {
    if (user.value) email.value = user.value.email
    form.value.fullName = newProfile.full_name || ''
    form.value.nickname = newProfile.nickname || ''
  } else if (isOpen && user.value && !newProfile) {
    // Fallback if profile not loaded yet
    email.value = user.value.email
  }
}, { immediate: true })

const close = () => {
  emit('close')
  error.value = null
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    const { error: updateError } = await updateProfile({
      full_name: form.value.fullName,
      nickname: form.value.nickname
    })

    if (updateError) throw updateError

    showToast('個人資料已更新', 'success')
    close()
  } catch (e) {
    error.value = e.message || '更新失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
