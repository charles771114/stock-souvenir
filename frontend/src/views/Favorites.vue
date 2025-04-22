<template>
  <div class="p-4 max-w-5xl mx-auto">
    <h2 class="text-xl font-bold mb-4">兌換品
      清單</h2>

    <div class="flex items-center gap-2 mb-4">
      <select v-model="store.currentIndex" class="border px-2 py-1 text-sm">
        <option v-for="(list, i) in store.lists" :key="i" :value="i">{{ list.name }}（{{ list.creator }}）</option>
      </select>

      <button @click="createList" class="px-2 py-1 bg-blue-600 text-white text-sm rounded">
        ➕ 建立清單
      </button>
    </div>

    <GiftList :gifts="allGifts" />
  </div>
</template>

<script setup>
import { useFavoriteStore } from '@/stores/favorite'
import { onMounted } from 'vue'
import GiftList from '@/components/GiftList.vue'
import { useGifts } from '@/composables/useGifts'

const baseUrl = import.meta.env.VITE_API_BASE_URL
const { gifts, fetchGifts } = useGifts(baseUrl)
const store = useFavoriteStore()

onMounted(() => {
  fetchGifts()
})

const allGifts = gifts

function createList() {
  const name = prompt('輸入清單名稱')
  const creator = prompt('輸入建立者名稱')
  if (name && creator) {
    store.addList(name, creator)
  }
}
</script>
