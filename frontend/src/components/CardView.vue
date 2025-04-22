<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <div
      v-for="item in items"
      :key="item.number"
      class="bg-white p-4 rounded shadow border hover:shadow-lg transition"
    >
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          代號：<span class="font-mono text-blue-700">{{ item.number }}</span>
        </div>
        <FavoriteButton :gift="item" />
      </div>
      <div class="text-sm">名稱：{{ item.code }}</div>
      <div class="text-sm">紀念品：<span class="font-semibold">{{ item.souvenir }}</span></div>
      <div
        class="text-sm"
        :class="isExpired(item.lastBuy) ? 'text-red-600' : 'text-green-700'"
      >
        最後買進日：{{ item.lastBuy || '—' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import FavoriteButton from './FavoriteButton.vue'

const props = defineProps({
  items: Array,
  isExpired: Function
})
</script>
