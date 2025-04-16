<template>
  <div>
    <!-- 切換按鈕 -->
    <div class="mb-4 flex justify-end space-x-2">
      <button
        :class="[
          'px-3 py-1 rounded border text-sm',
          viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
        ]"
        @click="viewMode = 'table'"
      >
        📋 表格模式
      </button>
      <button
        :class="[
          'px-3 py-1 rounded border text-sm',
          viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
        ]"
        @click="viewMode = 'card'"
      >
        🧱 卡片模式
      </button>
    </div>

    <!-- 表格模式 -->
    <table
      v-if="viewMode === 'table'"
      class="w-full table-auto border text-sm shadow-sm bg-white rounded overflow-hidden"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2">代號</th>
          <th class="p-2">名稱</th>
          <th class="p-2">紀念品</th>
          <th class="p-2">最後買進日</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in gifts" :key="item.number" class="border-t">
          <td class="p-2 text-center">{{ item.number }}</td>
          <td class="p-2">{{ item.code }}</td>
          <td class="p-2">{{ item.souvenir }}</td>
          <td class="p-2 text-center">{{ item.lastBuy || '—' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 卡片模式 -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
    >
      <div
        v-for="item in gifts"
        :key="item.number"
        class="bg-white p-4 rounded shadow border"
      >
        <div class="text-sm text-gray-500">代號：<span class="font-mono text-blue-700">{{ item.number }}</span></div>
        <div class="text-sm">名稱：{{ item.code }}</div>
        <div class="text-sm">紀念品：<span class="font-semibold">{{ item.souvenir }}</span></div>
        <div class="text-sm text-gray-500">最後買進日：{{ item.lastBuy || '—' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  gifts: {
    type: Array,
    default: () => []
  }
})

const viewMode = ref('table') // 切換模式
</script>
