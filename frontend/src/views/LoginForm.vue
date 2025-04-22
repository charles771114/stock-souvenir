<template>
  <div class="p-6 max-w-md mx-auto text-center">
    <h1 class="text-xl font-bold mb-4">🔐 登入系統</h1>
    <button @click="login" class="bg-blue-600 text-white px-4 py-2 rounded">使用 Google 登入</button>
    <p v-if="auth.user">目前登入帳號：{{ auth.user.email }}</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const login = () => auth.login()
</script>
