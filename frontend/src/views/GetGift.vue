<template>
  <div class="p-6 max-w-4xl mx-auto">

    <label class="block mb-4">
      篩選年份：
      <input type="number" v-model="year" class="border px-2 py-1 ml-2 w-24" />
    </label>

    <button
      @click="syncFirestore"
      :disabled="syncing"
      class="bg-blue-600 text-white px-4 py-1 rounded mb-4"
    >
      {{ syncing ? '同步中...' : '手動更新 Firestore' }}
    </button>

    <div v-if="syncResult" class="mb-2 text-sm text-green-700">
      ✅ {{ syncResult }}
    </div>

    <div v-if="loading">載入中...</div>
    <div v-else-if="error" class="text-red-500">❌ {{ error }}</div>
    <GiftList v-else :gifts="gifts" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import GiftList from '@/components/GiftList.vue'
const gifts = ref([])
const year = ref(new Date().getFullYear())
const loading = ref(true)
const error = ref('')
const syncing = ref(false)
const syncResult = ref('')

// 🔄 手動觸發 Firestore 同步
const syncFirestore = async () => {
  syncing.value = true
  syncResult.value = ''
  try {
    const res = await axios.post('/api/firestore/sync')
    syncResult.value = res.data.message || '同步完成'
    await fetchGifts() // 同步完重新抓取
  } catch (e) {
    syncResult.value = '同步失敗：' + (e.response?.data?.error || e.message)
  } finally {
    syncing.value = false
  }
}

// 🧊 抓資料
const fetchGifts = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/firestore/gifts')
    console.log(data)
    gifts.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchGifts())

</script>
