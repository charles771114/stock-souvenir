<template>
  <table class="w-full table-auto text-sm border shadow-sm bg-white rounded overflow-hidden">
    <thead class="bg-gray-100">
      <tr>
        <th class="p-2">代號</th>
        <th class="p-2">名稱</th>
        <th class="p-2">紀念品</th>
        <th class="p-2">最後買進日</th>
        <th class="p-2">收藏</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in items"
        :key="item.number"
        class="border-t hover:bg-gray-50"
      >
        <td class="p-2 text-center font-mono">{{ item.number }}</td>
        <td class="p-2">{{ item.code }}</td>
        <td class="p-2">{{ item.souvenir }}</td>
        <td
          class="p-2 text-center"
          :class="isExpired(item.lastBuy) ? 'text-red-600' : 'text-green-700'"
        >
          {{ item.lastBuy || '—' }}
        </td>
        <td class="p-2 text-center">
          <FavoriteButton :gift="item" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import FavoriteButton from './FavoriteButton.vue'

const props = defineProps({
  items: Array,
  isExpired: Function
})
</script>
