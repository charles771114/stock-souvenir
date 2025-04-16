<template>
  <div
    class="fixed bottom-4 right-4 z-50 group"
    @mouseenter="show = true"
    @mouseleave="show = false"
  >
    <!-- 圓形狀態徽章 -->
    <div
      :class="[
        'w-10 h-10 rounded-full shadow flex items-center justify-center cursor-pointer',
        status === 'warm' ? 'bg-green-500' : 'bg-red-500'
      ]"
      title="伺服器狀態"
    >
      <span class="text-white text-lg">
        {{ status === 'warm' ? '✓' : '!' }}
      </span>
    </div>

    <!-- hover 時顯示詳細內容 -->
    <div
      v-if="show"
      class="absolute bottom-12 right-0 w-64 bg-white border rounded-lg shadow-lg p-3 text-sm"
    >
      <div class="font-bold mb-2">伺服器狀態</div>
      <div v-if="status !== 'error'">
        ✅ 狀態：<span class="font-medium text-green-700">{{ status }}</span><br />
        ⏱️ 回應時間：<span class="font-mono">{{ responseTime.toFixed(1) }}ms</span><br />
        🕒 伺服器時間：<span class="font-mono">{{ serverTime }}</span>
      </div>
      <div v-else class="text-red-600">
        ❌ 無法連線後端
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const show = ref(false)
const status = ref('checking')
const responseTime = ref(0)
const serverTime = ref('')

async function checkHealth() {
  const start = performance.now()
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/health`)
    const end = performance.now()
    responseTime.value = end - start
    serverTime.value = data.time
    status.value = data.status
  } catch (err) {
    status.value = 'error'
  }
}

onMounted(checkHealth)
</script>
