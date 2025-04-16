<template>
  <div class="max-w-2xl mx-auto p-6 text-gray-800">
    <h1 class="text-2xl font-bold mb-4">📄 PDF 解密擷取工具</h1>

    <form @submit.prevent="handleSubmit" class="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label class="block mb-1 font-medium">選擇 PDF 檔案</label>
        <input type="file" @change="handleFile" accept="application/pdf" class="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label class="block mb-1 font-medium">輸入密碼</label>
        <input v-model="password" type="password" class="w-full border px-3 py-2 rounded" />
      </div>

      <button type="submit" :disabled="loading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
        {{ loading ? '處理中...' : '解密並擷取清單' }}
      </button>
    </form>

    <div v-if="error" class="text-red-600 mt-4">⚠️ {{ error }}</div>

    <!-- ✅ 已擁有清單 -->
    <div class="mt-6">
      <button @click="showOwned = !showOwned" class="text-green-700 font-semibold flex items-center space-x-1">
        <span>{{ showOwned ? '▼' : '▶' }}</span>
        <span>✅ 已擁有 {{ owned.length }} 筆</span>
      </button>
      <ul v-if="showOwned" class="mt-2 bg-white p-4 rounded shadow space-y-1 border max-h-[300px] overflow-y-auto">
        <li v-for="(item, i) in owned" :key="i" class="text-sm flex justify-between border-b py-1">
          <span class="font-mono text-blue-600">{{ item.number }}</span>
          <span>{{ item.name }} - {{ item.souvenir }}</span>
        </li>
      </ul>
    </div>
    <div v-if="notOwned.length" class="mt-1 text-red-600">❌ 未擁有 {{ notOwned.length }} 筆</div>

    <div v-if="result.length" class="mt-6">
      <h2 class="text-xl font-semibold mb-2">📋 擷取結果（{{ result.length }} 筆）</h2>
      <ul class="bg-white p-4 rounded shadow space-y-1 max-h-[500px] overflow-y-auto border">
        <li v-for="(stock, i) in result" :key="i" class="border-b py-1 flex justify-between">
          <span class="font-mono text-blue-600">{{ stock.code }}</span>
          <span class="text-gray-700">{{ stock.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { usePdfGiftStore } from '@/stores/pdf'

const pdfStore = usePdfGiftStore()
const {
  password,
  result,
  owned,
  notOwned,
  error,
  loading
} = storeToRefs(pdfStore)

const showOwned = ref(false) 
function handleFile(e) {
  pdfStore.setFile(e.target.files[0])
}

function handleSubmit() {
  pdfStore.decryptPdf()
}

onMounted(() => {
  pdfStore.fetchGiftData()
})
</script>

<style scoped>
body {
  background-color: #f9fafb;
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
