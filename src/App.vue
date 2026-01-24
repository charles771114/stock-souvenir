<template>
  <div id="app">
    <router-view />
    <ToastContainer />
    <ConfirmDialog />
    <AuthModal />
    <SiteFooter />
  </div>
</template>

<script setup>
import AuthModal from '@/components/AuthModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthModal } from '@/composables/useAuthModal'
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { initAuth } = useAuth()
const { openAuthModal } = useAuthModal()
const route = useRoute()
const router = useRouter()

// Watch for auth query param to trigger modal
watch(() => route.query.auth, (newVal) => {
  if (newVal === 'login') {
    openAuthModal()
    // Remove query param to clean URL
    router.replace({ query: { ...route.query, auth: undefined } })
  }
})

onMounted(async () => {
  await initAuth()
  
  // Check on mount as well (for initial load)
  if (route.query.auth === 'login') {
    openAuthModal()
    router.replace({ query: { ...route.query, auth: undefined } })
  }
})
</script>

<style>
/* Global styles are now in src/style/main.css */
</style>
