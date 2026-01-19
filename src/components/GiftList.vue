<template>
  <div>
    <!-- 切換按鈕與排序欄位 -->
    <div class="mb-4 flex flex-wrap justify-between items-center">
      <div class="space-x-2">
        <span class="text-lg font-bold text-gray-800">所有紀念品</span>
      </div>

      <!-- 排序選單 -->
      <div class="mt-2 sm:mt-0">
        <label class="text-sm mr-2">排序：</label>
        <select v-model="sortBy" class="border rounded px-2 py-1 text-sm">
          <option value="number">代號</option>
          <option value="lastBuy">最後買進日</option>
        </select>
        <button @click="toggleSort" class="ml-2 text-sm text-blue-600 flex items-center gap-1">
          <span v-if="sortDir === 'asc'" class="flex items-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            升冪
          </span>
          <span v-else class="flex items-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            降冪
          </span>
        </button>
      </div>
    </div>

    <!-- 區分是否已過期 -->
    <div class="mb-4 text-sm text-gray-700 flex items-center gap-2">
      <span class="font-bold flex items-center gap-1">
        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        已過最後買進日：
      </span>{{ expiredGifts.length }} 筆，
      <span class="font-bold flex items-center gap-1 ml-2">
         <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        尚可買進：
      </span>{{ validGifts.length }} 筆
    </div>

    <!-- 尚可買進 區塊 -->
    <div class="mb-6 border rounded shadow">
      <button
        @click="toggleSection('valid')"
        class="w-full text-left px-4 py-2 bg-green-100 hover:bg-green-200 font-semibold flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        尚可買進 ({{ validGifts.length }})
      </button>
      <div v-show="expanded.valid" class="p-4">
        <TableView
          :items="sortedGifts.filter((item) => !isExpired(item.lastBuy))"
          :isExpired="isExpired"
        />
      </div>
    </div>

    <!-- 已過期 區塊 -->
    <div class="border rounded shadow">
      <button
        @click="toggleSection('expired')"
        class="w-full text-left px-4 py-2 bg-red-100 hover:bg-red-200 font-semibold flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        已過最後買進日 ({{ expiredGifts.length }})
      </button>
      <div v-show="expanded.expired" class="p-4">
        <TableView
          :items="sortedGifts.filter((item) => isExpired(item.lastBuy))"
          :isExpired="isExpired"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TableView from './TableView.vue'

const props = defineProps({
  gifts: Array,
})

const sortBy = ref('number')
const sortDir = ref('asc')
const expanded = ref({ valid: true, expired: true })

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function toggleSection(key) {
  expanded.value[key] = !expanded.value[key]
}

function parseDate(mmdd) {
  return new Date(`${new Date().getFullYear()}/${mmdd}`)
}

function isExpired(lastBuy) {
  if (!lastBuy) return false
  const today = new Date().setHours(0, 0, 0, 0)
  const buyDate = parseDate(lastBuy).setHours(0, 0, 0, 0)
  return buyDate < today
}

const sortedGifts = computed(() => {
  return [...props.gifts].sort((a, b) => {
    let aVal =
      sortBy.value === 'lastBuy'
        ? parseDate(a.lastBuy || '01/01')
        : a[sortBy.value]
    let bVal =
      sortBy.value === 'lastBuy'
        ? parseDate(b.lastBuy || '01/01')
        : b[sortBy.value]
    return sortDir.value === 'asc'
      ? aVal > bVal
        ? 1
        : -1
      : aVal < bVal
        ? 1
        : -1
  })
})

const expiredGifts = computed(() =>
  props.gifts.filter((g) => isExpired(g.lastBuy))
)
const validGifts = computed(() =>
  props.gifts.filter((g) => !isExpired(g.lastBuy))
)
</script>

<style scoped>
button:focus {
  outline: none;
}
</style>
