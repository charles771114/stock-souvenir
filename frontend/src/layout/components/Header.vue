<template>
  <header class="flex items-center justify-between px-6 py-3 bg-blue-600 text-white shadow-md">
    <div class="text-xl font-bold">📦 股東紀念品系統</div>
    <nav class="space-x-4">
      <RouterLink to="/getGift" class="hover:underline">查詢紀念品</RouterLink>
      <RouterLink to="/favorites" class="hover:underline">收藏 </RouterLink>
      <RouterLink to="/pdfTransform" class="hover:underline">PDF 庫存對照 </RouterLink>
      <RouterLink to="/loginForm" class="hover:underline" v-if="!auth.user">登入 </RouterLink>
      <span v-else>
        {{ auth.user.email }}
        <button @click="auth.logout" class="ml-2 underline">登出</button>
      </span>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
